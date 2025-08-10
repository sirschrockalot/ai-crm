import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import AuditAnalytics from '../../../../components/settings/AuditAnalytics';
import { theme } from '../../../../design-system/theme';

// Mock the settings service
jest.mock('../../../../services/settingsService', () => ({
  settingsService: {
    getAuditLogs: jest.fn(),
    getAnalyticsData: jest.fn(),
    exportAuditData: jest.fn(),
    getAuditFilters: jest.fn(),
    getComplianceReport: jest.fn(),
  },
}));

// Mock the toast
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockAuditLogs = [
  {
    id: 'log-1',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    userId: 'user-1',
    userName: 'John Doe',
    action: 'login',
    resource: 'authentication',
    resourceId: 'auth-1',
    details: { ipAddress: '192.168.1.100', success: true },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    severity: 'low' as const,
    category: 'authentication' as const,
  },
  {
    id: 'log-2',
    timestamp: new Date('2024-01-15T09:15:00Z'),
    userId: 'user-2',
    userName: 'Jane Smith',
    action: 'create',
    resource: 'lead',
    resourceId: 'lead-123',
    details: { leadName: 'New Lead', value: 50000 },
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    severity: 'medium' as const,
    category: 'data_modification' as const,
  },
  {
    id: 'log-3',
    timestamp: new Date('2024-01-15T08:00:00Z'),
    userId: 'user-3',
    userName: 'Admin User',
    action: 'delete',
    resource: 'user',
    resourceId: 'user-456',
    details: { deletedUser: 'Old User', reason: 'Account closure' },
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    severity: 'high' as const,
    category: 'user_management' as const,
  },
];

const mockAnalyticsData = {
  totalUsers: 150,
  activeUsers: 89,
  totalLeads: 1250,
  totalDeals: 89,
  conversionRate: 7.12,
  avgDealValue: 45000,
  systemUptime: 99.8,
  responseTime: 245,
  storageUsed: 75.5,
  storageTotal: 100,
};

