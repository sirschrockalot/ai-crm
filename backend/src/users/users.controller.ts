import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  ForbiddenException 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { USER_ROLES } from '../common/decorators/roles.decorator';
import { UpdateProfileDto } from '../common/dto/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(USER_ROLES.ADMIN)
  async getAllUsers(@Request() req: any) {
    const tenantId = req.user.tenant_id;
    return this.usersService.findAllByTenant(tenantId);
  }

  @Get(':id')
  @Roles(USER_ROLES.ADMIN)
  async getUser(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenant_id;
    const user = await this.usersService.findByIdAndTenant(id, tenantId);
    
    if (!user) {
      throw new ForbiddenException('User not found in tenant');
    }
    
    return user;
  }

  @Post()
  @Roles(USER_ROLES.ADMIN)
  async createUser(@Body() createUserDto: any, @Request() req: any) {
    const tenantId = req.user.tenant_id;
    
    // Validate role
    if (!Object.values(USER_ROLES).includes(createUserDto.role)) {
      throw new ForbiddenException('Invalid role specified');
    }

    // Check if user already exists in tenant
    const existingUser = await this.usersService.findByEmail(createUserDto.email, tenantId);
    if (existingUser) {
      throw new ForbiddenException('User with this email already exists in tenant');
    }

    return this.usersService.createUserInTenant(createUserDto, tenantId);
  }

  @Put(':id')
  @Roles(USER_ROLES.ADMIN)
  async updateUser(
    @Param('id') id: string, 
    @Body() updateUserDto: any, 
    @Request() req: any
  ) {
    const tenantId = req.user.tenant_id;
    
    // Prevent updating own role to non-admin
    if (id === req.user._id && updateUserDto.role !== USER_ROLES.ADMIN) {
      throw new ForbiddenException('Cannot change your own role to non-admin');
    }

    // Validate role if provided
    if (updateUserDto.role && !Object.values(USER_ROLES).includes(updateUserDto.role)) {
      throw new ForbiddenException('Invalid role specified');
    }

    return this.usersService.updateUserInTenant(id, tenantId, updateUserDto);
  }

  @Put(':id/activate')
  @Roles(USER_ROLES.ADMIN)
  async activateUser(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenant_id;
    return this.usersService.activateUser(id, tenantId);
  }

  @Put(':id/deactivate')
  @Roles(USER_ROLES.ADMIN)
  async deactivateUser(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenant_id;
    
    // Prevent deactivating own account
    if (id === req.user._id) {
      throw new ForbiddenException('Cannot deactivate your own account');
    }

    return this.usersService.deactivateUser(id, tenantId);
  }

  @Delete(':id')
  @Roles(USER_ROLES.ADMIN)
  async deleteUser(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenant_id;
    
    // Prevent deleting own account
    if (id === req.user._id) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    await this.usersService.deleteUser(id, tenantId);
    return { message: 'User deleted successfully' };
  }

  @Get(':id/permissions')
  @Roles(USER_ROLES.ADMIN)
  async getUserPermissions(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenant_id;
    return this.usersService.getUserPermissions(id, tenantId);
  }

  // Profile management endpoints
  @Get('profile/me')
  async getMyProfile(@Request() req: any) {
    const tenantId = req.user.tenant_id;
    const user = await this.usersService.findByIdAndTenant(req.user._id, tenantId);
    
    if (!user) {
      throw new ForbiddenException('User not found');
    }
    
    return user;
  }

  @Put('profile/me')
  async updateMyProfile(@Body() updateProfileDto: UpdateProfileDto, @Request() req: any) {
    const tenantId = req.user.tenant_id;
    return this.usersService.updateProfile(req.user._id, tenantId, updateProfileDto);
  }

  @Get('profile/me/preferences')
  async getMyPreferences(@Request() req: any) {
    const tenantId = req.user.tenant_id;
    return this.usersService.getPreferences(req.user._id, tenantId);
  }

  @Put('profile/me/preferences')
  async updateMyPreferences(@Body() preferences: any, @Request() req: any) {
    const tenantId = req.user.tenant_id;
    return this.usersService.updatePreferences(req.user._id, tenantId, preferences);
  }
} 