export interface SendTextMessage {
  sessionId: string;
  to: string;
  message: string;
}

export interface SendMediaMessage {
  sessionId: string;
  to: string;
  mediaUrl: string;
  caption?: string;
  mediaType: 'image' | 'video' | 'audio' | 'document';
  fileName?: string;
}

export interface SendLocationMessage {
  sessionId: string;
  to: string;
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface SendContactMessage {
  sessionId: string;
  to: string;
  contactName: string;
  contactNumber: string;
}

export interface BulkMessage {
  sessionId: string;
  recipients: string[];
  message: string;
  delay?: number;
}
