import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAll, put, remove as dbRemove } from '@/lib/db';
import { Manager, BossConfig } from '@/types/client';

interface AuthContextType {
  manager: Manager | null;
  managers: Manager[];
  bossConfig: BossConfig | null;
  loading: boolean;
  isSetupComplete: boolean;
  login: (name: string, password: string) => Promise<boolean>;
  logout: () => void;
  registerManager: (name: string, password: string) => Promise<boolean>;
  deleteManager: (id: string, bossPassword: string) => Promise<boolean>;
  setupBoss: (name: string, email: string, password: string) => Promise<void>;
  changeBossPassword: (currentPass: string, newPass: string) => Promise<boolean>;
  changeManagerPassword: (currentPass: string, newPass: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [manager, setManager] = useState<Manager | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [bossConfig, setBossConfig] = useState<BossConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const [stored, bossConfigs] = await Promise.all([
        getAll<Manager>('managers'),
        getAll<BossConfig>('bossConfig'),
      ]);
      setManagers(stored);
      if (bossConfigs.length > 0) {
        setBossConfig(bossConfigs[0]);
      }
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

  const deleteManager = async (id: string, bossPass: string): Promise<boolean> => {
    if (!bossConfig || bossPass !== bossConfig.password) return false;
    if (manager?.id === id) return false;
    await dbRemove('managers', id);
    setManagers(prev => prev.filter(m => m.id !== id));
    return true;
  };

  const setupBoss = async (name: string, email: string, password: string) => {
    const config: BossConfig = {
      id: 'boss',
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    };
    await put('bossConfig', config);
    setBossConfig(config);
  };

  const changeBossPassword = async (currentPass: string, newPass: string): Promise<boolean> => {
    if (!bossConfig || currentPass !== bossConfig.password) return false;
    const updated = { ...bossConfig, password: newPass };
    await put('bossConfig', updated);
    setBossConfig(updated);
    return true;
  };

  const changeManagerPassword = async (currentPass: string, newPass: string): Promise<boolean> => {
    if (!manager || currentPass !== manager.password) return false;
    const updated = { ...manager, password: newPass };
    await put('managers', updated);
    setManagers(prev => prev.map(m => m.id === updated.id ? updated : m));
    setManager(updated);
    sessionStorage.setItem('gestornet_session', JSON.stringify(updated));
    return true;
  };

  const isSetupComplete = bossConfig !== null;

  return (
    <AuthContext.Provider value={{ manager, managers, bossConfig, loading, isSetupComplete, login, logout, registerManager, deleteManager, setupBoss, changeBossPassword, changeManagerPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
