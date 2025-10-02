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

interface SessionData {
  socket: WASocket;
  qr?: string;
  status: 'connected' | 'connecting' | 'disconnected';
  webhook?: string;
  phoneNumber?: string;
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
      webhook
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
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

        logger.info(`Connection closed for session ${sessionId}, reconnecting: ${shouldReconnect}`);

        if (shouldReconnect) {
          await this.createSession(sessionId, webhook);
        } else {
          this.sessions.delete(sessionId);
          sessionData.status = 'disconnected';
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
    const contacts = await session.socket.store?.contacts;

    if (!contacts) {
      return [];
    }

    return Object.values(contacts).map((contact: any) => ({
      id: contact.id,
      name: contact.name || contact.notify,
      notify: contact.notify
    }));
  }

  async checkNumberRegistered(sessionId: string, number: string) {
    const session = this.getSession(sessionId);
    const jid = this.formatJid(number);

    try {
      const [result] = await session.socket.onWhatsApp(jid);
      return {
        exists: !!result,
        jid: result?.jid
      };
    } catch (error) {
      return {
        exists: false
      };
    }
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
}

export const whatsappService = new WhatsAppService();
