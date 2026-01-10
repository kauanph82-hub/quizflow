import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser, ClientAuth, LoginCredentials, RegisterCredentials } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPremium: boolean;
  premiumStatus: {
    isActive: boolean;
    type: 'trial' | 'premium' | 'expired';
    expiresAt?: string;
    daysLeft?: number;
  };
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = ClientAuth.getToken();
        const storedUser = ClientAuth.getUser();

        if (token && storedUser) {
          // Verify token is still valid by making a request
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
          } else {
            // Token is invalid, clear auth
            ClientAuth.clearAuth();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        ClientAuth.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store auth data
      ClientAuth.setAuth(data.token, data.user);
      setUser(data.user);

      toast({
        title: 'Login realizado com sucesso!',
        description: `Bem-vindo de volta, ${data.user.email}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro no login';
      toast({
        title: 'Erro no login',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store auth data
      ClientAuth.setAuth(data.token, data.user);
      setUser(data.user);

      toast({
        title: 'Conta criada com sucesso! 🎉',
        description: 'Você tem 7 dias de trial gratuito para testar todas as funcionalidades.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro no cadastro';
      toast({
        title: 'Erro no cadastro',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    ClientAuth.clearAuth();
    setUser(null);
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
    });
  };

  const refreshUser = async () => {
    try {
      const token = ClientAuth.getToken();
      if (!token) return;

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        ClientAuth.setAuth(token, data.user);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // Calculate premium status
  const getPremiumStatus = () => {
    if (!user) {
      return {
        isActive: false,
        type: 'expired' as const,
        daysLeft: 0,
      };
    }

    const now = new Date();

    // Check premium subscription
    if (user.isPremium && user.subscriptionExpiresAt) {
      const expiresAt = new Date(user.subscriptionExpiresAt);
      const isActive = expiresAt > now;
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        isActive,
        type: isActive ? 'premium' as const : 'expired' as const,
        expiresAt: user.subscriptionExpiresAt,
        daysLeft: isActive ? daysLeft : 0,
      };
    }

    // Check trial
    if (user.trialEndsAt) {
      const expiresAt = new Date(user.trialEndsAt);
      const isActive = expiresAt > now;
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        isActive,
        type: isActive ? 'trial' as const : 'expired' as const,
        expiresAt: user.trialEndsAt,
        daysLeft: isActive ? daysLeft : 0,
      };
    }

    return {
      isActive: false,
      type: 'expired' as const,
      daysLeft: 0,
    };
  };

  const premiumStatus = getPremiumStatus();

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isPremium: premiumStatus.isActive,
    premiumStatus,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protecting routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
          <div className="glass-card rounded-3xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary to-cyan-400 animate-spin">
              <div className="w-full h-full rounded-full border-4 border-transparent border-t-white" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Carregando...</h2>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return null;
    }

    return <Component {...props} />;
  };
};

// Higher-order component for requiring premium access
export const withPremium = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { isPremium, isLoading, premiumStatus } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
          <div className="glass-card rounded-3xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary to-cyan-400 animate-spin">
              <div className="w-full h-full rounded-full border-4 border-transparent border-t-white" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Carregando...</h2>
          </div>
        </div>
      );
    }

    if (!isPremium) {
      // Redirect to upgrade page
      window.location.href = '/upgrade';
      return null;
    }

    return <Component {...props} />;
  };
};