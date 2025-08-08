import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdvancedRoleDocument = AdvancedRole & Document;

@Schema({ timestamps: true })
export class AdvancedRole {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Tenant' })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  roleKey: string; // e.g., 'admin', 'manager', 'agent'

  @Prop({ required: true })
  roleName: string; // Human-readable name

  @Prop({ required: true })
  description: string;

  @Prop({ type: [Types.ObjectId], ref: 'AdvancedRole', default: [] })
  parentRoles: Types.ObjectId[]; // Role inheritance

  @Prop({ type: [Types.ObjectId], ref: 'AdvancedRole', default: [] })
  childRoles: Types.ObjectId[]; // Child roles

  @Prop({ type: [String], default: [] })
  permissions: string[]; // Permission keys

  @Prop({ type: [String], default: [] })
  inheritedPermissions: string[]; // Permissions inherited from parent roles

  @Prop({ type: [String], default: [] })
  effectivePermissions: string[]; // All permissions (direct + inherited)

  @Prop({ type: [String], default: [] })
  deniedPermissions: string[]; // Explicitly denied permissions

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: true, default: false })
  isSystem: boolean; // System-defined roles

  @Prop({ required: true, default: 0 })
  priority: number; // Role priority for conflict resolution

  @Prop({ type: [String], default: [] })
  tags: string[]; // For categorization and filtering

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ type: [Object], default: [] })
  auditLog: Array<{
    action: string;
    timestamp: Date;
    userId: Types.ObjectId;
    details: Record<string, any>;
  }>;
}

export const AdvancedRoleSchema = SchemaFactory.createForClass(AdvancedRole);

// Indexes for performance
AdvancedRoleSchema.index({ tenantId: 1, roleKey: 1 }, { unique: true });
AdvancedRoleSchema.index({ tenantId: 1, isActive: 1 });
AdvancedRoleSchema.index({ tenantId: 1, isSystem: 1 });
AdvancedRoleSchema.index({ tenantId: 1, priority: -1 });

// Compound indexes for queries
AdvancedRoleSchema.index({ tenantId: 1, parentRoles: 1 });
AdvancedRoleSchema.index({ tenantId: 1, childRoles: 1 });
AdvancedRoleSchema.index({ tenantId: 1, tags: 1 });

// Text search index
AdvancedRoleSchema.index({
  roleName: 'text',
  description: 'text',
  tags: 'text',
});

// Virtual for role hierarchy level
AdvancedRoleSchema.virtual('hierarchyLevel').get(function() {
  return this.parentRoles.length;
});

// Virtual for role inheritance chain
AdvancedRoleSchema.virtual('inheritanceChain').get(function() {
  // This would be calculated dynamically based on parent roles
  return [this._id, ...this.parentRoles];
});

// Pre-save middleware for validation
AdvancedRoleSchema.pre('save', function(next) {
  // Validate role key format
  const keyRegex = /^[a-z][a-z0-9_]*$/;
  if (!keyRegex.test(this.roleKey)) {
    return next(new Error('Invalid role key format'));
  }

  // Validate role name
  if (!this.roleName || this.roleName.trim().length === 0) {
    return next(new Error('Role name is required'));
  }

  // Set updated timestamp
  this.updatedAt = new Date();

  next();
});

// Pre-save middleware for permission calculation
AdvancedRoleSchema.pre('save', async function(next) {
  try {
    // Calculate inherited permissions from parent roles
    if (this.parentRoles.length > 0) {
      const inheritedPerms = await this.calculateInheritedPermissions();
      this.inheritedPermissions = inheritedPerms;
    }

    // Calculate effective permissions (direct + inherited - denied)
    this.effectivePermissions = this.calculateEffectivePermissions();

    next();
  } catch (error) {
    next(error);
  }
});

// Static method to find roles by tenant
AdvancedRoleSchema.statics.findByTenant = function(tenantId: Types.ObjectId) {
  return this.find({ tenantId, isActive: true }).sort({ priority: -1 });
};

// Static method to find system roles
AdvancedRoleSchema.statics.findSystemRoles = function(tenantId: Types.ObjectId) {
  return this.find({ tenantId, isSystem: true, isActive: true }).sort({ priority: -1 });
};

// Static method to find custom roles
AdvancedRoleSchema.statics.findCustomRoles = function(tenantId: Types.ObjectId) {
  return this.find({ tenantId, isSystem: false, isActive: true }).sort({ priority: -1 });
};

// Static method to find roles by permission
AdvancedRoleSchema.statics.findByPermission = function(tenantId: Types.ObjectId, permission: string) {
  return this.find({
    tenantId,
    isActive: true,
    $or: [
      { permissions: permission },
      { inheritedPermissions: permission },
      { effectivePermissions: permission },
    ],
  }).sort({ priority: -1 });
};

