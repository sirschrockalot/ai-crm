# Agent 1: Lead Management Specialist - Implementation Instructions

## Agent Profile
**Agent ID**: `lead-management-dev`  
**Specialization**: API Integration, State Management, Authentication  
**Stories Assigned**: Story 2.3 - Integrate Lead Management with Shared Services  
**Priority**: HIGH (Blocking Epic 2 completion)  
**Estimated Effort**: 2-3 days

## Story Details
**Story File**: `docs/stories/2.3.integrate-lead-management-shared-services.md`  
**Epic**: Lead Management Feature Migration  
**Dependencies**: ✅ Stories 1.1, 1.2, 2.1, 2.2 completed

## Implementation Focus

### Primary Objectives
1. **Migrate API services to use shared patterns**
2. **Update state management to use shared hooks**
3. **Integrate with shared authentication and authorization**
4. **Implement shared error handling and loading states**
5. **Ensure all API integrations continue working correctly**

### Key Technical Areas
- **API Integration**: Update lead management API services to use shared `useApi` hook
- **State Management**: Replace local state with shared `useLeads` hook
- **Authentication**: Integrate with shared `useAuth` hook for authentication
- **Error Handling**: Implement shared error boundary and loading patterns
- **Testing**: Comprehensive testing of all lead management features

## File Locations to Modify

### Core Files
```
src/frontend/
├── hooks/
│   ├── useApi.ts                    # Shared API client (already exists)
│   ├── useAuth.ts                   # Shared authentication (already exists)
│   ├── useLeads.ts                  # Lead management hook (update)
│   └── services/
│       ├── useLeads.ts              # Lead service hook (update)
│       └── useCommunications.ts     # Communication service hook (update)
├── components/
│   ├── ui/
│   │   ├── Loading.tsx              # Shared loading component (already exists)
│   │   └── ErrorBoundary.tsx        # Error boundary (create)
│   └── forms/
│       └── LeadForm.tsx             # Lead form (already exists)
├── pages/
│   ├── leads/
│   │   ├── index.tsx                # Lead management page (update)
│   │   └── [id].tsx                 # Lead detail page (update)
│   └── dashboard.tsx                # Main dashboard (update)
└── utils/
    ├── error.ts                     # Error handling utilities (already exists)
    └── api.ts                       # API utilities (create)
```

## Implementation Checklist

### Task 1: Migrate API services to shared patterns
- [ ] Update lead management API services to use shared `useApi` hook
- [ ] Implement consistent API client patterns for all lead endpoints
- [ ] Add proper authentication headers to all API calls
- [ ] Implement retry logic for failed API requests
- [ ] Add request/response interceptors for logging
- [ ] Ensure proper error handling for API failures

### Task 2: Update state management with shared hooks
- [ ] Replace local state management with shared `useLeads` hook
- [ ] Implement proper loading states using shared patterns
- [ ] Add error state management using shared error handling
- [ ] Integrate with shared context providers
- [ ] Implement optimistic updates for better UX
- [ ] Add proper state synchronization across components

### Task 3: Integrate authentication and authorization
- [ ] Use shared `useAuth` hook for authentication state
- [ ] Implement role-based access control for lead operations
- [ ] Add proper authorization checks for sensitive operations
- [ ] Integrate with shared authentication middleware
- [ ] Implement proper token refresh handling
- [ ] Add session management for lead management features

### Task 4: Implement shared error handling
- [ ] Use shared error boundary components
- [ ] Implement consistent error message display
- [ ] Add proper error logging and reporting
- [ ] Implement error recovery mechanisms
- [ ] Add user-friendly error messages
- [ ] Integrate with monitoring and alerting systems

### Task 5: Add shared loading states and feedback
- [ ] Implement shared loading components
- [ ] Add progress indicators for long-running operations
- [ ] Implement success/error toast notifications
- [ ] Add skeleton loading states for data fetching
- [ ] Implement proper loading states for forms
- [ ] Add user feedback for all user interactions

### Task 6: Verify API integrations
- [ ] Test all lead CRUD operations
- [ ] Verify pipeline management functionality
- [ ] Test communication tracking features
- [ ] Validate bulk operations
- [ ] Test import/export functionality
- [ ] Verify real-time updates and synchronization

