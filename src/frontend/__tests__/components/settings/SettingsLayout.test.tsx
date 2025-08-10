import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import SettingsLayout from '../../../../components/settings/SettingsLayout';
import { theme } from '../../../../design-system/theme';

// Mock the child components
jest.mock('../../../../components/settings/GeneralSettings', () => {
  return function MockGeneralSettings() {
    return <div data-testid="general-settings">General Settings</div>;
  };
});

jest.mock('../../../../components/settings/UserManagement', () => {
  return function MockUserManagement() {
    return <div data-testid="user-management">User Management</div>;
  };
});

jest.mock('../../../../components/settings/RoleManagement', () => {
  return function MockRoleManagement() {
    return <div data-testid="role-management">Role Management</div>;
  };
});

jest.mock('../../../../components/settings/NotificationSettings', () => {
  return function MockNotificationSettings() {
    return <div data-testid="notification-settings">Notification Settings</div>;
  };
});

jest.mock('../../../../components/settings/SecuritySettings', () => {
  return function MockSecuritySettings() {
    return <div data-testid="security-settings">Security Settings</div>;
  };
});

jest.mock('../../../../components/settings/IntegrationSettings', () => {
  return function MockIntegrationSettings() {
    return <div data-testid="integration-settings">Integration Settings</div>;
  };
});

jest.mock('../../../../components/settings/ApiIntegrationSettings', () => {
  return function MockApiIntegrationSettings() {
    return <div data-testid="api-integration-settings">API Integration Settings</div>;
  };
});

jest.mock('../../../../components/settings/DataRetentionSettings', () => {
  return function MockDataRetentionSettings() {
    return <div data-testid="data-retention-settings">Data Retention Settings</div>;
  };
});

jest.mock('../../../../components/settings/BackupSettings', () => {
  return function MockBackupSettings() {
    return <div data-testid="backup-settings">Backup Settings</div>;
  };
});

jest.mock('../../../../components/settings/SystemHealthSettings', () => {
  return function MockSystemHealthSettings() {
    return <div data-testid="system-health-settings">System Health Settings</div>;
  };
});

jest.mock('../../../../components/settings/AuditLogSettings', () => {
  return function MockAuditLogSettings() {
    return <div data-testid="audit-log-settings">Audit Log Settings</div>;
  };
});

jest.mock('../../../../components/settings/CustomFieldsManagement', () => {
  return function MockCustomFieldsManagement() {
    return <div data-testid="custom-fields-management">Custom Fields Management</div>;
  };
});

jest.mock('../../../../components/settings/WorkflowManagement', () => {
  return function MockWorkflowManagement() {
    return <div data-testid="workflow-management">Workflow Management</div>;
  };
});

jest.mock('../../../../components/settings/MobileSettings', () => {
  return function MockMobileSettings() {
    return <div data-testid="mobile-settings">Mobile Settings</div>;
  };
});

