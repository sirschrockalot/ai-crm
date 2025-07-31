import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: string;
  tenant_id: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (isAuthenticated: boolean) => void;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      
      setAuth: (isAuthenticated: boolean) => set({ isAuthenticated }),
      
      setUser: (user: User | null) => set({ user }),
      
      setTokens: (accessToken: string, refreshToken: string) => 
        set({ accessToken, refreshToken }),
      
      logout: () => {
        // Clear tokens from localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      },
      
      updateUser: (user: User) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
); 