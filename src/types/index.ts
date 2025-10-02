export interface SessionConfig {
  sessionId: string;
  webhook?: string;
}

export interface SendMessagePayload {
  sessionId: string;
  to: string;
  message: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
}

export interface SessionStatus {
  sessionId: string;
  status: 'connected' | 'connecting' | 'disconnected';
  qr?: string;
}
