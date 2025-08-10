// Time Tracking Component Tests
// This file ensures all time tracking component tests are included

// Import all test files to ensure they are included in the test suite
import './TimeTrackingDashboard.test';
import './WeeklyTimesheetGrid.test';
import './TimeEntryModal.test';
import './ApprovalWorkflow.test';
import './TimeTrackingStats.test';
import './TimeTrackingSidebar.test';
import './ProjectTaskSelector.test';
import './BulkTimeEntryModal.test';
import './TimeTrackingAnalytics.test';
import './TimeTrackingExport.test';
import './TeamAnalytics.test';

// Export test utilities if needed
export const timeTrackingTestUtils = {
  mockTimeEntry: {
    id: '1',
    projectId: 'project-1',
    taskId: 'task-1',
    startTime: '2024-01-15T09:00:00Z',
    endTime: '2024-01-15T17:00:00Z',
    duration: 8,
    description: 'Development work',
    billable: true,
    status: 'draft',
  },
  mockTimesheet: {
    id: '1',
    weekStartDate: '2024-01-15',
    weekEndDate: '2024-01-21',
    totalHours: 40,
    billableHours: 35,
    status: 'draft',
    entries: [],
  },
  mockProject: {
    _id: 'project-1',
    name: 'Project Alpha',
    description: 'Sample project',
  },
  mockTask: {
    _id: 'task-1',
    name: 'Development',
    projectId: 'project-1',
  },
};
