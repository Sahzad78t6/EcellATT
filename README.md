# E-Cell Student Attendance & Member Management Portal

A full-stack, enterprise-grade web application built from scratch for a student body's Entrepreneurship Cell (E-Cell) to track, manage, analyze, and automate member attendance across events, workshops, and vertical meetings.

---

## Final Project Folder Tree

```text
ecell-attendance/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── constants.js
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   ├── controllers/
│   │   │   ├── analytics.controller.js
│   │   │   ├── attendance.controller.js
│   │   │   ├── audit.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── emailLog.controller.js
│   │   │   ├── event.controller.js
│   │   │   ├── report.controller.js
│   │   │   ├── settings.controller.js
│   │   │   ├── user.controller.js
│   │   │   └── vertical.controller.js
│   │   ├── jobs/
│   │   │   └── eventScheduler.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── rateLimiter.js
│   │   │   ├── sanitize.js
│   │   │   └── validate.js
│   │   ├── models/
│   │   │   ├── Attendance.js
│   │   │   ├── AuditLog.js
│   │   │   ├── EmailLog.js
│   │   │   ├── Event.js
│   │   │   ├── Settings.js
│   │   │   ├── User.js
│   │   │   └── Vertical.js
│   │   ├── routes/
│   │   │   ├── analytics.routes.js
│   │   │   ├── attendance.routes.js
│   │   │   ├── audit.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── emailLog.routes.js
│   │   │   ├── event.routes.js
│   │   │   ├── index.js
│   │   │   ├── report.routes.js
│   │   │   ├── settings.routes.js
│   │   │   ├── user.routes.js
│   │   │   └── vertical.routes.js
│   │   ├── seed/
│   │   │   └── seed.js
│   │   ├── services/
│   │   │   ├── alert.service.js
│   │   │   ├── analytics.service.js
│   │   │   ├── attendance.service.js
│   │   │   ├── audit.service.js
│   │   │   ├── auth.service.js
│   │   │   ├── email.service.js
│   │   │   ├── event.service.js
│   │   │   ├── report.service.js
│   │   │   ├── user.service.js
│   │   │   └── vertical.service.js
│   │   ├── templates/
│   │   │   ├── lowAttendanceEmail.js
│   │   │   └── welcomeEmail.js
│   │   ├── tests/
│   │   │   └── acceptance.test.js
│   │   ├── utils/
│   │   │   ├── apiResponse.js
│   │   │   ├── asyncHandler.js
│   │   │   ├── dateUtils.js
│   │   │   ├── passwordGenerator.js
│   │   │   └── token.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   ├── analyticsApi.js
│   │   │   ├── attendanceApi.js
│   │   │   ├── auditApi.js
│   │   │   ├── authApi.js
│   │   │   ├── axios.js
│   │   │   ├── emailLogApi.js
│   │   │   ├── eventApi.js
│   │   │   ├── reportApi.js
│   │   │   ├── settingsApi.js
│   │   │   ├── userApi.js
│   │   │   └── verticalApi.js
│   │   ├── components/
│   │   │   ├── analytics/
│   │   │   │   ├── Heatmap.jsx
│   │   │   │   ├── Leaderboard.jsx
│   │   │   │   └── StreaksList.jsx
│   │   │   ├── attendance/
│   │   │   │   └── AttendanceChecklist.jsx
│   │   │   └── common/
│   │   │       ├── ChartCard.jsx
│   │   │       ├── ConfirmDialog.jsx
│   │   │       ├── DataTable.jsx
│   │   │       ├── EmptyState.jsx
│   │   │       ├── EventCard.jsx
│   │   │       ├── LiveEventBanner.jsx
│   │   │       ├── MobileNav.jsx
│   │   │       ├── Navbar.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       ├── SkeletonLoader.jsx
│   │   │       ├── StatCard.jsx
│   │   │       └── StatusBadge.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useEventCountdown.js
│   │   │   └── useTheme.js
│   │   ├── layouts/
│   │   │   ├── AuthLayout.jsx
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboardPage.jsx
│   │   │   │   ├── AttendanceOversightPage.jsx
│   │   │   │   ├── AuditLogsPage.jsx
│   │   │   │   ├── EmailAlertsPage.jsx
│   │   │   │   ├── EventManagementPage.jsx
│   │   │   │   ├── ReportsPage.jsx
│   │   │   │   ├── SettingsPage.jsx
│   │   │   │   ├── UserManagementPage.jsx
│   │   │   │   └── VerticalManagementPage.jsx
│   │   │   ├── auth/
│   │   │   │   ├── ChangePasswordPage.jsx
│   │   │   │   └── LoginPage.jsx
│   │   │   ├── head/
│   │   │   │   ├── HeadAnalyticsPage.jsx
│   │   │   │   ├── HeadDashboardPage.jsx
│   │   │   │   ├── HeadMembersPage.jsx
│   │   │   │   └── MarkAttendancePage.jsx
│   │   │   ├── member/
│   │   │   │   ├── MemberDashboardPage.jsx
│   │   │   │   ├── MemberHistoryPage.jsx
│   │   │   │   └── MemberProfilePage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   └── UnauthorizedPage.jsx
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── utils/
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## Technology Stack

- **Frontend**: React 18, Vite, React Router v6, TanStack Query (@tanstack/react-query), Axios, Tailwind CSS, Recharts, React Hook Form + Zod, React Hot Toast, Lucide React icons.
- **Backend**: Node.js (ES Modules `type: "module"`), Express.js, MongoDB + Mongoose ODM.
- **Security & Utilities**: JWT in `httpOnly` cookies, bcryptjs (cost 12), Helmet, CORS, Express Rate Limit, Cookie Parser, Morgan, Zod, NoSQL Injection Sanitization, Node-Cron, CSV-Parse (bulk user upload), ExcelJS (Excel exports), Nodemailer, Dayjs (Timezone & UTC plugins).

---

## 8 Seeded Verticals

1. **Creative & Designing**
2. **Technical**
3. **Corporate Communication**
4. **Resource & Counselling**
5. **Media Relations**
6. **Public Relations**
7. **Marketing**
8. **Finance & Logistics**

---

## User Roles & Access Matrix

| Feature / Dashboard | ADMIN | SECRETARY | LEAD | MEMBER |
|---|:---:|:---:|:---:|:---:|
| **Admin Overview & Advanced Analytics** (Heatmap, Streaks, Leaderboards) | ✅ | ❌ | ❌ | ❌ |
| **User Management & Bulk CSV Import** | ✅ | ❌ | ❌ | ❌ |
| **Vertical Structure & Leadership Assignment** | ✅ | ❌ | ❌ | ❌ |
| **Event Lifecycle (Create, Open, Close, Reopen, Cancel)** | ✅ | ❌ | ❌ | ❌ |
| **Attendance Oversight & Audited Overrides** | ✅ | ❌ | ❌ | ❌ |
| **Reports & Exports (CSV / Excel .xlsx)** | ✅ | ❌ | ❌ | ❌ |
| **Email Alerts Log & Manual Dispatch** | ✅ | ❌ | ❌ | ❌ |
| **System Settings & Thresholds** | ✅ | ❌ | ❌ | ❌ |
| **Audit Logs Viewer** | ✅ | ❌ | ❌ | ❌ |
| **Vertical Head Dashboard & Scoped Analytics** | ✅ | ✅ (Own Vertical) | ✅ (Own Vertical) | ❌ |
| **Mark Live Attendance on Roster** | ✅ | ✅ (Own Vertical) | ✅ (Own Vertical) | ❌ |
| **Member Personal Dashboard & History** | ✅ | ✅ | ✅ | ✅ |

---

## Quick Start Setup

### Prerequisites
- Node.js >= 18 (Tested on v24.12.0)
- MongoDB instance running locally on `mongodb://127.0.0.1:27017` (or MongoDB Atlas URI)

