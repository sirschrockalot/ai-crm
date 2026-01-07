# Transaction Coordinator Features - Implementation Plan

## ✅ Implementation Status

### Phase 1: Foundation - COMPLETED ✅
- ✅ Appointment CRUD API (Backend) - Full MongoDB schema, service, controller
- ✅ Appointment Service & API Routes (Frontend) - Complete integration
- ✅ Calendar View (Day/Week/Month) - Full calendar with navigation
- ✅ Create Appointments from Transaction Detail Page - Modal with pre-population
- ✅ Reminder System (Backend) - Cron-based reminder checking
- ✅ Browser Notifications (Frontend) - Native browser notifications with permission handling

### Phase 2: Calendar & Tasks - COMPLETED ✅
- ✅ Task Management System (Backend) - Full CRUD with dependencies
- ✅ Task Service & API Routes (Frontend) - Complete integration
- ✅ Daily Planning Dashboard - Combined view of appointments and tasks
- ✅ Task Completion Tracking - Checkbox-based completion
- ✅ Overdue Task Alerts - Visual alerts for overdue items

### Phase 3: Communication Automation - COMPLETED ✅
- ✅ Automation Rules System (Backend) - Full rule engine with triggers
- ✅ Automation Service & API Routes (Frontend) - Complete integration
- ✅ Email Integration (via Auth Service) - Integrated with existing email service
- ✅ SMS Integration (Twilio) - Twilio API integration ready
- ✅ Status Change Triggers - Automatic rule execution on status changes
- ✅ Placeholder Replacement - Dynamic content in messages

### Phase 4: Advanced Features - PENDING
- ⏳ Analytics & Reporting Dashboard
- ⏳ Mobile App Integration
- ⏳ Advanced Notification Preferences
- ⏳ Recurring Appointments
- ⏳ Bulk Operations

---

## 📋 Implementation Details

### Backend Components Created:
1. **Appointments Module** (`transactions-service/src/appointments/`)
   - Schema with MongoDB indexes
   - Service with CRUD operations
   - Controller with REST endpoints
   - Reminder service with cron jobs

2. **Tasks Module** (`transactions-service/src/tasks/`)
   - Schema with dependencies support
   - Service with filtering and sorting
   - Controller with REST endpoints
   - Today/Overdue query methods

3. **Automation Module** (`transactions-service/src/automation/`)
   - Rule schema with triggers and actions
   - Service with email/SMS integration
   - Controller with REST endpoints
   - Placeholder replacement system

### Frontend Components Created:
1. **Services:**
   - `appointmentsService.ts` - Appointment API client
   - `tasksService.ts` - Task API client
   - `automationService.ts` - Automation rule API client

2. **Pages:**
   - `/transactions/calendar` - Calendar view (day/week/month)
   - `/transactions/planning` - Daily planning dashboard
   - Updated `/transactions/[id]` - Appointment creation modal

3. **Utilities:**
   - `notifications.ts` - Browser notification service

### API Routes Created:
- `/api/appointments/*` - Appointment proxy routes
- `/api/tasks/*` - Task proxy routes
- `/api/automation/*` - Automation proxy routes

---

## Implementation Details

## Overview

This document outlines new capabilities for Transaction Coordinators to efficiently manage their daily workflow, track important follow-ups, and automate routine communications. These features will help coordinators focus on high-value activities while ensuring nothing falls through the cracks.

---

## 🗓️ Feature 1: Calendar & Appointment Management

### 1.1 Appointment Scheduling

**Description:**  
Transaction Coordinators need to schedule and track appointments for calling buyers, sellers, and other parties involved in transactions. This includes setting reminders and viewing all appointments in a calendar view.

**User Stories:**
- As a Transaction Coordinator, I want to schedule a follow-up call with a seller, so I can track when I need to contact them
- As a Transaction Coordinator, I want to see all my appointments for the day in a calendar view, so I can plan my day effectively
- As a Transaction Coordinator, I want to set reminders for important deadlines, so I don't miss critical dates
- As a Transaction Coordinator, I want to see appointments related to specific transactions, so I can manage my workload per deal

**Features:**
- **Quick Appointment Creation**
  - Create appointment directly from transaction detail page
  - Pre-populate with transaction context (buyer/seller info, transaction ID)
  - Set appointment type (call, meeting, deadline, follow-up)
  - Add notes and context

