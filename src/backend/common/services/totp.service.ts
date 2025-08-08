import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class TOTPService {
  private readonly logger = new Logger(TOTPService.name);

  /**
   * Generate a TOTP secret
   */
  generateSecret(length: number = 32): string {
    try {
      // Generate random bytes
      const randomBytes = crypto.randomBytes(length);
      
      // Convert to base32
      const secret = this.toBase32(randomBytes);
      
      this.logger.debug(`Generated TOTP secret: ${secret.substring(0, 16)}...`);
      
      return secret;
    } catch (error) {
      this.logger.error('Error generating TOTP secret:', error);
      throw new Error('Failed to generate TOTP secret');
    }
  }

  /**
   * Generate a TOTP code for the current time
   */
  generateTOTP(secret: string, window: number = 0): string {
    try {
      // Get current timestamp
      const timestamp = Math.floor(Date.now() / 30000); // 30-second window
      
      // Generate TOTP for the specified window
      const timeWindow = timestamp + window;
      
      return this.generateTOTPForTime(secret, timeWindow);
    } catch (error) {
      this.logger.error('Error generating TOTP:', error);
      throw new Error('Failed to generate TOTP');
    }
  }

  /**
   * Generate TOTP for a specific time
   */
  generateTOTPForTime(secret: string, time: number): string {
    try {
      // Convert secret from base32 to bytes
      const secretBytes = this.fromBase32(secret);
      
      // Convert time to 8-byte buffer (big-endian)
      const timeBuffer = Buffer.alloc(8);
      timeBuffer.writeBigUInt64BE(BigInt(time), 0);
      
      // Generate HMAC-SHA1
      const hmac = crypto.createHmac('sha1', secretBytes);
      hmac.update(timeBuffer);
      const hash = hmac.digest();
      
      // Generate 6-digit code using RFC 6238 algorithm
      const offset = hash[hash.length - 1] & 0x0f;
      const code = (
        ((hash[offset] & 0x7f) << 24) |
        ((hash[offset + 1] & 0xff) << 16) |
        ((hash[offset + 2] & 0xff) << 8) |
        (hash[offset + 3] & 0xff)
      ) % 1000000;
      
      // Pad with leading zeros
      return code.toString().padStart(6, '0');
    } catch (error) {
      this.logger.error('Error generating TOTP for time:', error);
      throw new Error('Failed to generate TOTP for time');
    }
  }

  /**
   * Verify a TOTP code
   */
  verifyTOTP(secret: string, code: string, window: number = 1): boolean {
    try {
      // Check current window and adjacent windows
      for (let i = -window; i <= window; i++) {
        const generatedCode = this.generateTOTP(secret, i);
        if (generatedCode === code) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      this.logger.error('Error verifying TOTP:', error);
      return false;
    }
  }

  /**
   * Generate QR code URL for authenticator apps
   */
  generateQRCodeUrl(
    secret: string,
    userEmail: string,
    issuer: string = 'DealCycle CRM',
    algorithm: string = 'SHA1',
    digits: number = 6,
    period: number = 30,
  ): string {
    try {
      // Format: otpauth://totp/{issuer}:{userEmail}?secret={secret}&issuer={issuer}&algorithm={algorithm}&digits={digits}&period={period}
      const encodedIssuer = encodeURIComponent(issuer);
      const encodedUserEmail = encodeURIComponent(userEmail);
      
      const url = `otpauth://totp/${encodedIssuer}:${encodedUserEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=${algorithm}&digits=${digits}&period=${period}`;
      
      this.logger.debug(`Generated QR code URL for ${userEmail}`);
      
      return url;
    } catch (error) {
      this.logger.error('Error generating QR code URL:', error);
      throw new Error('Failed to generate QR code URL');
    }
  }

  /**
   * Generate manual entry key for authenticator apps
   */
  generateManualEntryKey(
    secret: string,
    userEmail: string,
    issuer: string = 'DealCycle CRM',
  ): string {
    try {
      // Format: {issuer}:{userEmail}
      return `${issuer}:${userEmail}`;
    } catch (error) {
      this.logger.error('Error generating manual entry key:', error);
      throw new Error('Failed to generate manual entry key');
    }
  }

  /**
   * Generate backup codes
   */
  generateBackupCodes(count: number = 10): string[] {
    try {
      const codes: string[] = [];
      
      for (let i = 0; i < count; i++) {
        // Generate 8-character alphanumeric code
        const code = this.generateRandomCode(8);
        codes.push(code);
      }
      
      this.logger.debug(`Generated ${count} backup codes`);
      
      return codes;
    } catch (error) {
      this.logger.error('Error generating backup codes:', error);
      throw new Error('Failed to generate backup codes');
    }
  }

  /**
   * Validate TOTP secret format
   */
  validateSecret(secret: string): boolean {
    try {
      // Check if secret is valid base32
      const base32Regex = /^[A-Z2-7]+=*$/;
      if (!base32Regex.test(secret)) {
        return false;
      }
      
      // Check if secret is at least 16 characters
      if (secret.length < 16) {
        return false;
      }
      
      return true;
    } catch (error) {
      this.logger.error('Error validating TOTP secret:', error);
      return false;
    }
  }

  /**
   * Validate TOTP code format
   */
  validateCode(code: string): boolean {
    try {
      // Check if code is 6 digits
      const codeRegex = /^\d{6}$/;
      return codeRegex.test(code);
    } catch (error) {
      this.logger.error('Error validating TOTP code:', error);
      return false;
    }
  }

  /**
   * Validate backup code format
   */
  validateBackupCode(code: string): boolean {
    try {
      // Check if code is 8 alphanumeric characters
      const backupCodeRegex = /^[A-Z0-9]{8}$/;
      return backupCodeRegex.test(code);
    } catch (error) {
      this.logger.error('Error validating backup code:', error);
      return false;
    }
  }

  /**
   * Get time window for current time
   */
  getCurrentTimeWindow(): number {
    return Math.floor(Date.now() / 30000); // 30-second window
  }

  /**
   * Get time remaining until next window
   */
  getTimeRemaining(): number {
    const currentWindow = this.getCurrentTimeWindow();
    const nextWindow = currentWindow + 1;
    const nextWindowTime = nextWindow * 30000; // 30 seconds
    const remaining = nextWindowTime - Date.now();
    
    return Math.max(0, Math.floor(remaining / 1000)); // Return seconds
  }

  /**
   * Convert buffer to base32
   */
  private toBase32(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';
    
    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;
      
      while (bits >= 5) {
        output += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    
    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31];
    }
    
    // Add padding
    while (output.length % 8 !== 0) {
      output += '=';
    }
    
    return output;
  }

  /**
   * Convert base32 to buffer
   */
  private fromBase32(base32: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const padding = '=';
    
    // Remove padding and convert to uppercase
    const input = base32.replace(new RegExp(padding, 'g'), '').toUpperCase();
    
    let bits = 0;
    let value = 0;
    const output: number[] = [];
    
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      const index = alphabet.indexOf(char);
      
      if (index === -1) {
        throw new Error('Invalid base32 character');
      }
      
      value = (value << 5) | index;
      bits += 5;
      
      while (bits >= 8) {
        output.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }
    
    return Buffer.from(output);
  }

  /**
   * Generate random alphanumeric code
   */
  private generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Check if TOTP is expired
   */
  isTOTPExpired(timestamp: number, maxAge: number = 30000): boolean {
    const now = Date.now();
    return (now - timestamp) > maxAge;
  }

  /**
   * Get TOTP drift (time difference between client and server)
   */
  getTOTPDrift(clientTime: number, serverTime: number = Date.now()): number {
    return Math.abs(clientTime - serverTime);
  }

  /**
   * Check if TOTP drift is acceptable
   */
  isTOTPDriftAcceptable(drift: number, maxDrift: number = 30000): boolean {
    return drift <= maxDrift;
  }
} 