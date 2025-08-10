import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import { Role, RoleDocument, RoleType } from './schemas/role.schema';
import { UserRole, UserRoleDocument } from './schemas/user-role.schema';
import { CreateRoleDto, UpdateRoleDto, RoleSearchDto, AssignRoleDto } from './dto/role.dto';
import { PERMISSIONS, ROLE_PERMISSIONS, ROLES } from '../../common/constants/permissions';

@Injectable()
export class RbacService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(UserRole.name) private userRoleModel: Model<UserRoleDocument>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a new role
   */
  async createRole(createRoleDto: CreateRoleDto, tenantId?: Types.ObjectId, createdBy?: Types.ObjectId): Promise<Role> {
    // Check if role name already exists
    const existingRole = await this.roleModel.findOne({ 
      name: createRoleDto.name,
      tenantId: tenantId || { $exists: false }
    }).exec();

    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    // Validate permissions
    if (createRoleDto.permissions) {
      await this.validatePermissions(createRoleDto.permissions);
    }

    // Validate inherited roles
    if (createRoleDto.inheritedRoles) {
      await this.validateInheritedRoles(createRoleDto.inheritedRoles, tenantId);
    }

    const role = new this.roleModel({
      ...createRoleDto,
      tenantId,
      createdBy,
      assignedAt: new Date(),
    });

    return role.save();
  }

  /**
   * Update an existing role
   */
  async updateRole(roleId: string, updateRoleDto: UpdateRoleDto, updatedBy?: Types.ObjectId): Promise<Role> {
    const role = await this.roleModel.findById(roleId).exec();
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Prevent updating system roles
    if (role.type === RoleType.SYSTEM) {
      throw new BadRequestException('System roles cannot be modified');
    }

    // Validate permissions
    if (updateRoleDto.permissions) {
      await this.validatePermissions(updateRoleDto.permissions);
    }

    // Validate inherited roles
    if (updateRoleDto.inheritedRoles) {
      await this.validateInheritedRoles(updateRoleDto.inheritedRoles, role.tenantId);
    }

    const updatedRole = await this.roleModel.findByIdAndUpdate(
      roleId,
      { ...updateRoleDto, updatedBy },
      { new: true }
    ).exec();

    return updatedRole;
  }

  /**
   * Get role by ID
   */
  async getRoleById(roleId: string): Promise<Role> {
    const role = await this.roleModel.findById(roleId).exec();
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  /**
   * Search and filter roles
   */
  async searchRoles(searchDto: RoleSearchDto, tenantId?: Types.ObjectId): Promise<{ roles: Role[]; total: number }> {
    const { page = 1, limit = 10, search, type, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = searchDto;

    const query: any = {};

    // Add tenant filter
    if (tenantId) {
      query.tenantId = tenantId;
    } else {
      // For global roles (no tenant)
      query.tenantId = { $exists: false };
    }

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Add type filter
    if (type) {
      query.type = type;
    }

    // Add active status filter
    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const [roles, total] = await Promise.all([
      this.roleModel
        .find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.roleModel.countDocuments(query).exec(),
    ]);

    return { roles, total };
  }

  /**
   * Delete a role
   */
  async deleteRole(roleId: string, deletedBy?: Types.ObjectId): Promise<void> {
    const role = await this.getRoleById(roleId);

    // Prevent deleting system roles
    if (role.type === RoleType.SYSTEM) {
      throw new BadRequestException('System roles cannot be deleted');
    }

    // Check if role is assigned to any users
    const userRoleCount = await this.userRoleModel.countDocuments({ 
      roleId: new Types.ObjectId(roleId),
      isActive: true 
    }).exec();

    if (userRoleCount > 0) {
      throw new BadRequestException('Cannot delete role that is assigned to users');
    }

    await this.roleModel.findByIdAndDelete(roleId).exec();
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(assignRoleDto: AssignRoleDto, tenantId?: Types.ObjectId, assignedBy?: Types.ObjectId): Promise<UserRole> {
    const { userId, roleId, expiresAt, reason, metadata } = assignRoleDto;

    // Check if role exists
    const role = await this.getRoleById(roleId);
    if (!role.isActive) {
      throw new BadRequestException('Cannot assign inactive role');
    }

    // Check if assignment already exists
    const existingAssignment = await this.userRoleModel.findOne({
      userId: new Types.ObjectId(userId),
      roleId: new Types.ObjectId(roleId),
      tenantId: tenantId || { $exists: false },
      isActive: true,
    }).exec();

    if (existingAssignment) {
      throw new ConflictException('User already has this role assigned');
    }

    const userRole = new this.userRoleModel({
      userId: new Types.ObjectId(userId),
      roleId: new Types.ObjectId(roleId),
      tenantId,
      assignedBy,
      assignedAt: new Date(),
      expiresAt,
      reason,
      metadata,
    });

    return userRole.save();
  }

  /**
   * Revoke role from user
   */
  async revokeRoleFromUser(userId: string, roleId: string, tenantId?: Types.ObjectId, revokedBy?: Types.ObjectId, reason?: string): Promise<void> {
    const userRole = await this.userRoleModel.findOne({
      userId: new Types.ObjectId(userId),
      roleId: new Types.ObjectId(roleId),
      tenantId: tenantId || { $exists: false },
      isActive: true,
    }).exec();

    if (!userRole) {
      throw new NotFoundException('Role assignment not found');
    }

    userRole.isActive = false;
    userRole.revokedBy = revokedBy;
    userRole.revokedAt = new Date();
    userRole.reason = reason;

    await userRole.save();
  }

  /**
   * Get user's roles
   */
  async getUserRoles(userId: string, tenantId?: Types.ObjectId): Promise<Role[]> {
    const userRoles = await this.userRoleModel.find({
      userId: new Types.ObjectId(userId),
      tenantId: tenantId || { $exists: false },
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    }).populate('roleId').exec();

    return userRoles.map(ur => ur.roleId as unknown as Role);
  }

  /**
   * Get user's permissions
   */
  async getUserPermissions(userId: string, tenantId?: Types.ObjectId): Promise<string[]> {
    const userRoles = await this.getUserRoles(userId, tenantId);
    const permissions = new Set<string>();

    for (const role of userRoles) {
      // Add direct permissions
      if (role.permissions) {
        role.permissions.forEach(permission => permissions.add(permission));
      }

      // Add inherited role permissions
      if (role.inheritedRoles) {
        for (const inheritedRoleName of role.inheritedRoles) {
          const inheritedRole = await this.roleModel.findOne({ 
            name: inheritedRoleName,
            tenantId: tenantId || { $exists: false },
            isActive: true 
          }).exec();

          if (inheritedRole && inheritedRole.permissions) {
            inheritedRole.permissions.forEach(permission => permissions.add(permission));
          }
        }
      }
    }

    return Array.from(permissions);
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId: string, permission: string, tenantId?: Types.ObjectId): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, tenantId);
    return userPermissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(userId: string, permissions: string[], tenantId?: Types.ObjectId): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, tenantId);
    return permissions.some(permission => userPermissions.includes(permission));
  }

  /**
   * Check if user has all of the specified permissions
   */
  async hasAllPermissions(userId: string, permissions: string[], tenantId?: Types.ObjectId): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, tenantId);
    return permissions.every(permission => userPermissions.includes(permission));
  }

  /**
   * Initialize system roles
   */
  async initializeSystemRoles(): Promise<void> {
    const systemRoles = [
      {
        name: ROLES.SUPER_ADMIN,
        displayName: 'Super Administrator',
        description: 'Full system access with all permissions',
        type: RoleType.SYSTEM,
        permissions: ROLE_PERMISSIONS[ROLES.SUPER_ADMIN],
        isActive: true,
      },
      {
        name: ROLES.TENANT_ADMIN,
        displayName: 'Tenant Administrator',
        description: 'Tenant-level administrator with full tenant access',
        type: RoleType.SYSTEM,
        permissions: ROLE_PERMISSIONS[ROLES.TENANT_ADMIN],
        isActive: true,
      },
      {
        name: ROLES.MANAGER,
        displayName: 'Manager',
        description: 'Team manager with lead and user management capabilities',
        type: RoleType.SYSTEM,
        permissions: ROLE_PERMISSIONS[ROLES.MANAGER],
        isActive: true,
      },
      {
        name: ROLES.AGENT,
        displayName: 'Agent',
        description: 'Standard agent with lead and buyer access',
        type: RoleType.SYSTEM,
        permissions: ROLE_PERMISSIONS[ROLES.AGENT],
        isActive: true,
      },
      {
        name: ROLES.VIEWER,
        displayName: 'Viewer',
        description: 'Read-only access to leads and analytics',
        type: RoleType.SYSTEM,
        permissions: ROLE_PERMISSIONS[ROLES.VIEWER],
        isActive: true,
      },
    ];

    for (const roleData of systemRoles) {
      const existingRole = await this.roleModel.findOne({ name: roleData.name }).exec();
      if (!existingRole) {
        await this.roleModel.create(roleData);
      }
    }
  }

  /**
   * Validate permissions
   */
  private async validatePermissions(permissions: string[]): Promise<void> {
    const validPermissions = Object.values(PERMISSIONS) as string[];
    const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
    
    if (invalidPermissions.length > 0) {
      throw new BadRequestException(`Invalid permissions: ${invalidPermissions.join(', ')}`);
    }
  }

  /**
   * Validate inherited roles
   */
  private async validateInheritedRoles(inheritedRoles: string[], tenantId?: Types.ObjectId): Promise<void> {
    for (const roleName of inheritedRoles) {
      const role = await this.roleModel.findOne({ 
        name: roleName,
        tenantId: tenantId || { $exists: false },
        isActive: true 
      }).exec();

      if (!role) {
        throw new BadRequestException(`Inherited role not found: ${roleName}`);
      }
    }
  }
} 