# DealCycle CRM

A modern, AI-powered CRM platform for real estate wholesalers, built with Next.js 14, NestJS, and React Native.

## 📊 Project Status

### ✅ Completed Features
- **Buyer Management UI** - Complete buyer management system with pages, components, and workflows
  - Buyer list, detail, creation, and editing pages
  - Buyer analytics and performance tracking
  - Buyer-lead matching with quality scoring
  - Comprehensive buyer management components library
  - Full integration with existing backend APIs

### 🚧 In Progress
- **Lead Management UI** - Enhanced lead management functionality
- **Authentication UI** - User authentication and authorization
- **Communications UI** - Communication workflows and history

### 📋 Planned Features
- **Dashboard Enhancements** - Role-based dashboards and analytics
- **Mobile App** - React Native mobile application
- **AI Features** - AI-powered lead scoring and insights

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+
- Docker & Docker Compose
- MongoDB 6.0+
- Redis 7.0+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/dealcycle-crm.git
   cd dealcycle-crm
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development environment**
   ```bash
   # Quick start - everything in one command
   ./scripts/dev.sh
   
   # Or start individual services
   npm run dev:backend
   npm run dev:frontend
   npm run dev:mobile
   ```

## 🏗️ Project Structure

```
dealcycle-crm/
├── src/
│   ├── backend/          # NestJS API
│   │   ├── modules/      # Feature modules
│   │   ├── common/       # Shared utilities
│   │   └── config/       # Configuration
│   ├── frontend/         # Next.js 14 App
│   │   ├── components/   # React components
│   │   ├── pages/        # Next.js pages
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   └── micro-apps/   # Micro-frontend apps
│   ├── mobile/           # React Native App
│   │   ├── components/   # Mobile components
│   │   ├── screens/      # Mobile screens
│   │   └── services/     # Mobile services
│   └── shared/           # Shared utilities & types
├── docs/                 # Documentation
├── .github/              # GitHub Actions
└── monitoring/           # Monitoring configs
```

## 🛠️ Development Commands

### Root Commands
```bash
./scripts/dev.sh         # Start complete development environment
./scripts/dev.sh --stop  # Stop all development services
./scripts/test-dev.sh    # Test if development environment is working
npm run dev              # Start backend + frontend
npm run test             # Run all tests
npm run lint             # Lint all code
npm run build            # Build all applications
npm run docker:up        # Start Docker services
npm run docker:down      # Stop Docker services
```

### Backend Commands
```bash
npm run dev:backend      # Start backend in dev mode
npm run test:backend     # Run backend tests
npm run build:backend    # Build backend
npm run lint:backend     # Lint backend code
```

### Frontend Commands
```bash
npm run dev:frontend     # Start frontend in dev mode
npm run test:frontend    # Run frontend tests
npm run build:frontend   # Build frontend
npm run lint:frontend    # Lint frontend code
```

### Mobile Commands
```bash
npm run dev:mobile       # Start mobile in dev mode
npm run test:mobile      # Run mobile tests
npm run build:mobile     # Build mobile app
npm run lint:mobile      # Lint mobile code
```

## 🧪 Testing

### Test Coverage Requirements
- **Backend**: 80%+ coverage
- **Frontend**: 70%+ coverage
- **Mobile**: 70%+ coverage

### Running Tests
```bash
# All tests
npm run test

# Specific test suites
npm run test:backend
npm run test:frontend
npm run test:mobile

# Test with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🚀 Development Environment

### Quick Start
The easiest way to get started with development is using our automated setup script:

```bash
# Start the complete development environment
./scripts/dev.sh

# Test if everything is working
./scripts/test-dev.sh

# Stop all services
./scripts/dev.sh --stop
```

This will automatically:
- ✅ Check prerequisites (Node.js, Docker)
- ✅ Set up environment files
- ✅ Install all dependencies
- ✅ Start core services (MongoDB, Redis, Meilisearch)
- ✅ Start backend in development mode
- ✅ Start frontend in development mode
- ✅ Show status and useful URLs

### Access Points
Once running, you can access:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Health**: http://localhost:3000/health
- **MongoDB**: mongodb://localhost:27017
- **Redis**: redis://localhost:6379
- **Search**: http://localhost:7700

For detailed development setup instructions, see [README-DEV.md](README-DEV.md).

## 🐳 Docker Development

### Start Services
```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d backend frontend mongo redis
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Stop Services
```bash
docker-compose down
```

## 🔧 Configuration

### Environment Variables
Copy `env.example` to `.env` and configure:

- **Database**: MongoDB connection string
- **Redis**: Redis connection string
- **Authentication**: JWT secret, Google OAuth
- **External Services**: Twilio, Email, AI APIs
- **Feature Flags**: Redis-based feature management

### Feature Flags
The application uses Redis-based feature flags for:
- Gradual rollouts
- A/B testing
- Feature toggles
- Environment-specific features

## 📊 Monitoring

### Prometheus & Grafana
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3002 (admin/admin)

### Application Metrics
- API response times
- Database query performance
- Memory usage
- Error rates
- Feature flag usage

## 🚀 Deployment

### CI/CD Pipeline
GitHub Actions automatically:
1. Lints and type-checks code
2. Runs tests with coverage
3. Builds applications
4. Security scans
5. Deploys to staging/production

### Environments
- **Development**: Local Docker setup
- **Staging**: Automated deployment from `develop` branch
- **Production**: Automated deployment from `main` branch

## 🏛️ Architecture

### Backend (NestJS)
- **Modules**: Auth, Leads, Users, Tenants, Analytics, Automation, AI
- **Database**: MongoDB with Mongoose
- **Caching**: Redis
- **Queue**: Bull/BullMQ
- **Search**: Meilisearch
- **Monitoring**: Prometheus + Grafana

### Frontend (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **UI Library**: Chakra UI
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Testing**: Jest + React Testing Library

### Mobile (React Native)
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **UI Library**: React Native Paper
- **Offline Support**: AsyncStorage + NetInfo
- **Testing**: Jest + Detox

## 🔐 Security

### Authentication
- Google OAuth 2.0
- JWT tokens
- Role-based access control (RBAC)
- Multi-factor authentication (MFA)

### Data Protection
- Input validation with Zod
- XSS protection
- CSRF protection
- Rate limiting
- Data encryption (AES-256-GCM)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

### Development Standards
- **Code Style**: ESLint + Prettier
- **Type Safety**: TypeScript strict mode
- **Testing**: Jest + Testing Library
- **Documentation**: JSDoc comments
- **Commits**: Conventional commits

## 📚 Documentation

- [Architecture Overview](docs/architecture/Architecture_Overview_Wholesaling_CRM.md)
- [API Specifications](docs/api/api-specifications.md)
- [Database Schema](docs/database/database-schema.md)
- [Frontend Specification](docs/front-end-specification.md)
- [Test Strategy](docs/qa/test-strategy.md)
- [Epics & Stories](docs/epics/)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/dealcycle-crm/issues)
- **Documentation**: [Project Wiki](https://github.com/your-org/dealcycle-crm/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/dealcycle-crm/discussions) 