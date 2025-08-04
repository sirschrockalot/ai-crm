import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';

import { RbacService } from './rbac.service';
import { Role, RoleDocument } from './schemas/role.schema';
import { UserRole, UserRoleDocument } from './schemas/user-role.schema';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto } from './dto/role.dto';
import { PERMISSIONS, ROLES } from '../../common/constants/permissions';

describe('RbacService', () => {
  let service: RbacService;
  let roleModel: any;
  let userRoleModel: any;
  let configService: ConfigService;

  const mockRoleModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRoleModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    save: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacService,
        {
          provide: getModelToken(Role.name),
          useValue: mockRoleModel,
        },
        {
          provide: getModelToken(UserRole.name),
          useValue: mockUserRoleModel,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<RbacService>(RbacService);
    roleModel = module.get(getModelToken(Role.name));
    userRoleModel = module.get(getModelToken(UserRole.name));
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRole', () => {
    it('should create a new role successfully', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'TEST_ROLE',
        displayName: 'Test Role',
        description: 'A test role',
        permissions: [PERMISSIONS.LEADS_READ, PERMISSIONS.LEADS_UPDATE],
      };

      const mockRole = {
        ...createRoleDto,
        _id: new Types.ObjectId(),
        type: 'custom',
        isActive: true,
        save: jest.fn().mockResolvedValue(createRoleDto),
      };

      roleModel.findOne.mockResolvedValue(null);
      roleModel.save = jest.fn().mockResolvedValue(mockRole);

      const result = await service.createRole(createRoleDto);

      expect(roleModel.findOne).toHaveBeenCalledWith({
        name: 'TEST_ROLE',
        tenantId: { $exists: false },
      });
      expect(result).toEqual(mockRole);
    });

    it('should throw ConflictException if role name already exists', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'EXISTING_ROLE',
        displayName: 'Existing Role',
      };

      roleModel.findOne.mockResolvedValue({ name: 'EXISTING_ROLE' });

      await expect(service.createRole(createRoleDto)).rejects.toThrow('Role with this name already exists');
    });

    it('should throw BadRequestException for invalid permissions', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'TEST_ROLE',
        displayName: 'Test Role',
        permissions: ['invalid:permission'],
      };

      roleModel.findOne.mockResolvedValue(null);

      await expect(service.createRole(createRoleDto)).rejects.toThrow('Invalid permissions: invalid:permission');
    });
  });

  describe('updateRole', () => {
    it('should update an existing role successfully', async () => {
      const roleId = new Types.ObjectId().toString();
      const updateRoleDto: UpdateRoleDto = {
        displayName: 'Updated Role',
        permissions: [PERMISSIONS.LEADS_READ],
      };

      const existingRole = {
        _id: roleId,
        name: 'TEST_ROLE',
        type: 'custom',
        isActive: true,
      };

      const updatedRole = {
        ...existingRole,
        ...updateRoleDto,
      };

      roleModel.findById.mockResolvedValue(existingRole);
      roleModel.findByIdAndUpdate.mockResolvedValue(updatedRole);

      const result = await service.updateRole(roleId, updateRoleDto);

      expect(roleModel.findById).toHaveBeenCalledWith(roleId);
      expect(roleModel.findByIdAndUpdate).toHaveBeenCalledWith(
        roleId,
        { ...updateRoleDto, updatedBy: undefined },
        { new: true }
      );
      expect(result).toEqual(updatedRole);
    });

    it('should throw NotFoundException if role not found', async () => {
      const roleId = new Types.ObjectId().toString();
      const updateRoleDto: UpdateRoleDto = {
        displayName: 'Updated Role',
      };

      roleModel.findById.mockResolvedValue(null);

      await expect(service.updateRole(roleId, updateRoleDto)).rejects.toThrow('Role not found');
    });

    it('should throw BadRequestException when updating system role', async () => {
      const roleId = new Types.ObjectId().toString();
      const updateRoleDto: UpdateRoleDto = {
        displayName: 'Updated Role',
      };

      const existingRole = {
        _id: roleId,
        name: 'SYSTEM_ROLE',
        type: 'system',
      };

      roleModel.findById.mockResolvedValue(existingRole);

      await expect(service.updateRole(roleId, updateRoleDto)).rejects.toThrow('System roles cannot be modified');
    });
  });

  describe('getRoleById', () => {
    it('should return role by ID', async () => {
      const roleId = new Types.ObjectId().toString();
      const mockRole = {
        _id: roleId,
        name: 'TEST_ROLE',
        displayName: 'Test Role',
      };

      roleModel.findById.mockResolvedValue(mockRole);

      const result = await service.getRoleById(roleId);

      expect(roleModel.findById).toHaveBeenCalledWith(roleId);
      expect(result).toEqual(mockRole);
    });

    it('should throw NotFoundException if role not found', async () => {
      const roleId = new Types.ObjectId().toString();

      roleModel.findById.mockResolvedValue(null);

      await expect(service.getRoleById(roleId)).rejects.toThrow('Role not found');
    });
  });

  describe('searchRoles', () => {
    it('should search and filter roles', async () => {
      const searchDto = {
        page: 1,
        limit: 10,
        search: 'test',
      };

      const mockRoles = [
        { _id: new Types.ObjectId(), name: 'TEST_ROLE_1', displayName: 'Test Role 1' },
        { _id: new Types.ObjectId(), name: 'TEST_ROLE_2', displayName: 'Test Role 2' },
      ];

      roleModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockRoles),
          }),
        }),
      });
      roleModel.countDocuments.mockResolvedValue(2);

      const result = await service.searchRoles(searchDto);

      expect(roleModel.find).toHaveBeenCalled();
      expect(roleModel.countDocuments).toHaveBeenCalled();
      expect(result).toEqual({ roles: mockRoles, total: 2 });
    });
  });

  describe('deleteRole', () => {
    it('should delete a role successfully', async () => {
      const roleId = new Types.ObjectId().toString();
      const mockRole = {
        _id: roleId,
        name: 'TEST_ROLE',
        type: 'custom',
      };

      roleModel.findById.mockResolvedValue(mockRole);
      userRoleModel.countDocuments.mockResolvedValue(0);
      roleModel.findByIdAndDelete.mockResolvedValue(mockRole);

      await service.deleteRole(roleId);

      expect(roleModel.findById).toHaveBeenCalledWith(roleId);
      expect(userRoleModel.countDocuments).toHaveBeenCalledWith({
        roleId: new Types.ObjectId(roleId),
        isActive: true,
      });
      expect(roleModel.findByIdAndDelete).toHaveBeenCalledWith(roleId);
    });

    it('should throw BadRequestException when deleting system role', async () => {
      const roleId = new Types.ObjectId().toString();
      const mockRole = {
        _id: roleId,
        name: 'SYSTEM_ROLE',
        type: 'system',
      };

      roleModel.findById.mockResolvedValue(mockRole);

      await expect(service.deleteRole(roleId)).rejects.toThrow('System roles cannot be deleted');
    });

    it('should throw BadRequestException when role is assigned to users', async () => {
      const roleId = new Types.ObjectId().toString();
      const mockRole = {
        _id: roleId,
        name: 'TEST_ROLE',
        type: 'custom',
      };

      roleModel.findById.mockResolvedValue(mockRole);
      userRoleModel.countDocuments.mockResolvedValue(1);

      await expect(service.deleteRole(roleId)).rejects.toThrow('Cannot delete role that is assigned to users');
    });
  });

  describe('assignRoleToUser', () => {
    it('should assign role to user successfully', async () => {
      const assignRoleDto: AssignRoleDto = {
        userId: new Types.ObjectId().toString(),
        roleId: new Types.ObjectId().toString(),
      };

      const mockRole = {
        _id: assignRoleDto.roleId,
        name: 'TEST_ROLE',
        isActive: true,
      };

      const mockUserRole = {
        ...assignRoleDto,
        _id: new Types.ObjectId(),
        isActive: true,
        assignedAt: new Date(),
        save: jest.fn().mockResolvedValue(assignRoleDto),
      };

      roleModel.findById.mockResolvedValue(mockRole);
      userRoleModel.findOne.mockResolvedValue(null);
      userRoleModel.save = jest.fn().mockResolvedValue(mockUserRole);

      const result = await service.assignRoleToUser(assignRoleDto);

      expect(roleModel.findById).toHaveBeenCalledWith(assignRoleDto.roleId);
      expect(userRoleModel.findOne).toHaveBeenCalledWith({
        userId: new Types.ObjectId(assignRoleDto.userId),
        roleId: new Types.ObjectId(assignRoleDto.roleId),
        tenantId: { $exists: false },
        isActive: true,
      });
      expect(result).toEqual(mockUserRole);
    });

    it('should throw BadRequestException when assigning inactive role', async () => {
      const assignRoleDto: AssignRoleDto = {
        userId: new Types.ObjectId().toString(),
        roleId: new Types.ObjectId().toString(),
      };

      const mockRole = {
        _id: assignRoleDto.roleId,
        name: 'TEST_ROLE',
        isActive: false,
      };

      roleModel.findById.mockResolvedValue(mockRole);

      await expect(service.assignRoleToUser(assignRoleDto)).rejects.toThrow('Cannot assign inactive role');
    });

    it('should throw ConflictException when role is already assigned', async () => {
      const assignRoleDto: AssignRoleDto = {
        userId: new Types.ObjectId().toString(),
        roleId: new Types.ObjectId().toString(),
      };

      const mockRole = {
        _id: assignRoleDto.roleId,
        name: 'TEST_ROLE',
        isActive: true,
      };

      roleModel.findById.mockResolvedValue(mockRole);
      userRoleModel.findOne.mockResolvedValue({ _id: new Types.ObjectId() });

      await expect(service.assignRoleToUser(assignRoleDto)).rejects.toThrow('User already has this role assigned');
    });
  });

  describe('getUserPermissions', () => {
    it('should return user permissions from roles', async () => {
      const userId = new Types.ObjectId().toString();
      const mockRoles = [
        {
          _id: new Types.ObjectId(),
          name: 'TEST_ROLE',
          permissions: [PERMISSIONS.LEADS_READ, PERMISSIONS.LEADS_UPDATE],
          inheritedRoles: [],
        },
      ];

      userRoleModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          { roleId: mockRoles[0] },
        ]),
      });

      const result = await service.getUserPermissions(userId);

      expect(userRoleModel.find).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId),
        tenantId: { $exists: false },
        isActive: true,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: expect.any(Date) } },
        ],
      });
      expect(result).toEqual([PERMISSIONS.LEADS_READ, PERMISSIONS.LEADS_UPDATE]);
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has permission', async () => {
      const userId = new Types.ObjectId().toString();
      const permission = PERMISSIONS.LEADS_READ;

      jest.spyOn(service, 'getUserPermissions').mockResolvedValue([
        PERMISSIONS.LEADS_READ,
        PERMISSIONS.LEADS_UPDATE,
      ]);

      const result = await service.hasPermission(userId, permission);

      expect(service.getUserPermissions).toHaveBeenCalledWith(userId, undefined);
      expect(result).toBe(true);
    });

    it('should return false if user does not have permission', async () => {
      const userId = new Types.ObjectId().toString();
      const permission = PERMISSIONS.LEADS_DELETE;

      jest.spyOn(service, 'getUserPermissions').mockResolvedValue([
        PERMISSIONS.LEADS_READ,
        PERMISSIONS.LEADS_UPDATE,
      ]);

      const result = await service.hasPermission(userId, permission);

      expect(result).toBe(false);
    });
  });

  describe('initializeSystemRoles', () => {
    it('should initialize system roles', async () => {
      roleModel.findOne.mockResolvedValue(null);
      roleModel.create.mockResolvedValue({});

      await service.initializeSystemRoles();

      expect(roleModel.findOne).toHaveBeenCalledTimes(5); // 5 system roles
      expect(roleModel.create).toHaveBeenCalledTimes(5);
    });

    it('should not create existing system roles', async () => {
      roleModel.findOne.mockResolvedValue({ name: 'SUPER_ADMIN' });
      roleModel.create.mockResolvedValue({});

      await service.initializeSystemRoles();

      expect(roleModel.findOne).toHaveBeenCalledTimes(5);
      expect(roleModel.create).toHaveBeenCalledTimes(0);
    });
  });
}); 