jest.mock('../../../../components/settings/OrganizationalSettings', () => {
  return function MockOrganizationalSettings() {
    return <div data-testid="organizational-settings">Organizational Settings</div>;
  };
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('SettingsLayout', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the settings layout with navigation', () => {
    renderWithTheme(<SettingsLayout />);
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Users & Roles')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Integrations')).toBeInTheDocument();
    expect(screen.getByText('Data & Backup')).toBeInTheDocument();
    expect(screen.getByText('Customization')).toBeInTheDocument();
    expect(screen.getByText('Mobile')).toBeInTheDocument();
    expect(screen.getByText('Organization')).toBeInTheDocument();
  });

  it('shows general settings by default', () => {
    renderWithTheme(<SettingsLayout />);
    
    expect(screen.getByTestId('general-settings')).toBeInTheDocument();
  });

  it('navigates to user management when clicked', () => {
    renderWithTheme(<SettingsLayout />);
    
    const userManagementTab = screen.getByText('User Management');
    fireEvent.click(userManagementTab);
    
    expect(screen.getByTestId('user-management')).toBeInTheDocument();
  });

  it('navigates to role management when clicked', () => {
    renderWithTheme(<SettingsLayout />);
    
    const roleManagementTab = screen.getByText('Role Management');
    fireEvent.click(roleManagementTab);
    
    expect(screen.getByTestId('role-management')).toBeInTheDocument();
  });

  it('navigates to notification settings when clicked', () => {
    renderWithTheme(<SettingsLayout />);
    
    const notificationTab = screen.getByText('Notifications');
    fireEvent.click(notificationTab);
    
    expect(screen.getByTestId('notification-settings')).toBeInTheDocument();
  });

  it('navigates to security settings when clicked', () => {
    renderWithTheme(<SettingsLayout />);
    
    const securityTab = screen.getByText('Security');
    fireEvent.click(securityTab);
    
    expect(screen.getByTestId('security-settings')).toBeInTheDocument();
  });

  it('navigates to integration settings when clicked', () => {
    renderWithTheme(<SettingsLayout />);
    
    const integrationTab = screen.getByText('Integrations');
    fireEvent.click(integrationTab);
    
    expect(screen.getByTestId('integration-settings')).toBeInTheDocument();
  });

  it('navigates to API integration settings when clicked', () => {
    renderWithTheme(<SettingsLayout />);
    
    const apiTab = screen.getByText('API');
    fireEvent.click(apiTab);
    
    expect(screen.getByTestId('api-integration-settings')).toBeInTheDocument();
  });

  it('navigates to data retention settings when clicked', () => {
    renderWithTheme(<SettingsLayout />);
    
    const dataRetentionTab = screen.getByText('Data Retention');
    fireEvent.click(dataRetentionTab);
    
    expect(screen.getByTestId('data-retention-settings')).toBeInTheDocument();
  });

  it('navigates to backup settings when clicked', () => {
    renderWithTheme(<SettingsLayout />);
    
    const backupTab = screen.getByText('Backup');
    fireEvent.click(backupTab);
    
    expect(screen.getByTestId('backup-settings')).toBeInTheDocument();
  });

  it('navigates to system health settings when clicked', () => {
    renderWithTheme(<SettingsLayout />);
    
    const systemHealthTab = screen.getByText('System Health');
    fireEvent.click(systemHealthTab);
    
    expect(screen.getByTestId('system-health-settings')).toBeInTheDocument();
  });

  it('navigates to audit log settings when clicked', () => {
    renderWithTheme(<SettingsLayout />);
    
    const auditLogTab = screen.getByText('Audit Logs');
    fireEvent.click(auditLogTab);
    
    expect(screen.getByTestId('audit-log-settings')).toBeInTheDocument();
  });

  it('navigates to custom fields management when clicked', () => {
    renderWithTheme(<SettingsLayout />);
    
    const customFieldsTab = screen.getByText('Custom Fields');
    fireEvent.click(customFieldsTab);
    
    expect(screen.getByTestId('custom-fields-management')).toBeInTheDocument();
  });

  it('navigates to workflow management when clicked', () => {
    renderWithTheme(<SettingsLayout />);
    
    const workflowTab = screen.getByText('Workflows');
    fireEvent.click(workflowTab);
    
    expect(screen.getByTestId('workflow-management')).toBeInTheDocument();
  });

  it('navigates to mobile settings when clicked', () => {
    renderWithTheme(<SettingsLayout />);
    
    const mobileTab = screen.getByText('Mobile');
    fireEvent.click(mobileTab);
    
    expect(screen.getByTestId('mobile-settings')).toBeInTheDocument();
  });

  it('navigates to organizational settings when clicked', () => {
    renderWithTheme(<SettingsLayout />);
    
    const organizationalTab = screen.getByText('Organization');
    fireEvent.click(organizationalTab);
    
    expect(screen.getByTestId('organizational-settings')).toBeInTheDocument();
  });

  it('maintains navigation state when switching between tabs', () => {
    renderWithTheme(<SettingsLayout />);
    
    // Start with general settings
    expect(screen.getByTestId('general-settings')).toBeInTheDocument();
    
    // Navigate to user management
    const userManagementTab = screen.getByText('User Management');
    fireEvent.click(userManagementTab);
    expect(screen.getByTestId('user-management')).toBeInTheDocument();
    
    // Navigate back to general
    const generalTab = screen.getByText('General');
    fireEvent.click(generalTab);
    expect(screen.getByTestId('general-settings')).toBeInTheDocument();
  });

  it('renders with proper accessibility attributes', () => {
    renderWithTheme(<SettingsLayout />);
    
    // Check for main landmark
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Check for navigation landmark
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    
    // Check for heading
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
  });
});
