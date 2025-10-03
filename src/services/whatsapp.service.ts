import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  WASocket,
  delay
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import QRCode from 'qrcode';
import path from 'path';
import { logger } from '../utils/logger';
import axios from 'axios';
import mime from 'mime-types';

interface ChatData {
  jid: string;
  name: string;
  lastMessage?: string;
  timestamp: number;
  unread: number;
  isGroup: boolean;
}

interface SessionData {
  socket: WASocket;
  qr?: string;
  status: 'connected' | 'connecting' | 'disconnected';
  webhook?: string;
  phoneNumber?: string;
  chats: Map<string, ChatData>;
  messages: Map<string, any[]>;
}

class WhatsAppService {
  private sessions: Map<string, SessionData> = new Map();
  private sessionsPath = path.join(process.cwd(), 'sessions');

  async createSession(sessionId: string, webhook?: string): Promise<void> {
    if (this.sessions.has(sessionId)) {
      const existing = this.sessions.get(sessionId);
      if (existing?.status === 'connected') {
        logger.info(`Session ${sessionId} already exists and connected`);
        return;
      }
    }

    const sessionPath = path.join(this.sessionsPath, sessionId);
    
    const fs = require('fs');
    if (!fs.existsSync(this.sessionsPath)) {
      fs.mkdirSync(this.sessionsPath, { recursive: true });
      logger.info('Created sessions directory');
    }
    
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();
    
    logger.info(`Creating session ${sessionId} with Baileys version ${version}`);

    const socket = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger)
      },
      printQRInTerminal: false,
      browser: Browsers.ubuntu('Chrome'),
      generateHighQualityLinkPreview: true
    });

    const sessionData: SessionData = {
      socket,
      status: 'connecting',
      webhook,
      chats: new Map(),
      messages: new Map()
    };

    this.sessions.set(sessionId, sessionData);

    socket.ev.on('creds.update', saveCreds);

    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          const qrCode = await QRCode.toDataURL(qr);
          sessionData.qr = qrCode;
          sessionData.status = 'connecting';
          logger.info(`✅ QR Code generated successfully for session ${sessionId}`);
          logger.info(`QR Code length: ${qrCode.length} characters`);
        } catch (error) {
          logger.error(`Failed to generate QR code for session ${sessionId}:`, error);
        }
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        logger.info(`Connection closed for session ${sessionId}, status: ${statusCode}, reconnecting: ${shouldReconnect}`);

        if (shouldReconnect) {
          // Wait 3 seconds before reconnecting
          await delay(3000);
          
          // Check if it's a connection error (need new QR)
          if (statusCode === DisconnectReason.connectionClosed || 
              statusCode === DisconnectReason.badSession ||
              statusCode === DisconnectReason.connectionLost) {
            logger.info(`Session ${sessionId} needs new QR code, clearing credentials`);
            sessionData.status = 'connecting';
            sessionData.qr = undefined;
          }
          
          await this.createSession(sessionId, webhook);
        } else {
          this.sessions.delete(sessionId);
          sessionData.status = 'disconnected';
          logger.info(`Session ${sessionId} logged out, not reconnecting`);
        }
      }

      if (connection === 'open') {
        sessionData.status = 'connected';
        sessionData.qr = undefined;
        
        // Get phone number from socket
        try {
          const user = socket.user;
          if (user && user.id) {
            // Extract phone number from user.id (format: 628xxx@s.whatsapp.net)
            const phoneNumber = user.id.split('@')[0];
            sessionData.phoneNumber = phoneNumber;
            logger.info(`✅ Session ${sessionId} connected with number: ${phoneNumber}`);
          } else {
            logger.info(`✅ Session ${sessionId} connected successfully`);
          }
        } catch (error) {
          logger.warn(`Could not extract phone number for session ${sessionId}`);
          logger.info(`Session ${sessionId} connected`);
        }
      }
    });

    socket.ev.on('messages.upsert', async ({ messages, type }) => {
      // Store messages
      for (const msg of messages) {
        const jid = msg.key.remoteJid;
        if (!jid) continue;

        // Store message
        if (!sessionData.messages.has(jid)) {
          sessionData.messages.set(jid, []);
        }
        sessionData.messages.get(jid)!.push(msg);

        // Update chat data
        const chatName = jid.includes('@g.us') 
          ? (msg.pushName || jid.split('@')[0])
          : (msg.pushName || jid.split('@')[0]);

        sessionData.chats.set(jid, {
          jid,
          name: chatName,
          lastMessage: msg.message?.conversation || msg.message?.extendedTextMessage?.text || '[Media]',
          timestamp: msg.messageTimestamp ? Number(msg.messageTimestamp) * 1000 : Date.now(),
          unread: 0,
          isGroup: jid.includes('@g.us')
        });

        logger.info(`Stored message from ${jid} for session ${sessionId}`);
      }

      // Send webhook if configured
      if (type === 'notify' && webhook) {
        for (const message of messages) {
          try {
            await axios.post(webhook, {
              sessionId,
              message: {
                key: message.key,
                messageTimestamp: message.messageTimestamp,
                message: message.message
              }
            });
          } catch (error) {
            logger.error(`Failed to send webhook for session ${sessionId}:`, error);
          }
        }
      }
    });
  }

  async sendTextMessage(sessionId: string, to: string, message: string) {
    const session = this.getSession(sessionId);
    const jid = this.formatJid(to);

    await session.socket.sendMessage(jid, { text: message });
    logger.info(`Text message sent from session ${sessionId} to ${to}`);
  }

  async sendMediaMessage(
    sessionId: string,
    to: string,
    mediaUrl: string,
    mediaType: 'image' | 'video' | 'audio' | 'document',
    caption?: string,
    fileName?: string
  ) {
    const session = this.getSession(sessionId);
    const jid = this.formatJid(to);

    const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    const messageContent: any = {};

    switch (mediaType) {
      case 'image':
        messageContent.image = buffer;
        if (caption) messageContent.caption = caption;
        break;
      case 'video':
        messageContent.video = buffer;
        if (caption) messageContent.caption = caption;
        break;
      case 'audio':
        messageContent.audio = buffer;
        messageContent.mimetype = 'audio/mp4';
        break;
      case 'document':
        messageContent.document = buffer;
        messageContent.fileName = fileName || 'document.pdf';
        messageContent.mimetype = mime.lookup(fileName || 'document.pdf') || 'application/pdf';
        if (caption) messageContent.caption = caption;
        break;
    }

    await session.socket.sendMessage(jid, messageContent);
    logger.info(`${mediaType} sent from session ${sessionId} to ${to}`);
  }

  async sendMediaBuffer(
    sessionId: string,
    to: string,
    buffer: Buffer,
    mediaType: 'image' | 'video' | 'audio' | 'document',
    caption?: string,
    fileName?: string
  ) {
    const session = this.getSession(sessionId);
    const jid = this.formatJid(to);

    const messageContent: any = {};

    switch (mediaType) {
      case 'image':
        messageContent.image = buffer;
        if (caption) messageContent.caption = caption;
        break;
      case 'video':
        messageContent.video = buffer;
        if (caption) messageContent.caption = caption;
        break;
      case 'audio':
        messageContent.audio = buffer;
        messageContent.mimetype = 'audio/mp4';
        break;
      case 'document':
        messageContent.document = buffer;
        messageContent.fileName = fileName || 'document.pdf';
        messageContent.mimetype = mime.lookup(fileName || 'document.pdf') || 'application/pdf';
        if (caption) messageContent.caption = caption;
        break;
    }

    await session.socket.sendMessage(jid, messageContent);
    logger.info(`${mediaType} (from buffer) sent from session ${sessionId} to ${to}`);
  }

  async sendLocationMessage(
    sessionId: string,
    to: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string
  ) {
    const session = this.getSession(sessionId);
    const jid = this.formatJid(to);

    await session.socket.sendMessage(jid, {
      location: {
        degreesLatitude: latitude,
        degreesLongitude: longitude,
        name: name || 'Location',
        address: address || ''
      }
    });

    logger.info(`Location sent from session ${sessionId} to ${to}`);
  }

  async sendContactMessage(
    sessionId: string,
    to: string,
    contactName: string,
    contactNumber: string
  ) {
    const session = this.getSession(sessionId);
    const jid = this.formatJid(to);
    const contactJid = this.formatJid(contactNumber);

    await session.socket.sendMessage(jid, {
      contacts: {
        displayName: contactName,
        contacts: [{ displayName: contactName, vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL;type=CELL;type=VOICE;waid=${contactNumber}:${contactNumber}\nEND:VCARD` }]
      }
    });

    logger.info(`Contact sent from session ${sessionId} to ${to}`);
  }

  async sendBulkMessages(
    sessionId: string,
    recipients: string[],
    message: string,
    delayMs: number = 1000
  ) {
    const session = this.getSession(sessionId);
    const results = [];

    for (const recipient of recipients) {
      try {
        await this.sendTextMessage(sessionId, recipient, message);
        results.push({ recipient, status: 'sent' });
        await delay(delayMs);
      } catch (error: any) {
        results.push({ recipient, status: 'failed', error: error.message });
        logger.error(`Failed to send bulk message to ${recipient}:`, error);
      }
    }

    return results;
  }

  async getGroups(sessionId: string) {
    const session = this.getSession(sessionId);
    const groups = await session.socket.groupFetchAllParticipating();

    return Object.values(groups).map(group => ({
      id: group.id,
      subject: group.subject,
      owner: group.owner,
      creation: group.creation,
      participantsCount: group.participants.length
    }));
  }

  async createGroup(sessionId: string, groupName: string, participants: string[]) {
    const session = this.getSession(sessionId);
    const participantJids = participants.map(p => this.formatJid(p));

    const group = await session.socket.groupCreate(groupName, participantJids);
    logger.info(`Group created: ${groupName} by session ${sessionId}`);

    return {
      groupId: group.id,
      groupName: groupName
    };
  }

  async addParticipantsToGroup(sessionId: string, groupId: string, participants: string[]) {
    const session = this.getSession(sessionId);
    const participantJids = participants.map(p => this.formatJid(p));

    await session.socket.groupParticipantsUpdate(groupId, participantJids, 'add');
    logger.info(`Added participants to group ${groupId}`);
  }

  async removeParticipantsFromGroup(sessionId: string, groupId: string, participants: string[]) {
    const session = this.getSession(sessionId);
    const participantJids = participants.map(p => this.formatJid(p));

    await session.socket.groupParticipantsUpdate(groupId, participantJids, 'remove');
    logger.info(`Removed participants from group ${groupId}`);
  }

  async leaveGroup(sessionId: string, groupId: string) {
    const session = this.getSession(sessionId);
    await session.socket.groupLeave(groupId);
    logger.info(`Session ${sessionId} left group ${groupId}`);
  }

  async getContacts(sessionId: string) {
    const session = this.getSession(sessionId);
    
    try {
      // Return contacts from chats
      const contacts = [];
      for (const [jid, chat] of session.chats.entries()) {
        if (!chat.isGroup) {
          contacts.push({
            id: jid,
            name: chat.name,
            notify: chat.name
          });
        }
      }
      return contacts;
    } catch (error) {
      logger.error('Error getting contacts:', error);
      return [];
    }
  }

  async checkNumber(sessionId: string, number: string) {
    return this.checkNumberRegistered(sessionId, number);
  }

  private getSession(sessionId: string): SessionData {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.status !== 'connected') {
      throw new Error(`Session ${sessionId} is not connected`);
    }

    return session;
  }

  private formatJid(number: string): string {
    if (number.includes('@')) return number;
    if (number.includes('-')) return `${number}@g.us`;
    return `${number}@s.whatsapp.net`;
  }

  getSessionStatus(sessionId: string) {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return { sessionId, status: 'disconnected' };
    }

    return {
      sessionId,
      status: session.status,
      qr: session.qr
    };
  }

  async deleteSession(sessionId: string) {
    const session = this.sessions.get(sessionId);

    if (session) {
      await session.socket.logout();
      this.sessions.delete(sessionId);
      logger.info(`Session ${sessionId} deleted`);
    }
  }

  getAllSessions() {
    const sessions = [];
    for (const [sessionId, session] of this.sessions.entries()) {
      sessions.push({
        sessionId,
        status: session.status,
        phoneNumber: session.phoneNumber
      });
    }
    return sessions;
  }

  // ============ INBOX FEATURES ============

  async getMessages(sessionId: string, jid: string, limit: number = 50) {
    const session = this.getSession(sessionId);
    const formattedJid = this.formatJid(jid);

    try {
      // Get messages from our stored Map
      const messages = session.messages.get(formattedJid) || [];
      
      // Get last N messages
      const limited = messages.slice(-limit);
      
      logger.info(`Found ${limited.length} messages for ${jid}`);
      
      // Format messages
      return limited.map((msg: any) => ({
        id: msg.key.id,
        from: msg.key.fromMe ? (session.phoneNumber + '@s.whatsapp.net') : msg.key.remoteJid,
        to: msg.key.remoteJid,
        text: msg.message?.conversation || msg.message?.extendedTextMessage?.text || '[Media]',
        timestamp: msg.messageTimestamp ? Number(msg.messageTimestamp) * 1000 : Date.now(),
        fromMe: msg.key.fromMe || false,
        status: 'delivered',
        pinned: false,
        key: msg.key
      }));
    } catch (error) {
      logger.error(`Error fetching messages for ${jid}:`, error);
      return [];
    }
  }

  async getChats(sessionId: string) {
    const session = this.getSession(sessionId);

    try {
      const allChats = [];

      // Get chats from our stored Map
      for (const [jid, chat] of session.chats.entries()) {
        allChats.push({
          jid: chat.jid,
          name: chat.name,
          lastMessage: chat.lastMessage,
          timestamp: chat.timestamp,
          unread: chat.unread,
          type: chat.isGroup ? 'group' : 'personal',
          isGroup: chat.isGroup
        });
      }

      // Sort by timestamp (newest first)
      allChats.sort((a, b) => b.timestamp - a.timestamp);

      logger.info(`Found ${allChats.length} chats for session ${sessionId}`);
      return allChats;
    } catch (error) {
      logger.error('Error fetching chats:', error);
      throw error;
    }
  }

  async markAsRead(sessionId: string, jid: string, messageKey: any) {
    const session = this.getSession(sessionId);
    const formattedJid = this.formatJid(jid);

    try {
      await session.socket.readMessages([messageKey]);
      logger.info(`Message marked as read for ${jid}`);
    } catch (error) {
      logger.error('Error marking message as read:', error);
      throw error;
    }
  }

  async replyMessage(sessionId: string, jid: string, quotedMessage: any, replyText: string) {
    const session = this.getSession(sessionId);
    const formattedJid = this.formatJid(jid);

    try {
      await session.socket.sendMessage(formattedJid, {
        text: replyText
      }, {
        quoted: quotedMessage
      });
      logger.info(`Reply sent to ${jid}`);
    } catch (error) {
      logger.error('Error replying to message:', error);
      throw error;
    }
  }

  async forwardMessage(sessionId: string, fromJid: string, toJid: string, messageKey: any) {
    const session = this.getSession(sessionId);
    const formattedFromJid = this.formatJid(fromJid);
    const formattedToJid = this.formatJid(toJid);

    try {
      // Get the message from storage
      const messages = session.messages.get(formattedFromJid) || [];
      const message = messages.find((m: any) => m.key.id === messageKey.id);
      
      if (!message) {
        throw new Error('Message not found');
      }

      // Forward by sending the same message content
      await session.socket.sendMessage(formattedToJid, message.message);
      logger.info(`Message forwarded from ${fromJid} to ${toJid}`);
    } catch (error) {
      logger.error('Error forwarding message:', error);
      throw error;
    }
  }

  async deleteMessage(sessionId: string, jid: string, messageKey: any, forEveryone: boolean = false) {
    const session = this.getSession(sessionId);
    const formattedJid = this.formatJid(jid);

    try {
      await session.socket.sendMessage(formattedJid, {
        delete: messageKey
      });
      logger.info(`Message deleted for ${forEveryone ? 'everyone' : 'me'} in ${jid}`);
    } catch (error) {
      logger.error('Error deleting message:', error);
      throw error;
    }
  }

  async pinMessage(sessionId: string, jid: string, messageKey: any, pin: boolean = true) {
    const session = this.getSession(sessionId);
    const formattedJid = this.formatJid(jid);

    try {
      await session.socket.chatModify(
        {
          pin: pin
        },
        formattedJid
      );
      logger.info(`Message ${pin ? 'pinned' : 'unpinned'} in ${jid}`);
    } catch (error) {
      logger.error('Error pinning message:', error);
      throw error;
    }
  }

  // ============ PRESENCE FEATURES ============

  async setPresence(sessionId: string, jid: string, presence: 'available' | 'unavailable') {
    const session = this.getSession(sessionId);
    const formattedJid = this.formatJid(jid);

    try {
      await session.socket.sendPresenceUpdate(presence, formattedJid);
      logger.info(`Presence set to ${presence} for ${jid}`);
    } catch (error) {
      logger.error('Error setting presence:', error);
      throw error;
    }
  }

  async getPresence(sessionId: string, jid: string) {
    const session = this.getSession(sessionId);
    const formattedJid = this.formatJid(jid);

    try {
      await session.socket.presenceSubscribe(formattedJid);
      const presence = session.socket.store?.presences?.[formattedJid];
      return presence;
    } catch (error) {
      logger.error('Error getting presence:', error);
      throw error;
    }
  }

  async sendTyping(sessionId: string, jid: string, isTyping: boolean = true) {
    const session = this.getSession(sessionId);
    const formattedJid = this.formatJid(jid);

    try {
      await session.socket.sendPresenceUpdate(isTyping ? 'composing' : 'paused', formattedJid);
      logger.info(`Typing indicator ${isTyping ? 'started' : 'stopped'} for ${jid}`);
    } catch (error) {
      logger.error('Error sending typing indicator:', error);
      throw error;
    }
  }

  async sendRecording(sessionId: string, jid: string, isRecording: boolean = true) {
    const session = this.getSession(sessionId);
    const formattedJid = this.formatJid(jid);

    try {
      await session.socket.sendPresenceUpdate(isRecording ? 'recording' : 'paused', formattedJid);
      logger.info(`Recording indicator ${isRecording ? 'started' : 'stopped'} for ${jid}`);
    } catch (error) {
      logger.error('Error sending recording indicator:', error);
      throw error;
    }
  }

  // ============ STATUS FEATURES ============

  async uploadStatus(sessionId: string, buffer: Buffer, mediaType: 'image' | 'video' | 'text', caption?: string) {
    const session = this.getSession(sessionId);

    try {
      const messageContent: any = {
        backgroundColor: '#25D366'
      };

      if (mediaType === 'image') {
        messageContent.image = buffer;
        if (caption) messageContent.caption = caption;
      } else if (mediaType === 'video') {
        messageContent.video = buffer;
        if (caption) messageContent.caption = caption;
      } else if (mediaType === 'text') {
        messageContent.text = caption || '';
      }

      // Send to status@broadcast
      await session.socket.sendMessage('status@broadcast', messageContent);
      logger.info(`Status uploaded successfully for session ${sessionId}`);
    } catch (error) {
      logger.error('Error uploading status:', error);
      throw error;
    }
  }

  async getStatus(sessionId: string, limit: number = 50) {
    const session = this.getSession(sessionId);

    try {
      // Fetch status updates from contacts
      const statuses = await session.socket.fetchStatus();
      return statuses;
    } catch (error) {
      logger.error('Error getting status:', error);
      throw error;
    }
  }

  async viewStatus(sessionId: string, jid: string, statusId: string) {
    const session = this.getSession(sessionId);
    const formattedJid = this.formatJid(jid);

    try {
      // Mark status as viewed
      await session.socket.readMessages([{
        remoteJid: formattedJid,
        id: statusId,
        participant: undefined
      }]);
      logger.info(`Status viewed for ${jid}`);
    } catch (error) {
      logger.error('Error viewing status:', error);
      throw error;
    }
  }

  async deleteStatus(sessionId: string, statusId: string) {
    const session = this.getSession(sessionId);

    try {
      await session.socket.sendMessage('status@broadcast', {
        delete: {
          remoteJid: 'status@broadcast',
          id: statusId,
          participant: undefined
        }
      });
      logger.info(`Status deleted for session ${sessionId}`);
    } catch (error) {
      logger.error('Error deleting status:', error);
      throw error;
    }
  }

  // ============ CONTACT VALIDATION ============

  async checkNumberRegistered(sessionId: string, phoneNumber: string): Promise<{ registered: boolean; jid?: string }> {
    const session = this.getSession(sessionId);

    try {
      const formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
      const [result] = await session.socket.onWhatsApp(formattedNumber);
      
      return {
        registered: result?.exists || false,
        jid: result?.jid
      };
    } catch (error) {
      logger.error('Error checking number:', error);
      return { registered: false };
    }
  }

  async getContactInfo(sessionId: string, jid: string) {
    const session = this.getSession(sessionId);
    const formattedJid = this.formatJid(jid);

    try {
      const profilePic = await session.socket.profilePictureUrl(formattedJid).catch(() => null);
      const status = await session.socket.fetchStatus(formattedJid).catch(() => null);
      
      return {
        jid: formattedJid,
        name: formattedJid.split('@')[0],
        about: status?.status || '',
        profilePictureUrl: profilePic,
        lastSeen: null // WhatsApp doesn't provide this via API
      };
    } catch (error) {
      logger.error('Error getting contact info:', error);
      throw error;
    }
  }
}

export const whatsappService = new WhatsAppService();