### 1. Backend Server Setup
```bash
cd server
cp .env.example .env
npm install
npm run seed -- --demo
npm run start
```
*The server starts on port `5000` (`http://localhost:5000`).*

### 2. Frontend Client Setup
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
*The client dev server runs on `http://localhost:5173`.*

---

## Default Login Credentials (Seeded)

All demo accounts use the standard seed credentials:

| Role | Email / Identifier | Password | Notes |
|---|---|---|---|
| **Super Admin** | `admin@ecell.org` | `Admin@12345` | Full system access |
| **Technical Secretary** | `technical.sec@ecell.org` | `Password@123` | Vertical Head (Technical) |
| **Technical Lead** | `technical.lead@ecell.org` | `Password@123` | Vertical Head (Technical) |
| **Marketing Secretary** | `marketing.sec@ecell.org` | `Password@123` | Vertical Head (Marketing) |
| **Marketing Lead** | `marketing.lead@ecell.org` | `Password@123` | Vertical Head (Marketing) |
| **Member (Tech 1)** | `member.tech.1@ecell.org` | `Password@123` | Personal Attendance Dashboard |
| **Member (Marketing 1)** | `member.mark.1@ecell.org` | `Password@123` | Personal Attendance Dashboard |

*(Alternatively, login with Member ID, e.g. `ADMIN001`, `SEC002`, `LEAD002`, `EC24101`)*

---

## Running Automated Integration Tests

Run the backend integration test suite verifying the acceptance checklist:
```bash
cd server
npm test
```
Tests verify:
1. Cross-vertical 403 authorization enforcement (Lead A cannot mark Lead B members).
2. Attendance window status enforcement (rejection outside OPEN status).
3. Compound unique index `{ event, member }` preventing duplicates.
4. Attendance percentage logic (filtering CLOSED, non-cancelled events on or after `joinedAt` targeting vertical).
5. Event closing automation: auto-absent generation for unmarked members and low-attendance alert triggers.

---

## Testing Email Alerts Locally

In development, `EMAIL_ENABLED=false` by default. When an event closes or an alert is dispatched, the system uses a **Console Simulator Mode** that prints the formatted email headers, recipient, subject, and plain-text body directly to the server terminal.

