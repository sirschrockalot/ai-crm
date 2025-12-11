// MongoDB initialization script for Presidential Digs CRM
// This script sets up the databases and collections for all services

// Switch to admin database
db = db.getSiblingDB('admin');

// Create databases for each service
db.runCommand({ create: 'dealcycle' });
db.runCommand({ create: 'dealcycle-auth' });
db.runCommand({ create: 'presidential-digs-crm' });
db.runCommand({ create: 'timesheet-service' });
db.runCommand({ create: 'user-management' });
db.runCommand({ create: 'presidential_digs_crm' });

// Create collections and indexes for each service
// Auth Service Collections
db = db.getSiblingDB('dealcycle-auth');
db.createCollection('users');
db.createCollection('roles');
db.createCollection('permissions');
db.createCollection('sessions');

// Create indexes for auth service
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });
db.sessions.createIndex({ userId: 1 });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Leads Service Collections
db = db.getSiblingDB('dealcycle');
db.createCollection('leads');
db.createCollection('lead_activities');
db.createCollection('lead_sources');

// Create indexes for leads service
db.leads.createIndex({ email: 1 });
db.leads.createIndex({ phone: 1 });
db.leads.createIndex({ status: 1 });
db.leads.createIndex({ createdAt: 1 });
db.leads.createIndex({ updatedAt: 1 });
db.leads.createIndex({ assignedTo: 1 });
db.leads.createIndex({ source: 1 });

// Transactions Service Collections
db = db.getSiblingDB('presidential-digs-crm');
db.createCollection('transactions');
db.createCollection('transaction_documents');
db.createCollection('transaction_notes');

// Create indexes for transactions service
db.transactions.createIndex({ leadId: 1 });
db.transactions.createIndex({ status: 1 });
db.transactions.createIndex({ createdAt: 1 });
db.transactions.createIndex({ updatedAt: 1 });
db.transactions.createIndex({ assignedTo: 1 });

// Timesheet Service Collections
db = db.getSiblingDB('timesheet-service');
db.createCollection('timeentries');
db.createCollection('timesheets');

// Create indexes for timesheet service
db.timeentries.createIndex({ userId: 1 });
db.timeentries.createIndex({ weekStart: 1 });
db.timeentries.createIndex({ status: 1 });
db.timeentries.createIndex({ createdAt: 1 });

// User Management Service Collections
db = db.getSiblingDB('user-management');
db.createCollection('users');
db.createCollection('roles');
db.createCollection('organizations');
db.createCollection('departments');

// Create indexes for user management service
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ organizationId: 1 });
db.users.createIndex({ departmentId: 1 });
db.users.createIndex({ role: 1 });
db.roles.createIndex({ name: 1 }, { unique: true });

// Lead Import Service Collections
db = db.getSiblingDB('presidential_digs_crm');
db.createCollection('imported_leads');
db.createCollection('import_jobs');
db.createCollection('import_templates');

// Create indexes for lead import service
db.imported_leads.createIndex({ email: 1 });
db.imported_leads.createIndex({ phone: 1 });
db.imported_leads.createIndex({ importJobId: 1 });
db.import_jobs.createIndex({ status: 1 });
db.import_jobs.createIndex({ createdAt: 1 });

print('MongoDB initialization completed successfully!');
print('Created databases: dealcycle, dealcycle-auth, presidential-digs-crm, timesheet-service, user-management, presidential_digs_crm');
print('Created collections and indexes for all services');
