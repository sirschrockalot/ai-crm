# Development Guide

Development workflow, architecture, and best practices for DealCycle CRM.

## Architecture Overview

DealCycle CRM is built as a microservices architecture:

- **Frontend**: Next.js 14 application (Port 3000)
- **Auth Service**: Authentication and user management (Port 3001)
- **Leads Service**: Lead management and CRM functionality (Port 3008)
- **Transactions Service**: Transaction processing (Port 3003)
- **Timesheet Service**: Time tracking (Port 3007)
- **User Management Service**: User roles and permissions (Port 3005)
- **Shared Database**: MongoDB (Port 27017)
- **Cache/Sessions**: Redis (Port 6379)

See [Architecture Guide](./ARCHITECTURE.md) for detailed architecture documentation.

## Development Workflow

### 1. Start Development Environment

```bash
# Using Doppler (recommended)
npm run dev

# Or manually
cd src/frontend && npm run dev
```

### 2. Make Changes

- Frontend changes hot-reload automatically
- Backend services require restart for changes
- Use TypeScript for type safety

### 3. Run Tests

```bash
# Frontend tests
npm run test:frontend

# All tests
npm run test
```

### 4. Lint and Format

```bash
# Lint
npm run lint

# Format
npm run format

# Type check
npm run type-check
```

## Code Structure

```
ai-crm/
├── src/
│   ├── frontend/         # Next.js frontend
│   │   ├── components/   # React components
│   │   ├── pages/        # Next.js pages
│   │   ├── services/     # API services
│   │   └── hooks/       # Custom hooks
│   └── shared/           # Shared utilities
├── docs/                 # Documentation
├── scripts/              # Utility scripts
└── docker-compose.yml    # Docker configuration
```

## Best Practices

### Code Style

- Use TypeScript for all new code
- Follow existing patterns and conventions
- Use Chakra UI components for UI
- Keep components small and focused

### API Development

- Use Next.js API routes as proxies to microservices
- Handle errors gracefully
- Include proper authentication headers
- Document endpoints

### Testing

- Write unit tests for utilities
- Test critical business logic
- Use integration tests for API endpoints
- Keep test coverage above 70%

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## Additional Resources

- [API Documentation](./API.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
