import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { fetchWithAuth, API_BASE_URL } from '@/utils/api';

export interface User {
  id: string;
  name: string;
  email: string;
  country: string;
  avatar?: string;
  role?: string;
  provider?: 'google' | 'email';
}

interface AuthState {
  currentUser: User | null;
  isRestoringSession: boolean;
  isAuthModalOpen: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setIsRestoringSession(false);
        return;
      }
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/users/profile`);
        if (!res.ok) throw new Error('Session expired');
        const data = await res.json();
        setCurrentUser({
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
          country: data.data.country || '',
          avatar: data.data.avatarUrl,
          role: data.data.role,
          provider: data.data.provider || 'email',
        });
        console.log('[Session] Restored user session');
      } catch {
        console.log('[Session] Token expired or invalid, clearing...');
        localStorage.removeItem('accessToken');
      } finally {
        setIsRestoringSession(false);
      }
    };
    restoreSession();
  }, []);

  useEffect(() => {
    const handleAuthLogout = () => {
      setCurrentUser(null);
      console.log('[Auth] Session expired, logged out automatically');
    };
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  const login = useCallback((user: User) => setCurrentUser(user), []);
  const updateUser = useCallback((user: User) => setCurrentUser(user), []);
  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);
  const logout = useCallback(async () => {
    try {
      await fetchWithAuth(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
      console.log('[Logout] Backend logout successful');
    } catch (error) {
      console.error('[Logout] API error:', error);
    }
    localStorage.removeItem('accessToken');
    setCurrentUser(null);
    console.log('[Logout] User logged out successfully');
  }, []);

  if (isRestoringSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">{t('messages.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isRestoringSession,
        isAuthModalOpen,
        login,
        logout,
        updateUser,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
