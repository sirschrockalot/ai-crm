import { apiService } from './apiService';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  isEmailVerified?: boolean;
  mfaEnabled?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface MFASetupResponse {
  qrCodeUrl: string;
  secretKey: string;
  backupCodes: string[];
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

export interface TestModeLoginRequest {
  userId: string;
  email: string;
  role: string;
}

class AuthService {
  private readonly baseUrl = '/api/auth';

  // Login with email/password
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(`${this.baseUrl}/login`, credentials);
    return response.data;
  }

  // Google OAuth login
  async googleLogin(): Promise<void> {
    const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    window.location.href = googleAuthUrl;
  }

  // Google OAuth registration
  async googleRegister(): Promise<void> {
    const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/register/google`;
    window.location.href = googleAuthUrl;
  }

  // Handle OAuth callback
  async handleOAuthCallback(code: string, state?: string): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(`${this.baseUrl}/google/callback`, {
      code,
      state,
    });
    return response.data;
  }

  // Register new user
  async register(data: RegisterData): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>(`${this.baseUrl}/register`, data);
    return response.data;
  }

  // Request password reset
  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>(`${this.baseUrl}/reset-password`, data);
    return response.data;
  }

  // Confirm password reset
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>(`${this.baseUrl}/reset-password/confirm`, data);
    return response.data;
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<User>(`${this.baseUrl}/me`);
    return response.data;
  }

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(`${this.baseUrl}/refresh`);
    return response.data;
  }

  // Logout
  async logout(): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>(`${this.baseUrl}/logout`);
    return response.data;
  }

  // MFA Setup
  async setupMFA(): Promise<MFASetupResponse> {
    const response = await apiService.post<MFASetupResponse>(`${this.baseUrl}/mfa/setup`);
    return response.data;
  }

  // MFA Verify
  async verifyMFA(code: string, secretKey: string): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>(`${this.baseUrl}/mfa/verify`, {
      code,
      secretKey,
    });
    return response.data;
  }

  // MFA Disable
  async disableMFA(): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>(`${this.baseUrl}/mfa/disable`);
    return response.data;
  }

  // Test mode login
  async testModeLogin(data: TestModeLoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(`${this.baseUrl}/test-mode/login`, data);
    return response.data;
  }

  // Validate token
  async validateToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      const response = await apiService.get<{ valid: boolean; user?: User }>(`${this.baseUrl}/validate`);
      return response.data;
    } catch (error) {
      return { valid: false };
    }
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiService.put<User>(`${this.baseUrl}/profile`, userData);
    return response.data;
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>(`${this.baseUrl}/change-password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  // Verify email
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>(`${this.baseUrl}/verify-email`, { token });
    return response.data;
  }

  // Resend verification email
  async resendVerificationEmail(): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>(`${this.baseUrl}/resend-verification`);
    return response.data;
  }

  // Get user sessions
  async getUserSessions(): Promise<Array<{ id: string; device: string; lastActive: string; current: boolean }>> {
    const response = await apiService.get<Array<{ id: string; device: string; lastActive: string; current: boolean }>>(`${this.baseUrl}/sessions`);
    return response.data;
  }

  // Revoke session
  async revokeSession(sessionId: string): Promise<{ message: string }> {
    const response = await apiService.delete<{ message: string }>(`${this.baseUrl}/sessions/${sessionId}`);
    return response.data;
  }

  // Revoke all sessions
  async revokeAllSessions(): Promise<{ message: string }> {
    const response = await apiService.delete<{ message: string }>(`${this.baseUrl}/sessions`);
    return response.data;
  }
}

export const authService = new AuthService();