## Technical Requirements

### API Endpoints to Integrate
- **Lead Endpoints**: `/api/leads`, `/api/leads/:id`, `/api/leads/bulk`
- **Communication Endpoints**: `/api/communications` for lead communication tracking
- **Pipeline Endpoints**: `/api/pipeline` for pipeline management
- **Authentication**: Google OAuth 2.0 + JWT tokens

### Shared Components to Use
- **Loading Component**: Use existing `Loading` component from Story 1.2
- **Error Components**: Use error boundary and error display patterns
- **Form Components**: Use existing form validation and submission patterns
- **UI Components**: Use Button, Modal, Table, Card components from Story 1.2

### Testing Requirements
- **Unit Tests**: Test all service integrations and state management
- **Integration Tests**: Test API calls and authentication flows
- **E2E Tests**: Test complete lead management workflows
- **Error Tests**: Test error handling and recovery scenarios
- **Performance Tests**: Test loading states and user feedback

## Success Criteria

### Functional Requirements
- ✅ All lead management features work with shared services
- ✅ API integrations use consistent patterns
- ✅ Error handling and loading states work properly
- ✅ Authentication and authorization function correctly
- ✅ All lead CRUD operations work correctly
- ✅ Pipeline management functionality works
- ✅ Communication tracking features work
- ✅ Bulk operations work correctly
- ✅ Import/export functionality works
- ✅ Real-time updates and synchronization work

### Technical Requirements
- ✅ All acceptance criteria met for Story 2.3
- ✅ Comprehensive unit tests implemented
- ✅ Integration tests passing
- ✅ Performance benchmarks met
- ✅ Accessibility requirements satisfied

## Coordination Points

### With Other Agents
- **Agent 2 (Analytics)**: May need lead data for analytics integration
- **Agent 3 (Automation)**: May need lead triggers for automation workflows
- **Agent 4 (Dashboard)**: May need lead widgets for dashboard
- **Agent 5 (Integration)**: Will consolidate shared components

### Shared Resources
- Use shared component library from Story 1.2
- Use shared hooks (`useApi`, `useAuth`, `useLeads`)
- Use shared utilities (data, error, date, currency, validation)
- Follow consistent API patterns and error handling

## Daily Progress Updates

### Commit Message Format
```
feat(lead-management): [Story 2.3] [Task Description]

- Task completion status
- Integration points reached
- Blockers or dependencies
- Next steps
```

### Example Commit Messages
```
feat(lead-management): [Story 2.3] Migrate API services to shared patterns

- Updated useLeads hook to use shared useApi
- Implemented consistent API client patterns
- Added authentication headers to all API calls
- Next: Implement retry logic and error handling
```

## Blockers and Dependencies

### Dependencies Met
- ✅ Stories 1.1, 1.2, 2.1, 2.2 completed
- ✅ Shared component library established
- ✅ Shared hooks and utilities available

### Potential Blockers
- API endpoint changes from backend team
- Authentication service modifications
- Shared component updates from other agents

## Next Steps After Completion

1. **Notify Agent 2 (Analytics)**: Lead management integration complete
2. **Coordinate with Agent 3 (Automation)**: Lead triggers for automation
3. **Update Agent 4 (Dashboard)**: Lead widgets for dashboard
4. **Prepare for Agent 5 (Integration)**: Component consolidation

## Resources

### Story Documentation
- **Story File**: `docs/stories/2.3.integrate-lead-management-shared-services.md`
- **Epic Documentation**: `docs/epics/frontend-migration-epics.md`
- **Architecture Documentation**: `docs/architecture/Architecture_Overview_Wholesaling_CRM.md`

### Shared Resources
- **Component Library**: `src/frontend/components/ui/`
- **Shared Hooks**: `src/frontend/hooks/`
- **Utilities**: `src/frontend/utils/`
- **Types**: `src/frontend/types/`

### Testing Resources
- **Test Framework**: Jest and React Testing Library
- **Test Location**: `src/frontend/__tests__/`
- **Test Utilities**: `src/frontend/test-utils/`

---

**Agent 1 is ready to begin implementation of Story 2.3!** 🚀 