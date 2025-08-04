# Authentication Module - Sprint 1.1

## 📋 Overview

This module implements the core authentication foundation for the DealCycle CRM platform, providing JWT-based authentication with Google OAuth 2.0 integration.

## 🎯 Sprint Goals

- ✅ Set up NestJS authentication module
- ✅ Implement Google OAuth 2.0 integration
- ✅ Create JWT token generation and validation
- ✅ Build basic login/logout functionality
- ✅ Implement session management
- ✅ Create authentication API endpoints
- ✅ Add authentication error handling

## 🏗️ Architecture

### **Module Structure**
```
auth/
├── auth.module.ts              # Main module configuration
├── auth.service.ts             # Core authentication logic
├── auth.controller.ts          # API endpoints
├── strategies/
│   ├── jwt.strategy.ts         # JWT authentication strategy
│   └── google-oauth.strategy.ts # Google OAuth strategy
├── guards/
│   ├── jwt-auth.guard.ts       # JWT route protection
│   └── google-oauth.guard.ts   # Google OAuth route protection
├── decorators/
│   └── auth.decorator.ts       # User data decorators
├── auth.service.spec.ts        # Unit tests
└── index.ts                    # Module exports
```

### **Key Components**

#### **AuthService**
- JWT token generation and validation
- Google OAuth user handling
- Token refresh functionality
- Session management

#### **JwtStrategy**
- JWT token extraction and validation
- User payload verification
- Error handling for invalid tokens

#### **GoogleOAuthStrategy**
- Google OAuth 2.0 flow handling
- User profile extraction
- OAuth token management

#### **AuthController**
- `/auth/google` - Initiate Google OAuth
- `/auth/google/callback` - Handle OAuth callback
- `/auth/refresh` - Refresh JWT tokens
- `/auth/logout` - User logout
- `/auth/profile` - Get user profile
- `/auth/validate` - Validate JWT token

## 🔧 Configuration

### **Environment Variables**
```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### **Module Registration**
```typescript
import { AuthModule } from './modules/auth';

@Module({
  imports: [AuthModule],
  // ...
})
export class AppModule {}
```

## 🚀 Usage

### **Protecting Routes**
```typescript
import { JwtAuthGuard } from './modules/auth';

@Controller('protected')
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  // Routes require valid JWT token
}
```

### **Accessing User Data**
```typescript
import { CurrentUser, CurrentUserId, CurrentUserEmail } from './modules/auth';

@Controller('profile')
export class ProfileController {
  @Get()
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: JwtPayload) {
    return user;
  }

  @Get('id')
  @UseGuards(JwtAuthGuard)
  getUserId(@CurrentUserId() userId: string) {
    return { userId };
  }
}
```

### **Google OAuth Flow**
1. User visits `/auth/google`
2. Redirected to Google OAuth
3. User authorizes application
4. Google redirects to `/auth/google/callback`
5. JWT token generated and returned

## 🧪 Testing

### **Unit Tests**
```bash
npm test -- --testPathPattern=auth.service.spec.ts
```

### **Test Coverage**
- ✅ JWT token generation and validation
- ✅ Google OAuth user handling
- ✅ Token refresh functionality
- ✅ Error handling scenarios
- ✅ Configuration validation

## 🔒 Security Features

### **JWT Security**
- Secure token generation with configurable expiration
- Token validation with proper error handling
- Refresh token functionality
- Token extraction from Authorization header

### **OAuth Security**
- Google OAuth 2.0 integration
- Secure callback handling
- User profile validation
- Error handling for OAuth failures

### **Route Protection**
- JWT authentication guards
- Google OAuth guards
- Decorators for user data access
- Proper error responses

## 📈 Performance

### **Token Management**
- Efficient JWT validation
- Configurable token expiration
- Minimal database queries (future sprints)
- Redis caching ready (future sprints)

### **OAuth Optimization**
- Single OAuth flow
- Minimal redirects
- Efficient user data extraction
- Error recovery mechanisms

## 🔄 Integration Points

### **Current Sprint (1.1)**
- ✅ Basic authentication foundation
- ✅ JWT token system
- ✅ Google OAuth integration
- ✅ API endpoints

### **Future Sprints**
- 🔄 User management integration (Sprint 1.2)
- 🔄 Role-based access control (Sprint 1.3)
- 🔄 Multi-tenant architecture (Sprint 1.4)
- 🔄 Session persistence (Sprint 1.5)

## 🐛 Known Issues

### **Current Limitations**
- Google token validation not yet implemented (placeholder)
- Token blacklisting not implemented (future sprint)
- User database integration pending (Sprint 1.2)
- Session persistence not implemented (future sprint)

### **TODOs**
- [ ] Implement Google token validation
- [ ] Add token blacklisting for logout
- [ ] Integrate with user management system
- [ ] Add session persistence
- [ ] Implement rate limiting
- [ ] Add audit logging

## 📚 API Documentation

### **Authentication Endpoints**

#### **GET /auth/google**
Initiates Google OAuth flow.

#### **GET /auth/google/callback**
Handles Google OAuth callback and returns JWT token.

**Response:**
```json
{
  "success": true,
  "message": "Google OAuth authentication successful",
  "data": {
    "token": "jwt.token.here",
    "user": {
      "id": "google123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "picture": "https://example.com/picture.jpg"
    }
  }
}
```

#### **POST /auth/refresh**
Refreshes JWT token.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "new.jwt.token",
    "expiresIn": 86400
  }
}
```

#### **POST /auth/logout**
Logs out user (invalidates token).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### **GET /auth/profile**
Gets current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "tenantId": "tenant123",
      "roles": ["user"]
    }
  }
}
```

#### **GET /auth/validate**
Validates JWT token.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "valid": true,
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "tenantId": "tenant123",
      "roles": ["user"]
    }
  }
}
```

## 🎉 Sprint 1.1 Complete!

The core authentication foundation is now implemented and ready for integration with the user management system in Sprint 1.2. 