- **Appointment Types**
  - Call Back - Buyer
  - Call Back - Seller
  - Call Back - Title Company
  - Call Back - Lender
  - Document Follow-up
  - Closing Date Reminder
  - Inspection Deadline
  - EMD Deadline
  - Custom appointment types

- **Recurring Appointments**
  - Daily check-ins
  - Weekly status updates
  - Custom recurrence patterns

- **Appointment Details**
  - Title/Subject
  - Date & Time
  - Duration
  - Related Transaction
  - Contact Person (buyer/seller/attorney/etc.)
  - Contact Method (phone/email/in-person)
  - Notes
  - Status (scheduled, completed, cancelled, missed)
  - Priority level

### 1.2 Calendar View

**Description:**  
A comprehensive calendar interface that allows coordinators to view, manage, and plan their appointments and tasks.

**Views:**
- **Day View**
  - Hourly timeline
  - Color-coded by appointment type
  - Quick add appointment
  - Drag-and-drop rescheduling

- **Week View**
  - 7-day overview
  - Time slots visible
  - Appointment count per day
  - Quick navigation

- **Month View**
  - Full month overview
  - Appointment indicators
  - Deadline markers
  - Transaction milestones

- **List View**
  - Upcoming appointments
  - Filter by date range
  - Sort by priority/date
  - Quick actions (complete, reschedule, cancel)

**Features:**
- **Filtering & Search**
  - Filter by transaction
  - Filter by contact type (buyer/seller/etc.)
  - Filter by appointment type
  - Filter by status
  - Search by transaction address or contact name

- **Quick Actions**
  - Mark as completed
  - Reschedule
  - Add to another coordinator's calendar
  - Convert to task
  - Create follow-up appointment

- **Notifications & Reminders**
  - Browser notifications
  - Email reminders (configurable: 15min, 1hr, 1day before)
  - In-app notifications
  - Mobile push notifications (future)

### 1.3 Integration Points

- **Transaction Detail Page**
  - "Schedule Follow-up" button
  - Quick appointment creation modal
  - View related appointments in transaction timeline

- **Dashboard**
  - Today's appointments widget
  - Upcoming appointments list
  - Overdue appointments alert

- **Activity Feed**
  - Appointment completions logged
  - Missed appointments flagged
  - Appointment status changes

---

## 🤖 Feature 2: Communication Automation

### 2.1 Email Automation

**Description:**  
Automate routine email communications to buyers, sellers, and other parties, allowing coordinators to focus on problem-solving and high-value activities.

**Automation Templates:**

- **Transaction Status Updates**
  - Weekly status email to buyer
  - Weekly status email to seller
  - Document request emails
  - Closing date reminders
  - Inspection reminders

- **Document Requests**
  - Request specific documents from seller
  - Request documents from buyer
  - Follow-up on missing documents
  - Document receipt confirmation

- **Deadline Reminders**
  - EMD deadline approaching
  - Inspection period ending
  - Closing date approaching
  - Document submission deadlines

- **Custom Templates**
  - Create custom email templates
  - Variable substitution (transaction details, dates, names)
  - Personalization tokens

**Automation Rules:**

- **Trigger-Based Automation**
  - On transaction status change
  - On document upload
  - On deadline approaching (X days before)
  - On date reached
  - On custom condition

- **Schedule-Based Automation**
  - Daily at specific time
  - Weekly on specific day
  - Monthly on specific date
  - Custom schedule

- **Conditional Logic**
  - Send only if condition met
  - Different templates based on transaction type
  - Different recipients based on status
  - Skip if already sent recently

**Features:**
- **Template Management**
  - Rich text editor
  - Variable placeholders
  - Preview with sample data
  - Version history
  - Template categories

- **Automation Workflows**
  - Multi-step email sequences
  - Conditional branching
  - Wait/delay steps
  - Stop conditions

- **Tracking & Analytics**
  - Email open rates
  - Click tracking
  - Delivery status
  - Bounce handling
  - Unsubscribe management

### 2.2 SMS/Text Message Automation

**Description:**  
Automate text message communications for time-sensitive updates and reminders.

**Use Cases:**
- Closing date reminders
- Document submission deadlines
- Inspection reminders
- Quick status updates
- Appointment confirmations
- Urgent notifications

