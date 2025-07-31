# Story 2.2: Lead Pipeline Management

## 📋 Story Information

**Epic:** Epic 2: Lead Management System  
**Story ID:** 2.2  
**Priority:** High  
**Estimated Points:** 13  
**Dependencies:** Story 2.1 (Lead Creation)  

## 🎯 Goal & Context

### **User Story**
```
As a user
I want to view and manage leads in a pipeline view
So that I can track lead progress and status
```

### **Business Context**
This story implements a Kanban-style pipeline view that allows users to visualize and manage leads through different stages of the sales process. It provides drag-and-drop functionality, filtering, and real-time updates to help teams track lead progress efficiently.

### **Success Criteria**
- User can view leads organized by status (new, contacted, under_contract, closed, lost)
- User can drag and drop leads between status columns
- User can filter leads by assigned user, tags, or search terms
- User can see lead details in a card format
- User can quickly update lead status
- Pipeline view is responsive and works on mobile

## 🏗️ Technical Implementation

### **Key Files to Create/Modify**

#### **Backend Files:**
- `backend/src/leads/leads.controller.ts` - Pipeline endpoints
- `backend/src/leads/leads.service.ts` - Pipeline business logic
- `backend/src/leads/lead.schema.ts` - Lead status tracking
- `backend/src/common/dto/update-lead-status.dto.ts` - Status update validation

#### **Frontend Files:**
- `frontend/src/pages/leads/pipeline.tsx` - Pipeline view page
- `frontend/src/components/leads/LeadPipeline.tsx` - Main pipeline component
- `frontend/src/components/leads/LeadColumn.tsx` - Status column component
- `frontend/src/components/leads/LeadCard.tsx` - Individual lead card
- `frontend/src/components/leads/LeadFilters.tsx` - Filter controls
- `frontend/src/hooks/useLeadPipeline.ts` - Pipeline state management
- `frontend/src/services/leads.ts` - Pipeline API service

### **Required Technologies**
- **React DnD** - Drag and drop functionality
- **React Query** - Data fetching and caching
- **Zustand** - Pipeline state management
- **TailwindCSS** - Responsive design
- **WebSockets** - Real-time updates (optional)

### **Critical APIs & Interfaces**

#### **Pipeline Data Structure:**
```typescript
// frontend/src/types/leads.ts
interface LeadPipeline {
  new: Lead[];
  contacted: Lead[];
  under_contract: Lead[];
  closed: Lead[];
  lost: Lead[];
}

interface Lead {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  status: 'new' | 'contacted' | 'under_contract' | 'closed' | 'lost';
  assigned_to?: string;
  tags: string[];
  last_contacted?: Date;
  next_follow_up?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_value?: number;
  created_at: Date;
  updated_at: Date;
}
```

#### **Status Update API:**
```typescript
// backend/src/leads/leads.controller.ts
@Put('/leads/:id/status')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('acquisition_rep', 'disposition_manager', 'admin')
async updateLeadStatus(
  @Param('id') id: string,
  @Body() updateStatusDto: UpdateLeadStatusDto,
  @Request() req: any
) {
  return this.leadsService.updateLeadStatus(id, updateStatusDto, req.user.tenant_id);
}
```

### **Data Models**

#### **Lead Status Tracking:**
```typescript
// backend/src/leads/lead.schema.ts
{
  status: String,                 // new, contacted, under_contract, closed, lost
  status_history: [{
    status: String,
    changed_by: ObjectId,
    changed_at: Date,
    notes: String
  }],
  last_status_change: Date,
  next_follow_up: Date,
  priority: String,               // low, medium, high, urgent
  assigned_to: ObjectId,
  tags: [String]
}
```

### **Required Environment Variables**
```bash
# Backend .env
MONGODB_URI=mongodb://localhost:27017/presidential_digs_crm
JWT_SECRET=your_jwt_secret_key
```

## 🔗 Integration Points

### **Database Integration**
- **Collection:** `leads`
- **Operations:** Update lead status, track status history
- **Indexes:** `{ tenant_id: 1, status: 1 }`, `{ tenant_id: 1, assigned_to: 1 }`

