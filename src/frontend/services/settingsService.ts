import { apiService } from './apiService';
import { getUserManagementServiceConfig } from './configService';

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
    description?: string;
    industry?: string;
    founded?: string;
    employees?: number;
    revenue?: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    customCss?: string;
    fontFamily?: string;
    slogan?: string;
    mission?: string;
    vision?: string;
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
  private baseUrl = '/settings';

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

  // User Management (Admin only) - Using Frontend API Routes
  async getUsers(params: {
    search?: string;
    role?: string;
    roles?: string[];
    department?: string;
    organizationId?: string;
    isActive?: boolean;
    isEmailVerified?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeInactive?: boolean;
  } = {}): Promise<any[]> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => queryParams.append(key, item));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    const response = await apiService.get(`/users?${queryParams}`);
    // Service returns { users, total, page, limit } – UI expects array for now
    if (response?.data?.users) {
      return response.data.users as any[];
    }
    return (response.data ?? []) as any[];
  }

  async createUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
    roles?: string[];
    title?: string;
    department?: string;
    phone?: string;
    avatar?: string;
    organizationId?: string;
    departmentId?: string;
    password?: string;
  }): Promise<any> {
    // Validate password meets requirements
    if (!userData.password) {
      throw new Error('Password is required');
    }
    
    // Password must contain: uppercase, lowercase, number, and special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(userData.password)) {
      throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }
    
    // Map UI fields to API contract
    const payload: any = {
      email: userData.email.trim().toLowerCase(),
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      password: userData.password,
      roles: userData.roles || (userData.role ? [userData.role] : ['Agent']),
      title: userData.title?.trim(),
      department: userData.department?.trim(),
      phone: userData.phone?.trim(),
      avatar: userData.avatar,
      organizationId: userData.organizationId,
      departmentId: userData.departmentId,
      isActive: true,
    };

    // Remove undefined/null values to avoid validation issues
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
        delete payload[key];
      }
    });

    const response = await apiService.post('/users', payload);
    return response.data;
  }

  async updateUser(userId: string, userData: Partial<{
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
    title?: string;
    department?: string;
    phone?: string;
    avatar?: string;
    organizationId?: string;
    departmentId?: string;
    isActive?: boolean;
    preferences?: Record<string, any>;
    metadata?: Record<string, any>;
  }>): Promise<any> {
    // Map potential role field to roles array if provided
    const payload: any = { ...userData };

    // Normalize organizational unit field name from UI to API contract
    if ((payload as any).organizationalUnit && !payload.organizationId) {
      payload.organizationId = (payload as any).organizationalUnit;
    }
    delete (payload as any).organizationalUnit; // Backend forbids unknown properties
    if (userData.role) {
      payload.roles = [userData.role];
      delete payload.role;
    }

    const response = await apiService.patch(`/users/${userId}`, payload);
    return response.data;
  }

  async deleteUser(userId: string): Promise<void> {
    await apiService.delete(`/users/${userId}`);
  }

  async updateUserRoles(userId: string, roles: string[]): Promise<any> {
    const response = await apiService.patch(`/users/${userId}/roles`, { roles });
    return response.data;
  }

  async activateUser(userId: string): Promise<any> {
    const response = await apiService.patch(`/users/${userId}/activate`);
    return response.data;
  }

  async deactivateUser(userId: string): Promise<any> {
    const response = await apiService.patch(`/users/${userId}/deactivate`);
    return response.data;
  }

  async getUserStats(): Promise<any> {
    const response = await apiService.get('/users/stats');
    return response.data;
  }

  // Role Management (Admin only) - Using Frontend API Routes
  async getRoles(organizationId?: string): Promise<any[]> {
    const url = organizationId 
      ? `/roles?organizationId=${organizationId}`
      : '/roles';
    const response = await apiService.get(url);
    return response.data;
  }

  async createRole(roleData: {
    name: string;
    description: string;
    permissions: string[];
    organizationId?: string;
    isActive?: boolean;
    metadata?: Record<string, any>;
  }): Promise<any> {
    const response = await apiService.post('/roles', roleData);
    return response.data;
  }

  async updateRole(roleId: string, roleData: Partial<{
    name: string;
    description: string;
    permissions: string[];
    isActive: boolean;
    metadata: Record<string, any>;
  }>): Promise<any> {
    const response = await apiService.patch(`/roles/${roleId}`, roleData);
    return response.data;
  }

  async deleteRole(roleId: string): Promise<void> {
    await apiService.delete(`/roles/${roleId}`);
  }

  async updateRolePermissions(roleId: string, permissions: string[]): Promise<any> {
    const response = await apiService.patch(`/roles/${roleId}/permissions`, { permissions });
    return response.data;
  }

  async getRoleStats(): Promise<any> {
    const response = await apiService.get('/roles/stats');
    return response.data;
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
