# Security Plan (System Security Plan)

## Purpose

This document defines the security baseline for DealCycle CRM, with a focus on:

- Protecting **CRM data** (PII, customer/lead data, notes, documents)
- Protecting **credentials and API keys** (OAuth, Twilio, Sentry, service tokens)
- Reducing the risk of **data loss**, **account takeover**, and **unauthorized access**
- Establishing repeatable **operational security** practices (logging, monitoring, backups, incident response)

This plan is intended to be actionable for engineering and operations. It complements (but does not replace) the vulnerability-focused report in `docs/SECURITY_AUDIT_REPORT.md`.

## Scope

- **Frontend**: `src/frontend` (Next.js)
- **Next.js API routes (server-side)**: `src/frontend/pages/api/*` (proxy and integration endpoints)
- **External services / integrations**: Auth provider (e.g., Auth0), Twilio, analytics/monitoring, any AI providers, storage providers
- **CI/CD and infrastructure**: GitHub Actions workflows in `.github/workflows/*`

## Security Objectives (what “secure” means here)

- **Confidentiality**: Only authorized users/services can access CRM data and secrets.
- **Integrity**: Data changes are authenticated/authorized, validated, and auditable.
- **Availability**: Service is resilient to common DoS vectors and has backups + recovery.
- **Accountability**: Actions affecting sensitive data are logged with user identity and time.

## Data classification

- **Restricted** (highest): API keys/secrets, OAuth client secrets, JWT signing keys, encryption keys, database backups, documents, MFA seeds/recovery codes.
- **Confidential**: Leads, contacts, deal/transaction records, notes, communication logs, internal analytics.
- **Internal**: System configuration, runbooks, non-sensitive logs/metrics.
- **Public**: Marketing content, public docs.

**Rule**: *Restricted* data must never be shipped to browsers/mobile clients, committed to git, or logged in plaintext.

## Roles and responsibilities

- **Engineering**: Implement controls, fix security bugs, maintain dependency hygiene.
- **Ops/Platform**: Secrets storage, access controls, backups, monitoring/alerting, key rotation.
- **Security owner** (designated): Reviews high-risk changes, owns incident response coordination.

## Core controls (baseline)

### 1) Secrets and key management

- **Source of truth**: Use Doppler for developer/runtime secrets. Avoid `.env` files except `.env.example` (non-secret placeholders).
- **Server-only secrets**: Store secrets in **non-`NEXT_PUBLIC_*`** environment variables. `NEXT_PUBLIC_*` variables are considered public.
- **CI secrets**: Store in GitHub Actions secrets. Apply least privilege and rotate on staff changes.
- **Rotation**:
  - High-impact secrets (JWT signing keys, DB credentials): rotate on schedule and immediately on suspected leak.
  - Third-party API keys: rotate at least quarterly or per provider best practices.
- **Access control**:
  - Separate configs for `dev`, `staging`, `prod`
  - Least privilege per environment (staging keys must not access prod data)
  - Audit access via Doppler and GitHub logs

### 2) Identity, authentication, and sessions

- Prefer a managed identity provider (e.g., Auth0) with:
  - **MFA** enforced for admins (and optionally for all users)
  - **Phishing-resistant** methods where possible (WebAuthn)
  - **Short-lived access tokens** + refresh tokens
  - Device/session management and forced logout on credential changes
- **Auth bypass** must be **development-only** and impossible to enable in production via build/runtime policy.

### 3) Authorization (RBAC / ABAC)

- Enforce **server-side authorization** for every sensitive operation.
- Use **least privilege roles** (e.g., Admin, Manager, Agent, ReadOnly).
- Every API route and service endpoint must:
  - Authenticate user/service identity
  - Authorize action against role + tenant/org boundaries

### 4) Data protection (in transit and at rest)

- **TLS everywhere**:
  - Browser ↔ frontend: HTTPS only
  - Frontend API routes ↔ downstream services: HTTPS/mTLS where possible
- **At rest**:
  - Encrypt databases and storage volumes (cloud-managed encryption at minimum)
  - Prefer **field-level encryption** for especially sensitive fields (SSNs, bank info) if ever stored
- **Retention**:
  - Define retention windows per data type (e.g., logs 30–90 days, documents per legal needs)
  - Implement deletion processes for data subject requests (GDPR/CCPA, if applicable)

### 5) Application security (OWASP baseline)

- **Input validation** on server boundaries; treat all client input as untrusted.
- **Output encoding** and modern frameworks to reduce XSS.
- **CSRF**: Prefer same-site cookies + CSRF tokens where needed.
- **Rate limiting** on auth endpoints and high-cost endpoints.
- **Security headers**:
  - CSP (Content Security Policy)
  - HSTS
  - X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Dependency hygiene**: keep dependencies patched; treat `npm audit` and CI scans as blocking for high severity.

### 6) Logging, monitoring, and audit trails

- **Do not log secrets** or full tokens. Redact:
  - `Authorization` headers
  - cookies
  - API keys
  - PII fields where not necessary
- Maintain an **audit log** for:
  - Logins/MFA events
  - Permission changes
  - Exports and bulk operations
  - Document access/downloads
- Alert on:
  - Spikes in 401/403/5xx
  - Unusual export volume
  - Repeated failed logins / lockouts

### 7) Backups and disaster recovery

- Backups must be **encrypted**, **tested**, and **access-controlled**.
- Define RPO/RTO targets (example starting points):
  - **RPO**: 24h
  - **RTO**: 4–24h depending on environment
- Run restore tests at least quarterly.

## Immediate technical guardrails (must-haves)

### Never expose secrets to the browser

- **Do not use `NEXT_PUBLIC_*`** for secrets. Those values are exposed to the client bundle.
- Client apps should call **server-side endpoints** (Next.js API routes / backend services) which hold secrets in server-only env vars.

### Centralized secret management

- Continue using Doppler for local dev (`doppler run -- ...`) and GitHub secrets for CI.
- Keep `.env` files gitignored; only `.env.example` may be tracked and must contain **no secrets**.

## CI/CD security checks (current + required)

This repo already includes a security scan job in `.github/workflows/ci.yml`:

- Dependency scanning (Snyk)
- Vulnerability scanning (Trivy)
- DAST scanning (OWASP ZAP)

**Policy**:

- High/critical findings block merges unless explicitly risk-accepted with documented justification.

## Incident response (high-level)

### Severity guide

- **SEV0**: confirmed secret leak, active breach, or production data exfiltration
- **SEV1**: high-likelihood exploit affecting production confidentiality/integrity
- **SEV2**: important vulnerability with partial mitigations or limited blast radius
- **SEV3**: low-risk issues / hardening

### Response steps

1. **Contain**: disable compromised keys, revoke sessions, block malicious IPs, disable vulnerable feature flag.
2. **Eradicate**: patch root cause, add detections, rotate secrets.
3. **Recover**: restore services/data, monitor for recurrence.
4. **Postmortem**: document timeline, impact, corrective actions, and verify completion.

## Security checklist (ongoing)

- **Before every release**:
  - Dependency scans pass (high/critical resolved)
  - No secrets in `NEXT_PUBLIC_*` variables
  - Auth bypass disabled for staging/prod
  - CSP/HSTS validated in production headers
- **Quarterly**:
  - Secret rotation (per policy)
  - Restore test from backups
  - Access review (Doppler/GitHub/cloud)
- **Annually**:
  - Threat model review and tabletop incident exercise

