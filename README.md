# 🏛️ Presidential Digs CRM

A custom full-stack CRM platform specifically designed for real estate wholesaling operations, with built-in texting, calling, and buyer management capabilities, built with multi-tenant architecture for future SaaS expansion.

## 📋 Project Overview

**Presidential Digs CRM** is a specialized customer relationship management system built for real estate wholesalers. It addresses the unique needs of wholesaling operations by providing industry-specific workflows, integrated communication tools, and AI-powered assistance.

### 🎯 Key Features

- **🔐 Multi-Tenant Authentication** - Google OAuth with JWT security
- **📞 Lead Management** - Complete lead lifecycle from capture to disposition
- **💼 Buyer Database** - Investor tracking and matching capabilities
- **📱 Communication Integration** - SMS and calling via Twilio
- **🤖 AI-Powered Features** - Lead summaries, communication suggestions, auto-tagging
- **📊 Analytics Dashboard** - Real-time performance metrics and reporting
- **🌐 Multi-Cloud Ready** - Dockerized + GCP-compatible architecture

### 🏗️ Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 14 + TypeScript + TailwindCSS | Modern, responsive UI |
| **Backend** | NestJS + TypeScript | Robust API framework |
| **Database** | MongoDB | Flexible, scalable data storage |
| **Authentication** | Google OAuth 2.0 + JWT | Secure, user-friendly auth |
| **Communication** | Twilio API | SMS and voice integration |
| **AI Features** | OpenAI GPT-4 | Intelligent assistance |
| **Deployment** | Docker + Google Cloud Platform | Scalable infrastructure |
| **Monitoring** | Prometheus + Grafana | Observability and metrics |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- MongoDB 5.0+
- Google Cloud Platform account (for production)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/presidential-digs-crm.git
   cd presidential-digs-crm
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development environment**
   ```bash
   docker-compose up -d
   ```

4. **Install dependencies and start development servers**
   ```bash
   # Backend
   cd backend
   npm install
   npm run start:dev

   # Frontend (in new terminal)
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api/docs
   - Grafana: http://localhost:3002 (admin/admin)

## 📁 Project Structure

```
presidential-digs-crm/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── auth/           # Authentication modules
│   │   ├── users/          # User management
│   │   ├── leads/          # Lead management
│   │   ├── buyers/         # Buyer management
│   │   ├── communications/ # SMS/Call integration
│   │   ├── ai/            # AI features
│   │   └── common/        # Shared utilities
│   └── test/              # Backend tests
├── frontend/               # Next.js web application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Next.js pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   └── stores/        # State management
│   └── public/            # Static assets
├── docs/                  # Project documentation
│   ├── prd/              # Product Requirements Document
│   ├── architecture/     # Technical architecture
│   ├── api/              # API specifications
│   ├── database/         # Database schema
│   └── epics/            # Epic structure and user stories
├── monitoring/           # Prometheus and Grafana configs
├── infrastructure/       # Terraform and deployment configs
└── docker-compose.yml   # Development environment
```

## 📚 Documentation

### 📋 Product Documentation
- **[Product Requirements Document](docs/prd/presidential-digs-crm-prd.md)** - Comprehensive PRD with all requirements
- **[Epic Structure](docs/epics/epic-structure.md)** - Development roadmap with user stories
- **[API Specifications](docs/api/api-specifications.md)** - Complete API documentation
- **[Database Schema](docs/database/database-schema.md)** - MongoDB schema and relationships
- **[Architecture Overview](docs/architecture/Architecture_Overview_Wholesaling_CRM.md)** - Technical architecture

### 🔧 Technical Documentation
- **[API Documentation](http://localhost:3000/api/docs)** - Interactive Swagger docs
- **[Database Schema](docs/database/database-schema.md)** - MongoDB collections and indexes
- **[Deployment Guide](docs/deployment/README.md)** - Production deployment instructions

## 🎯 Core Features

### 🔐 Authentication & User Management
- Google OAuth 2.0 integration
- Multi-tenant user isolation
- Role-based access control (Admin, Acquisition Rep, Disposition Manager)
- User profile management and preferences

### 📞 Lead Management
- Lead creation and editing
- Pipeline view with drag-and-drop
- Lead status tracking (New → Contacted → Under Contract → Closed)
- Lead assignment and tagging
- Search and filtering capabilities

### 💼 Buyer Management
- Buyer profile creation and management
- Property type and price range preferences
- Buyer-lead matching algorithm
- Buyer database search and filtering
- Communication history tracking

### 📱 Communication Integration
- SMS integration via Twilio
- Call initiation and logging
- Message templates and scheduling
- Communication history and analytics
- Delivery status tracking

### 🤖 AI-Powered Features
- AI-generated lead summaries
- Communication reply suggestions
- Automatic lead tagging
- Buyer matching recommendations
- Property description generation

### 📊 Analytics & Reporting
- Real-time dashboard metrics
- Lead pipeline analytics
- Team performance tracking
- Revenue and conversion reporting
- Custom report generation

## 🚀 Deployment

### Development Environment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Production Deployment
```bash
# Build production images
docker build -t presidential-digs-crm-backend ./backend
docker build -t presidential-digs-crm-frontend ./frontend

# Deploy to GCP
terraform init
terraform plan
terraform apply
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test
npm run test:e2e
npm run test:cov
```

### Frontend Testing
```bash
cd frontend
npm run test
npm run test:coverage
```

### End-to-End Testing
```bash
npm run test:e2e
```

## 📈 Monitoring

### Application Metrics
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3002 (admin/admin)
- **Health Check**: http://localhost:3000/health

### Key Metrics
- API response times
- Lead conversion rates
- User engagement metrics
- System uptime and performance
- Error rates and debugging

## 🔒 Security

### Security Features
- Multi-tenant data isolation
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting and API protection
- HTTPS enforcement
- Container security best practices

### Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## 🤝 Contributing

### Development Workflow
1. Create a feature branch from `main`
2. Make your changes with proper testing
3. Update documentation as needed
4. Submit a pull request with detailed description
5. Ensure all tests pass and code is reviewed

### Code Standards
- **TypeScript** for type safety
- **ESLint** and **Prettier** for code formatting
- **Jest** for unit testing
- **Cypress** for E2E testing
- **Conventional Commits** for commit messages

## 📞 Support

### Getting Help
- **Documentation**: Check the `/docs` folder for comprehensive guides
- **API Docs**: Interactive documentation at `/api/docs`
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions and ideas

### Contact
- **Project Lead**: [Your Name]
- **Technical Lead**: [Your Name]
- **Product Owner**: [Your Name]

## 📄 License

This project is proprietary software developed for Presidential Digs. All rights reserved.

## 🎯 Roadmap

### Phase 1: MVP (Current)
- ✅ Authentication & User Management
- ✅ Lead Management System
- ✅ Buyer Management System
- ✅ Communication Integration
- ✅ AI Features Integration
- ✅ Dashboard & Analytics
- ✅ API & Documentation
- ✅ Infrastructure & Deployment

### Phase 2: SaaS Expansion (Q2 2024)
- 🔄 External buyer self-service portal
- 🔄 Advanced analytics and reporting
- 🔄 Mobile applications (iOS/Android)
- 🔄 Third-party integrations
- 🔄 Advanced AI features
- 🔄 White-label customization

### Phase 3: Enterprise Features (Q3 2024)
- 🔄 Advanced workflow automation
- 🔄 Enterprise security features
- 🔄 Advanced reporting and BI
- 🔄 API ecosystem and integrations
- 🔄 International expansion

---

**Built with ❤️ for real estate wholesalers who need better tools for their business.** 