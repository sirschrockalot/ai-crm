import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class UserService {
  private getAuthHeaders() {
    const { accessToken } = useAuthStore.getState();
    return {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };
  }

  async getUsers(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async createUser(userData: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async activateUser(userId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/activate`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to activate user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  }

  async deactivateUser(userId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/deactivate`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to deactivate user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/permissions`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user permissions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  }

  async getMyProfile(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile/me`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }
}

export const userService = new UserService(); 