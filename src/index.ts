import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import routes from './routes';
import { logger } from './utils/logger';
import { authMiddleware } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(limiter);

// Serve static files (Web UI)
app.use(express.static(path.join(__dirname, '../public')));

// QR Code page (no auth)
app.get('/qr/:sessionId', (req, res, next) => {
  import('./controllers/session.controller').then(({ sessionController }) => {
    sessionController.getSessionQR(req, res);
  }).catch(next);
});

// API routes (with auth)
app.use('/api', authMiddleware, routes);

app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Baileys WhatsApp Gateway API',
    version: '2.0.0',
    qrCodeUrl: 'Open /qr/:sessionId in browser to scan QR code (no auth needed)',
    documentation: {
      sessions: {
        'POST /api/session/create': 'Create new session',
        'GET /api/session/:sessionId/status': 'Get session status and QR code (JSON)',
        'GET /qr/:sessionId': 'View QR code in browser (HTML, no auth)',
        'GET /api/sessions': 'Get all sessions',
        'DELETE /api/session/:sessionId': 'Delete session'
      },
      messages: {
        'POST /api/message/text': 'Send text message',
        'POST /api/message/media': 'Send media (image/video/audio/document)',
        'POST /api/message/location': 'Send location',
        'POST /api/message/contact': 'Send contact',
        'POST /api/message/bulk': 'Send bulk messages'
      },
      groups: {
        'GET /api/group/:sessionId/list': 'Get all groups',
        'POST /api/group/create': 'Create new group',
        'POST /api/group/participants/add': 'Add participants to group',
        'POST /api/group/participants/remove': 'Remove participants from group',
        'POST /api/group/leave': 'Leave group'
      },
      contacts: {
        'GET /api/contact/:sessionId/list': 'Get all contacts',
        'POST /api/contact/check': 'Check if number is registered on WhatsApp'
      }
    },
    authentication: 'Add X-API-KEY header or apiKey query parameter'
  });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
