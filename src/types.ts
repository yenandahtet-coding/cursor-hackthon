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
  timestamp?: number;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  lastActive: string;
  leadCount: number;
  latestInsight?: string;
  product?: string;
  intent?: Lead['intent'];
  source: 'registered' | 'lead';
}

export type UserRole = 'customer' | 'rm';

export interface AuthUser {
  id?: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
}

export type Language = 'en' | 'mm';
