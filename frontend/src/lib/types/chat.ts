export interface ChatMessage {
  id: string;
  text: string;
  response: 'bot' | 'user';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  name: string;
  timestamp: Date;
  lastMessage: string;
}