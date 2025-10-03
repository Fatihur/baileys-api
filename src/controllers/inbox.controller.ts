import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsapp.service';
import { logger } from '../utils/logger';

export class InboxController {
  // Get messages from a chat
  async getMessages(req: Request, res: Response) {
    try {
      const { sessionId, jid } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!sessionId || !jid) {
        return res.status(400).json({
          error: 'sessionId and jid are required'
        });
      }

      const messages = await whatsappService.getMessages(sessionId, jid, limit);

      res.json({
        success: true,
        messages
      });
    } catch (error: any) {
      logger.error('Error getting messages:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get all chats
  async getChats(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          error: 'sessionId is required'
        });
      }

      const chats = await whatsappService.getChats(sessionId);

      res.json({
        success: true,
        chats
      });
    } catch (error: any) {
      logger.error('Error getting chats:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Mark message as read
  async markAsRead(req: Request, res: Response) {
    try {
      const { sessionId, jid, messageKey } = req.body;

      if (!sessionId || !jid || !messageKey) {
        return res.status(400).json({
          error: 'sessionId, jid, and messageKey are required'
        });
      }

      await whatsappService.markAsRead(sessionId, jid, messageKey);

      res.json({
        success: true,
        message: 'Message marked as read'
      });
    } catch (error: any) {
      logger.error('Error marking message as read:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Reply to message
  async replyMessage(req: Request, res: Response) {
    try {
      const { sessionId, jid, quotedMessage, replyText } = req.body;

      if (!sessionId || !jid || !quotedMessage || !replyText) {
        return res.status(400).json({
          error: 'sessionId, jid, quotedMessage, and replyText are required'
        });
      }

      await whatsappService.replyMessage(sessionId, jid, quotedMessage, replyText);

      res.json({
        success: true,
        message: 'Reply sent successfully'
      });
    } catch (error: any) {
      logger.error('Error replying to message:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Forward message
  async forwardMessage(req: Request, res: Response) {
    try {
      const { sessionId, fromJid, toJid, messageKey } = req.body;

      if (!sessionId || !fromJid || !toJid || !messageKey) {
        return res.status(400).json({
          error: 'sessionId, fromJid, toJid, and messageKey are required'
        });
      }

      await whatsappService.forwardMessage(sessionId, fromJid, toJid, messageKey);

      res.json({
        success: true,
        message: 'Message forwarded successfully'
      });
    } catch (error: any) {
      logger.error('Error forwarding message:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Delete message
  async deleteMessage(req: Request, res: Response) {
    try {
      const { sessionId, jid, messageKey, forEveryone } = req.body;

      if (!sessionId || !jid || !messageKey) {
        return res.status(400).json({
          error: 'sessionId, jid, and messageKey are required'
        });
      }

      await whatsappService.deleteMessage(sessionId, jid, messageKey, forEveryone);

      res.json({
        success: true,
        message: forEveryone ? 'Message deleted for everyone' : 'Message deleted for you'
      });
    } catch (error: any) {
      logger.error('Error deleting message:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Pin/Unpin message
  async pinMessage(req: Request, res: Response) {
    try {
      const { sessionId, jid, messageKey, pin } = req.body;

      if (!sessionId || !jid || !messageKey) {
        return res.status(400).json({
          error: 'sessionId, jid, and messageKey are required'
        });
      }

      await whatsappService.pinMessage(sessionId, jid, messageKey, pin !== false);

      res.json({
        success: true,
        message: pin !== false ? 'Message pinned' : 'Message unpinned'
      });
    } catch (error: any) {
      logger.error('Error pinning message:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const inboxController = new InboxController();
