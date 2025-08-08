import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Redis from 'ioredis';

export interface PermissionCacheEntry {
  userId: string;
  tenantId: string;
  permissions: string[];
  roles: string[];
  expiresAt: number;
  lastUpdated: number;
}

export interface RoleCacheEntry {
  roleId: string;
  tenantId: string;
  effectivePermissions: string[];
  parentRoles: string[];
  childRoles: string[];
  expiresAt: number;
  lastUpdated: number;
}

@Injectable()
export class PermissionCacheService {
  private readonly logger = new Logger(PermissionCacheService.name);
  private readonly redis: Redis.Redis;
  private readonly cacheTTL = 3600; // 1 hour in seconds

  constructor(private readonly configService: ConfigService) {
    // Initialize Redis connection
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      db: 1, // Use different DB for permissions
      keyPrefix: 'perm:',
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      this.logger.log('Connected to Redis for permission caching');
    });
  }

  /**
   * Cache user permissions
   */
  async cacheUserPermissions(
    userId: string,
    tenantId: string,
    permissions: string[],
    roles: string[],
  ): Promise<void> {
    try {
      const cacheKey = `user:${tenantId}:${userId}`;
      const cacheEntry: PermissionCacheEntry = {
        userId,
        tenantId,
        permissions,
        roles,
        expiresAt: Date.now() + this.cacheTTL * 1000,
        lastUpdated: Date.now(),
      };

      await this.redis.setex(
        cacheKey,
        this.cacheTTL,
        JSON.stringify(cacheEntry)
      );

      this.logger.debug(`Cached permissions for user ${userId} in tenant ${tenantId}`);
    } catch (error) {
      this.logger.error('Error caching user permissions:', error);
    }
  }

  /**
   * Get cached user permissions
   */
  async getCachedUserPermissions(userId: string, tenantId: string): Promise<PermissionCacheEntry | null> {
    try {
      const cacheKey = `user:${tenantId}:${userId}`;
      const cachedData = await this.redis.get(cacheKey);

      if (cachedData) {
        const entry: PermissionCacheEntry = JSON.parse(cachedData);
        
        // Check if cache is still valid
        if (entry.expiresAt > Date.now()) {
          this.logger.debug(`Retrieved cached permissions for user ${userId} in tenant ${tenantId}`);
          return entry;
        } else {
          // Remove expired cache
          await this.redis.del(cacheKey);
        }
      }

      return null;
    } catch (error) {
      this.logger.error('Error getting cached user permissions:', error);
      return null;
    }
  }

  /**
   * Cache role permissions
   */
  async cacheRolePermissions(
    roleId: string,
    tenantId: string,
    effectivePermissions: string[],
    parentRoles: string[],
    childRoles: string[],
  ): Promise<void> {
    try {
      const cacheKey = `role:${tenantId}:${roleId}`;
      const cacheEntry: RoleCacheEntry = {
        roleId,
        tenantId,
        effectivePermissions,
        parentRoles,
        childRoles,
        expiresAt: Date.now() + this.cacheTTL * 1000,
        lastUpdated: Date.now(),
      };

      await this.redis.setex(
        cacheKey,
        this.cacheTTL,
        JSON.stringify(cacheEntry)
      );

      this.logger.debug(`Cached permissions for role ${roleId} in tenant ${tenantId}`);
    } catch (error) {
      this.logger.error('Error caching role permissions:', error);
    }
  }

  /**
   * Get cached role permissions
   */
  async getCachedRolePermissions(roleId: string, tenantId: string): Promise<RoleCacheEntry | null> {
    try {
      const cacheKey = `role:${tenantId}:${roleId}`;
      const cachedData = await this.redis.get(cacheKey);

      if (cachedData) {
        const entry: RoleCacheEntry = JSON.parse(cachedData);
        
        // Check if cache is still valid
        if (entry.expiresAt > Date.now()) {
          this.logger.debug(`Retrieved cached permissions for role ${roleId} in tenant ${tenantId}`);
          return entry;
        } else {
          // Remove expired cache
          await this.redis.del(cacheKey);
        }
      }

      return null;
    } catch (error) {
      this.logger.error('Error getting cached role permissions:', error);
      return null;
    }
  }

  /**
   * Check if user has permission (cached)
   */
  async hasPermission(
    userId: string,
    tenantId: string,
    permission: string,
  ): Promise<boolean> {
    try {
      const cachedPermissions = await this.getCachedUserPermissions(userId, tenantId);
      
      if (cachedPermissions) {
        return cachedPermissions.permissions.includes(permission);
      }

      return false;
    } catch (error) {
      this.logger.error('Error checking cached permission:', error);
      return false;
    }
  }

  /**
   * Check if user has any permission from list (cached)
   */
  async hasAnyPermission(
    userId: string,
    tenantId: string,
    permissions: string[],
  ): Promise<boolean> {
    try {
      const cachedPermissions = await this.getCachedUserPermissions(userId, tenantId);
      
      if (cachedPermissions) {
        return permissions.some(permission => 
          cachedPermissions.permissions.includes(permission)
        );
      }

      return false;
    } catch (error) {
      this.logger.error('Error checking cached permissions:', error);
      return false;
    }
  }

  /**
   * Check if user has all permissions from list (cached)
   */
  async hasAllPermissions(
    userId: string,
    tenantId: string,
    permissions: string[],
  ): Promise<boolean> {
    try {
      const cachedPermissions = await this.getCachedUserPermissions(userId, tenantId);
      
      if (cachedPermissions) {
        return permissions.every(permission => 
          cachedPermissions.permissions.includes(permission)
        );
      }

      return false;
    } catch (error) {
      this.logger.error('Error checking cached permissions:', error);
      return false;
    }
  }

  /**
   * Invalidate user permission cache
   */
  async invalidateUserCache(userId: string, tenantId: string): Promise<void> {
    try {
      const cacheKey = `user:${tenantId}:${userId}`;
      await this.redis.del(cacheKey);
      
      this.logger.debug(`Invalidated permission cache for user ${userId} in tenant ${tenantId}`);
    } catch (error) {
      this.logger.error('Error invalidating user cache:', error);
    }
  }

  /**
   * Invalidate role permission cache
   */
  async invalidateRoleCache(roleId: string, tenantId: string): Promise<void> {
    try {
      const cacheKey = `role:${tenantId}:${roleId}`;
      await this.redis.del(cacheKey);
      
      this.logger.debug(`Invalidated permission cache for role ${roleId} in tenant ${tenantId}`);
    } catch (error) {
      this.logger.error('Error invalidating role cache:', error);
    }
  }

  /**
   * Invalidate all caches for a tenant
   */
  async invalidateTenantCache(tenantId: string): Promise<void> {
    try {
      const pattern = `*:${tenantId}:*`;
      const keys = await this.redis.keys(pattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.debug(`Invalidated ${keys.length} cache entries for tenant ${tenantId}`);
      }
    } catch (error) {
      this.logger.error('Error invalidating tenant cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStatistics(): Promise<any> {
    try {
      const keys = await this.redis.keys('*');
      const userKeys = keys.filter(key => key.includes('user:'));
      const roleKeys = keys.filter(key => key.includes('role:'));
      
      return {
        totalKeys: keys.length,
        userPermissionKeys: userKeys.length,
        rolePermissionKeys: roleKeys.length,
        memoryUsage: await this.redis.memory('USAGE'),
      };
    } catch (error) {
      this.logger.error('Error getting cache statistics:', error);
      return {};
    }
  }

  /**
   * Clear all permission caches
   */
  async clearAllCaches(): Promise<void> {
    try {
      const keys = await this.redis.keys('perm:*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.log(`Cleared ${keys.length} permission cache entries`);
      }
    } catch (error) {
      this.logger.error('Error clearing all caches:', error);
    }
  }

  /**
   * Get cache hit rate
   */
  async getCacheHitRate(): Promise<number> {
    try {
      const info = await this.redis.info('stats');
      const lines = info.split('\n');
      
      let hits = 0;
      let misses = 0;
      
      for (const line of lines) {
        if (line.startsWith('keyspace_hits:')) {
          hits = parseInt(line.split(':')[1]);
        } else if (line.startsWith('keyspace_misses:')) {
          misses = parseInt(line.split(':')[1]);
        }
      }
      
      const total = hits + misses;
      return total > 0 ? (hits / total) * 100 : 0;
    } catch (error) {
      this.logger.error('Error getting cache hit rate:', error);
      return 0;
    }
  }

  /**
   * Set cache TTL
   */
  setCacheTTL(ttl: number): void {
    this.cacheTTL = ttl;
    this.logger.log(`Cache TTL set to ${ttl} seconds`);
  }

  /**
   * Get current cache TTL
   */
  getCacheTTL(): number {
    return this.cacheTTL;
  }

  /**
   * On module destroy, close Redis connection
   */
  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }
} 