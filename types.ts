
export enum AppView {
  Home = 'home',
  PhotoAI = 'photo-ai',
  FileConverter = 'file-converter',
  SmartChat = 'smart-chat',
  ArticleAI = 'article-ai',
  TestAI = 'test-ai',
  PresentationAI = 'presentation-ai'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isVoice?: boolean;
}

export interface FileData {
  name: string;
  type: string;
  size: number;
  content: string; // Base64
  textContent?: string; // Extracted text for Live API context
}
