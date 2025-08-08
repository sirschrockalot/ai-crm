import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LocationTrackingService {
  private readonly logger = new Logger(LocationTrackingService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Get location information from IP address
   */
  async getLocationFromIP(ipAddress: string): Promise<{
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
    timezone: string;
  }> {
    try {
      // In a real implementation, you would use a geolocation service like MaxMind, IP2Location, etc.
      // For now, we'll implement a mock service that returns basic location data
      
      const location = await this.mockGeolocationService(ipAddress);
      
      this.logger.debug(`Resolved location for IP ${ipAddress}: ${location.city}, ${location.country}`);
      
      return location;
    } catch (error) {
      this.logger.error('Error getting location from IP:', error);
      // Return default location on error
      return {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
      };
    }
  }

  /**
   * Mock geolocation service for development
   */
  private async mockGeolocationService(ipAddress: string): Promise<{
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
    timezone: string;
  }> {
    // Simple IP-based location mapping for development
    const ipRanges = {
      '127.0.0.1': {
        country: 'United States',
        region: 'California',
        city: 'San Francisco',
        latitude: 37.7749,
        longitude: -122.4194,
        timezone: 'America/Los_Angeles',
      },
      '192.168.1.1': {
        country: 'United States',
        region: 'New York',
        city: 'New York',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
      },
      '10.0.0.1': {
        country: 'United States',
        region: 'Texas',
        city: 'Austin',
        latitude: 30.2672,
        longitude: -97.7431,
        timezone: 'America/Chicago',
      },
    };

    // Check if IP is in our mock database
    if (ipRanges[ipAddress]) {
      return ipRanges[ipAddress];
    }

    // For other IPs, generate mock data based on IP hash
    const hash = this.hashIP(ipAddress);
    const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio'];
    
    return {
      country: countries[hash % countries.length],
      region: 'Unknown',
      city: cities[hash % cities.length],
      latitude: 20 + (hash % 50),
      longitude: -120 + (hash % 60),
      timezone: 'UTC',
    };
  }

  /**
   * Simple hash function for IP addresses
   */
  private hashIP(ipAddress: string): number {
    let hash = 0;
    for (let i = 0; i < ipAddress.length; i++) {
      const char = ipAddress.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Check if location is suspicious
   */
  async isSuspiciousLocation(location: {
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
    timezone: string;
  }, tenantId: string): Promise<boolean> {
    try {
      // In a real implementation, you would check against known suspicious locations
      // For now, we'll implement basic checks
      
      // Check for known suspicious countries/regions
      const suspiciousCountries = ['XX', 'YY', 'ZZ']; // Placeholder for real suspicious countries
      if (suspiciousCountries.includes(location.country)) {
        return true;
      }

      // Check for unusual coordinates (e.g., middle of ocean)
      if (location.latitude === 0 && location.longitude === 0) {
        return true;
      }

      // Check for VPN/proxy indicators
      // This would typically involve checking against known VPN/proxy IP ranges
      
      return false;
    } catch (error) {
      this.logger.error('Error checking suspicious location:', error);
      return false;
    }
  }

  /**
   * Calculate distance between two locations
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Check if two locations are within a certain distance
   */
  isWithinDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    maxDistanceKm: number,
  ): boolean {
    const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
    return distance <= maxDistanceKm;
  }

  /**
   * Get timezone offset for a location
   */
  async getTimezoneOffset(location: {
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
    timezone: string;
  }): Promise<number> {
    try {
      // In a real implementation, you would use a timezone service
      // For now, we'll return mock timezone offsets
      
      const timezoneOffsets: Record<string, number> = {
        'America/Los_Angeles': -8,
        'America/New_York': -5,
        'America/Chicago': -6,
        'UTC': 0,
        'Europe/London': 0,
        'Europe/Berlin': 1,
        'Asia/Tokyo': 9,
      };

      return timezoneOffsets[location.timezone] || 0;
    } catch (error) {
      this.logger.error('Error getting timezone offset:', error);
      return 0;
    }
  }

  /**
   * Check if location change is suspicious
   */
  async isSuspiciousLocationChange(
    previousLocation: {
      country: string;
      region: string;
      city: string;
      latitude: number;
      longitude: number;
      timezone: string;
    },
    currentLocation: {
      country: string;
      region: string;
      city: string;
      latitude: number;
      longitude: number;
      timezone: string;
    },
    timeBetweenRequests: number, // in milliseconds
  ): Promise<boolean> {
    try {
      // Calculate distance between locations
      const distance = this.calculateDistance(
        previousLocation.latitude,
        previousLocation.longitude,
        currentLocation.latitude,
        currentLocation.longitude,
      );

      // Calculate time in hours
      const timeInHours = timeBetweenRequests / (1000 * 60 * 60);

      // If distance is too large for the time elapsed, it's suspicious
      // Assuming maximum realistic travel speed of 1000 km/h
      const maxRealisticDistance = timeInHours * 1000;

      if (distance > maxRealisticDistance) {
        return true;
      }

      // Check for impossible travel times
      // If someone appears to travel more than 1000 km in less than 1 hour, it's suspicious
      if (distance > 1000 && timeInHours < 1) {
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Error checking suspicious location change:', error);
      return false;
    }
  }

  /**
   * Get location statistics for analytics
   */
  async getLocationStatistics(tenantId: string): Promise<any> {
    try {
      // In a real implementation, you would query the database for location statistics
      
      return {
        totalLocations: 0,
        countries: {},
        cities: {},
        suspiciousLocations: 0,
        averageDistance: 0,
      };
    } catch (error) {
      this.logger.error('Error getting location statistics:', error);
      return {};
    }
  }

  /**
   * Validate IP address format
   */
  validateIPAddress(ipAddress: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ipAddress) || ipv6Regex.test(ipAddress);
  }

  /**
   * Check if IP address is private/internal
   */
  isPrivateIP(ipAddress: string): boolean {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^169\.254\./,
      /^::1$/,
      /^fc00:/,
      /^fe80:/,
    ];

    return privateRanges.some(range => range.test(ipAddress));
  }
} 