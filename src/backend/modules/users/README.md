# Users Module - Sprint 1.2

## 📋 Overview

This module implements the comprehensive user management system for the DealCycle CRM platform, providing user CRUD operations, profile management, search functionality, and activity tracking.

## 🎯 Sprint Goals

- ✅ Create user management module
- ✅ Implement user registration workflow
- ✅ Build user profile management
- ✅ Add user search and filtering
- ✅ Implement account status management
- ✅ Create user activity logging

## 🏗️ Architecture

### **Module Structure**
```
users/
├── users.module.ts              # Main module configuration
├── users.service.ts             # Core user management logic
├── users.controller.ts          # API endpoints
├── schemas/
│   ├── user.schema.ts           # User data model
│   └── user-activity.schema.ts  # User activity tracking
├── dto/
│   └── user.dto.ts              # Data transfer objects
├── services/
│   ├── email.service.ts         # Email notifications
│   └── user-validation.service.ts # Data validation
├── users.service.spec.ts        # Unit tests
└── index.ts                     # Module exports
```

### **Key Components**

#### **UsersService**
- User CRUD operations (Create, Read, Update, Delete)
- Google OAuth integration for user creation
- User search and filtering with pagination
- User status and role management
- Activity logging and tracking
- Email notifications

#### **User Schema**
- Comprehensive user profile data
- User status management (Active, Inactive, Suspended, Pending)
- Role-based access control (Admin, Manager, User, Viewer)
- User settings and preferences
- Profile information and social media links
- Audit fields (createdAt, updatedAt, lastLoginAt, lastActiveAt)

#### **UserActivity Schema**
- Detailed activity tracking
- Activity types (Login, Profile Update, Status Change, etc.)
- Severity levels (Low, Medium, High, Critical)
- Metadata storage for audit trails
- Tenant isolation support

#### **UsersController**
- **POST /users** - Create new user
- **GET /users** - Search and filter users
- **GET /users/me** - Get current user profile
- **GET /users/:id** - Get user by ID
- **PUT /users/me** - Update current user profile
- **PUT /users/:id** - Update user by ID
- **PUT /users/:id/status** - Update user status
- **PUT /users/:id/role** - Update user role
- **GET /users/me/activity** - Get current user activity
- **GET /users/:id/activity** - Get user activity by ID
- **DELETE /users/:id** - Delete user (soft delete)
- **GET /users/stats/active-count** - Get active users count
- **GET /users/stats/by-role/:role** - Get users by role

## 🔧 Configuration

### **Environment Variables**
```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Database Configuration
DATABASE_URL=mongodb://localhost:27017/dealcycle_crm
```

### **Module Registration**
```typescript
import { UsersModule } from './modules/users';

@Module({
  imports: [UsersModule],
  // ...
})
export class AppModule {}
```

## 🚀 Usage

### **Creating Users**
```typescript
import { UsersService } from './modules/users';

@Controller('admin')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }
}
```

### **Searching Users**
```typescript
@Get('users')
async searchUsers(@Query() searchDto: UserSearchDto) {
  return this.usersService.searchUsers(searchDto);
}
```

### **Updating User Status**
```typescript
@Put('users/:id/status')
async updateUserStatus(
  @Param('id') userId: string,
  @Body() updateStatusDto: UpdateUserStatusDto,
) {
  return this.usersService.updateUserStatus(
    userId,
    updateStatusDto.status,
    updateStatusDto.reason,
  );
}
```

### **Getting User Activity**
```typescript
@Get('users/:id/activity')
async getUserActivity(@Param('id') userId: string) {
  return this.usersService.getUserActivity(userId);
}
```

## 🧪 Testing

### **Unit Tests**
```bash
npm test -- --testPathPattern=users.service.spec.ts
```

### **Test Coverage**
- ✅ User CRUD operations
- ✅ Google OAuth integration
- ✅ User search and filtering
- ✅ Status and role management
- ✅ Activity logging
- ✅ Email notifications
- ✅ Data validation

## 🔒 Security Features

### **Data Validation**
- Email format validation
- Phone number validation
- URL validation for social media links
- Input sanitization and trimming
- Length and format restrictions

### **Access Control**
- Role-based permissions
- Tenant isolation
- Activity audit trails
- Soft delete functionality
- Status-based access control

### **Email Security**
- Welcome email notifications
- Account status change notifications
- Role change notifications
- Email verification (future sprint)
- Password reset (future sprint)

## 📈 Performance

### **Database Optimization**
- Indexed fields for fast queries
- Pagination support
- Efficient search queries
- Activity log optimization
- Tenant-based filtering

### **Caching Ready**
- User profile caching
- Search result caching
- Activity log caching
- Redis integration ready

## 🔄 Integration Points

### **Current Sprint (1.2)**
- ✅ User management foundation
- ✅ Profile management system
- ✅ Search and filtering
- ✅ Activity tracking
- ✅ Email notifications

### **Future Sprints**
- 🔄 Role-based access control (Sprint 1.3)
- 🔄 Multi-tenant architecture (Sprint 1.4)
- 🔄 Email verification (Sprint 1.5)
- 🔄 Password management (Sprint 1.6)

## 🐛 Known Issues

### **Current Limitations**
- Email sending is mocked (logs only)
- Google OAuth integration needs completion
- Email verification not implemented
- Password reset not implemented
- Advanced permissions not implemented

### **TODOs**
- [ ] Implement actual email sending with nodemailer
- [ ] Complete Google OAuth integration
- [ ] Add email verification functionality
- [ ] Implement password reset
- [ ] Add advanced permission system
- [ ] Implement user invitation system
- [ ] Add bulk user operations

## 📚 API Documentation

### **User Management Endpoints**

#### **POST /users**
Create a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "displayName": "John Doe",
  "profile": {
    "phone": "+1234567890",
    "company": "DealCycle",
    "position": "Manager"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "status": "pending",
      "role": "user"
    }
  }
}
```

#### **GET /users**
Search and filter users.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term
- `status` (string): Filter by status
- `role` (string): Filter by role
- `sortBy` (string): Sort field
- `sortOrder` (string): Sort order (asc/desc)

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### **PUT /users/:id/status**
Update user status.

**Request Body:**
```json
{
  "status": "active",
  "reason": "Account approved"
}
```

#### **GET /users/:id/activity**
Get user activity.

**Response:**
```json
{
  "success": true,
  "message": "User activity retrieved successfully",
  "data": {
    "activities": [
      {
        "id": "activity123",
        "type": "login",
        "description": "User logged in",
        "performedAt": "2024-01-01T00:00:00Z",
        "severity": "low"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

## 🎉 Sprint 1.2 Complete!

The user management system is now implemented and ready for integration with role-based access control in Sprint 1.3. 