**Features:**
- **SMS Templates**
  - Short, concise messages
  - Variable substitution
  - Character count indicator
  - Link shortening for URLs

- **Automation Rules**
  - Similar to email automation
  - SMS-specific triggers
  - Time-of-day restrictions (business hours)
  - Opt-out management

- **Two-Way Communication**
  - Receive replies
  - Auto-responses
  - Conversation threading
  - Integration with transaction notes

- **Compliance**
  - Opt-in/opt-out management
  - TCPA compliance
  - Message logging
  - Delivery receipts

### 2.3 Automation Dashboard

**Description:**  
Centralized interface for managing all automation rules and templates.

**Features:**
- **Automation List**
  - Active automations
  - Inactive automations
  - Automation performance metrics
  - Quick enable/disable toggle

- **Automation Builder**
  - Visual workflow builder
  - Drag-and-drop interface
  - Trigger configuration
  - Action configuration
  - Condition setup
  - Testing mode

- **Template Library**
  - Browse all templates
  - Search and filter
  - Preview templates
  - Duplicate templates
  - Template categories

- **Analytics & Reporting**
  - Emails sent (daily/weekly/monthly)
  - SMS sent (daily/weekly/monthly)
  - Open rates
  - Response rates
  - Cost tracking
  - Automation effectiveness

### 2.4 Integration Points

- **Transaction Detail Page**
  - "Set up Automation" button
  - View active automations for transaction
  - Manual trigger option
  - Automation history

- **Settings/Configuration**
  - Default automation rules
  - Template management
  - SMS provider configuration
  - Email service configuration

- **Activity Feed**
  - Automated messages logged
  - Responses tracked
  - Automation triggers visible

---

## 📋 Feature 3: Task Management & Daily Planning

### 3.1 Task Creation & Management

**Description:**  
Allow coordinators to create and manage tasks related to transactions and their daily workflow.

**Task Types:**
- Follow-up call
- Document review
- Problem resolution
- Deadline tracking
- Custom tasks

**Task Properties:**
- Title
- Description
- Related transaction
- Due date/time
- Priority (low, medium, high, urgent)
- Assignee (self or other coordinator)
- Status (todo, in-progress, completed, cancelled)
- Tags/categories
- Notes
- Attachments

**Features:**
- **Quick Task Creation**
  - From transaction page
  - From calendar
  - From email/SMS
  - Bulk task creation

- **Task Templates**
  - Pre-defined task lists for transaction types
  - Recurring task patterns
  - Task checklists

- **Task Dependencies**
  - Task A must complete before Task B
  - Sequential workflows
  - Parallel task tracking

### 3.2 Daily Planning View

**Description:**  
A consolidated view that helps coordinators plan and execute their day effectively.

**Components:**
- **Today's Overview**
  - Appointments for today
  - Tasks due today
  - Overdue items
  - Upcoming deadlines
  - Priority items

- **Time Blocking**
  - Visual time slots
  - Drag tasks/appointments into time blocks
  - Estimated vs actual time
  - Buffer time suggestions

- **Priority Matrix**
  - Urgent & Important
  - Important but not urgent
  - Urgent but not important
  - Neither urgent nor important

- **Workload Balance**
  - Number of active transactions
  - Tasks per transaction
  - Time allocation per transaction
  - Workload warnings

**Features:**
- **Smart Suggestions**
  - Suggest optimal task order
  - Identify time conflicts
  - Recommend breaks
  - Flag overloaded days

- **Quick Actions**
  - Mark task complete
  - Reschedule appointment
  - Delegate task
  - Add to tomorrow

- **Progress Tracking**
  - Daily completion rate
  - Weekly goals
  - Productivity metrics

---

## 🔔 Feature 4: Notifications & Reminders

### 4.1 Smart Notifications

**Description:**  
Intelligent notification system that ensures coordinators never miss important items.

**Notification Types:**
- Appointment reminders
- Task due reminders
- Deadline approaching
- Document received
- Status change alerts
- Automation triggered
- Problem detected

**Notification Channels:**
- In-app notifications
- Browser notifications
- Email notifications
- SMS notifications (urgent only)
- Mobile push (future)

**Features:**
- **Notification Preferences**
  - Per notification type settings
  - Quiet hours
  - Channel preferences
  - Frequency controls

- **Notification Grouping**
  - Group by transaction
  - Group by type
  - Batch notifications
  - Digest mode

