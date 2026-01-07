# Application Tracking System (ATS) - Feature Specification

## Overview

The Application Tracking System (ATS) is designed to streamline the hiring process for Admins, from initial candidate sourcing through final interview scheduling. The system integrates with third-party job boards, manages phone screenings with scripted interviews, scores candidates, and prioritizes top performers for team review and video interviews.

---

## Core Features

### 1. Third-Party Job Board Integration

#### 1.1 Indeed Integration
- **Job Posting Sync**
  - Automatically sync job postings from Indeed
  - Map Indeed job categories to internal job categories
  - Track posting performance metrics (views, applications, clicks)
  - Support for multiple job postings simultaneously

- **Candidate Import**
  - Automatic import of applications from Indeed
  - Parse candidate resumes (PDF, DOCX, TXT)
  - Extract key information:
    - Contact details (email, phone)
    - Work experience
    - Education history
    - Skills and certifications
    - Cover letter text

- **API Integration**
  - Real-time webhook support for new applications
  - Batch import for historical data
  - Error handling and retry logic for failed imports
  - Rate limiting compliance with Indeed API

#### 1.2 Other Job Board Integrations (Future)
- LinkedIn Jobs
- ZipRecruiter
- Glassdoor
- Company career page
- Manual application entry

#### 1.3 Unified Candidate Database
- Single source of truth for all candidates
- Deduplication logic (match by email, phone, name)
- Candidate profile merging
- Application history tracking

---

### 2. Phone Screening System

#### 2.1 Interview Script Management
- **Script Builder**
  - Create customizable interview scripts
  - Support for multiple script templates:
    - Technical roles
    - Sales roles (Acquisitions Specialist template available)
    - Customer service roles
    - General/entry-level roles
  - Question types:
    - Open-ended questions
    - Yes/No questions
    - Rating scale questions
    - Behavioral questions (STAR format)
  - Estimated time per question
  - Total script duration (target: 10-15 minutes)

- **Script Library**
  - Pre-built script templates
  - **Acquisitions Specialist 10-15 Minute Screening Script** (see: `transactions/10–15 Minute Acquisitions Screening Call Script.md`)
    - 9 structured sections with timing guidelines
    - Opening & Frame Control (1 min)
    - Company Awareness Check (1 min)
    - Role Fit & Sales Identity (2 min)
    - Organization & Pressure Test (2 min)
    - Sales Belief Test (1 min)
    - Live Prospecting Role Play (3-4 min)
    - Self-Awareness Check (1 min)
    - Best Sale Story (2 min)
    - Close the Call (1 min)
  - Ability to clone and customize scripts
  - Version control for script changes
  - Script assignment by job role

#### 2.2 Interview Scheduling
- **Calendar Integration**
  - View interviewer availability
  - Block time slots for phone screenings
  - Send calendar invites to candidates
  - SMS/Email reminders (24 hours, 1 hour before)
  - Rescheduling capabilities

- **Interview Assignment**
  - Assign interviews to specific team members
  - Support for multiple interviewers per role
  - Load balancing across interviewers
  - Interviewer capacity management

#### 2.3 Interview Execution Interface
- **Live Interview Dashboard**
  - Display candidate profile and resume
  - Show interview script with current question highlighted
  - Timer for interview duration
  - Notes section for each question
  - Rating/score input for each question
  - Overall interview rating
  - Red flags/concerns section

- **Question Navigation**
  - Next/Previous question navigation
  - Mark questions as answered/skipped
  - Add follow-up questions on the fly
  - Time tracking per question

#### 2.4 Scoring and Rating System

- **Question-Level Scoring**
  - Rating scale: 1-3 points per question (Weak/Average/Strong)
  - 8 core evaluation categories:
    1. Call Presence & Professionalism (1-3)
    2. Company Awareness & Preparation (1-3)
    3. Sales Identity & Role Fit (1-3)
    4. Organization & Pressure Response (1-3)
    5. Sales Mindset & Beliefs (1-3)
    6. Live Prospecting / Role Play (1-3)
    7. Self-Awareness & Coachability (1-3)
    8. Best Sale Story (1-3)
  - Base score maximum: 24 points (8 questions × 3 points)
  - Bonus points system:
    - +3 points: Enjoyed the call / good rapport
    - +1 point: Asked thoughtful questions
    - +1 point: Tried to keep interviewer on the call
  - Qualitative notes per question
  - Flag for exceptional answers
  - Flag for concerning answers (red flags)