### **API Endpoints**
- `GET /api/leads/pipeline` - Get leads organized by status
- `PUT /api/leads/:id/status` - Update lead status
- `GET /api/leads?status=new&assigned_to=user_id` - Filtered leads
- `GET /api/leads?search=term&tags=tag1,tag2` - Search and filter

### **Frontend Integration**
- Kanban-style pipeline interface
- Drag-and-drop functionality
- Real-time status updates
- Filter and search controls
- Lead card details view

## 🧪 Testing Requirements

### **Unit Tests**
- Pipeline data organization
- Status update validation
- Filter and search logic
- Drag-and-drop functionality
- State management

### **Integration Tests**
- Pipeline API endpoints
- Status update workflows
- Filter and search functionality
- Real-time updates
- Multi-tenant isolation

### **E2E Tests**
- User can view pipeline with leads
- User can drag and drop leads between columns
- User can filter leads by various criteria
- User can search for specific leads
- Pipeline updates in real-time

### **Test Scenarios**
1. **Pipeline Navigation**
   - User loads pipeline view
   - Leads are organized by status
   - User can scroll through columns
   - User can see lead counts per status

2. **Drag and Drop**
   - User drags lead from "new" to "contacted"
   - Lead status updates in database
   - UI reflects the change immediately
   - Status history is recorded

3. **Filtering and Search**
   - User filters by assigned team member
   - User searches for specific lead name
   - User filters by tags
   - Results update in real-time

4. **Mobile Responsiveness**
   - Pipeline works on mobile devices
   - Touch gestures work for drag and drop
   - Filters are accessible on mobile
   - Cards are readable on small screens

## 📚 References

### **Architecture Documents**
- `docs/architecture/Architecture_Overview_Wholesaling_CRM.md#frontend-optimizations`
- `docs/architecture/Architecture_Overview_Wholesaling_CRM.md#database-schema`

### **API Specifications**
- `docs/api/api-specifications.md#lead-management-endpoints`

### **Database Schema**
- `docs/database/database-schema.md#leads-collection`

### **Epic Context**
- `docs/epics/epic-structure.md#epic-2-lead-management-system`

## ⚠️ Assumptions & Edge Cases

### **Assumptions**
- Users will understand Kanban-style interfaces
- Drag-and-drop will be intuitive
- Real-time updates will improve user experience
- Mobile users will need touch-friendly interface
- Status changes will be frequent

### **Edge Cases**
- User drags lead to invalid status
- Network disconnection during drag operation
- Large number of leads in single column
- User has slow internet connection
- Multiple users updating same lead

### **Error Scenarios**
- Drag operation fails due to network error
- Status update validation fails
- Permission denied for status change
- Database connection failures
- Real-time sync conflicts

## 🎯 Acceptance Criteria

### **Functional Requirements**
- [ ] User can view leads organized by status columns
- [ ] User can drag and drop leads between status columns
- [ ] User can filter leads by assigned user, tags, or search terms
- [ ] User can see lead details in card format
- [ ] User can quickly update lead status
- [ ] Pipeline view is responsive and works on mobile

### **Technical Requirements**
- [ ] Pipeline API endpoints are functional
- [ ] Drag-and-drop works smoothly
- [ ] Status updates are persisted to database
- [ ] Real-time updates work correctly
- [ ] Filtering and search are performant
- [ ] Multi-tenant isolation is maintained

### **User Experience Requirements**
- [ ] Pipeline interface is intuitive and responsive
- [ ] Drag-and-drop provides visual feedback
- [ ] Status changes are immediate and clear
- [ ] Filtering controls are easy to use
- [ ] Mobile experience is optimized
- [ ] Loading states are shown during operations

## 📈 Definition of Done

- [ ] Pipeline view is fully functional
- [ ] Drag-and-drop works across all status columns
- [ ] Filtering and search work correctly
- [ ] Real-time updates are implemented
- [ ] Mobile responsiveness is complete
- [ ] All test scenarios pass
- [ ] Error handling is comprehensive
- [ ] Documentation is updated
- [ ] Code review is completed
- [ ] Feature is deployed to staging environment
- [ ] User acceptance testing is completed 