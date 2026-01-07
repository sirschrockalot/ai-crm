# ATS Service Frontend Integration Guide

## Overview

This document explains how users will access the ATS (Application Tracking System) modules from the frontend application.

## Architecture Pattern

The ATS service follows the same integration pattern as other microservices:

1. **Backend Service** (`ats-service`) - NestJS microservice running on port 3008
2. **Next.js API Routes** (`/api/ats/*`) - Proxy routes that forward requests to the backend
3. **Frontend Service** (`atsService.ts`) - Client-side service that calls the API routes
4. **Frontend Pages** (`/ats/*`) - React pages that display the UI
5. **Navigation** - Menu items to access ATS features

## Integration Steps

### 1. Service Configuration

Add ATS service to `configService.ts`:

```typescript
microservices: {
  // ... existing services
  ats: {
    url: process.env.NEXT_PUBLIC_ATS_SERVICE_URL || 'http://localhost:3008',
    apiUrl: process.env.NEXT_PUBLIC_ATS_SERVICE_API_URL || 'http://localhost:3008/api/v1',
  },
}
```

### 2. Next.js API Routes

Create proxy routes in `/api/ats/`:
- `/api/ats/candidates` - List/create candidates
- `/api/ats/candidates/[id]` - Get/update/delete candidate
- `/api/ats/applications` - Manage applications
- `/api/ats/interviews` - Manage interviews
- `/api/ats/scripts` - Manage interview scripts
- `/api/ats/job-postings` - Manage job postings

### 3. Frontend Service

Create `services/atsService.ts` with methods:
- `listCandidates()`
- `getCandidate(id)`
- `createCandidate(data)`
- `updateCandidate(id, data)`
- `deleteCandidate(id)`
- Similar methods for applications, interviews, scripts, job postings

### 4. Frontend Pages

Create pages in `/ats/`:
- `/ats` - Main dashboard (candidate list)
- `/ats/candidates` - Candidate management
- `/ats/candidates/[id]` - Candidate detail
- `/ats/candidates/new` - Create new candidate
- `/ats/interviews` - Interview management
- `/ats/interviews/[id]` - Interview execution (phone screening)
- `/ats/scripts` - Interview script builder
- `/ats/job-postings` - Job posting management
- `/ats/analytics` - Hiring analytics and reports

### 5. Navigation

Add ATS menu items to the navigation:
- **ATS** (main menu)
  - Candidates
  - Interviews
  - Scripts
  - Job Postings
  - Analytics

## User Access Flow

1. **Login** → User authenticates via `/auth/login`
2. **Navigation** → User clicks "ATS" in the main menu
3. **Dashboard** → User sees `/ats` with candidate overview
4. **Actions**:
   - View candidates → `/ats/candidates`
   - Create candidate → `/ats/candidates/new`
   - Conduct interview → `/ats/interviews/[id]`
   - Manage scripts → `/ats/scripts`
   - View analytics → `/ats/analytics`

## API Request Flow

```
Frontend Page
    ↓
atsService.ts (client-side)
    ↓
/api/ats/candidates (Next.js API route)
    ↓
http://localhost:3008/api/v1/candidates (ATS Service)
    ↓
MongoDB
```

## Environment Variables

Add to `.env.local`:

```bash
# ATS Service Configuration
NEXT_PUBLIC_ATS_SERVICE_URL=http://localhost:3008
NEXT_PUBLIC_ATS_SERVICE_API_URL=http://localhost:3008/api/v1
```

For production:
```bash
NEXT_PUBLIC_ATS_SERVICE_URL=https://ats-service.herokuapp.com
NEXT_PUBLIC_ATS_SERVICE_API_URL=https://ats-service.herokuapp.com/api/v1
```

## Permissions

ATS features should be role-based:
- **Admin**: Full access to all ATS features
- **Hiring Manager**: View candidates, conduct interviews, review
- **Interviewer**: Conduct phone screenings, score candidates
- **Recruiter**: Manage candidates, schedule interviews

## Next Steps

1. ✅ Backend service created and tested
2. ⏳ Add service configuration
3. ⏳ Create Next.js API routes
4. ⏳ Create frontend service
5. ⏳ Create frontend pages
6. ⏳ Add navigation menu items
7. ⏳ Implement role-based access control

