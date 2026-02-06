import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAll, put } from '@/lib/db';
import { Manager } from '@/types/client';

interface AuthContextType {
  manager: Manager | null;
  managers: Manager[];
  loading: boolean;
  login: (name: string, password: string) => Promise<boolean>;
  logout: () => void;
  registerManager: (name: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [manager, setManager] = useState<Manager | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const stored = await getAll<Manager>('managers');
      setManagers(stored);
      const session = sessionStorage.getItem('gestornet_session');
      if (session) {
        const parsed = JSON.parse(session);
        const valid = stored.find(m => m.id === parsed.id);
        if (valid) setManager(valid);
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (name: string, password: string): Promise<boolean> => {
    const stored = await getAll<Manager>('managers');
    const found = stored.find(m => m.name === name && m.password === password);
    if (found) {
      setManager(found);
      sessionStorage.setItem('gestornet_session', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const logout = () => {
    setManager(null);
    sessionStorage.removeItem('gestornet_session');
  };

  const registerManager = async (name: string, password: string): Promise<boolean> => {
    const existing = await getAll<Manager>('managers');
    if (existing.some(m => m.name.toLowerCase() === name.toLowerCase())) return false;
    const newManager: Manager = { id: Date.now().toString(), name, password };
    await put('managers', newManager);
    setManagers(prev => [...prev, newManager]);
    return true;
  };

  return (
    <AuthContext.Provider value={{ manager, managers, loading, login, logout, registerManager }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
