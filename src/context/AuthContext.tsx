import { createContext, useContext, useState } from 'react';
import { mockUsers } from '@/data/users';
import type { AppUser } from '@/data/users';

interface AuthContextType {
  user: AppUser | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => ({ success: false }),
  logout: () => {},
});

const STORAGE_KEY = 'inorins_user_id';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (!savedId) return null;
    return mockUsers.find((u) => u.id === savedId) ?? null;
  });

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const found = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!found) return { success: false, error: 'Invalid email or password.' };
    setUser(found);
    localStorage.setItem(STORAGE_KEY, found.id);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
