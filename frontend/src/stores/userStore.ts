import { create } from 'zustand';
import { userService } from '../services/users';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  is_active: boolean;
  avatar_url?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    dashboard_layout?: object;
    default_view?: 'leads' | 'buyers' | 'dashboard';
  };
  last_login?: Date;
  created_at: Date;
  permissions: string[];
}

interface UserState {
  users: User[];
  user: User | null; // Current user
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  createUser: (userData: any) => Promise<void>;
  updateUser: (userId: string, userData: any) => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
  updatePreferences: (preferences: any) => Promise<void>;
  activateUser: (userId: string) => Promise<void>;
  deactivateUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  user: null,
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const users = await userService.getUsers();
      set({ users, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch users', 
        loading: false 
      });
    }
  },

  fetchCurrentUser: async () => {
    set({ loading: true, error: null });
    try {
      const user = await userService.getCurrentUser();
      set({ user, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch current user', 
        loading: false 
      });
    }
  },

  createUser: async (userData) => {
    set({ loading: true, error: null });
    try {
      await userService.createUser(userData);
      // Refresh the user list
      await get().fetchUsers();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create user', 
        loading: false 
      });
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    set({ loading: true, error: null });
    try {
      await userService.updateUser(userId, userData);
      // Refresh the user list
      await get().fetchUsers();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update user', 
        loading: false 
      });
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const updatedUser = await userService.updateProfile(profileData);
      set({ user: updatedUser, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update profile', 
        loading: false 
      });
      throw error;
    }
  },

  updatePreferences: async (preferences) => {
    set({ loading: true, error: null });
    try {
      const updatedUser = await userService.updatePreferences(preferences);
      set({ user: updatedUser, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update preferences', 
        loading: false 
      });
      throw error;
    }
  },

  activateUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      await userService.activateUser(userId);
      // Refresh the user list
      await get().fetchUsers();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to activate user', 
        loading: false 
      });
      throw error;
    }
  },

  deactivateUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      await userService.deactivateUser(userId);
      // Refresh the user list
      await get().fetchUsers();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to deactivate user', 
        loading: false 
      });
      throw error;
    }
  },

  deleteUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      await userService.deleteUser(userId);
      // Refresh the user list
      await get().fetchUsers();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete user', 
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
})); 