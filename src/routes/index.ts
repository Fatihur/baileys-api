import { Router } from 'express';
import { sessionController } from '../controllers/session.controller';
import { messageController } from '../controllers/message.controller';
import { groupController } from '../controllers/group.controller';
import { contactController } from '../controllers/contact.controller';
import { inboxController } from '../controllers/inbox.controller';
import { presenceController } from '../controllers/presence.controller';
import { statusController } from '../controllers/status.controller';

const router = Router();

// Session routes
router.post('/session/create', sessionController.createSession);
router.get('/session/:sessionId/status', sessionController.getSessionStatus);
router.get('/session/:sessionId/qr', sessionController.getSessionQR);
router.get('/sessions', sessionController.getAllSessions);
router.delete('/session/:sessionId', sessionController.deleteSession);

// Message routes
router.post('/message/text', messageController.sendTextMessage);
router.post('/message/media', messageController.sendMediaMessage);
router.post('/message/media-base64', messageController.sendMediaBase64);
router.post('/message/location', messageController.sendLocationMessage);
router.post('/message/contact', messageController.sendContactMessage);
router.post('/message/bulk', messageController.sendBulkMessages);

// Inbox routes - Message Management
router.get('/messages/:sessionId/:jid', inboxController.getMessages);
router.get('/chats/:sessionId', inboxController.getChats);
router.post('/message/read', inboxController.markAsRead);
router.post('/message/reply', inboxController.replyMessage);
router.post('/message/forward', inboxController.forwardMessage);
router.post('/message/delete', inboxController.deleteMessage);
router.post('/message/pin', inboxController.pinMessage);

// Presence routes
router.post('/presence/set', presenceController.setPresence);
router.get('/presence/:sessionId/:jid', presenceController.getPresence);
router.post('/presence/typing', presenceController.sendTyping);
router.post('/presence/recording', presenceController.sendRecording);

// Status routes
router.post('/status/upload', statusController.uploadStatus);
router.get('/status/:sessionId', statusController.getStatus);
router.post('/status/view', statusController.viewStatus);
router.post('/status/delete', statusController.deleteStatus);

// Group routes
router.get('/group/:sessionId/list', groupController.getGroups);
router.post('/group/create', groupController.createGroup);
router.post('/group/participants/add', groupController.addParticipants);
router.post('/group/participants/remove', groupController.removeParticipants);
router.post('/group/leave', groupController.leaveGroup);

// Contact routes
router.get('/contact/:sessionId/list', contactController.getContacts);
router.post('/contact/check', contactController.checkNumber);
router.get('/contact/info/:sessionId/:jid', contactController.getContactInfo);

export default router;
