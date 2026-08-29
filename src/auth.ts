import type { AuthUser, UserRole } from '@/types';

const STORAGE_KEY = 'kizuna_user';

export function login(name: string, role: UserRole, email: string, extras?: { id?: string; phone?: string }): AuthUser {
  const user: AuthUser = {
    name,
    role,
    email,
    ...(extras?.id ? { id: extras.id } : {}),
    ...(extras?.phone ? { phone: extras.phone } : {}),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function setSession(user: AuthUser): AuthUser {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getUserRole(): UserRole | null {
  const user = getCurrentUser();
  return user?.role ?? null;
}
