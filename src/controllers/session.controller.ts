import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsapp.service';
import { logger } from '../utils/logger';

export class SessionController {
  async createSession(req: Request, res: Response) {
    try {
      const { sessionId, webhook } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
      }

      await whatsappService.createSession(sessionId, webhook);

      res.json({
        success: true,
        message: 'Session created successfully. Open /qr/' + sessionId + ' in browser to scan QR code.',
        sessionId,
        qrUrl: `/qr/${sessionId}`
      });
    } catch (error: any) {
      logger.error('Error creating session:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getSessionStatus(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const status = whatsappService.getSessionStatus(sessionId);

      res.json(status);
    } catch (error: any) {
      logger.error('Error getting session status:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getSessionQR(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const status = whatsappService.getSessionStatus(sessionId);

      logger.info(`QR page accessed for session ${sessionId}, status: ${status.status}, has QR: ${!!status.qr}`);

      if (status.status === 'disconnected') {
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Session Not Found</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
              }
              .container {
                background: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 500px;
              }
              h1 { color: #f44336; margin-bottom: 20px; }
              .icon { font-size: 60px; margin: 20px 0; }
              .code { 
                background: #f5f5f5; 
                padding: 15px; 
                border-radius: 8px; 
                font-family: monospace;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">❌</div>
              <h1>Session Not Found</h1>
              <p>Session <strong>${sessionId}</strong> does not exist.</p>
              <p>Please create the session first:</p>
              <div class="code">
                POST /api/session/create<br>
                { "sessionId": "${sessionId}" }
              </div>
            </div>
          </body>
          </html>
        `);
      }

      if (status.status === 'connected') {
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>WhatsApp Session - ${sessionId}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 500px;
              }
              h1 { color: #25D366; margin-bottom: 20px; }
              .status {
                padding: 15px;
                background: #25D366;
                color: white;
                border-radius: 10px;
                font-size: 18px;
                font-weight: bold;
              }
              .icon { font-size: 60px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">✅</div>
              <h1>Session Connected!</h1>
              <p>Session <strong>${sessionId}</strong> is already connected to WhatsApp.</p>
              <div class="status">Status: Connected</div>
            </div>
          </body>
          </html>
        `);
      }

      if (!status.qr) {
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>WhatsApp Session - ${sessionId}</title>
            <meta http-equiv="refresh" content="2">
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
              }
              .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
                margin: 20px auto;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              h1 { color: #667eea; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="spinner"></div>
              <h1>Generating QR Code...</h1>
              <p>Session: <strong>${sessionId}</strong></p>
              <p>Please wait, page will refresh automatically.</p>
            </div>
          </body>
          </html>
        `);
      }

      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>WhatsApp QR Code - ${sessionId}</title>
          <meta http-equiv="refresh" content="5">
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 500px;
            }
            h1 {
              color: #333;
              margin-bottom: 10px;
            }
            .qr-code {
              margin: 30px auto;
              padding: 20px;
              background: white;
              border-radius: 15px;
              display: inline-block;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .qr-code img {
              display: block;
              width: 300px;
              height: 300px;
            }
            .instructions {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 10px;
              margin-top: 20px;
              text-align: left;
            }
            .instructions ol {
              margin: 10px 0;
              padding-left: 20px;
            }
            .instructions li {
              margin: 8px 0;
            }
            .refresh-note {
              color: #666;
              font-size: 14px;
              margin-top: 20px;
            }
            .session-id {
              background: #667eea;
              color: white;
              padding: 10px 20px;
              border-radius: 20px;
              display: inline-block;
              margin: 10px 0;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📱 Scan QR Code</h1>
            <div class="session-id">Session: ${sessionId}</div>
            
            <div class="qr-code">
              <img src="${status.qr}" alt="QR Code" />
            </div>
            
            <div class="instructions">
              <strong>📋 Instructions:</strong>
              <ol>
                <li>Open WhatsApp on your phone</li>
                <li>Tap Menu or Settings ⚙️</li>
                <li>Tap Linked Devices</li>
                <li>Tap Link a Device</li>
                <li>Point your phone at this screen to scan the QR code</li>
              </ol>
            </div>
            
            <div class="refresh-note">
              ⏱️ Page refreshes every 5 seconds<br>
              QR Code expires after 30 seconds
            </div>
          </div>
        </body>
        </html>
      `);
    } catch (error: any) {
      logger.error('Error getting QR code:', error);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: #f44336;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 20px;
              text-align: center;
            }
            h1 { color: #f44336; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Error</h1>
            <p>${error.message}</p>
          </div>
        </body>
        </html>
      `);
    }
  }

  async getAllSessions(req: Request, res: Response) {
    try {
      const sessions = whatsappService.getAllSessions();
      res.json({ sessions });
    } catch (error: any) {
      logger.error('Error getting all sessions:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async deleteSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      await whatsappService.deleteSession(sessionId);

      res.json({
        success: true,
        message: 'Session deleted successfully'
      });
    } catch (error: any) {
      logger.error('Error deleting session:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const sessionController = new SessionController();