- **Smart Filtering**
  - Only show important notifications
  - Mute low-priority items
  - Focus mode

### 4.2 Reminder System

**Description:**  
Configurable reminder system for appointments, tasks, and deadlines.

**Reminder Types:**
- One-time reminders
- Recurring reminders
- Escalating reminders (multiple alerts)
- Smart reminders (based on workload)

**Reminder Timing:**
- Minutes before (5, 15, 30, 60)
- Hours before (1, 2, 4, 12, 24)
- Days before (1, 2, 3, 7)
- Custom timing

---

## 📊 Feature 5: Analytics & Reporting

### 5.1 Coordinator Performance Metrics

**Metrics:**
- Appointments completed on time
- Tasks completed
- Response times
- Automation usage
- Transaction throughput
- Customer satisfaction

### 5.2 Workload Analytics

**Metrics:**
- Active transactions per coordinator
- Average time per transaction
- Peak workload times
- Task completion rates
- Automation effectiveness

### 5.3 Communication Analytics

**Metrics:**
- Emails sent/received
- SMS sent/received
- Response rates
- Automation engagement
- Communication costs

---

## 🏗️ Technical Implementation Considerations

### Database Schema Additions

**Appointments Collection:**
```typescript
{
  _id: ObjectId,
  transactionId: string,
  title: string,
  description?: string,
  type: 'call_back_buyer' | 'call_back_seller' | 'deadline' | 'meeting' | 'custom',
  startDate: Date,
  endDate?: Date,
  duration?: number, // minutes
  contactPerson?: string,
  contactMethod: 'phone' | 'email' | 'in_person',
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  reminderSettings: {
    enabled: boolean,
    timings: number[], // minutes before
  },
  notes?: string,
  coordinatorId: string,
  createdAt: Date,
  updatedAt: Date,
}
```

**Automation Rules Collection:**
```typescript
{
  _id: ObjectId,
  name: string,
  description?: string,
  type: 'email' | 'sms',
  trigger: {
    type: 'status_change' | 'date' | 'document_upload' | 'schedule',
    conditions: object,
  },
  templateId: string,
  recipients: {
    type: 'buyer' | 'seller' | 'title_company' | 'lender' | 'custom',
    customEmails?: string[],
    customPhones?: string[],
  },
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom',
    timing: object,
  },
  conditions?: object[],
  active: boolean,
  transactionType?: string[],
  createdAt: Date,
  updatedAt: Date,
}
```

**Email/SMS Templates Collection:**
```typescript
{
  _id: ObjectId,
  name: string,
  type: 'email' | 'sms',
  category: string,
  subject?: string, // for email
  body: string,
  variables: string[], // available variables
  active: boolean,
  createdAt: Date,
  updatedAt: Date,
}
```

**Tasks Collection:**
```typescript
{
  _id: ObjectId,
  transactionId?: string,
  title: string,
  description?: string,
  type: string,
  dueDate?: Date,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled',
  assigneeId: string,
  tags?: string[],
  notes?: string,
  attachments?: string[],
  dependencies?: string[], // task IDs
  createdAt: Date,
  updatedAt: Date,
}
```

### API Endpoints Needed

**Appointments:**
- `GET /api/v1/appointments` - List appointments (with filters)
- `POST /api/v1/appointments` - Create appointment
- `GET /api/v1/appointments/:id` - Get appointment
- `PATCH /api/v1/appointments/:id` - Update appointment
- `DELETE /api/v1/appointments/:id` - Delete appointment
- `GET /api/v1/appointments/calendar` - Get calendar view data

**Automation:**
- `GET /api/v1/automations` - List automation rules
- `POST /api/v1/automations` - Create automation rule
- `GET /api/v1/automations/:id` - Get automation rule
- `PATCH /api/v1/automations/:id` - Update automation rule
- `DELETE /api/v1/automations/:id` - Delete automation rule
- `POST /api/v1/automations/:id/trigger` - Manually trigger automation
- `GET /api/v1/automations/:id/history` - Get automation execution history

**Templates:**
- `GET /api/v1/templates` - List templates
- `POST /api/v1/templates` - Create template
- `GET /api/v1/templates/:id` - Get template
- `PATCH /api/v1/templates/:id` - Update template
- `DELETE /api/v1/templates/:id` - Delete template
- `POST /api/v1/templates/:id/preview` - Preview template with sample data

