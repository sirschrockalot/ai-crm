/**
 * Stats Service
 * Tracks and provides system statistics for the admin dashboard
 */

import { settingsService } from './settingsService';
import { checkAllServicesHealth } from '../utils/serviceHealthCheck';

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  systemUptime: number; // Percentage
  errorRate: number; // Percentage
  totalUsersChange?: number; // Percentage change from previous period
  activeUsersChange?: number; // Percentage change from previous period
  errorRateChange?: number; // Percentage change from previous period
}

interface StoredStats {
  totalUsers: number;
  activeUsers: number;
  errorRate: number;
  timestamp: string;
}

const STATS_STORAGE_KEY = 'admin_stats_history';
const ERROR_TRACKING_KEY = 'api_errors_tracking';

interface ErrorTracking {
  total: number;
  errors: number;
  timestamp: number;
}

/**
 * Get stored stats from localStorage
 */
function getStoredStats(): StoredStats | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY);
    if (stored) {
      const stats = JSON.parse(stored);
      // Check if stats are from last month (for total users) or last week (for active users)
      const statsDate = new Date(stats.timestamp);
      const now = new Date();
      const daysDiff = (now.getTime() - statsDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // Only use if less than 35 days old (for monthly comparison)
      if (daysDiff < 35) {
        return stats;
      }
    }
  } catch (error) {
    console.error('Error reading stored stats:', error);
  }
  return null;
}

/**
 * Store stats to localStorage
 */
function storeStats(stats: { totalUsers: number; activeUsers: number; errorRate: number }): void {
  if (typeof window === 'undefined') return;
  try {
    const stored: StoredStats = {
      ...stats,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error('Error storing stats:', error);
  }
}

/**
 * Track API error
 */
export function trackApiError(): void {
  if (typeof window === 'undefined') return;
  try {
    const tracking = getErrorTracking();
    tracking.errors++;
    tracking.total++;
    saveErrorTracking(tracking);
  } catch (error) {
    console.error('Error tracking API error:', error);
  }
}

/**
 * Track API success
 */
export function trackApiSuccess(): void {
  if (typeof window === 'undefined') return;
  try {
    const tracking = getErrorTracking();
    tracking.total++;
    saveErrorTracking(tracking);
  } catch (error) {
    console.error('Error tracking API success:', error);
  }
}

/**
 * Get error tracking data
 */
function getErrorTracking(): ErrorTracking {
  if (typeof window === 'undefined') {
    return { total: 0, errors: 0, timestamp: Date.now() };
  }
  try {
    const stored = localStorage.getItem(ERROR_TRACKING_KEY);
    if (stored) {
      const tracking = JSON.parse(stored);
      const now = Date.now();
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      
      // Reset if older than a week
      if (tracking.timestamp < oneWeekAgo) {
        return { total: 0, errors: 0, timestamp: now };
      }
      return tracking;
    }
  } catch (error) {
    console.error('Error reading error tracking:', error);
  }
  return { total: 0, errors: 0, timestamp: Date.now() };
}

/**
 * Save error tracking data
 */
function saveErrorTracking(tracking: ErrorTracking): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ERROR_TRACKING_KEY, JSON.stringify(tracking));
  } catch (error) {
    console.error('Error saving error tracking:', error);
  }
}

/**
 * Get previous error rate from stored stats
 */
function getPreviousErrorRate(): number | null {
  const stored = getStoredStats();
  return stored?.errorRate ?? null;
}

/**
 * Calculate system uptime from service health checks
 */
async function calculateSystemUptime(): Promise<number> {
  try {
    const healthResult = await checkAllServicesHealth();
    const healthyCount = healthResult.services.filter(s => s.status === 'healthy').length;
    const totalCount = healthResult.services.length;
    
    if (totalCount === 0) return 0;
    
    // Calculate uptime as percentage of healthy services
    // For a more accurate calculation, we'd need historical data
    // For now, we'll use current health status as a proxy
    return (healthyCount / totalCount) * 100;
  } catch (error) {
    console.error('Error calculating system uptime:', error);
    return 0;
  }
}

/**
 * Calculate percentage change
 */
function calculateChange(current: number, previous: number | null): number | undefined {
  if (previous === null || previous === 0) return undefined;
  return ((current - previous) / previous) * 100;
}

/**
 * Get comprehensive system statistics
 */
export async function getSystemStats(): Promise<SystemStats> {
  try {
    // Fetch user stats
    const userStats = await settingsService.getSystemStats();
    
    // Calculate error rate
    const errorTracking = getErrorTracking();
    const errorRate = errorTracking.total > 0 
      ? (errorTracking.errors / errorTracking.total) * 100 
      : 0;
    
    // Calculate system uptime
    const systemUptime = await calculateSystemUptime();
    
    // Get previous stats for trend calculation
    const previousStats = getStoredStats();
    const previousErrorRate = getPreviousErrorRate();
    
    // Calculate changes
    const totalUsersChange = calculateChange(userStats.total, previousStats?.totalUsers ?? null);
    const activeUsersChange = calculateChange(userStats.active, previousStats?.activeUsers ?? null);
    const errorRateChange = calculateChange(errorRate, previousErrorRate);
    
    // Store current stats for future comparison
    storeStats({
      totalUsers: userStats.total,
      activeUsers: userStats.active,
      errorRate,
    });
    
    return {
      totalUsers: userStats.total,
      activeUsers: userStats.active,
      systemUptime,
      errorRate,
      totalUsersChange,
      activeUsersChange,
      errorRateChange,
    };
  } catch (error) {
    console.error('Error fetching system stats:', error);
    // Return default values on error
    return {
      totalUsers: 0,
      activeUsers: 0,
      systemUptime: 0,
      errorRate: 0,
    };
  }
}

/**
 * Reset error tracking (useful for testing or manual reset)
 */
export function resetErrorTracking(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ERROR_TRACKING_KEY);
  } catch (error) {
    console.error('Error resetting error tracking:', error);
  }
}

