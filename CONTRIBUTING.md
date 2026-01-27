# Contributing to DealCycle CRM

Thank you for contributing to DealCycle CRM! This document provides guidelines for contributing.

## Documentation Guidelines

### Documentation Location

**All documentation must be placed in `/docs` and linked in `/docs/README.md`.**
**CI will fail if markdown files exist outside `/docs/` (except README.md, CONTRIBUTING.md, CHANGELOG.md).**

- Documentation files should be in `/docs/` directory
- Root-level `.md` files should be minimal (README.md, CONTRIBUTING.md only)
- All feature documentation should be in `/docs/`
- Update `/docs/README.md` when adding new documentation

### Documentation Structure

1. **Core Documentation** (in `/docs/` root):
   - `SETUP.md` - Setup and installation
   - `DEVELOPMENT.md` - Development workflow
   - `DEPLOYMENT.md` - Deployment instructions
   - `TROUBLESHOOTING.md` - Common issues
   - `API.md` - API documentation
   - `ARCHITECTURE.md` - Architecture overview

2. **Feature Documentation** (in `/docs/` subdirectories):
   - Feature-specific guides
   - Implementation details
   - Configuration guides

3. **Project Management** (in `/docs/` subdirectories):
   - Epics and stories
   - PRD documents
   - Status reports

### Configuration Files

**No `.env` files should be tracked in git (except `.env.example`).**
- Use Doppler for secret management
- CI will fail if any `.env*` files are tracked (except `.env.example`)
- See [Setup Guide](./docs/SETUP.md) for Doppler configuration

### Guardrails

**CI automatically checks for config and documentation sprawl:**
- ❌ Fails if any `.env*` files are tracked (except `.env.example`)
- ❌ Fails if markdown files exist outside `/docs/` (except `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `.github/` templates, and component `README.md` files in `src/`)

Run the check locally:
```bash
./scripts/check-doc-config-sprawl.sh
```

### Adding New Documentation

1. Create the documentation file in `/docs/`
2. Add a link to `/docs/README.md`
3. Follow existing documentation patterns
4. Keep content focused and up-to-date

## Code Contribution

### Development Workflow

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Run linting and tests
5. Submit a pull request

### Code Style

- Use TypeScript for all new code
- Follow existing patterns
- Write clear, self-documenting code
- Add comments for complex logic

### Testing

- Write unit tests for utilities
- Test critical business logic
- Maintain test coverage above 70%

## Pull Request Process

1. Update documentation if needed
2. Ensure all tests pass
3. Update CHANGELOG if applicable
4. Request review from maintainers

## Questions?

- Check [Documentation Index](./docs/README.md)
- Review [Development Guide](./docs/DEVELOPMENT.md)
- Open an issue for questions
