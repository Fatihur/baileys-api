import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsapp.service';
import { logger } from '../utils/logger';

export class ContactController {
  async getContacts(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const contacts = await whatsappService.getContacts(sessionId);

      res.json({
        success: true,
        contacts
      });
    } catch (error: any) {
      logger.error('Error getting contacts:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async checkNumber(req: Request, res: Response) {
    try {
      const { sessionId, number } = req.body;

      if (!sessionId || !number) {
        return res.status(400).json({
          error: 'sessionId and number are required'
        });
      }

      const result = await whatsappService.checkNumberRegistered(sessionId, number);

      res.json({
        success: true,
        ...result
      });
    } catch (error: any) {
      logger.error('Error checking number:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getContactInfo(req: Request, res: Response) {
    try {
      const { sessionId, jid } = req.params;

      if (!sessionId || !jid) {
        return res.status(400).json({
          error: 'sessionId and jid are required'
        });
      }

      const contactInfo = await whatsappService.getContactInfo(sessionId, jid);

      res.json({
        success: true,
        contact: contactInfo
      });
    } catch (error: any) {
      logger.error('Error getting contact info:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const contactController = new ContactController();