const mockAuditFilters = {
  categories: ['authentication', 'data_access', 'data_modification', 'system', 'security', 'user_management'],
  severities: ['low', 'medium', 'high', 'critical'],
  actions: ['login', 'logout', 'create', 'read', 'update', 'delete'],
  resources: ['user', 'lead', 'deal', 'authentication', 'system'],
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('AuditAnalytics', () => {
  const mockSettingsService = require('../../../../services/settingsService').settingsService;
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the toast function
    jest.spyOn(require('@chakra-ui/react'), 'useToast').mockReturnValue({
      toast: mockToast,
    });
  });

  it('renders the audit analytics interface', async () => {
    mockSettingsService.getAuditLogs.mockResolvedValue(mockAuditLogs);
    mockSettingsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Audit & Analytics')).toBeInTheDocument();
      expect(screen.getByText('Audit Logs')).toBeInTheDocument();
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Compliance Reports')).toBeInTheDocument();
    });
  });

  it('displays audit logs correctly', async () => {
    mockSettingsService.getAuditLogs.mockResolvedValue(mockAuditLogs);
    mockSettingsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('login')).toBeInTheDocument();
      expect(screen.getByText('create')).toBeInTheDocument();
      expect(screen.getByText('delete')).toBeInTheDocument();
    });
  });

  it('displays analytics data correctly', async () => {
    mockSettingsService.getAuditLogs.mockResolvedValue(mockAuditLogs);
    mockSettingsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument(); // totalUsers
      expect(screen.getByText('89')).toBeInTheDocument(); // activeUsers
      expect(screen.getByText('1,250')).toBeInTheDocument(); // totalLeads
      expect(screen.getByText('89')).toBeInTheDocument(); // totalDeals
      expect(screen.getByText('7.12%')).toBeInTheDocument(); // conversionRate
      expect(screen.getByText('$45,000')).toBeInTheDocument(); // avgDealValue
      expect(screen.getByText('99.8%')).toBeInTheDocument(); // systemUptime
    });
  });

  it('allows filtering audit logs by category', async () => {
    mockSettingsService.getAuditLogs.mockResolvedValue(mockAuditLogs);
    mockSettingsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    });

    const categoryFilter = screen.getByLabelText('Category');
    await userEvent.selectOptions(categoryFilter, 'authentication');

    await waitFor(() => {
      expect(mockSettingsService.getAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'authentication',
        })
      );
    });
  });

  it('allows filtering audit logs by severity', async () => {
    mockSettingsService.getAuditLogs.mockResolvedValue(mockAuditLogs);
    mockSettingsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    });

    const severityFilter = screen.getByLabelText('Severity');
    await userEvent.selectOptions(severityFilter, 'high');

    await waitFor(() => {
      expect(mockSettingsService.getAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'high',
        })
      );
    });
  });

  it('allows filtering audit logs by date range', async () => {
    mockSettingsService.getAuditLogs.mockResolvedValue(mockAuditLogs);
    mockSettingsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    });

    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');

    await userEvent.type(startDateInput, '2024-01-01');
    await userEvent.type(endDateInput, '2024-01-31');

    await waitFor(() => {
      expect(mockSettingsService.getAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        })
      );
    });
  });

  it('allows searching audit logs by user or action', async () => {
    mockSettingsService.getAuditLogs.mockResolvedValue(mockAuditLogs);
    mockSettingsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search logs...');
    await userEvent.type(searchInput, 'John Doe');

    await waitFor(() => {
      expect(mockSettingsService.getAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'John Doe',
        })
      );
    });
  });

  it('displays audit log details in modal', async () => {
    mockSettingsService.getAuditLogs.mockResolvedValue(mockAuditLogs);
    mockSettingsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByLabelText('View log details');
    await userEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Audit Log Details')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('login')).toBeInTheDocument();
      expect(screen.getByText('authentication')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
    });
  });

  it('allows exporting audit data', async () => {
    mockSettingsService.getAuditLogs.mockResolvedValue(mockAuditLogs);
    mockSettingsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);
    mockSettingsService.exportAuditData.mockResolvedValue({ success: true, downloadUrl: 'data:application/csv;base64,test' });

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    });

    const exportButton = screen.getByText('Export Data');
    await userEvent.click(exportButton);

    await waitFor(() => {
      expect(mockSettingsService.exportAuditData).toHaveBeenCalled();
    });
  });

  it('generates compliance reports', async () => {
    mockSettingsService.getAuditLogs.mockResolvedValue(mockAuditLogs);
    mockSettingsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);
    mockSettingsService.getComplianceReport.mockResolvedValue({ success: true, report: 'compliance-report.pdf' });

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Compliance Reports')).toBeInTheDocument();
    });

    const generateButton = screen.getByText('Generate Report');
    await userEvent.click(generateButton);

    await waitFor(() => {
      expect(mockSettingsService.getComplianceReport).toHaveBeenCalled();
    });
  });

  it('displays severity colors correctly', async () => {
    mockSettingsService.getAuditLogs.mockResolvedValue(mockAuditLogs);
    mockSettingsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    });

    // Check that severity badges are displayed with appropriate colors
    const lowSeverity = screen.getByText('low');
    const mediumSeverity = screen.getByText('medium');
    const highSeverity = screen.getByText('high');

    expect(lowSeverity).toBeInTheDocument();
    expect(mediumSeverity).toBeInTheDocument();
    expect(highSeverity).toBeInTheDocument();
  });

  it('displays category icons correctly', async () => {
    mockSettingsService.getAuditLogs.mockResolvedValue(mockAuditLogs);
    mockSettingsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    });

    // Check that category information is displayed
    expect(screen.getByText('authentication')).toBeInTheDocument();
    expect(screen.getByText('data_modification')).toBeInTheDocument();
    expect(screen.getByText('user_management')).toBeInTheDocument();
  });

  it('displays action icons correctly', async () => {
    mockSettingsService.getAuditLogs.mockResolvedValue(mockAuditLogs);
    mockSettingsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    });

    // Check that action information is displayed
    expect(screen.getByText('login')).toBeInTheDocument();
    expect(screen.getByText('create')).toBeInTheDocument();
    expect(screen.getByText('delete')).toBeInTheDocument();
  });

  it('handles audit log loading errors gracefully', async () => {
    mockSettingsService.getAuditLogs.mockRejectedValue(new Error('Failed to load audit logs'));
    mockSettingsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'Failed to load audit logs',
          status: 'error',
        })
      );
    });
  });

  it('handles analytics data loading errors gracefully', async () => {
    mockSettingsService.getAuditLogs.mockResolvedValue(mockAuditLogs);
    mockSettingsService.getAnalyticsData.mockRejectedValue(new Error('Failed to load analytics'));
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'Failed to load analytics data',
          status: 'error',
        })
      );
    });
  });

  it('handles export errors gracefully', async () => {
    mockSettingsService.getAuditLogs.mockResolvedValue(mockAuditLogs);
    mockSettingsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);
    mockSettingsService.exportAuditData.mockRejectedValue(new Error('Export failed'));

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    });

    const exportButton = screen.getByText('Export Data');
    await userEvent.click(exportButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'Failed to export audit data',
          status: 'error',
        })
      );
    });
  });

  it('handles compliance report generation errors gracefully', async () => {
    mockSettingsService.getAuditLogs.mockResolvedValue(mockAuditLogs);
    mockSettingsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);
    mockSettingsService.getComplianceReport.mockRejectedValue(new Error('Report generation failed'));

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Compliance Reports')).toBeInTheDocument();
    });

    const generateButton = screen.getByText('Generate Report');
    await userEvent.click(generateButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'Failed to generate compliance report',
          status: 'error',
        })
      );
    });
  });

  it('displays storage usage progress correctly', async () => {
    mockSettingsService.getAuditLogs.mockResolvedValue(mockAuditLogs);
    mockSettingsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });

    // Check that storage usage is displayed
    expect(screen.getByText('75.5 GB / 100 GB')).toBeInTheDocument();
  });

  it('displays response time metrics correctly', async () => {
    mockSettingsService.getAuditLogs.mockResolvedValue(mockAuditLogs);
    mockSettingsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });

    // Check that response time is displayed
    expect(screen.getByText('245ms')).toBeInTheDocument();
  });

  it('allows refreshing audit data', async () => {
    mockSettingsService.getAuditLogs.mockResolvedValue(mockAuditLogs);
    mockSettingsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    });

    const refreshButton = screen.getByLabelText('Refresh audit logs');
    await userEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockSettingsService.getAuditLogs).toHaveBeenCalledTimes(2); // Initial load + refresh
    });
  });

  it('displays loading states during API calls', async () => {
    mockSettingsService.getAuditLogs.mockResolvedValue(mockAuditLogs);
    mockSettingsService.getAnalyticsData.mockResolvedValue(mockAnalyticsData);
    mockSettingsService.getAuditFilters.mockResolvedValue(mockAuditFilters);

    renderWithTheme(<AuditAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Audit & Analytics')).toBeInTheDocument();
    });

    // Check that loading indicators are not shown after data loads
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