- **Overall Interview Score**
  - Automatic calculation: Base Score + Bonus Points = Total Score
  - Maximum possible score: 27 points (24 base + 3 bonus)
  - Manual override capability
  - Score breakdown by category (mapped to script sections)
  - **Acquisitions Specialist Scorecard Template** (see: `transactions/Acquisitions Specialist – Phone Screen Scorecard (10–15 min).md`)
    - Structured scoring form for each evaluation category
    - Notes section for each category
    - Final tally calculation
    - Hiring recommendation (STRONG YES / MAYBE / NO)
    - Decision rule: Top 2-3 scores only move forward

- **Interviewer Notes**
  - Rich text editor for detailed notes
  - Timestamp for each note entry
  - Tag system (e.g., "strong candidate", "needs improvement", "red flag")
  - Section-specific notes aligned with script questions
  - Final notes / gut check section
  - Voice-to-text transcription (future enhancement)

#### 2.5 Interview Completion
- **Post-Interview Summary**
  - Overall score display (Base Score + Bonus = Total)
  - Score breakdown by category
  - Key highlights from interview
  - Concerns or red flags
  - Recommendation (STRONG YES / MAYBE / NO)
  - Final notes / gut check
  - Estimated time to complete interview
  - Call duration tracking

- **Candidate Status Update**
  - Automatic status change: "Phone Screen Completed"
  - Move to next stage or reject based on score
  - **Decision Rule**: Only top 2-3 scores advance to team review
  - Automatic prioritization in review queue
  - Notification to candidate (if proceeding)
  - Rejection notification with feedback (optional)

---

### 3. Candidate Prioritization and Ranking

#### 3.1 Scoring Algorithm
- **Multi-Factor Scoring**
  - Phone screen score (weighted: 40%)
    - Based on structured scorecard (1-3 scale per category)
    - Base score (max 24) + Bonus points (max 3) = Total (max 27)
    - Scorecard template: `transactions/Acquisitions Specialist – Phone Screen Scorecard (10–15 min).md`
  - Resume/application quality (weighted: 20%)
  - Experience match (weighted: 20%)
  - Skills alignment (weighted: 10%)
  - Application timeliness (weighted: 10%)

- **Dynamic Ranking**
  - Real-time ranking updates as new interviews complete
  - Ranking by job role
  - Ranking by department
  - Custom ranking filters
  - **Priority Threshold**: Top 2-3 candidates per role advance automatically

#### 3.2 Priority Queue
- **Top Candidates List**
  - Display top N candidates (configurable, default: 10)
  - Score threshold for "top candidate" status
  - **Acquisitions Specialist Scoring Scale**:
    - Base Score Range: 1-24 points
    - Bonus Points: 0-3 points
    - Total Score Range: 1-27 points
  - Visual indicators:
    - Green: High priority (score > 20, or top 2-3)
    - Yellow: Medium priority (score 15-20)
    - Red: Low priority (score < 15)
  - Automatic filtering: Only candidates with "STRONG YES" recommendation appear in top queue

- **Review Queue**
  - Dedicated queue for team review
  - Candidates requiring team consensus
  - Flagged candidates (exceptional or concerning)

#### 3.3 Team Review Workflow
- **Review Dashboard**
  - List of candidates pending team review
  - Sortable by:
    - Overall score
    - Interview date
    - Application date
    - Interviewer recommendation
  - Quick view of candidate summary
  - Side-by-side candidate comparison

- **Review Actions**
  - Approve for video interview
  - Request additional information
  - Reject candidate
  - Add to watchlist
  - Request second phone screen
  - Assign to specific team member for follow-up

- **Collaboration Features**
  - Comments/notes from multiple reviewers
  - @mention team members
  - Voting system for candidate approval
  - Review history/audit trail

---

### 4. Video Interview Scheduling

#### 4.1 Interview Setup
- **Interview Type Selection**
  - One-on-one video interview
  - Panel interview (multiple interviewers)
  - Technical assessment interview
  - Final round interview

- **Interviewer Selection**
  - Choose primary interviewer
  - Add additional interviewers (panel)
  - Set interviewer roles (technical, cultural fit, manager)
  - Interviewer availability calendar

#### 4.2 Scheduling Interface
- **Calendar View**
  - Display candidate availability
  - Display interviewer availability
  - Find common available time slots
  - Drag-and-drop scheduling
  - Recurring interview slots (for multiple candidates)

- **Automated Scheduling**
  - Send availability request to candidate
  - Candidate selects preferred time slots
  - Auto-match with interviewer availability
  - Confirm interview time
  - Send calendar invites (Google Calendar, Outlook)

#### 4.3 Interview Preparation
- **Candidate Package**
  - Interview details (date, time, duration)
  - Interviewer names and roles
  - Video call link (Zoom, Teams, Google Meet)
  - Interview format/agenda
  - Preparation materials (if applicable)
  - Company information packet

