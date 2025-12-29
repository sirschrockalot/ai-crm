import { NextApiRequest, NextApiResponse } from 'next';
import { SystemSettings } from '../../../services/settingsService';

// In-memory store for system settings (in production, this would be a database)
let systemSettingsStore: SystemSettings = {
  company: {
    name: 'Presidential Digs CRM',
    logo: undefined,
    address: undefined,
    phone: undefined,
    email: undefined,
    website: undefined,
    description: undefined,
    industry: undefined,
    founded: undefined,
    employees: undefined,
    revenue: undefined,
  },
  branding: {
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    customCss: undefined,
    fontFamily: undefined,
    slogan: undefined,
    mission: undefined,
    vision: undefined,
  },
  features: {},
  integrations: {},
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SystemSettings | { error: string }>
) {
  // Basic authentication check, with bypass for development
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
  if (!bypassAuth) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  }

  if (req.method === 'GET') {
    // Return current system settings
    return res.status(200).json(systemSettingsStore);
  } else if (req.method === 'PATCH' || req.method === 'PUT') {
    try {
      // Merge the incoming settings with existing settings
      const updates = req.body as Partial<SystemSettings>;
      
      systemSettingsStore = {
        ...systemSettingsStore,
        ...updates,
        company: {
          ...systemSettingsStore.company,
          ...(updates.company || {}),
        },
        branding: {
          ...systemSettingsStore.branding,
          ...(updates.branding || {}),
        },
        features: {
          ...systemSettingsStore.features,
          ...(updates.features || {}),
        },
        integrations: {
          ...systemSettingsStore.integrations,
          ...(updates.integrations || {}),
        },
      };

      return res.status(200).json(systemSettingsStore);
    } catch (error) {
      console.error('Error updating system settings:', error);
      return res.status(500).json({ error: 'Failed to update system settings' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH', 'PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

