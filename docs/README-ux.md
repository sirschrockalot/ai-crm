# 🎨 UX Expert Guide – Wholesaling CRM

## 👤 Target Personas

### 🧑 Acquisition Rep
- Task: Call leads, qualify, get deals under contract
- Needs: Fast dialing, one-click access to lead details, clear statuses

### 👩 Disposition Rep
- Task: Match buyers, send deals, close contracts
- Needs: Buyer filters, lead history, tag-based search

### 👨‍💼 Admin / Business Owner
- Task: Monitor KPIs, control costs, manage team
- Needs: Dashboard views, import/export tools, cloud-efficient design

---

## 🧭 UX Principles (inspired by Cursor.com)

| Principle              | Application to CRM                                  |
|------------------------|------------------------------------------------------|
| 🧼 Minimal UI           | Focused views, no clutter                            |
| 🌒 Dark Theme First     | Eye comfort, modern feel                             |
| 🎛 Modular Layouts      | Component-driven with logical visual hierarchy       |
| 🌀 Smooth Animations    | Subtle transitions, hover lifts                      |
| 🧩 Composable Panels    | Slideovers, drawers, and clean pop-ups               |

---

## 🧩 Component Strategy

- Sidebar: Collapsible, icon-based, highlights active
- Lead Cards: Status-colored, hover-lift, easy tags
- Slide Panel: Lead details with tabs (Summary, Activity, Comms)
- Modal Windows: Glassy overlays, centered prompts
- Tables: Zebra striping, fixed headers, responsive
- Chips & Tags: Color-coded, editable inline

---

## 📱 Responsive Design

| Component        | Mobile Behavior                  | Desktop Behavior                 |
|------------------|----------------------------------|----------------------------------|
| Sidebar          | Collapsible drawer               | Static mini-column               |
| Lead Detail      | Full screen                      | Slide-over or modal              |
| Tables/Grid      | Accordion or stacked view        | Full width grid + filter bar     |
| Import Workflow  | Stacked wizard steps             | Side-by-side stepper + preview   |

---

## 🧠 AI UX Guidelines

| Feature              | UI Placement                  | UX Behavior                           |
|----------------------|-------------------------------|----------------------------------------|
| Note Summary         | Under notes section           | Optional preview/edit before save      |
| Smart Replies        | Under text input              | Click-to-insert, regenerate option     |
| Hot Lead Score       | Badge on card + tooltip       | Tooltip explains logic on hover        |
| Suggested Tags       | Editable tag UI, highlights   | Different color from saved tags        |

---

## 🧪 Success Metrics

| Metric                          | Target                             |
|----------------------------------|-------------------------------------|
| Time to complete lead update    | < 15 seconds                        |
| Clicks to send SMS/call         | 1-2 clicks                          |
| Import mapping success rate     | > 95% match rate                    |
| AI feature opt-in rate          | > 60% during MVP                    |

---

## 🧰 Tools to Use

- Design System: ShadCN UI + Tailwind (no Tailwind required for MVP HTML)
- Monitoring UX: Prometheus + Grafana (service UX stability)
- Auth UX: Google OAuth with redirect + team switch panel

---

Let me know if you’d like this exported as PDF or added to GitHub `docs/README-ux.md`