**Tasks:**
- `GET /api/v1/tasks` - List tasks
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks/:id` - Get task
- `PATCH /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

### Third-Party Integrations

**Email Service:**
- SendGrid (already configured)
- Alternative: AWS SES, Mailgun

**SMS Service:**
- Twilio (recommended)
- Alternative: AWS SNS, MessageBird

**Calendar Integration (Future):**
- Google Calendar
- Outlook Calendar
- iCal export

### Frontend Components Needed

**Calendar Components:**
- Calendar view (day/week/month)
- Appointment card
- Appointment creation modal
- Appointment detail modal
- Drag-and-drop scheduler

**Automation Components:**
- Automation list view
- Automation builder (visual workflow)
- Template editor
- Template library
- Automation history view

**Task Management Components:**
- Task list view
- Task card
- Task creation modal
- Daily planning view
- Priority matrix view

**Notification Components:**
- Notification center
- Notification preferences
- Reminder settings

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Database schema design and implementation
- [ ] Basic appointment CRUD API
- [ ] Basic calendar view (day/week/month)
- [ ] Appointment creation from transaction page
- [ ] Simple reminder system

### Phase 2: Calendar & Tasks (Weeks 3-4)
- [ ] Enhanced calendar features (drag-and-drop, rescheduling)
- [ ] Task management system
- [ ] Daily planning view
- [ ] Notification system
- [ ] Integration with transaction detail page

### Phase 3: Email Automation (Weeks 5-6)
- [ ] Email template system
- [ ] Basic automation rules
- [ ] Email sending integration
- [ ] Automation dashboard
- [ ] Template management

### Phase 4: SMS Automation (Weeks 7-8)
- [ ] SMS template system
- [ ] SMS service integration (Twilio)
- [ ] SMS automation rules
- [ ] Two-way SMS handling
- [ ] Compliance features

### Phase 5: Advanced Features (Weeks 9-10)
- [ ] Visual automation builder
- [ ] Advanced scheduling options
- [ ] Analytics and reporting
- [ ] Workload balancing
- [ ] Mobile optimization

### Phase 6: Polish & Optimization (Weeks 11-12)
- [ ] Performance optimization
- [ ] UI/UX improvements
- [ ] Testing and bug fixes
- [ ] Documentation
- [ ] User training materials

---

## 📝 User Acceptance Criteria

### Calendar & Appointments
- ✅ Coordinator can create appointment from transaction page
- ✅ Coordinator can view appointments in day/week/month views
- ✅ Coordinator receives reminders before appointments
- ✅ Coordinator can mark appointments as completed
- ✅ Coordinator can reschedule appointments
- ✅ Appointments are linked to transactions

### Automation
- ✅ Coordinator can create email automation rules
- ✅ Coordinator can create SMS automation rules
- ✅ Automation triggers correctly based on conditions
- ✅ Templates support variable substitution
- ✅ Coordinator can preview templates
- ✅ Automation execution is logged
- ✅ Coordinator can manually trigger automations

### Task Management
- ✅ Coordinator can create tasks from transactions
- ✅ Coordinator can view tasks in daily planning view
- ✅ Coordinator can prioritize tasks
- ✅ Coordinator can mark tasks complete
- ✅ Tasks are linked to transactions

---

## 🔐 Security & Compliance Considerations

- **Data Privacy:** Ensure appointment and task data is properly secured
- **Access Control:** Only authorized coordinators can view/manage appointments
- **Audit Logging:** Track all automation executions and appointment changes
- **SMS Compliance:** Ensure TCPA compliance for SMS automation
- **Email Compliance:** Ensure CAN-SPAM compliance for email automation
- **Data Retention:** Define retention policies for automation logs

---

## 📚 Related Documentation

- Transaction Service API Documentation
- Email Service Configuration
- SMS Service Integration Guide
- Calendar Component Library
- Automation Engine Architecture

---

## 🎯 Success Metrics

- **Efficiency:** 30% reduction in time spent on routine communications
- **Compliance:** 95% of appointments completed on time
- **Engagement:** 80% of automated messages opened/read
- **Satisfaction:** Coordinator satisfaction score > 4.5/5
- **Throughput:** 20% increase in transactions managed per coordinator

---

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Owner:** Product Team  
**Status:** Planning Phase

