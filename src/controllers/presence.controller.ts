import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsapp.service';
import { logger } from '../utils/logger';

export class PresenceController {
  // Set presence (available/unavailable)
  async setPresence(req: Request, res: Response) {
    try {
      const { sessionId, jid, presence } = req.body;

      if (!sessionId || !jid || !presence) {
        return res.status(400).json({
          error: 'sessionId, jid, and presence are required'
        });
      }

      if (!['available', 'unavailable'].includes(presence)) {
        return res.status(400).json({
          error: 'presence must be "available" or "unavailable"'
        });
      }

      await whatsappService.setPresence(sessionId, jid, presence);

      res.json({
        success: true,
        message: `Presence set to ${presence}`
      });
    } catch (error: any) {
      logger.error('Error setting presence:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get presence info
  async getPresence(req: Request, res: Response) {
    try {
      const { sessionId, jid } = req.params;

      if (!sessionId || !jid) {
        return res.status(400).json({
          error: 'sessionId and jid are required'
        });
      }

      const presence = await whatsappService.getPresence(sessionId, jid);

      res.json({
        success: true,
        presence
      });
    } catch (error: any) {
      logger.error('Error getting presence:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Send typing indicator
  async sendTyping(req: Request, res: Response) {
    try {
      const { sessionId, jid, isTyping } = req.body;

      if (!sessionId || !jid) {
        return res.status(400).json({
          error: 'sessionId and jid are required'
        });
      }

      await whatsappService.sendTyping(sessionId, jid, isTyping !== false);

      res.json({
        success: true,
        message: isTyping !== false ? 'Typing indicator sent' : 'Typing stopped'
      });
    } catch (error: any) {
      logger.error('Error sending typing indicator:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Send recording indicator
  async sendRecording(req: Request, res: Response) {
    try {
      const { sessionId, jid, isRecording } = req.body;

      if (!sessionId || !jid) {
        return res.status(400).json({
          error: 'sessionId and jid are required'
        });
      }

      await whatsappService.sendRecording(sessionId, jid, isRecording !== false);

      res.json({
        success: true,
        message: isRecording !== false ? 'Recording indicator sent' : 'Recording stopped'
      });
    } catch (error: any) {
      logger.error('Error sending recording indicator:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const presenceController = new PresenceController();
