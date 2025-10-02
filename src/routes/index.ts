import { Router } from 'express';
import { sessionController } from '../controllers/session.controller';
import { messageController } from '../controllers/message.controller';
import { groupController } from '../controllers/group.controller';
import { contactController } from '../controllers/contact.controller';

const router = Router();

router.post('/session/create', sessionController.createSession);
router.get('/session/:sessionId/status', sessionController.getSessionStatus);
router.get('/session/:sessionId/qr', sessionController.getSessionQR);
router.get('/sessions', sessionController.getAllSessions);
router.delete('/session/:sessionId', sessionController.deleteSession);

router.post('/message/text', messageController.sendTextMessage);
router.post('/message/media', messageController.sendMediaMessage);
router.post('/message/media-base64', messageController.sendMediaBase64);
router.post('/message/location', messageController.sendLocationMessage);
router.post('/message/contact', messageController.sendContactMessage);
router.post('/message/bulk', messageController.sendBulkMessages);

router.get('/group/:sessionId/list', groupController.getGroups);
router.post('/group/create', groupController.createGroup);
router.post('/group/participants/add', groupController.addParticipants);
router.post('/group/participants/remove', groupController.removeParticipants);
router.post('/group/leave', groupController.leaveGroup);

router.get('/contact/:sessionId/list', contactController.getContacts);
router.post('/contact/check', contactController.checkNumber);

export default router;
