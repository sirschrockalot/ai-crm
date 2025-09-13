import React from 'react';
import { ErrorBoundary } from '../../components/ui';
import SettingsLayout from '../../components/settings/SettingsLayout';
import ProfileSettings from '../../components/settings/ProfileSettings';
import NotificationSettings from '../../components/settings/NotificationSettings';
import SecuritySettings from '../../components/settings/SecuritySettings';
import SystemSettings from '../../components/settings/SystemSettings';
import AuditAnalytics from '../../components/settings/AuditAnalytics';
import MobileSettings from '../../components/settings/MobileSettings';
import CustomFieldsManagement from '../../components/settings/CustomFieldsManagement';
import WorkflowManagement from '../../components/settings/WorkflowManagement';
import ApiIntegrationSettings from '../../components/settings/ApiIntegrationSettings';
import OrganizationalSettings from '../../components/settings/OrganizationalSettings';
import { 
  FiUser, 
  FiBell, 
  FiShield, 
  FiSettings, 
  FiBarChart as FiBarChart3, 
  FiSmartphone,
  FiDatabase,
  FiGitBranch as FiWorkflow,
  FiCode,
  FiHome as FiBuilding
} from 'react-icons/fi';

const settingsSections = [
  {
    id: 'profile',
    label: 'Profile Settings',
    icon: FiUser,
    description: 'Manage your personal profile and preferences',
    component: ProfileSettings,
  },
  {
    id: 'notifications',
    label: 'Notification Preferences',
    icon: FiBell,
    description: 'Configure how and when you receive notifications',
    component: NotificationSettings,
  },
  {
    id: 'security',
    label: 'Security & 2FA',
    icon: FiShield,
    description: 'Manage security settings and two-factor authentication',
    component: SecuritySettings,
  },
  {
    id: 'system',
    label: 'System Settings',
    icon: FiSettings,
    description: 'Configure system-wide settings and preferences',
    component: SystemSettings,
  },
  {
    id: 'audit',
    label: 'Audit & Analytics',
    icon: FiBarChart3,
    description: 'View audit trails and system analytics',
    component: AuditAnalytics,
  },
  {
    id: 'mobile',
    label: 'Mobile Settings',
    icon: FiSmartphone,
    description: 'Configure mobile-specific settings and preferences',
    component: MobileSettings,
  },
  {
    id: 'custom-fields',
    label: 'Custom Fields',
    icon: FiDatabase,
    description: 'Manage custom fields and data structures',
    component: CustomFieldsManagement,
  },
  {
    id: 'workflows',
    label: 'Workflow Management',
    icon: FiWorkflow,
    description: 'Configure business workflows and automation',
    component: WorkflowManagement,
  },
  {
    id: 'api-integrations',
    label: 'API Integrations',
    icon: FiCode,
    description: 'Manage third-party API integrations and webhooks',
    component: ApiIntegrationSettings,
  },
  {
    id: 'organizational',
    label: 'Organizational Settings',
    icon: FiBuilding,
    description: 'Manage company information, branding, and organizational structure',
    component: OrganizationalSettings,
  },
];

const SettingsPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <SettingsLayout 
        sections={settingsSections} 
        defaultSection="profile"
      />
    </ErrorBoundary>
  );
};

export default SettingsPage;
