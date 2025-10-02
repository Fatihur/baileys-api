import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsapp.service';
import { logger } from '../utils/logger';

export class GroupController {
  async getGroups(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const groups = await whatsappService.getGroups(sessionId);

      res.json({
        success: true,
        groups
      });
    } catch (error: any) {
      logger.error('Error getting groups:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createGroup(req: Request, res: Response) {
    try {
      const { sessionId, groupName, participants } = req.body;

      if (!sessionId || !groupName || !participants || !Array.isArray(participants)) {
        return res.status(400).json({
          error: 'sessionId, groupName, and participants (array) are required'
        });
      }

      const result = await whatsappService.createGroup(sessionId, groupName, participants);

      res.json({
        success: true,
        ...result
      });
    } catch (error: any) {
      logger.error('Error creating group:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async addParticipants(req: Request, res: Response) {
    try {
      const { sessionId, groupId, participants } = req.body;

      if (!sessionId || !groupId || !participants || !Array.isArray(participants)) {
        return res.status(400).json({
          error: 'sessionId, groupId, and participants (array) are required'
        });
      }

      await whatsappService.addParticipantsToGroup(sessionId, groupId, participants);

      res.json({
        success: true,
        message: 'Participants added successfully'
      });
    } catch (error: any) {
      logger.error('Error adding participants:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async removeParticipants(req: Request, res: Response) {
    try {
      const { sessionId, groupId, participants } = req.body;

      if (!sessionId || !groupId || !participants || !Array.isArray(participants)) {
        return res.status(400).json({
          error: 'sessionId, groupId, and participants (array) are required'
        });
      }

      await whatsappService.removeParticipantsFromGroup(sessionId, groupId, participants);

      res.json({
        success: true,
        message: 'Participants removed successfully'
      });
    } catch (error: any) {
      logger.error('Error removing participants:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async leaveGroup(req: Request, res: Response) {
    try {
      const { sessionId, groupId } = req.body;

      if (!sessionId || !groupId) {
        return res.status(400).json({
          error: 'sessionId and groupId are required'
        });
      }

      await whatsappService.leaveGroup(sessionId, groupId);

      res.json({
        success: true,
        message: 'Left group successfully'
      });
    } catch (error: any) {
      logger.error('Error leaving group:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const groupController = new GroupController();