To test real SMTP delivery (e.g. via Gmail or Mailtrap):
1. In `server/.env`, set:
   ```env
   EMAIL_ENABLED=true
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_16_digit_app_password
   MAIL_FROM="E-Cell Attendance" <your_email@gmail.com>
   PORTAL_URL=http://localhost:5173
   ```
2. Close an event from the Admin panel or trigger **"Send Alert Now"** from the Admin Email Alerts page.

---

## API Overview (`/api/v1`)

### Authentication
- `POST /auth/login` - Login with identifier (email/memberId) and password. Sets httpOnly cookie.
- `POST /auth/logout` - Clears auth cookie.
- `GET /auth/me` - Get authenticated user profile.
- `POST /auth/change-password` - Update password (clears `mustChangePassword` flag).

### User Management (Admin Only)
- `GET /users` - List users with search, role, vertical, and active status filters.
- `POST /users` - Create single user (optional temporary password, optional welcome email).
- `POST /users/bulk` - Bulk upload users via CSV with per-row validation and error diagnostics.
- `GET /users/:id` - Get user details.
- `PUT /users/:id` - Update user details, role, or vertical assignment.
- `POST /users/:id/reset-password` - Reset user password and generate temporary password.

### Verticals
- `GET /verticals` - List all 8 verticals with member counts and assigned heads.
- `GET /verticals/:id` - Get single vertical.
- `POST /verticals` - Create vertical (Admin only).
- `PUT /verticals/:id` - Update vertical details and assign secretary/leads (Admin only).

### Events
- `GET /events` - List events with session, status, and vertical filters.
- `GET /events/:id` - Get event details.
- `POST /events` - Create and schedule event (Admin only).
- `PUT /events/:id` - Edit event (Admin only).
- `POST /events/:id/open` - Manually open attendance window (Admin only).
- `POST /events/:id/close` - Manually close event, auto-fill absents, evaluate alerts (Admin only).
- `POST /events/:id/reopen` - Reopen attendance window (Admin only).
- `POST /events/:id/cancel` - Cancel event (Admin only).

### Attendance
- `GET /events/:id/roster` - Get member checklist for event (scoped to own vertical for Heads).
- `PUT /events/:id/attendance` - Bulk mark/upsert attendance (Heads & Admin, while OPEN only).
- `GET /attendance` - List all attendance records with filters (Admin only).
- `PATCH /attendance/:id` - Admin override attendance record with mandatory reason (Admin only).

### Analytics
- `GET /analytics/admin/overview` - System-wide KPIs (Admin only).
- `GET /analytics/admin/trends` - Historical attendance trend line data (Admin only).
- `GET /analytics/admin/vertical-comparison` - Cross-vertical comparison chart data (Admin only).
- `GET /analytics/admin/vertical-leaderboard` - Ranked verticals leaderboard (Admin only).
- `GET /analytics/admin/member-leaderboard` - Top members ranked by % and streaks (Admin only).
- `GET /analytics/admin/heatmap` - 2D matrix of members x capped events (Admin only).
- `GET /analytics/admin/at-risk` - List of members below threshold (Admin only).
- `GET /analytics/vertical/summary` - Scoped vertical analytics for Heads.
- `GET /analytics/member/me` - Personal attendance analytics for members.

### Reports & Export (Admin Only)
- `GET /reports/members` - Member-wise attendance report (JSON, or `export=csv|xlsx`).
- `GET /reports/events` - Event-wise attendance report (JSON, or `export=csv|xlsx`).
- `GET /reports/verticals` - Vertical-wise attendance report (JSON, or `export=csv|xlsx`).

### Settings & Audit (Admin Only)
- `GET /settings` & `PUT /settings` - Retrieve & update system thresholds and session defaults.
- `GET /audit-logs` - View system audit trail with before/after state diffs.
- `GET /email-logs` - View email logs.
- `POST /email-logs/send-now` - Trigger alerts for all at-risk members.
- `POST /email-logs/:id/retry` - Retry a failed email log record.

---

## Assumptions & Design Decisions

1. **No Signup Route**: By business design, there is no public registration API or page. All accounts are created and distributed by the Admin.
2. **Attendance States**: Attendance is strictly binary (`PRESENT` and `ABSENT`).
3. **Session Filtering**: Every event is tied to an academic session (default `2024-2025`). All dashboard metrics, reports, and member histories support session filtering.
4. **Atomic Event Transitions**: Event closures use atomic database queries (`findOneAndUpdate({ status: { $ne: 'CLOSED' } })`) so absent-filling and alert dispatch execute exactly once per event.
5. **Reopened Events**: When an event is reopened, existing auto-absent records remain editable during the open window; subsequent closures respect the 7-day alert cooldown period.
6. **Scoped Vertical Head RBAC**: Secretaries and Leads can only read and mark records belonging to their assigned vertical. The server derives the vertical scope from the authenticated session, preventing client tampering.
7. **Email Failure Resilience**: Email delivery errors are caught per recipient, retried up to 3 times, logged to `EmailLog`, and never crash the cron background job.
