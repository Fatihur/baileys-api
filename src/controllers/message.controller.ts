import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsapp.service';
import { logger } from '../utils/logger';

export class MessageController {
  async sendTextMessage(req: Request, res: Response) {
    try {
      const { sessionId, to, message } = req.body;

      if (!sessionId || !to || !message) {
        return res.status(400).json({
          error: 'sessionId, to, and message are required'
        });
      }

      await whatsappService.sendTextMessage(sessionId, to, message);

      res.json({
        success: true,
        message: 'Text message sent successfully'
      });
    } catch (error: any) {
      logger.error('Error sending text message:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async sendMediaMessage(req: Request, res: Response) {
    try {
      const { sessionId, to, mediaUrl, mediaType, caption, fileName } = req.body;

      if (!sessionId || !to || !mediaUrl || !mediaType) {
        return res.status(400).json({
          error: 'sessionId, to, mediaUrl, and mediaType are required'
        });
      }

      if (!['image', 'video', 'audio', 'document'].includes(mediaType)) {
        return res.status(400).json({
          error: 'mediaType must be one of: image, video, audio, document'
        });
      }

      await whatsappService.sendMediaMessage(
        sessionId,
        to,
        mediaUrl,
        mediaType,
        caption,
        fileName
      );

      res.json({
        success: true,
        message: `${mediaType} sent successfully`
      });
    } catch (error: any) {
      logger.error('Error sending media message:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async sendMediaBase64(req: Request, res: Response) {
    try {
      const { sessionId, to, mediaBase64, mediaType, caption, fileName } = req.body;

      if (!sessionId || !to || !mediaBase64 || !mediaType) {
        return res.status(400).json({
          error: 'sessionId, to, mediaBase64, and mediaType are required'
        });
      }

      if (!['image', 'video', 'audio', 'document'].includes(mediaType)) {
        return res.status(400).json({
          error: 'mediaType must be one of: image, video, audio, document'
        });
      }

      // Convert base64 to buffer
      const base64Data = mediaBase64.replace(/^data:.*?;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      await whatsappService.sendMediaBuffer(
        sessionId,
        to,
        buffer,
        mediaType,
        caption,
        fileName
      );

      res.json({
        success: true,
        message: `${mediaType} sent successfully`
      });
    } catch (error: any) {
      logger.error('Error sending media base64:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async sendLocationMessage(req: Request, res: Response) {
    try {
      const { sessionId, to, latitude, longitude, name, address } = req.body;

      if (!sessionId || !to || latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          error: 'sessionId, to, latitude, and longitude are required'
        });
      }

      await whatsappService.sendLocationMessage(
        sessionId,
        to,
        latitude,
        longitude,
        name,
        address
      );

      res.json({
        success: true,
        message: 'Location sent successfully'
      });
    } catch (error: any) {
      logger.error('Error sending location:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async sendContactMessage(req: Request, res: Response) {
    try {
      const { sessionId, to, contactName, contactNumber } = req.body;

      if (!sessionId || !to || !contactName || !contactNumber) {
        return res.status(400).json({
          error: 'sessionId, to, contactName, and contactNumber are required'
        });
      }

      await whatsappService.sendContactMessage(sessionId, to, contactName, contactNumber);

      res.json({
        success: true,
        message: 'Contact sent successfully'
      });
    } catch (error: any) {
      logger.error('Error sending contact:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async sendBulkMessages(req: Request, res: Response) {
    try {
      const { sessionId, recipients, message, delay } = req.body;

      if (!sessionId || !recipients || !Array.isArray(recipients) || !message) {
        return res.status(400).json({
          error: 'sessionId, recipients (array), and message are required'
        });
      }

      const results = await whatsappService.sendBulkMessages(
        sessionId,
        recipients,
        message,
        delay
      );

      const successCount = results.filter(r => r.status === 'sent').length;
      const failedCount = results.filter(r => r.status === 'failed').length;

      res.json({
        success: true,
        message: `Bulk messages completed: ${successCount} sent, ${failedCount} failed`,
        results
      });
    } catch (error: any) {
      logger.error('Error sending bulk messages:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const messageController = new MessageController();
