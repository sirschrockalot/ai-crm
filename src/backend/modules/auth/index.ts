// Module
export { AuthModule } from './auth.module';

// Service
export { AuthService, JwtPayload, GoogleUser } from './auth.service';

// Strategies
export { JwtStrategy } from './strategies/jwt.strategy';
export { GoogleOAuthStrategy } from './strategies/google-oauth.strategy';

// Guards
export { JwtAuthGuard } from './guards/jwt-auth.guard';
export { GoogleOAuthGuard } from './guards/google-oauth.guard';

// Decorators
export {
  CurrentUser,
  CurrentUserId,
  CurrentUserEmail,
  CurrentUserRoles,
  CurrentTenantId,
} from './decorators/auth.decorator';

// Controller
export { AuthController } from './auth.controller'; 