import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsapp.service';
import { logger } from '../utils/logger';

export class StatusController {
  // Upload status/story
  async uploadStatus(req: Request, res: Response) {
    try {
      const { sessionId, mediaBase64, mediaType, caption } = req.body;

      if (!sessionId || !mediaBase64 || !mediaType) {
        return res.status(400).json({
          error: 'sessionId, mediaBase64, and mediaType are required'
        });
      }

      if (!['image', 'video', 'text'].includes(mediaType)) {
        return res.status(400).json({
          error: 'mediaType must be one of: image, video, text'
        });
      }

      // Convert base64 to buffer
      const base64Data = mediaBase64.replace(/^data:.*?;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      await whatsappService.uploadStatus(sessionId, buffer, mediaType, caption);

      res.json({
        success: true,
        message: 'Status uploaded successfully'
      });
    } catch (error: any) {
      logger.error('Error uploading status:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get status updates
  async getStatus(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!sessionId) {
        return res.status(400).json({
          error: 'sessionId is required'
        });
      }

      const statuses = await whatsappService.getStatus(sessionId, limit);

      res.json({
        success: true,
        statuses
      });
    } catch (error: any) {
      logger.error('Error getting status:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // View someone's status
  async viewStatus(req: Request, res: Response) {
    try {
      const { sessionId, jid, statusId } = req.body;

      if (!sessionId || !jid || !statusId) {
        return res.status(400).json({
          error: 'sessionId, jid, and statusId are required'
        });
      }

      await whatsappService.viewStatus(sessionId, jid, statusId);

      res.json({
        success: true,
        message: 'Status viewed'
      });
    } catch (error: any) {
      logger.error('Error viewing status:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Delete status
  async deleteStatus(req: Request, res: Response) {
    try {
      const { sessionId, statusId } = req.body;

      if (!sessionId || !statusId) {
        return res.status(400).json({
          error: 'sessionId and statusId are required'
        });
      }

      await whatsappService.deleteStatus(sessionId, statusId);

      res.json({
        success: true,
        message: 'Status deleted successfully'
      });
    } catch (error: any) {
      logger.error('Error deleting status:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const statusController = new StatusController();
