export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface UserData {
  name: string;
  kizunaPoints: number;
  dailyStreak: number;
  avatarInitial?: string;
}

export interface Lead {
  id: string;
  customerName: string;
  insight: string;
  intent: 'high' | 'medium' | 'low';
  product: string;
  lastActive: string;
  phone?: string;
}

export type ViewMode = 'customer' | 'rm';
