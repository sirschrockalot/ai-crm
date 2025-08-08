import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class DeviceFingerprintingService {
  private readonly logger = new Logger(DeviceFingerprintingService.name);

  /**
   * Generate a unique device fingerprint from user agent and other device information
   */
  async generateFingerprint(userAgent: string, additionalData?: Record<string, any>): Promise<string> {
    try {
      // Parse user agent to extract device information
      const deviceInfo = this.parseUserAgent(userAgent);
      
      // Combine device information with additional data
      const fingerprintData = {
        ...deviceInfo,
        ...additionalData,
        timestamp: Date.now(),
      };

      // Create a hash of the device information
      const fingerprintString = JSON.stringify(fingerprintData);
      const hash = crypto.createHash('sha256').update(fingerprintString).digest('hex');

      this.logger.debug(`Generated device fingerprint: ${hash.substring(0, 16)}...`);
      
      return hash;
    } catch (error) {
      this.logger.error('Error generating device fingerprint:', error);
      // Fallback to a simple hash of the user agent
      return crypto.createHash('sha256').update(userAgent).digest('hex');
    }
  }

  /**
   * Parse user agent to extract device information
   */
  private parseUserAgent(userAgent: string): {
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    device: string;
    deviceType: string;
  } {
    const ua = userAgent.toLowerCase();
    
    // Browser detection
    let browser = 'unknown';
    let browserVersion = 'unknown';
    
    if (ua.includes('chrome')) {
      browser = 'chrome';
      browserVersion = this.extractVersion(ua, 'chrome');
    } else if (ua.includes('firefox')) {
      browser = 'firefox';
      browserVersion = this.extractVersion(ua, 'firefox');
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      browser = 'safari';
      browserVersion = this.extractVersion(ua, 'version');
    } else if (ua.includes('edge')) {
      browser = 'edge';
      browserVersion = this.extractVersion(ua, 'edge');
    } else if (ua.includes('opera')) {
      browser = 'opera';
      browserVersion = this.extractVersion(ua, 'opera');
    }

    // OS detection
    let os = 'unknown';
    let osVersion = 'unknown';
    
    if (ua.includes('windows')) {
      os = 'windows';
      if (ua.includes('windows nt 10.0')) osVersion = '10';
      else if (ua.includes('windows nt 6.3')) osVersion = '8.1';
      else if (ua.includes('windows nt 6.2')) osVersion = '8';
      else if (ua.includes('windows nt 6.1')) osVersion = '7';
    } else if (ua.includes('mac os x')) {
      os = 'macos';
      osVersion = this.extractVersion(ua, 'mac os x');
    } else if (ua.includes('linux')) {
      os = 'linux';
      if (ua.includes('ubuntu')) osVersion = 'ubuntu';
      else if (ua.includes('fedora')) osVersion = 'fedora';
      else if (ua.includes('centos')) osVersion = 'centos';
    } else if (ua.includes('android')) {
      os = 'android';
      osVersion = this.extractVersion(ua, 'android');
    } else if (ua.includes('ios')) {
      os = 'ios';
      osVersion = this.extractVersion(ua, 'os');
    }

    // Device type detection
    let device = 'desktop';
    let deviceType = 'desktop';
    
    if (ua.includes('mobile')) {
      device = 'mobile';
      deviceType = 'mobile';
    } else if (ua.includes('tablet')) {
      device = 'tablet';
      deviceType = 'tablet';
    } else if (ua.includes('tv')) {
      device = 'tv';
      deviceType = 'tv';
    }

    return {
      browser,
      browserVersion,
      os,
      osVersion,
      device,
      deviceType,
    };
  }

  /**
   * Extract version number from user agent string
   */
  private extractVersion(userAgent: string, keyword: string): string {
    const regex = new RegExp(`${keyword}[\\s/]([\\d.]+)`, 'i');
    const match = userAgent.match(regex);
    return match ? match[1] : 'unknown';
  }

  /**
   * Validate device fingerprint format
   */
  validateFingerprint(fingerprint: string): boolean {
    // Check if fingerprint is a valid SHA-256 hash
    const sha256Regex = /^[a-f0-9]{64}$/i;
    return sha256Regex.test(fingerprint);
  }

  /**
   * Compare two device fingerprints for similarity
   */
  compareFingerprints(fingerprint1: string, fingerprint2: string): number {
    if (!this.validateFingerprint(fingerprint1) || !this.validateFingerprint(fingerprint2)) {
      return 0;
    }

    // Simple comparison - in a real implementation, you might want more sophisticated comparison
    return fingerprint1 === fingerprint2 ? 1 : 0;
  }

  /**
   * Generate device fingerprint with additional context
   */
  async generateDetailedFingerprint(
    userAgent: string,
    screenResolution?: string,
    timezone?: string,
    language?: string,
    plugins?: string[],
  ): Promise<string> {
    const additionalData = {
      screenResolution,
      timezone,
      language,
      plugins: plugins?.join(','),
    };

    return this.generateFingerprint(userAgent, additionalData);
  }

  /**
   * Check if device fingerprint is suspicious
   */
  async isSuspiciousFingerprint(fingerprint: string, tenantId: string): Promise<boolean> {
    try {
      // In a real implementation, you would check against known suspicious patterns
      // For now, we'll implement basic checks
      
      // Check if fingerprint is too common (indicating a generic/bot device)
      const commonFingerprints = [
        '0000000000000000000000000000000000000000000000000000000000000000',
        '1111111111111111111111111111111111111111111111111111111111111111',
      ];

      if (commonFingerprints.includes(fingerprint)) {
        return true;
      }

      // Check if fingerprint has been flagged before
      // This would typically query a database of known suspicious fingerprints
      
      return false;
    } catch (error) {
      this.logger.error('Error checking suspicious fingerprint:', error);
      return false;
    }
  }

  /**
   * Get device information from fingerprint (reverse lookup)
   */
  async getDeviceInfoFromFingerprint(fingerprint: string): Promise<any> {
    try {
      // In a real implementation, you would store and retrieve device information
      // associated with fingerprints
      
      return {
        fingerprint,
        lastSeen: new Date(),
        deviceCount: 1,
        riskLevel: 'low',
      };
    } catch (error) {
      this.logger.error('Error getting device info from fingerprint:', error);
      return null;
    }
  }

  /**
   * Update device fingerprint with new information
   */
  async updateFingerprint(fingerprint: string, newData: Record<string, any>): Promise<string> {
    try {
      // In a real implementation, you would update the stored device information
      // and potentially generate a new fingerprint if significant changes are detected
      
      this.logger.debug(`Updating fingerprint ${fingerprint.substring(0, 16)}... with new data`);
      
      return fingerprint;
    } catch (error) {
      this.logger.error('Error updating fingerprint:', error);
      return fingerprint;
    }
  }
} 