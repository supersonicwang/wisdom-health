export enum Sender {
  USER = 'user',
  BOT = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  isRedacted?: boolean; // If true, indicates privacy filter blocked some content
  isBlocked?: boolean; // If true, indicates adversarial defense blocked the input
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface DefenseStatus {
  privacyShield: boolean;
  adversarialGuard: boolean;
}

export interface ServiceResponse {
  text: string;
  error?: string;
}