// Static method to get role statistics
AdvancedRoleSchema.statics.getStatistics = function(tenantId: Types.ObjectId) {
  return this.aggregate([
    { $match: { tenantId } },
    {
      $group: {
        _id: null,
        totalRoles: { $sum: 1 },
        activeRoles: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0],
          },
        },
        systemRoles: {
          $sum: {
            $cond: [{ $eq: ['$isSystem', true] }, 1, 0],
          },
        },
        customRoles: {
          $sum: {
            $cond: [{ $eq: ['$isSystem', false] }, 1, 0],
          },
        },
        avgPermissionsPerRole: { $avg: { $size: '$effectivePermissions' } },
        maxHierarchyLevel: { $max: '$hierarchyLevel' },
      },
    },
  ]);
};

// Method to calculate inherited permissions
AdvancedRoleSchema.methods.calculateInheritedPermissions = async function(): Promise<string[]> {
  const inheritedPerms: string[] = [];
  
  for (const parentRoleId of this.parentRoles) {
    const parentRole = await this.constructor.findById(parentRoleId);
    if (parentRole && parentRole.isActive) {
      inheritedPerms.push(...parentRole.effectivePermissions);
    }
  }
  
  return [...new Set(inheritedPerms)]; // Remove duplicates
};

// Method to calculate effective permissions
AdvancedRoleSchema.methods.calculateEffectivePermissions = function(): string[] {
  const allPerms = [...this.permissions, ...this.inheritedPermissions];
  const effectivePerms = allPerms.filter(perm => !this.deniedPermissions.includes(perm));
  return [...new Set(effectivePerms)]; // Remove duplicates
};

// Method to add permission
AdvancedRoleSchema.methods.addPermission = function(permission: string) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
  }
  return this.save();
};

// Method to remove permission
AdvancedRoleSchema.methods.removePermission = function(permission: string) {
  this.permissions = this.permissions.filter(p => p !== permission);
  return this.save();
};

// Method to deny permission
AdvancedRoleSchema.methods.denyPermission = function(permission: string) {
  if (!this.deniedPermissions.includes(permission)) {
    this.deniedPermissions.push(permission);
  }
  return this.save();
};

// Method to allow permission (remove from denied)
AdvancedRoleSchema.methods.allowPermission = function(permission: string) {
  this.deniedPermissions = this.deniedPermissions.filter(p => p !== permission);
  return this.save();
};

// Method to add parent role
AdvancedRoleSchema.methods.addParentRole = function(parentRoleId: Types.ObjectId) {
  if (!this.parentRoles.includes(parentRoleId)) {
    this.parentRoles.push(parentRoleId);
  }
  return this.save();
};

// Method to remove parent role
AdvancedRoleSchema.methods.removeParentRole = function(parentRoleId: Types.ObjectId) {
  this.parentRoles = this.parentRoles.filter(id => !id.equals(parentRoleId));
  return this.save();
};

// Method to check if role has permission
AdvancedRoleSchema.methods.hasPermission = function(permission: string): boolean {
  return this.effectivePermissions.includes(permission);
};

// Method to check if role has any permission from list
AdvancedRoleSchema.methods.hasAnyPermission = function(permissions: string[]): boolean {
  return permissions.some(permission => this.effectivePermissions.includes(permission));
};

// Method to check if role has all permissions from list
AdvancedRoleSchema.methods.hasAllPermissions = function(permissions: string[]): boolean {
  return permissions.every(permission => this.effectivePermissions.includes(permission));
};

// Method to add audit log entry
AdvancedRoleSchema.methods.addAuditLog = function(action: string, userId: Types.ObjectId, details: Record<string, any>) {
  this.auditLog.push({
    action,
    timestamp: new Date(),
    userId,
    details,
  });
  return this.save();
};

// Method to get role hierarchy (all parent roles)
AdvancedRoleSchema.methods.getRoleHierarchy = async function(): Promise<Types.ObjectId[]> {
  const hierarchy: Types.ObjectId[] = [];
  const visited = new Set<string>();
  
  const traverse = async (roleId: Types.ObjectId) => {
    if (visited.has(roleId.toString())) return;
    visited.add(roleId.toString());
    
    const role = await this.constructor.findById(roleId);
    if (role && role.isActive) {
      hierarchy.push(roleId);
      for (const parentId of role.parentRoles) {
        await traverse(parentId);
      }
    }
  };
  
  await traverse(this._id);
  return hierarchy;
};

// Method to get all child roles
AdvancedRoleSchema.methods.getChildRoles = async function(): Promise<Types.ObjectId[]> {
  const children: Types.ObjectId[] = [];
  const visited = new Set<string>();
  
  const traverse = async (roleId: Types.ObjectId) => {
    if (visited.has(roleId.toString())) return;
    visited.add(roleId.toString());
    
    const role = await this.constructor.findById(roleId);
    if (role && role.isActive) {
      children.push(roleId);
      for (const childId of role.childRoles) {
        await traverse(childId);
      }
    }
  };
  
  await traverse(this._id);
  return children;
}; 