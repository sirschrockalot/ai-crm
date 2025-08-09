// Module
export { UsersModule } from './users.module';

// Service
export { UsersService } from './users.service';

// Schemas
export { User, UserDocument, UserStatus, UserRole } from './schemas/user.schema';
export { UserActivity, UserActivityDocument, ActivityType, ActivitySeverity } from './schemas/user-activity.schema';

// DTOs
export {
  CreateUserDto,
  UpdateUserDto,
  UserSearchDto,
  UpdateUserStatusDto,
  UpdateUserRolesDto,
  UserActivitySearchDto,
  ProfileDto,
  AddressDto,
  SocialMediaDto,
  UserSettingsDto,
  NotificationSettingsDto,
  UserPreferencesDto,
} from './dto/user.dto';

// Services
export { EmailService } from './services/email.service';
export { UserValidationService } from './services/user-validation.service';

// Controller
export { UsersController } from './users.controller'; 