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

export type UserRole = 'customer' | 'rm';

export interface AuthUser {
  name: string;
  role: UserRole;
  email: string;
}

export type Language = 'en' | 'mm';
