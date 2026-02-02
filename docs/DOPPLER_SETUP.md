# Doppler Setup for Local Development

Use [Doppler](https://www.doppler.com/) to store all config for the CRM UI and microservices so you can run locally **without `.env` files**. The Doppler CLI injects secrets as environment variables at runtime.

## Prerequisites

- **Doppler CLI** installed and logged in:
  ```bash
  # Install (macOS)
  brew install doppler

  # Login (opens browser)
  doppler login
  ```

## 1. Create Project and Config

**Option A: Doppler Dashboard**

1. Go to [dashboard.doppler.com](https://dashboard.doppler.com).
2. Create a project named `dealcycle-crm` (or match the name in `doppler.yaml`).
3. Create a config named `dev` for local development.

**Option B: Doppler CLI**

```bash
doppler projects create dealcycle-crm
doppler setup --project dealcycle-crm --config dev
# Create config "dev" in dashboard if it doesn't exist, or:
doppler configs create dev --project dealcycle-crm
```

## 2. Link This Repo to Doppler

From the **ai-crm** repo root:

```bash
cd /path/to/ai-crm
doppler setup
```

- If prompted, choose project **dealcycle-crm** and config **dev**.
- The repo’s `doppler.yaml` sets `project: dealcycle-crm` and `config: dev` so `doppler setup` can use them.

## 3. Add Secrets to the `dev` Config

Add these in the Doppler dashboard (**dealcycle-crm** → **dev**), or use the CLI.

### 3.1 Frontend (Next.js UI)

| Variable | Example / Description |
|----------|------------------------|
| `NEXT_PUBLIC_APP_NAME` | DealCycle CRM |
| `NEXT_PUBLIC_APP_VERSION` | 1.0.0 |
| `NEXT_PUBLIC_APP_ENV` | development |
| `NEXT_PUBLIC_API_URL` | http://localhost:3000/api |
| `NEXT_PUBLIC_API_TIMEOUT` | 10000 |
| `NEXT_PUBLIC_WS_URL` | ws://localhost:3000 |
| `NEXT_PUBLIC_BYPASS_AUTH` | false (set true for local auth bypass) |
| `DEV_ADMIN_PASSWORD` | admin123 (used by `/api/auth/bypass-token` when bypass is on; must match admin@dealcycle.com password) |
| `NEXT_PUBLIC_AUTH_SERVICE_URL` | http://localhost:3001 |
| `NEXT_PUBLIC_AUTH_SERVICE_API_URL` | http://localhost:3001/api/auth |
| `NEXT_PUBLIC_LEADS_SERVICE_URL` | http://localhost:3008 |
| `NEXT_PUBLIC_LEADS_SERVICE_API_URL` | http://localhost:3008/api/v1/leads |
| `NEXT_PUBLIC_TRANSACTIONS_SERVICE_URL` | http://localhost:3003 |
| `NEXT_PUBLIC_TRANSACTIONS_SERVICE_API_URL` | http://localhost:3003/api/v1 |
| `NEXT_PUBLIC_TIMESHEET_SERVICE_URL` | http://localhost:3007 |
| `NEXT_PUBLIC_TIMESHEET_SERVICE_API_URL` | http://localhost:3007/api/time-entries |
| `NEXT_PUBLIC_LEAD_IMPORT_SERVICE_URL` | http://localhost:3003 |
| `NEXT_PUBLIC_LEAD_IMPORT_SERVICE_API_URL` | http://localhost:3003/api/import |
| `NEXT_PUBLIC_USER_MANAGEMENT_SERVICE_URL` | http://localhost:3005 |
| `NEXT_PUBLIC_USER_MANAGEMENT_SERVICE_API_URL` | http://localhost:3005/api/v1 |
| `NEXT_PUBLIC_ATS_SERVICE_URL` | http://localhost:3008 |
| `NEXT_PUBLIC_ATS_SERVICE_API_URL` | http://localhost:3008/api/v1 |
| `NEXT_PUBLIC_ENABLE_DEBUG_MODE` | true |
| `NEXT_PUBLIC_ENABLE_LOGGING` | true |
| `NEXT_PUBLIC_LOG_LEVEL` | info |
| `ANALYZE` | false |
| `GENERATE_SOURCEMAP` | true |

Optional (Auth0, Twilio, Sentry, etc.): add any `NEXT_PUBLIC_*` or build vars from `src/frontend/env.template`.

### 3.2 Auth Service

| Variable | Example |
|----------|---------|
| `NODE_ENV` | development |
| `PORT` | 3001 |
| `MONGODB_URI` | No auth: `mongodb://localhost:27017/dealcycle-auth`. With auth: `mongodb://username:password@localhost:27017/dealcycle-auth?authSource=admin`. Docker: `mongodb://admin:password123@localhost:27017/dealcycle-auth?authSource=admin` |
| `JWT_SECRET` | (strong secret, same as used by other services that verify JWTs) |
| `JWT_EXPIRES_IN` | 24h |
| `CORS_ORIGIN` | http://localhost:3000 |
| `FRONTEND_URL` | http://localhost:3000 |
| `LOG_LEVEL` | info |

Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `REDIS_URL`, `SMTP_*`, `BCRYPT_ROUNDS`, etc. (see auth-service `env.example`).

**Reset password with Doppler** (from `auth-service-repo`): ensure `MONGODB_URI` in Doppler points to the same DB as the Auth Service (e.g. `dealcycle-auth` for local). Then run: `doppler run -- npm run reset-password -- admin@dealcycle.com admin123`

### 3.3 Leads Service

| Variable | Example |
|----------|---------|
| `NODE_ENV` | development |
| `PORT` | 3008 |
| `MONGODB_URI` | See below for local MongoDB options |
| `DATABASE_NAME` | dealcycle |
| `JWT_SECRET` | (same as Auth Service for JWT verification) |
| `JWT_EXPIRES_IN` | 24h |
| `CORS_ORIGIN` | http://localhost:3000 |
| `API_PREFIX` | api/v1 |

**Local MongoDB for Leads Service:**

- **No auth:** `mongodb://localhost:27017/dealcycle`
- **With auth** (if you see "Command find requires authentication"):  
  `mongodb://username:password@localhost:27017/dealcycle?authSource=admin`  
  Replace `username` and `password` with a MongoDB user that has access to the `dealcycle` database (create in `admin` DB if needed).

Optional: GCS vars if you use Google Cloud Storage.

### 3.4 Transactions Service

| Variable | Example |
|----------|---------|
| `NODE_ENV` | development |
| `PORT` | 3003 |
| `MONGODB_URI` | No auth: `mongodb://localhost:27017/presidential-digs-crm`. With auth: `mongodb://username:password@localhost:27017/presidential-digs-crm?authSource=admin` |
| `FRONTEND_URL` | http://localhost:3000 |
| `JWT_SECRET` | (same as Auth for JWT verification) |
| `JWT_EXPIRES_IN` | 24h |

Optional: `RATE_LIMIT_*`, `GCS_*`, etc.

### 3.5 Other Microservices

Add env vars for **Timesheet**, **User Management**, **ATS**, etc., using the same pattern: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN` / `FRONTEND_URL` as in each repo’s `env.example`.

---

**Set dev admin password (for auth bypass):**

```bash
doppler secrets set DEV_ADMIN_PASSWORD="admin123"
```

If you get **"You do not have write access to this config's secrets"**, add it locally instead: in ai-crm create `.env` or `.env.local` with `DEV_ADMIN_PASSWORD=admin123`. Next.js loads `.env.local` and it overrides/supplements Doppler when you run the server.

**Troubleshooting: 401 Unauthorized on `/api/auth/bypass-token`, `/api/leads`, `/api/tasks`**

When bypass auth is on, the app calls `/api/auth/bypass-token` to get a JWT for `admin@dealcycle.com`. If that returns **401**, the Auth Service rejected the login. Then `/api/leads` and `/api/tasks` have no token and also return **401**. Fix it by:

1. **Start the Auth Service** (e.g. `cd auth-service-repo && npm run start:dev` on port 3001). Ensure `NEXT_PUBLIC_AUTH_SERVICE_URL` is correct (default `http://localhost:3001`).
2. **Create or reset the admin user** in the Auth Service’s DB:
   ```bash
   curl -X POST http://localhost:3001/api/auth/bootstrap-admin \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@dealcycle.com","password":"admin123"}'
   ```
3. **Set the same password in the CRM** so bypass-token can log in: in Doppler set `DEV_ADMIN_PASSWORD=admin123`, or in ai-crm `.env.local` add `DEV_ADMIN_PASSWORD=admin123`. Restart the Next.js dev server after changing env.

**CLI bulk set (example; adjust values):**

```bash
# Frontend + Leads Service (no MongoDB auth)
doppler secrets set \
  NEXT_PUBLIC_API_URL="http://localhost:3000/api" \
  NEXT_PUBLIC_LEADS_SERVICE_URL="http://localhost:3008" \
  NEXT_PUBLIC_LEADS_SERVICE_API_URL="http://localhost:3008/api/v1/leads" \
  DEV_ADMIN_PASSWORD="admin123" \
  PORT="3008" \
  MONGODB_URI="mongodb://localhost:27017/dealcycle" \
  JWT_SECRET="your-shared-jwt-secret"

# If local MongoDB has auth (Leads Service "Command find requires authentication"):
# doppler secrets set MONGODB_URI="mongodb://USERNAME:PASSWORD@localhost:27017/dealcycle?authSource=admin"
# Replace USERNAME and PASSWORD with your MongoDB user credentials.
```

## 4. Run the App Locally (No .env)

### 4.1 CRM Frontend (ai-crm)

From **ai-crm** root (Doppler context is set by `doppler.yaml` / `doppler setup`):

```bash
npm run dev
```

This runs `doppler run -- npm run dev:frontend`, so the Next.js app gets all Doppler secrets as env vars.

### 4.2 Microservices (Other Repos)

Doppler stores your **auth token per directory**. If you run `doppler run` from a different repo (e.g. Leads-Service) you may get **"Invalid Auth token"** because that directory doesn’t have a valid token.

**Option A – Run from ai-crm (recommended)**  
Use ai-crm’s Doppler context and start the service from there (sibling repo path):

```bash
cd /path/to/ai-crm
doppler run -- bash -c 'cd ../Leads-Service && npm run start:dev'
doppler run -- bash -c 'cd ../auth-service-repo && npm run start:dev'
```

Or use the npm scripts (see repo root `package.json`):  
`npm run dev:leads`, `npm run dev:auth` (if you have sibling clones).

**Option B – Link Doppler in the microservice repo**  
From the microservice repo, run setup and re-auth if needed:

```bash
doppler login                    # refresh token if you see "Invalid Auth token"
cd /path/to/Leads-Service
doppler setup --project ai-crm --config dev
doppler run -- npm run start:dev
```

Repeat for Auth, Transactions, etc.: `doppler setup --project ai-crm --config dev` in each repo, then `doppler run -- npm run start:dev`.

## 5. Same token in all service repos (run Doppler from any directory)

Each service repo has a **doppler.yaml** with `project: ai-crm` and `config: dev`. To use the **same token** from any directory (so `doppler run` works in Leads-Service, auth-service-repo, etc.):

**Use `DOPPLER_TOKEN` in your shell profile (recommended):**

1. From **ai-crm** (where Doppler is already set up), run:
   ```bash
   cd /path/to/ai-crm
   ./scripts/doppler-export-token.sh
   ```
2. Copy the **export** line from the output and add it to your shell profile:
   ```bash
   # Add to ~/.zshrc (or ~/.bashrc)
   export DOPPLER_TOKEN="dp.ct.xxxx..."
   ```
3. Reload your shell:
   ```bash
   source ~/.zshrc
   ```
4. From **any** repo (Leads-Service, auth-service-repo, Buyers-Service, etc.):
   ```bash
   doppler run -- npm run start:dev
   ```

**If you previously set `DOPPLER_CONFIG_DIR`:** Remove it from your shell profile (or run `unset DOPPLER_CONFIG_DIR`), otherwise Doppler may ignore `DOPPLER_TOKEN` and use a config dir that has no token.

**If you don’t use the script:** Create a token in [Doppler](https://dashboard.doppler.com) → Project **ai-crm** → Access → Service Tokens → Generate (config: **dev**). Then add `export DOPPLER_TOKEN="dp.ct.xxx"` to `~/.zshrc`.

**Optional:** Run services from ai-crm without setting the token elsewhere:
```bash
cd /path/to/ai-crm
npm run dev:leads
npm run dev:auth:doppler
```

## 6. Verify

- **Doppler:** `doppler secrets` (lists keys for current project/config).
- **Frontend:** From ai-crm, `doppler run -- printenv \| grep NEXT_PUBLIC` to confirm vars are injected.
- **App:** Start frontend + Auth + Leads (and any others you need), open http://localhost:3000, and log in.

## 7. No .env Files

With Doppler configured:

- You do **not** need `.env`, `.env.local`, or `.env.development` in ai-crm or in the microservices for local runs.
- Keep using `doppler run -- <command>` (or `npm run dev` in ai-crm, which already wraps it) so that secrets stay in Doppler and out of the repo.

## Reference

- [Doppler CLI](https://docs.doppler.com/docs/cli)
- [Environment-based configuration](https://docs.doppler.com/docs/environment-based-configuration)
- Repo root: `doppler.yaml` (project + config); `npm run dev` uses Doppler by default.
