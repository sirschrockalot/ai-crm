import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class AuthService {
  private getAuthHeaders() {
    const { accessToken } = useAuthStore.getState();
    return {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const { setTokens, setUser } = useAuthStore.getState();
      
      setTokens(data.access_token, data.refresh_token);
      setUser(data.user);
      
      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      useAuthStore.getState().logout();
      throw error;
    }
  }

  async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        useAuthStore.getState().logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if API call fails
      useAuthStore.getState().logout();
    }
  }

  async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const user = await response.json();
      useAuthStore.getState().setUser(user);
      return user;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  }

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  // Auto-refresh token if needed
  async ensureValidToken() {
    const { accessToken, refreshToken } = useAuthStore.getState();
    
    if (!accessToken || this.isTokenExpired(accessToken)) {
      if (refreshToken) {
        await this.refreshToken(refreshToken);
      } else {
        useAuthStore.getState().logout();
        throw new Error('No valid token available');
      }
    }
  }
}

export const authService = new AuthService(); 