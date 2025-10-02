import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key is required',
      message: 'Please provide X-API-KEY header or apiKey query parameter'
    });
  }

  if (apiKey !== process.env.API_KEY) {
    logger.warn(`Invalid API key attempt: ${apiKey}`);
    return res.status(403).json({
      error: 'Invalid API key'
    });
  }

  next();
};
