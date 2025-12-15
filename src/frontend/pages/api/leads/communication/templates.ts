import { NextApiRequest, NextApiResponse } from 'next';

interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'sms' | 'voice';
  content: string;
  variables: string[];
  isActive: boolean;
  tenantId: string;
}

// Mock templates (in a real app, this would come from a database)
const mockTemplates: CommunicationTemplate[] = [
  {
    id: '1',
    name: 'Follow-up SMS',
    type: 'sms',
    content: 'Hi {{name}}, this is a follow-up regarding your property at {{address}}. Please call us at {{phone}}.',
    variables: ['name', 'address', 'phone'],
    isActive: true,
    tenantId: 'default',
  },
  {
    id: '2',
    name: 'Initial Contact',
    type: 'sms',
    content: 'Hello {{name}}, we are interested in your property. Would you like to discuss an offer?',
    variables: ['name'],
    isActive: true,
    tenantId: 'default',
  },
  {
    id: '3',
    name: 'Appointment Reminder',
    type: 'sms',
    content: 'Reminder: You have an appointment scheduled for {{date}} at {{time}}. See you then!',
    variables: ['date', 'time'],
    isActive: true,
    tenantId: 'default',
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommunicationTemplate[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Filter by active templates if needed
    const { active } = req.query;
    let templates = mockTemplates;
    
    if (active === 'true') {
      templates = templates.filter(t => t.isActive);
    }

    return res.status(200).json(templates);
  } catch (error) {
    console.error('Error fetching communication templates:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

