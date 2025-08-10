import { apiService } from './apiService';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  department?: string;
  avatar?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  dashboard: {
    layout: 'grid' | 'list';
    defaultView: string;
    refreshInterval: number;
  };
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
    types: string[];
  };
  push: {
    enabled: boolean;
    types: string[];
  };
  sms: {
    enabled: boolean;
    types: string[];
  };
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: 'totp' | 'sms' | 'email';
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays: number;
  };
  sessionTimeout: number;
  loginHistory: boolean;
  ipRestrictions: string[];
}

export interface SystemSettings {
  company: {
    name: string;
    logo?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    customCss?: string;
  };
  features: {
    [key: string]: boolean;
  };
  integrations: {
    [key: string]: {
      enabled: boolean;
      config: Record<string, any>;
    };
  };
}

export interface SettingsResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class SettingsService {
  private baseUrl = '/api/settings';

  // User Profile Management
  async getUserProfile(): Promise<UserProfile> {
    const response = await apiService.get(`${this.baseUrl}/profile`);
    return response.data;
  }

  async updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiService.patch(`${this.baseUrl}/profile`, profile);
    return response.data;
  }

  // User Preferences
  async getUserPreferences(): Promise<UserPreferences> {
    const response = await apiService.get(`${this.baseUrl}/preferences`);
    return response.data;
  }

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await apiService.patch(`${this.baseUrl}/preferences`, preferences);
    return response.data;
  }

  // Notification Settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await apiService.get(`${this.baseUrl}/notifications`);
    return response.data;
  }

  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const response = await apiService.patch(`${this.baseUrl}/notifications`, settings);
    return response.data;
  }

  // Security Settings
  async getSecuritySettings(): Promise<SecuritySettings> {
    const response = await apiService.get(`${this.baseUrl}/security`);
    return response.data;
  }

  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
    const response = await apiService.patch(`${this.baseUrl}/security`, settings);
    return response.data;
  }

  async enableTwoFactor(method: 'totp' | 'sms' | 'email'): Promise<{ qrCode?: string; backupCodes: string[] }> {
    const response = await apiService.post(`${this.baseUrl}/security/2fa/enable`, { method });
    return response.data;
  }

  async disableTwoFactor(): Promise<void> {
    await apiService.post(`${this.baseUrl}/security/2fa/disable`);
  }

  async verifyTwoFactor(code: string): Promise<boolean> {
    const response = await apiService.post(`${this.baseUrl}/security/2fa/verify`, { code });
    return response.data.verified;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.post(`${this.baseUrl}/security/password`, {
      currentPassword,
      newPassword,
    });
  }

  // System Settings (Admin only)
  async getSystemSettings(): Promise<SystemSettings> {
    const response = await apiService.get(`${this.baseUrl}/system`);
    return response.data;
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const response = await apiService.patch(`${this.baseUrl}/system`, settings);
    return response.data;
  }

  // User Management (Admin only)
  async getUsers(): Promise<any[]> {
    const response = await apiService.get(`${this.baseUrl}/users`);
    return response.data;
  }

  async createUser(userData: any): Promise<any> {
    const response = await apiService.post(`${this.baseUrl}/users`, userData);
    return response.data;
  }

  async updateUser(userId: string, userData: any): Promise<any> {
    const response = await apiService.patch(`${this.baseUrl}/users/${userId}`, userData);
    return response.data;
  }

  async deleteUser(userId: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/users/${userId}`);
  }

  // Role Management (Admin only)
  async getRoles(): Promise<any[]> {
    const response = await apiService.get(`${this.baseUrl}/roles`);
    return response.data;
  }

  async createRole(roleData: any): Promise<any> {
    const response = await apiService.post(`${this.baseUrl}/roles`, roleData);
    return response.data;
  }

  async updateRole(roleId: string, roleData: any): Promise<any> {
    const response = await apiService.patch(`${this.baseUrl}/roles/${roleId}`, roleData);
    return response.data;
  }

  async deleteRole(roleId: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/roles/${roleId}`);
  }

  // Audit and Analytics
  async getSettingsHistory(): Promise<any[]> {
    const response = await apiService.get(`${this.baseUrl}/history`);
    return response.data;
  }

  async getSettingsAnalytics(): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/analytics`);
    return response.data;
  }

  // Backup and Restore
  async exportSettings(): Promise<Blob> {
    const response = await apiService.get(`${this.baseUrl}/export`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async importSettings(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('settings', file);
    await apiService.post(`${this.baseUrl}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const settingsService = new SettingsService();