- **Interviewer Briefing**
  - Candidate profile and resume
  - Phone screen notes and scores
  - Interview script (if applicable)
  - Previous interviewer feedback
  - Red flags or areas to explore

#### 4.4 Video Interview Tools
- **Integration Options**
  - Zoom integration
  - Microsoft Teams integration
  - Google Meet integration
  - Custom video solution

- **Interview Recording** (Optional, with consent)
  - Record video interviews
  - Store recordings securely
  - Share recordings with team
  - Transcription of interviews

---

### 5. Candidate Management

#### 5.1 Candidate Profile
- **Comprehensive Profile**
  - Personal information
  - Contact details
  - Resume/CV storage
  - Application history
  - Interview history
  - Scores and ratings
  - Notes and comments
  - Documents (certificates, portfolio)

- **Status Tracking**
  - Application received
  - Resume review
  - Phone screen scheduled
  - Phone screen completed
  - Team review
  - Video interview scheduled
  - Video interview completed
  - Offer extended
  - Offer accepted/rejected
  - Hired
  - Rejected

#### 5.2 Communication
- **Automated Emails**
  - Application confirmation
  - Phone screen invitation
  - Phone screen reminder
  - Video interview invitation
  - Rejection notification
  - Offer letter

- **SMS Notifications**
  - Interview reminders
  - Status updates
  - Quick responses

- **Communication History**
  - All emails sent/received
  - SMS messages
  - Call logs
  - Notes from conversations

---

### 6. Analytics and Reporting

#### 6.1 Hiring Metrics
- **Pipeline Metrics**
  - Applications received
  - Phone screens completed
  - Video interviews scheduled
  - Offer acceptance rate
  - Time to hire
  - Cost per hire

- **Interviewer Performance**
  - Interviews conducted
  - Average interview duration
  - Candidate quality scores
  - Interview completion rate

#### 6.2 Candidate Analytics
- **Source Analysis**
  - Applications by source (Indeed, LinkedIn, etc.)
  - Quality of candidates by source
  - Conversion rates by source

- **Score Distribution**
  - Average scores by role
  - Score trends over time
  - Top performing candidates

#### 6.3 Reports
- **Standard Reports**
  - Weekly hiring summary
  - Monthly hiring report
  - Interviewer activity report
  - Candidate pipeline report

- **Custom Reports**
  - Configurable date ranges
  - Filter by role, department, interviewer
  - Export to CSV/PDF

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-4)
- ✅ Candidate database schema
- ✅ Basic candidate profile management
- ✅ Manual application entry
- ✅ Candidate status tracking
- ✅ Basic search and filtering

### Phase 2: Job Board Integration (Weeks 5-8)
- ✅ Indeed API integration
- ✅ Automatic candidate import
- ✅ Resume parsing
- ✅ Deduplication logic
- ✅ Webhook support

### Phase 3: Phone Screening System (Weeks 9-14)
- ✅ Interview script builder
- ✅ Script library and templates
- ✅ Interview scheduling
- ✅ Interview execution interface
- ✅ Scoring and rating system
- ✅ Interview notes and feedback

### Phase 4: Prioritization and Review (Weeks 15-18)
- ✅ Scoring algorithm
- ✅ Candidate ranking system
- ✅ Priority queue
- ✅ Team review dashboard
- ✅ Collaboration features

### Phase 5: Video Interview Scheduling (Weeks 19-22)
- ✅ Video platform integration
- ✅ Calendar integration
- ✅ Automated scheduling
- ✅ Interview preparation tools
- ✅ Interview recording (optional)

### Phase 6: Analytics and Reporting (Weeks 23-24)
- ✅ Dashboard with key metrics
- ✅ Standard reports
- ✅ Custom report builder
- ✅ Export functionality

### Phase 7: Enhancements (Ongoing)
- ✅ Additional job board integrations
- ✅ AI-powered resume screening
- ✅ Automated interview scheduling with AI
- ✅ Video interview transcription
- ✅ Candidate portal
- ✅ Mobile app for interviewers

---

## Technical Requirements

### Backend Services
- **ATS Service** (New microservice)
  - Candidate management
  - Application tracking
  - Interview management
  - Scoring and ranking

- **Integration Service** (New or extend existing)
  - Job board API integrations
  - Webhook handling
  - Data synchronization

- **Communication Service** (Extend existing)
  - Email notifications
  - SMS notifications
  - Calendar integration

### Database Schema
- **Candidates Collection**
  - Personal information
  - Contact details
  - Application history
  - Status tracking

