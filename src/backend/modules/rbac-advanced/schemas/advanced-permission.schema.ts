import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdvancedPermissionDocument = AdvancedPermission & Document;

@Schema({ timestamps: true })
export class AdvancedPermission {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Tenant' })
  tenantId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  permissionKey: string; // e.g., 'users:read', 'leads:create:own'

  @Prop({ required: true })
  permissionName: string; // Human-readable name

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  resource: string; // e.g., 'users', 'leads', 'analytics'

  @Prop({ required: true })
  action: string; // e.g., 'read', 'create', 'update', 'delete'

  @Prop({ type: [String], default: [] })
  scopes: string[]; // e.g., ['own', 'team', 'all']

  @Prop({ type: [String], default: [] })
  conditions: string[]; // e.g., ['business_hours', 'location_based']

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: true, default: false })
  isSystem: boolean; // System-defined permissions

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
}

export const AdvancedPermissionSchema = SchemaFactory.createForClass(AdvancedPermission);

// Indexes for performance
AdvancedPermissionSchema.index({ tenantId: 1, permissionKey: 1 }, { unique: true });
AdvancedPermissionSchema.index({ tenantId: 1, resource: 1 });
AdvancedPermissionSchema.index({ tenantId: 1, action: 1 });
AdvancedPermissionSchema.index({ tenantId: 1, isActive: 1 });
AdvancedPermissionSchema.index({ tenantId: 1, isSystem: 1 });

// Compound indexes for queries
AdvancedPermissionSchema.index({ tenantId: 1, resource: 1, action: 1 });
AdvancedPermissionSchema.index({ tenantId: 1, tags: 1 });

// Text search index
AdvancedPermissionSchema.index({
  permissionName: 'text',
  description: 'text',
  tags: 'text',
});

// Virtual for full permission string
AdvancedPermissionSchema.virtual('fullPermission').get(function() {
  return `${this.resource}:${this.action}`;
});

// Virtual for scoped permission
AdvancedPermissionSchema.virtual('scopedPermission').get(function() {
  if (this.scopes.length === 0) return this.fullPermission;
  return `${this.fullPermission}:${this.scopes.join(':')}`;
});

// Pre-save middleware for validation
AdvancedPermissionSchema.pre('save', function(next) {
  // Validate permission key format
  const keyRegex = /^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*$/;
  if (!keyRegex.test(this.permissionKey)) {
    return next(new Error('Invalid permission key format'));
  }

  // Validate resource and action
  if (!this.resource || !this.action) {
    return next(new Error('Resource and action are required'));
  }

  // Set updated timestamp
  this.updatedAt = new Date();

  next();
});

// Static method to find permissions by resource
AdvancedPermissionSchema.statics.findByResource = function(tenantId: Types.ObjectId, resource: string) {
  return this.find({ tenantId, resource, isActive: true }).sort({ action: 1 });
};

// Static method to find permissions by action
AdvancedPermissionSchema.statics.findByAction = function(tenantId: Types.ObjectId, action: string) {
  return this.find({ tenantId, action, isActive: true }).sort({ resource: 1 });
};

// Static method to find system permissions
AdvancedPermissionSchema.statics.findSystemPermissions = function(tenantId: Types.ObjectId) {
  return this.find({ tenantId, isSystem: true, isActive: true }).sort({ resource: 1, action: 1 });
};

// Static method to find custom permissions
AdvancedPermissionSchema.statics.findCustomPermissions = function(tenantId: Types.ObjectId) {
  return this.find({ tenantId, isSystem: false, isActive: true }).sort({ resource: 1, action: 1 });
};

// Static method to get permission statistics
AdvancedPermissionSchema.statics.getStatistics = function(tenantId: Types.ObjectId) {
  return this.aggregate([
    { $match: { tenantId } },
    {
      $group: {
        _id: null,
        totalPermissions: { $sum: 1 },
        activePermissions: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0],
          },
        },
        systemPermissions: {
          $sum: {
            $cond: [{ $eq: ['$isSystem', true] }, 1, 0],
          },
        },
        customPermissions: {
          $sum: {
            $cond: [{ $eq: ['$isSystem', false] }, 1, 0],
          },
        },
        resources: { $addToSet: '$resource' },
        actions: { $addToSet: '$action' },
      },
    },
  ]);
};

// Method to check if permission has scope
AdvancedPermissionSchema.methods.hasScope = function(scope: string): boolean {
  return this.scopes.includes(scope);
};

// Method to check if permission has condition
AdvancedPermissionSchema.methods.hasCondition = function(condition: string): boolean {
  return this.conditions.includes(condition);
};

// Method to add scope
AdvancedPermissionSchema.methods.addScope = function(scope: string) {
  if (!this.scopes.includes(scope)) {
    this.scopes.push(scope);
  }
  return this.save();
};

// Method to remove scope
AdvancedPermissionSchema.methods.removeScope = function(scope: string) {
  this.scopes = this.scopes.filter(s => s !== scope);
  return this.save();
};

// Method to add condition
AdvancedPermissionSchema.methods.addCondition = function(condition: string) {
  if (!this.conditions.includes(condition)) {
    this.conditions.push(condition);
  }
  return this.save();
};

// Method to remove condition
AdvancedPermissionSchema.methods.removeCondition = function(condition: string) {
  this.conditions = this.conditions.filter(c => c !== condition);
  return this.save();
};

// Method to add tag
AdvancedPermissionSchema.methods.addTag = function(tag: string) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
  }
  return this.save();
};

// Method to remove tag
AdvancedPermissionSchema.methods.removeTag = function(tag: string) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
}; 