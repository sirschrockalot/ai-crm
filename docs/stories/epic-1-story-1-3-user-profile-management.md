# Story 1.3: User Profile Management

## 📋 Story Information

**Epic:** Epic 1: Authentication & User Management  
**Story ID:** 1.3  
**Priority:** High  
**Estimated Points:** 5  
**Dependencies:** Story 1.1 (Google OAuth Integration)  

## 🎯 Goal & Context

### **User Story**
```
As a user
I want to manage my profile and preferences
So that I can customize my experience
```

### **Business Context**
This story enables users to personalize their CRM experience by managing their profile information and preferences. It builds upon the Google OAuth foundation to allow users to customize their settings, notification preferences, and dashboard layout.

### **Success Criteria**
- User can view their profile information
- User can update their name, phone, and preferences
- User can change their theme (light/dark/auto)
- User can configure notification preferences
- User can set default dashboard view
- Changes are saved and persisted

## 🏗️ Technical Implementation

### **Key Files to Create/Modify**

#### **Backend Files:**
- `backend/src/users/users.controller.ts` - Profile management endpoints
- `backend/src/users/users.service.ts` - Profile update logic
- `backend/src/users/user.schema.ts` - User model with preferences
- `backend/src/common/dto/update-profile.dto.ts` - Profile update validation

#### **Frontend Files:**
- `frontend/src/pages/settings/profile.tsx` - Profile management page
- `frontend/src/components/profile/ProfileForm.tsx` - Profile editing form
- `frontend/src/components/profile/PreferencesForm.tsx` - Preferences form
- `frontend/src/components/ui/ThemeToggle.tsx` - Theme switching component
- `frontend/src/stores/userStore.ts` - User state management
- `frontend/src/services/users.ts` - Profile API service

### **Required Technologies**
- **React Hook Form** - Form validation and handling
- **Zustand** - State management for user preferences
- **TailwindCSS** - Theme implementation
- **NestJS Validation** - Backend form validation
- **MongoDB** - User preference storage

### **Critical APIs & Interfaces**

#### **Profile Update DTO:**
```typescript
// backend/src/common/dto/update-profile.dto.ts
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsObject()
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    dashboard_layout?: object;
    default_view?: 'leads' | 'buyers' | 'dashboard';
  };
}
```

#### **User Preferences Schema:**
```typescript
// backend/src/users/user.schema.ts
{
  preferences: {
    theme: String,                // light, dark, auto
    notifications: {
      email: Boolean,
      sms: Boolean,
      push: Boolean
    },
    dashboard_layout: Object,     // Customizable dashboard layout
    default_view: String          // leads, buyers, dashboard
  }
}
```

### **Data Models**

#### **User Schema Updates:**
```typescript
// backend/src/users/user.schema.ts
{
  _id: ObjectId,
  tenant_id: ObjectId,            // From Story 1.2
  google_id: String,              // From Story 1.1
  email: String,
  name: String,
  phone: String,                  // Optional phone number
  avatar_url: String,             // From Google profile
  preferences: {
    theme: String,                // light, dark, auto
    notifications: {
      email: Boolean,
      sms: Boolean,
      push: Boolean
    },
    dashboard_layout: Object,     // Customizable layout
    default_view: String          // Default page on login
  },
  created_at: Date,
  updated_at: Date
}
```

### **Required Environment Variables**
```bash
# Backend .env
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h
```

## 🔗 Integration Points

### **Database Integration**
- **Collection:** `users`
- **Operations:** Update user profile and preferences
- **Indexes:** `{ tenant_id: 1, email: 1 }`

### **API Endpoints**
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/me/preferences` - Get user preferences
- `PUT /api/users/me/preferences` - Update user preferences

### **Frontend Integration**
- Profile management page with form
- Theme switching functionality
- Notification preference controls
- Dashboard layout customization
- Default view selection

## 🧪 Testing Requirements

### **Unit Tests**
- Profile update validation
- Preference saving and retrieval
- Theme switching functionality
- Form validation and error handling

### **Integration Tests**
- Profile update API endpoints
- Preference persistence across sessions
- Theme changes apply immediately
- Notification preference updates

### **E2E Tests**
- User can update profile information
- User can change theme preferences
- User can configure notification settings
- User can customize dashboard layout
- Changes persist across browser sessions

### **Test Scenarios**
1. **Profile Management**
   - User updates name and phone number
   - User changes avatar (if applicable)
   - User saves profile changes
   - Profile updates are reflected immediately

2. **Theme Preferences**
   - User switches between light/dark/auto themes
   - Theme changes apply to all pages
   - Theme preference persists across sessions
   - Auto theme responds to system settings

3. **Notification Preferences**
   - User enables/disables email notifications
   - User enables/disables SMS notifications
   - User enables/disables push notifications
   - Notification settings are saved and applied

4. **Dashboard Customization**
   - User changes default dashboard view
   - User customizes dashboard layout
   - Layout preferences are saved
   - Custom layout persists across sessions

## 📚 References

### **Architecture Documents**
- `docs/architecture/Architecture_Overview_Wholesaling_CRM.md#frontend-optimizations`
- `docs/architecture/Architecture_Overview_Wholesaling_CRM.md#user-schema`

### **API Specifications**
- `docs/api/api-specifications.md#user-management-endpoints`

### **Database Schema**
- `docs/database/database-schema.md#users-collection`

### **Epic Context**
- `docs/epics/epic-structure.md#epic-1-authentication--user-management`

## ⚠️ Assumptions & Edge Cases

### **Assumptions**
- Users will want to customize their experience
- Theme preferences will be sufficient (light/dark/auto)
- Notification preferences will be boolean (on/off)
- Dashboard layout will be JSON-serializable
- Google profile data will be the primary source

### **Edge Cases**
- User clears browser data and loses preferences
- User switches devices and preferences don't sync
- Invalid theme preference is saved
- Notification preferences conflict with system settings
- Dashboard layout becomes corrupted

### **Error Scenarios**
- Profile update fails due to validation errors
- Database connection fails during preference save
- Invalid preference data is submitted
- Theme switching causes UI issues
- Notification settings conflict with permissions

## 🎯 Acceptance Criteria

### **Functional Requirements**
- [ ] User can view their current profile information
- [ ] User can update their name and phone number
- [ ] User can change theme (light/dark/auto)
- [ ] User can configure notification preferences
- [ ] User can set default dashboard view
- [ ] User can customize dashboard layout
- [ ] All changes are saved and persisted

### **Technical Requirements**
- [ ] Profile updates are validated on backend
- [ ] Preferences are stored in user document
- [ ] Theme changes apply immediately without refresh
- [ ] Form validation prevents invalid data
- [ ] Changes persist across browser sessions
- [ ] API endpoints are properly secured

### **User Experience Requirements**
- [ ] Profile management interface is intuitive
- [ ] Theme switching is smooth and responsive
- [ ] Form validation provides clear error messages
- [ ] Success feedback is provided for changes
- [ ] Loading states are shown during updates
- [ ] Responsive design works on mobile devices

## 📈 Definition of Done

- [ ] User profile management is fully functional
- [ ] Theme switching works across all pages
- [ ] Notification preferences are configurable
- [ ] Dashboard customization is available
- [ ] All preferences persist across sessions
- [ ] All test scenarios pass
- [ ] Error handling is comprehensive
- [ ] Documentation is updated
- [ ] Code review is completed
- [ ] Feature is deployed to staging environment
- [ ] User acceptance testing is completed 