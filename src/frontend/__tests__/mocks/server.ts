import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock API endpoints
export const handlers = [
  // Leads API
  rest.get('/api/leads', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '555-1234',
          status: 'new',
          propertyType: 'single_family',
          estimatedValue: 250000,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '555-5678',
          status: 'contacted',
          propertyType: 'multi_family',
          estimatedValue: 450000,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
      ])
    );
  }),

  rest.post('/api/leads', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: '3',
        firstName: 'New',
        lastName: 'Lead',
        email: 'new@example.com',
        phone: '555-9999',
        status: 'new',
        propertyType: 'single_family',
        estimatedValue: 300000,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
      })
    );
  }),

  // Analytics API
  rest.get('/api/analytics', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        leads: [
          { id: '1', status: 'new', propertyType: 'single_family', estimatedValue: 250000 },
          { id: '2', status: 'contacted', propertyType: 'multi_family', estimatedValue: 450000 },
        ],
        buyers: [
          { id: '1', buyerType: 'individual', isActive: true },
          { id: '2', buyerType: 'company', isActive: true },
        ],
        metrics: {
          totalLeads: 2,
          totalBuyers: 2,
          conversionRate: 12.5,
          averageLeadValue: 350000,
          totalPipelineValue: 700000,
          activeBuyers: 2,
        },
        charts: {
          leadStatusDistribution: [
            { name: 'New', value: 1 },
            { name: 'Contacted', value: 1 },
          ],
          propertyTypeDistribution: [
            { name: 'Single Family', value: 1 },
            { name: 'Multi Family', value: 1 },
          ],
          buyerTypeDistribution: [
            { name: 'Individual', value: 1 },
            { name: 'Company', value: 1 },
          ],
          monthlyLeadGrowth: [
            { name: 'Jan', value: 30 },
            { name: 'Feb', value: 45 },
          ],
          conversionRateOverTime: [
            { name: 'Jan', value: 12.5 },
            { name: 'Feb', value: 14.2 },
          ],
        },
      })
    );
  }),

  // Automation API
  rest.get('/api/automation/workflows', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          name: 'Welcome Email Sequence',
          description: 'Send welcome emails to new leads',
          triggerType: 'automatic',
          triggerCondition: 'Lead status = new',
          actions: [
            { type: 'email', config: { template: 'welcome', delay: '1h' } },
            { type: 'notification', config: { message: 'Welcome email sent' } }
          ],
          isActive: true,
          priority: 'high',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
        },
      ])
    );
  }),

  // Dashboard API
  rest.get('/api/dashboard', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        stats: {
          totalLeads: 1234,
          conversionRate: 12.5,
          activeBuyers: 89,
          revenue: 45678,
          leadGrowth: 23.36,
          conversionGrowth: 5.2,
          buyerGrowth: -2.1,
          revenueGrowth: 18.7,
        },
        leadPipelineData: [
          { name: 'New Leads', value: 45, color: '#2196f3' },
          { name: 'Contacted', value: 32, color: '#ff9800' },
          { name: 'Qualified', value: 28, color: '#4caf50' },
          { name: 'Converted', value: 15, color: '#9c27b0' },
        ],
        monthlyGrowthData: [
          { name: 'Jan', value: 30 },
          { name: 'Feb', value: 45 },
          { name: 'Mar', value: 35 },
        ],
        conversionTrendData: [
          { name: 'Jan', value: 8.5 },
          { name: 'Feb', value: 10.2 },
          { name: 'Mar', value: 12.1 },
        ],
        revenueData: [
          { name: 'Jan', value: 25000 },
          { name: 'Feb', value: 32000 },
          { name: 'Mar', value: 28000 },
        ],
        recentActivity: [
          {
            id: '1',
            type: 'lead',
            message: 'New lead added',
            timestamp: '2024-01-03T10:00:00Z',
            priority: 'medium',
          },
        ],
        alerts: [
          {
            id: '1',
            type: 'info',
            title: 'System Update',
            message: 'Dashboard data refreshed',
            timestamp: '2024-01-03T10:00:00Z',
            isRead: false,
          },
        ],
      })
    );
  }),

  // Error handlers
  rest.get('*', (req, res, ctx) => {
    console.warn(`Unhandled ${req.method} request to ${req.url}`);
    return res(ctx.status(404));
  }),

  rest.post('*', (req, res, ctx) => {
    console.warn(`Unhandled ${req.method} request to ${req.url}`);
    return res(ctx.status(404));
  }),
];

export const server = setupServer(...handlers); 