- **Applications Collection**
  - Job posting reference
  - Application date
  - Source (Indeed, etc.)
  - Resume/CV storage

- **Interviews Collection**
  - Interview type (phone, video)
  - Interviewer information
  - Script used
  - Scores and ratings
  - Notes and feedback
  - Recording (if applicable)

- **Interview Scripts Collection**
  - Script templates
  - Questions and answers
  - Scoring criteria
  - Version history

- **Job Postings Collection**
  - Job details
  - Posting locations (Indeed, etc.)
  - Application tracking
  - Performance metrics

### Frontend Components
- **Candidate Management Dashboard**
- **Interview Script Builder**
- **Interview Execution Interface**
- **Team Review Dashboard**
- **Video Interview Scheduler**
- **Analytics Dashboard**

---

## User Roles and Permissions

### Admin
- Full access to all features
- Manage job postings
- Configure integrations
- View all candidates and interviews
- Manage interviewers
- Access analytics and reports

### Interviewer
- Conduct phone screenings
- View assigned candidates
- Score and rate candidates
- Add interview notes
- Schedule video interviews (if authorized)

### Hiring Manager
- Review top candidates
- Approve/reject candidates
- Schedule video interviews
- View team interview results
- Access hiring metrics

### Recruiter
- Manage candidate pipeline
- Schedule interviews
- Communicate with candidates
- Track application status
- View basic analytics

---

## Integration Points

### External Services
- **Indeed API**
  - Job posting management
  - Application import
  - Webhook notifications

- **Video Platforms**
  - Zoom API
  - Microsoft Teams API
  - Google Meet API

- **Calendar Services**
  - Google Calendar API
  - Microsoft Outlook Calendar API

- **Communication Services**
  - Email service (SendGrid, etc.)
  - SMS service (Twilio, etc.)

### Internal Services
- **Auth Service**
  - User authentication
  - Role-based access control

- **User Management Service**
  - Interviewer profiles
  - Team management

- **Notification Service**
  - Interview reminders
  - Status updates

---

## Success Metrics

### Efficiency Metrics
- Time to complete phone screening: < 15 minutes
- Time from application to phone screen: < 48 hours
- Time from phone screen to video interview: < 1 week
- Interviewer utilization rate: > 80%

### Quality Metrics
- Candidate satisfaction score: > 4.0/5.0
- Interviewer satisfaction score: > 4.0/5.0
- Offer acceptance rate: > 70%
- Time to hire: < 30 days

### System Metrics
- Application import success rate: > 99%
- System uptime: > 99.9%
- API response time: < 200ms
- Page load time: < 2 seconds

---

## Future Enhancements

### AI/ML Features
- Resume screening and ranking
- Automated interview scheduling
- Interview question recommendations
- Candidate matching algorithm
- Predictive hiring analytics

### Advanced Features
- Candidate portal for self-service
- Mobile app for interviewers
- Video interview AI analysis
- Automated reference checking
- Background check integration
- Onboarding workflow integration

---

## Reference Documents

### Phone Screening Scripts
- **Acquisitions Specialist 10-15 Minute Screening Script**
  - Location: `docs/transactions/10–15 Minute Acquisitions Screening Call Script.md`
  - Purpose: Structured interview script for phone screenings
  - Duration: 10-15 minutes
  - Sections: 9 structured sections with timing guidelines
  - Use Case: Post-video, pre-interview gate screening

### Scoring Templates
- **Acquisitions Specialist Phone Screen Scorecard**
  - Location: `docs/transactions/Acquisitions Specialist – Phone Screen Scorecard (10–15 min).md`
  - Purpose: Standardized scoring form for phone screenings
  - Scoring System: 1-3 scale per category (8 categories = max 24 base points)
  - Bonus Points: Up to 3 additional points
  - Total Score Range: 1-27 points
  - Decision Rule: Top 2-3 scores only move forward

### Integration with ATS System
- Script templates should be importable into the Script Builder
- Scorecard templates should be configurable in the Scoring System
- Both documents serve as reference templates for creating role-specific scripts and scorecards
- System should support cloning and customizing these templates for other roles

---

## Notes

- All candidate data must comply with GDPR, CCPA, and other privacy regulations
- Interview recordings require explicit consent
- Scoring algorithms should be transparent and auditable
- System should support multiple languages (future)
- Accessibility compliance (WCAG 2.1 AA)
- **Scoring Consistency**: Use standardized scorecards to ensure fair evaluation across all interviewers
- **Script Adherence**: Interviewers should follow script structure but maintain natural conversation flow
- **Decision Speed**: Move fast on top candidates - strong sales candidates disappear quickly

