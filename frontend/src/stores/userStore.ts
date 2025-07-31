import { create } from 'zustand';
import { userService } from '../services/users';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  avatar_url?: string;
  last_login?: Date;
  created_at: Date;
  permissions: string[];
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (userData: any) => Promise<void>;
  updateUser: (userId: string, userData: any) => Promise<void>;
  activateUser: (userId: string) => Promise<void>;
  deactivateUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
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