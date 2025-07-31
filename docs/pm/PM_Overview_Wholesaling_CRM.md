# 📋 Product Manager Overview – Wholesaling CRM

## ✅ MVP Status Summary

| Area               | Status     | Notes                                                                 |
|--------------------|------------|-----------------------------------------------------------------------|
| Product Vision     | ✅ Complete | Replace third-party CRM, SaaS-ready                                 |
| PRD                | ✅ Complete | Core features: leads, buyers, SMS, call, auth, AI roadmap            |
| Stack              | ✅ Locked   | Next.js + NestJS + MongoDB + Docker + Prometheus + Grafana           |
| Auth & Security    | ✅ Done     | Google OAuth, JWT, RBAC, tenant scope, Docker hardening              |
| Monitoring         | ✅ Done     | Prometheus + Grafana, /healthcheck                                   |
| AI Roadmap         | ✅ Prioritized | Phased release, prompt-first strategy                            |

---

## 🗓️ Sprints & Milestones

### 🧱 Sprint 1: UI Foundation
- Lead dashboard (lifecycle status)
- Lead detail view (notes, call/text)
- Buyer list & profile pages
- Sidebar navigation (Acquisition/Disposition split)

### 🧪 Sprint 2: Import/Export
- CSV upload with field mapping
- Validation + preview
- CSV export with filters

### 🧠 Sprint 3: AI – Phase 2.0
- GPT summary of notes
- Suggested SMS replies
- Auto-tagging engine

---

## 🧠 AI Features by Phase

| Feature                           | Phase | Priority | LLM |
|-----------------------------------|--------|----------|-----|
| Summarize Notes                   | 2.0    | High     | GPT |
| Suggested SMS                     | 2.0    | High     | GPT |
| Auto Tagging                      | 2.0    | High     | GPT |
| Lead Scoring                      | 2.1    | Medium   | GPT |
| AI Deal Description               | 2.2    | Medium   | GPT |
| Smart Search                      | 2.3    | Low      | GPT |

---

## 🎨 UI Design (AI Integration)

| Feature              | UI Location            | Element                         |
|----------------------|------------------------|----------------------------------|
| Summarize Notes      | Lead detail page       | 🧠 Button + editable summary     |
| Suggested SMS        | Chat view              | AI reply bubble + “Insert” btn  |
| Auto Tagging         | Lead create/update     | Suggested tags as chips         |
| Lead Score           | Lead card & tooltip    | “🔥 Hot” badges                  |

---

## 🔁 PM To-Dos

- [ ] Add ticket backlog to Jira/ClickUp
- [ ] Assign epic leads + dev effort sizes
- [ ] Define SaaS pricing tiers (future)
- [ ] Mock onboarding for SaaS clients (PDF or walkthrough)