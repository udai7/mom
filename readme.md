# Minutes of Meeting (MoM) Platform
## Product Requirements Document & System Design

**Version:** 1.0  
**Author:** Udai Das / Archilect Studio  
**Date:** June 2026  
**Status:** Draft — Phase Planning

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Non-Goals](#3-goals--non-goals)
4. [Stakeholders & User Roles](#4-stakeholders--user-roles)
5. [Organizational Hierarchy Model](#5-organizational-hierarchy-model)
6. [Core Features & Functional Requirements](#6-core-features--functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [User Flows](#8-user-flows)
9. [Data Models](#9-data-models)
10. [API Design](#10-api-design)
11. [System Architecture](#11-system-architecture)
12. [Database Design (PostgreSQL)](#12-database-design-postgresql)
13. [PDF Storage Strategy](#13-pdf-storage-strategy)
14. [Permissions & Visibility Model](#14-permissions--visibility-model)
15. [Phase Plan](#15-phase-plan)
16. [UI/UX Screens Reference](#16-uiux-screens-reference)
17. [Scalability Considerations](#17-scalability-considerations)
18. [Security Considerations](#18-security-considerations)
19. [Open Questions & Future Scope](#19-open-questions--future-scope)

---

## 1. Executive Summary

The **Minutes of Meeting (MoM) Platform** is a hierarchical meeting management and documentation system designed for district-level government offices in India. It allows offices at any level of the administrative hierarchy — from sub-offices up to the District Magistrate (DM) — to schedule meetings, manage guest lists, record outcomes via a rich text editor or PDF upload, schedule follow-up meetings, and automatically propagate meeting summaries upward through the organizational tree.

The platform is built for a maximum of **100 offices** in hierarchy and will be delivered in three phases: React UI, UI refinement, then Django + PostgreSQL backend.

---

## 2. Problem Statement

Government offices in districts conduct hundreds of meetings annually across a multi-layered hierarchy — sub-offices, NIC, DIT, ADM, DM, and other bodies. Currently:

- Meeting summaries are documented informally or not at all.
- There is no standardized way for a sub-office meeting outcome to reach its parent office automatically.
- Scheduling follow-up meetings lacks traceability to the original meeting.
- Guest/participant records are ad hoc and not retrievable.
- Documents (PDFs, reports) are siloed within individual offices without structured access.

This platform solves the above by providing a centralized, hierarchical, structured meeting lifecycle system.

---

## 3. Goals & Non-Goals

### Goals

- Allow any office to create and manage meetings end-to-end.
- Support a guest list with internal (system users) and external (ad hoc) participants.
- Allow meeting summaries to be submitted via rich text editor or PDF upload (or both).
- Automatically make meeting summaries visible to all parent offices up the hierarchy.
- Support scheduling follow-up meetings linked to the original meeting.
- Track action items, conclusions, and achievements per meeting.
- Provide dashboards per office showing their own meetings and meetings from their child offices.
- Support up to 100 offices across the hierarchy with no degradation.

### Non-Goals (v1)

- Real-time video/audio conferencing integration.
- SMS or WhatsApp notifications (future scope).
- Mobile-native apps (PWA only in v1).
- Multi-district support (single district in v1).
- Automated AI summarization of meeting notes (future scope).
- E-signature or digital approval workflows on PDFs.

---

## 4. Stakeholders & User Roles

| Role | Description | Key Capabilities |
|------|-------------|-----------------|
| **Super Admin** | Platform administrator (IT/NIC team) | Manage offices, users, hierarchy, system config |
| **Office Admin** | Head or designated staff of an office | Create/manage meetings, submit summaries, view child reports |
| **Office Member** | Staff of an office | View their office's meetings, participate as attendees |
| **Guest (Internal)** | User from another office invited to a meeting | Receive notification, view meeting they are invited to |
| **Guest (External)** | Named person not in the system (e.g., Chief Minister, external officials) | Listed as attendee; no system access |

---

## 5. Organizational Hierarchy Model

The hierarchy is a **tree** with a single root (DM Office). Each node is an `Office`. An office can have zero or more child offices. There is no fixed depth limit but practically 4–5 levels is expected.

```
DM Office (root)
├── ADM Office
│   ├── Sub-Divisional Office A
│   │   ├── Block Office A1
│   │   └── Block Office A2
│   └── Sub-Divisional Office B
├── NIC Tripura
│   ├── NIC Sub-office 1
│   └── NIC Sub-office 2
├── DIT Tripura
│   ├── e-Governance Cell
│   └── IT Infrastructure Cell
├── SCERT
│   └── Curriculum Division
└── Other Offices...
```

**Rules:**
- An office always has exactly one parent (except root).
- Meeting summaries are visible to all ancestors of the creating office.
- An office can only directly manage meetings it creates.
- A parent office cannot edit a child's meeting — only view it.

---

## 6. Core Features & Functional Requirements

### 6.1 Meeting Creation

- An Office Admin can create a meeting with the following fields:
  - **Title** (required)
  - **Description / Agenda** (rich text, optional)
  - **Scheduled Date & Time** (required)
  - **Location** (text — physical room, address, or "Virtual"; required)
  - **Status**: `DRAFT` → `SCHEDULED` → `IN_PROGRESS` → `COMPLETED` → `CANCELLED`
- A meeting belongs to exactly one office (the creator).

### 6.2 Guest Management

- The admin can add guests from two sources:
  - **Internal Guests**: Search and select users from the system (any office).
  - **External Guests**: Free-text name + optional designation + optional contact email.
- Each guest entry records:
  - `name`, `designation`, `office_name` (for internal guests, pulled from their profile)
  - `attendance_status`: `INVITED` → `CONFIRMED` / `DECLINED` / `ATTENDED` / `ABSENT`
- Guest list can be edited until meeting status reaches `COMPLETED`.
- Total guest count is shown; no cap enforced at the application layer (handle via UX warning if > 50).

### 6.3 Meeting Summary Submission

After a meeting is marked `COMPLETED`, the Office Admin must submit a summary. The summary has three components:

#### a) Rich Text Summary (Editor)
- A full-featured rich text editor (TipTap or Quill).
- Sections prompted by the UI:
  - **Agenda Recap**
  - **Discussion Points**
  - **Conclusions**
  - **Achievements / Outcomes**
  - **Action Items** (structured: task, assignee, due date)
- The editor content is saved as HTML in the database.

#### b) PDF Upload (Optional)
- The admin can upload a PDF (max 20 MB) as the official signed minutes document.
- The PDF binary is stored in PostgreSQL as `bytea` (see Section 13).
- If both rich text and PDF are provided, both are stored and both are visible to parent offices.
- A PDF-only submission is also valid (rich text editor left blank).

#### c) Summary Metadata
- `submitted_at` timestamp
- `submitted_by` (user reference)
- `version` (allows resubmission — each resubmit creates a new version record, old versions archived)

### 6.4 Follow-up Meeting Scheduling

- After submitting a summary, the admin is prompted: **"Schedule a follow-up meeting?"**
- If yes, a new meeting is created with:
  - `parent_meeting_id` linking back to the original meeting.
  - Pre-filled guests from the original meeting (editable).
  - A reference note: "Follow-up to: [original meeting title] — [date]".
- The chain of meetings (original → follow-up → follow-up of follow-up) forms a **meeting thread**, visible as a timeline on the meeting detail page.

### 6.5 Visibility to Parent Offices

- When a summary is submitted and the meeting marked `COMPLETED`, it becomes automatically visible to all ancestor offices.
- Parent offices see a **read-only** view of the meeting.
- This is enforced by the `office_ancestors` pre-computed table (see Section 12).

### 6.6 Dashboards

**Office Dashboard (own office):**
- Upcoming meetings (next 7 days)
- Recent completed meetings with summary status
- Pending summaries (completed meetings without a submitted summary)
- Quick stats: total meetings this month, total action items open

**Hierarchy View (for admins with children):**
- List of all child and descendant offices
- Per office: # meetings this month, last meeting date, # pending summaries
- Filterable by time range

**Meeting Detail Page:**
- Full meeting info, guest list with attendance status
- Rich text summary rendered
- PDF download button (if uploaded)
- Follow-up meeting chain / thread
- Action items table

---

## 7. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| **Availability** | 99.5% uptime during office hours (9am–6pm IST) |
| **Response Time** | Page loads < 2s; PDF upload < 10s for 20MB |
| **Scalability** | Support up to 100 offices, ~1000 users, ~10,000 meetings/year |
| **PDF Storage** | All PDFs stored in PostgreSQL; no external blob storage dependency |
| **Concurrent Users** | Up to 200 concurrent sessions without degradation |
| **Accessibility** | WCAG 2.1 AA minimum |
| **Browser Support** | Chrome 110+, Firefox 110+, Edge 110+ |
| **Data Retention** | Meeting records retained indefinitely; PDFs retained minimum 7 years |
| **Audit Trail** | All writes (create/update/delete) logged with user + timestamp |

---

## 8. User Flows

### Flow 1: Create and Complete a Meeting

```
Office Admin logs in
  → Dashboard: clicks "New Meeting"
  → Fills: Title, Agenda, Date/Time, Location
  → Saves as DRAFT or publishes as SCHEDULED
  → Adds guests (internal search + external free-text)
  → On meeting day: marks meeting as IN_PROGRESS (optional) then COMPLETED
  → Summary form appears:
      → Writes rich text summary (or skips)
      → Uploads PDF (optional)
      → Fills Action Items table
  → Clicks "Submit Summary"
  → System: saves summary, marks meeting COMPLETED
  → System: makes meeting visible to all ancestor offices
  → Prompt: "Would you like to schedule a follow-up meeting?"
      → Yes → Pre-filled new meeting form
      → No  → Returns to dashboard
```

### Flow 2: Parent Office Viewing Child Meeting

```
DM Office Admin logs in
  → Dashboard: "Hierarchy Meetings" tab
  → Sees meetings from NIC, DIT, ADM, and all descendants
  → Clicks on NIC Sub-office 1 → NIC Internal Meeting #12
  → Read-only view: agenda, guest list, summary, action items
  → Can download attached PDF
  → Can see follow-up meeting chain
```

### Flow 3: Super Admin Sets Up Hierarchy

```
Super Admin logs in
  → Admin Panel → Offices
  → Creates root office: DM Office
  → Creates child offices: NIC, DIT, ADM (parent = DM Office)
  → Creates sub-offices under NIC: NIC Sub-office 1, 2 (parent = NIC)
  → Assigns users to offices with roles (Admin / Member)
  → System pre-computes office_ancestors table
```

---

## 9. Data Models

### Office

```
Office {
  id: UUID (PK)
  name: String
  code: String (unique, e.g., "NIC-TRP-01")
  parent_id: UUID → Office (nullable; null = root)
  office_type: Enum [DM, ADM, NIC, DIT, SCERT, BLOCK, OTHER]
  address: Text
  contact_email: String
  is_active: Boolean
  created_at: Timestamp
}
```

### User

```
User {
  id: UUID (PK)
  name: String
  email: String (unique)
  phone: String
  designation: String
  office_id: UUID → Office
  role: Enum [SUPER_ADMIN, OFFICE_ADMIN, OFFICE_MEMBER]
  is_active: Boolean
  last_login: Timestamp
  created_at: Timestamp
}
```

### Meeting

```
Meeting {
  id: UUID (PK)
  office_id: UUID → Office
  title: String
  agenda: Text (rich HTML, optional)
  scheduled_at: Timestamp
  location: String
  status: Enum [DRAFT, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED]
  parent_meeting_id: UUID → Meeting (nullable; for follow-ups)
  created_by: UUID → User
  created_at: Timestamp
  updated_at: Timestamp
}
```

### MeetingGuest

```
MeetingGuest {
  id: UUID (PK)
  meeting_id: UUID → Meeting
  guest_type: Enum [INTERNAL, EXTERNAL]
  user_id: UUID → User (nullable; only for INTERNAL)
  name: String  (always filled — for internal, mirrored from user)
  designation: String
  office_name: String
  contact_email: String (optional)
  attendance_status: Enum [INVITED, CONFIRMED, DECLINED, ATTENDED, ABSENT]
  added_at: Timestamp
}
```

### MeetingSummary

```
MeetingSummary {
  id: UUID (PK)
  meeting_id: UUID → Meeting
  version: Integer (default 1; increments on resubmission)
  rich_text_content: Text (HTML, nullable)
  pdf_data: bytea (nullable)
  pdf_filename: String (nullable)
  pdf_size_bytes: Integer (nullable)
  pdf_uploaded_at: Timestamp (nullable)
  submitted_by: UUID → User
  submitted_at: Timestamp
  is_latest: Boolean (true for most recent version)
}
```

### ActionItem

```
ActionItem {
  id: UUID (PK)
  meeting_id: UUID → Meeting
  summary_id: UUID → MeetingSummary
  description: Text
  assigned_to_name: String (free text; may or may not be a system user)
  assigned_to_user_id: UUID → User (nullable)
  due_date: Date
  status: Enum [OPEN, IN_PROGRESS, DONE, DROPPED]
  created_at: Timestamp
  updated_at: Timestamp
}
```

### OfficeAncestor (Pre-computed closure table)

```
OfficeAncestor {
  office_id: UUID → Office   (PK part 1)
  ancestor_id: UUID → Office (PK part 2)
  depth: Integer  (1 = direct parent, 2 = grandparent, etc.)
}
```

This table is recomputed whenever the office hierarchy changes. It enables O(1) ancestor visibility queries.

### AuditLog

```
AuditLog {
  id: UUID (PK)
  actor_id: UUID → User
  action: String  (e.g., "meeting.create", "summary.submit", "meeting.cancel")
  entity_type: String (e.g., "Meeting", "MeetingSummary")
  entity_id: UUID
  metadata: JSONB (diff or payload snapshot)
  ip_address: String
  created_at: Timestamp
}
```

---

## 10. API Design

All endpoints follow REST conventions. Base path: `/api/v1/`

Authentication: JWT Bearer token.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Email + password login, returns JWT |
| POST | `/auth/refresh` | Refresh JWT |
| POST | `/auth/logout` | Invalidate token |

### Offices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/offices` | List all offices (tree structure) |
| POST | `/offices` | Create office (Super Admin) |
| GET | `/offices/{id}` | Get office detail |
| PATCH | `/offices/{id}` | Update office |
| GET | `/offices/{id}/children` | List direct children |
| GET | `/offices/{id}/descendants` | List all descendants |
| GET | `/offices/{id}/meetings` | Meetings visible to this office (own + descendants) |

### Meetings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/meetings` | List meetings for current user's office |
| POST | `/meetings` | Create meeting |
| GET | `/meetings/{id}` | Get meeting detail |
| PATCH | `/meetings/{id}` | Update meeting |
| DELETE | `/meetings/{id}` | Cancel meeting (soft delete) |
| PATCH | `/meetings/{id}/status` | Transition meeting status |
| GET | `/meetings/{id}/thread` | Get full follow-up chain |

### Meeting Guests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/meetings/{id}/guests` | List guests |
| POST | `/meetings/{id}/guests` | Add guest |
| PATCH | `/meetings/{id}/guests/{guestId}` | Update attendance status |
| DELETE | `/meetings/{id}/guests/{guestId}` | Remove guest |

### Summaries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/meetings/{id}/summary` | Get latest summary |
| POST | `/meetings/{id}/summary` | Submit summary (rich text + optional PDF) |
| GET | `/meetings/{id}/summary/versions` | List all versions |
| GET | `/meetings/{id}/summary/{version}/pdf` | Download PDF for a version |

### Action Items

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/meetings/{id}/actions` | List action items |
| POST | `/meetings/{id}/actions` | Create action item |
| PATCH | `/meetings/{id}/actions/{actionId}` | Update status |
| DELETE | `/meetings/{id}/actions/{actionId}` | Delete action item |

### Users (Super Admin only for write)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List users (filterable by office) |
| POST | `/users` | Create user |
| PATCH | `/users/{id}` | Update user |
| GET | `/users/search?q=name` | Search users (for guest autocomplete) |

---

## 11. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│                                                             │
│   React (Next.js or Vite) SPA                               │
│   TipTap Rich Text Editor                                   │
│   React Query (server state)                                │
│   Tailwind CSS + shadcn/ui                                  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────────┐
│                       API LAYER                             │
│                                                             │
│   Django REST Framework (DRF)                               │
│   djangorestframework-simplejwt (auth)                      │
│   Gunicorn WSGI server                                      │
│   Nginx reverse proxy                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    SERVICE LAYER                             │
│                                                             │
│   MeetingService     — lifecycle transitions, validations   │
│   SummaryService     — PDF ingest, versioning               │
│   VisibilityService  — ancestor resolution                  │
│   NotificationService— email dispatch (optional)           │
│   AuditService       — write audit log on every mutation   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    DATA LAYER                               │
│                                                             │
│   PostgreSQL 16                                             │
│   ├── All application tables                                │
│   ├── PDF binaries (bytea in meeting_summaries)             │
│   └── Full-text search via pg_trgm on titles/content        │
│                                                             │
│   Redis (optional in Phase 3)                               │
│   └── JWT denylist, session cache, rate limiting            │
└─────────────────────────────────────────────────────────────┘
```

**Deployment (single VPS, Coolify-managed):**

```
VPS (4 vCPU / 8GB RAM recommended)
├── Nginx (reverse proxy + TLS termination)
├── Django app container (Gunicorn, 4 workers)
├── PostgreSQL container (persistent volume)
├── Redis container (optional)
└── Static files served by Nginx
```

---

## 12. Database Design (PostgreSQL)

### Key Design Decisions

1. **UUIDs** for all PKs — no sequential integer IDs exposed via API.
2. **Closure table** (`office_ancestors`) for efficient ancestor queries without recursive CTEs on every request.
3. **JSONB** on `audit_log.metadata` for flexible diff storage.
4. **`bytea`** for PDF storage — see Section 13.
5. **`is_latest` flag** on `meeting_summaries` for fast "get current summary" queries.

### Critical Indexes

```sql
-- Meeting lookups by office
CREATE INDEX idx_meetings_office_id ON meetings(office_id);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_scheduled_at ON meetings(scheduled_at DESC);

-- Guest lookups
CREATE INDEX idx_meeting_guests_meeting_id ON meeting_guests(meeting_id);
CREATE INDEX idx_meeting_guests_user_id ON meeting_guests(user_id);

-- Visibility (ancestor resolution)
CREATE INDEX idx_office_ancestors_office_id ON office_ancestors(office_id);
CREATE INDEX idx_office_ancestors_ancestor_id ON office_ancestors(ancestor_id);

-- Summary latest version
CREATE INDEX idx_summaries_meeting_latest ON meeting_summaries(meeting_id, is_latest);

-- Full text search on meeting title
CREATE INDEX idx_meetings_title_trgm ON meetings USING gin(title gin_trgm_ops);

-- Audit log
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_actor ON audit_log(actor_id, created_at DESC);
```

### Office Ancestor Population (trigger or service call)

Whenever an office is created or re-parented, the `office_ancestors` table is recomputed for that branch:

```sql
-- Insert self-reference at depth 0, then all ancestors
INSERT INTO office_ancestors (office_id, ancestor_id, depth)
WITH RECURSIVE tree AS (
  SELECT id AS office_id, parent_id AS ancestor_id, 1 AS depth
  FROM offices WHERE id = :new_office_id AND parent_id IS NOT NULL
  UNION ALL
  SELECT tree.office_id, o.parent_id, tree.depth + 1
  FROM tree
  JOIN offices o ON o.id = tree.ancestor_id
  WHERE o.parent_id IS NOT NULL
)
SELECT * FROM tree;
```

---

## 13. PDF Storage Strategy

### Why PostgreSQL `bytea`?

For this deployment context (single VPS, government office, ≤100 offices, no S3 dependency):

- **Simplicity**: No external blob service to configure, manage, or pay for.
- **ACID guarantees**: PDF and metadata are committed atomically.
- **Backup**: A single `pg_dump` backs up everything including files.
- **Access control**: File access is controlled by the same DB session as the metadata.

### Practical Limits

- Max PDF size enforced: **20 MB** per upload (enforced at Django layer with `MAX_UPLOAD_SIZE` setting and at Nginx with `client_max_body_size 25m`).
- Expected annual PDF volume: 100 offices × ~100 meetings/year × avg 2 MB = ~20 GB/year. PostgreSQL handles this comfortably on a well-provisioned VPS.
- If growth exceeds 50 GB total, the migration path is to swap `bytea` for a `file_path` reference to Minio/S3 with minimal schema change (same API contract).

### PDF Upload Endpoint

- Multipart form upload: `POST /meetings/{id}/summary`
- Fields: `rich_text_content` (string), `pdf` (file, optional)
- Django validates: file type must be `application/pdf`, size ≤ 20 MB.
- Stored: `meeting_summaries.pdf_data = bytea`, `pdf_filename`, `pdf_size_bytes`, `pdf_uploaded_at`.

### PDF Download Endpoint

- `GET /meetings/{id}/summary/{version}/pdf`
- Django streams the `bytea` field as `application/pdf` with `Content-Disposition: attachment`.
- Authorization: only accessible to the owning office or any ancestor office.

---

## 14. Permissions & Visibility Model

### Permission Matrix

| Action | Super Admin | Office Admin (own office) | Office Admin (ancestor) | Office Member |
|--------|:-----------:|:-------------------------:|:-----------------------:|:-------------:|
| Create meeting | ✅ | ✅ | ✅ | ❌ |
| Edit meeting (own) | ✅ | ✅ | ❌ | ❌ |
| Cancel meeting | ✅ | ✅ | ❌ | ❌ |
| Add guests | ✅ | ✅ | ❌ | ❌ |
| Submit summary | ✅ | ✅ | ❌ | ❌ |
| View meeting (own office) | ✅ | ✅ | ✅ | ✅ |
| View meeting (descendant) | ✅ | ✅ (ancestors only) | ✅ | ❌ |
| Download PDF (own) | ✅ | ✅ | ✅ | ✅ |
| Download PDF (descendant) | ✅ | ✅ | ✅ | ❌ |
| Manage offices / users | ✅ | ❌ | ❌ | ❌ |

### Visibility Rule Implementation (Django)

```python
def get_visible_meetings(user):
    office = user.office
    # Get all descendant office IDs that are ancestors of the current office
    # i.e., meetings from any office whose ancestor_id = current office id
    ancestor_office_ids = OfficeAncestor.objects.filter(
        ancestor_id=office.id
    ).values_list('office_id', flat=True)

    visible_office_ids = list(ancestor_office_ids) + [office.id]

    return Meeting.objects.filter(
        office_id__in=visible_office_ids,
        status='COMPLETED'  # only completed meetings propagate up
    ).order_by('-scheduled_at')
```

---

## 15. Phase Plan

### Phase 1: React UI (Weeks 1–6)

**Goal:** Fully functional static frontend with mock data. No backend.

**Deliverables:**
- Project scaffold: Vite + React + TypeScript + Tailwind + shadcn/ui
- Mock data layer using `msw` (Mock Service Worker) or static JSON
- All screens listed in Section 16 implemented
- TipTap rich text editor integration
- PDF upload component (client-side only, no actual upload)
- Role-based UI rendering (mock role toggle)
- Responsive layout (desktop-first, tablet support)
- Component library documented

**Key Screens:**
- Login
- Dashboard (Office view + Hierarchy view)
- Meeting List
- Meeting Create / Edit
- Meeting Detail (with guest list)
- Summary Submission (editor + PDF upload)
- Action Items tracker
- Admin: Office Tree management
- Admin: User management

---

### Phase 2: UI Update with Feedback (Weeks 7–10)

**Goal:** Incorporate stakeholder feedback from Phase 1 demo. Refine UX.

**Deliverables:**
- Feedback collection session with NIC / DIT / office staff (actual users)
- UX refinements per feedback: navigation, terminology, workflow order
- Accessibility audit (WCAG 2.1 AA)
- Loading states, error states, empty states for all screens
- PDF viewer component (react-pdf) embedded in meeting detail
- Print-friendly view for meeting summaries
- Mobile-responsive improvements
- Finalized component library

---

### Phase 3: Backend Development (Weeks 11–22)

**Goal:** Full production-ready backend replacing all mocks.

**Deliverables:**

*Week 11–12: Setup & Auth*
- Django project scaffold with DRF
- PostgreSQL setup, migrations for all models
- JWT auth (`djangorestframework-simplejwt`)
- Super Admin office + user management APIs

*Week 13–14: Hierarchy & Office APIs*
- Office CRUD
- `office_ancestors` closure table with auto-population signal
- Hierarchy tree API

*Week 15–16: Meeting APIs*
- Meeting CRUD
- Status transition validation (state machine)
- Guest management APIs

*Week 17–18: Summary & PDF APIs*
- Summary submission (rich text + PDF ingest to bytea)
- PDF streaming download
- Summary versioning

*Week 19: Action Items + Visibility*
- Action items CRUD
- Visibility enforcement middleware
- Hierarchy dashboard APIs

*Week 20: Audit Logging + Security*
- AuditLog writes on all mutations
- Rate limiting
- Input sanitization (bleach for rich text HTML)

*Week 21: Integration & Testing*
- Connect React frontend to live API (swap MSW for real calls)
- E2E tests (Playwright) for critical flows
- Unit tests for service layer

*Week 22: Deployment & Handoff*
- Coolify deployment configuration
- Nginx config with TLS
- Database backup schedule (pg_dump cron)
- Admin documentation + user guide

---

## 16. UI/UX Screens Reference

### Screen 1: Login
- Email + password
- Office name shown on login card
- Forgot password link

### Screen 2: Dashboard
- **My Office** tab:
  - Upcoming meetings card (next 7 days)
  - Recent completed meetings
  - Pending summaries alert
  - Quick stat chips: meetings this month, open action items
- **Hierarchy** tab (admin only):
  - Tree view of child offices with meeting activity indicators
  - Table: office name, last meeting, meetings this month, pending summaries

### Screen 3: Meeting List
- Tabbed by status: All / Upcoming / Completed / Cancelled
- Search bar (title search)
- Filter by date range
- Meeting card: title, date, location, guest count, status badge

### Screen 4: Create / Edit Meeting
- Form: Title, Agenda (rich text), Date+Time picker, Location
- Save as Draft / Schedule buttons
- Guest section: internal user search autocomplete + external guest form

### Screen 5: Meeting Detail
- Header: title, date, location, status badge, office badge
- Tabs: **Overview** | **Guests** | **Summary** | **Action Items** | **Follow-ups**
- Overview: agenda
- Guests: table with name, designation, office, attendance status (editable until completed)
- Summary: rendered rich text + PDF download button (if uploaded)
- Action Items: table with task, assignee, due date, status pill
- Follow-ups: timeline of parent/child meetings in the thread

### Screen 6: Summary Submission
- Step 1: Rich text editor (TipTap) with section prompts (Agenda Recap, Discussion, Conclusions, Achievements)
- Step 2: Action Items — add/remove rows (task, assignee, due date)
- Step 3: PDF Upload — drag-and-drop area with preview thumbnail, replace/remove option
- Submit button → confirmation dialog
- Post-submit: "Schedule follow-up?" prompt

### Screen 7: Admin — Office Management
- Office tree visualizer (collapsible)
- Add office form with parent selector
- Edit / deactivate office

### Screen 8: Admin — User Management
- Users table: name, email, office, role, status
- Create user form
- Assign office / role

---

## 17. Scalability Considerations

### For 100 Offices

- **Query volume**: 100 offices × 10 active users = 1,000 users max. At peak, maybe 200 concurrent. Single Gunicorn instance with 4 workers handles this.
- **Meeting volume**: 10,000 meetings/year, ~50K guest records, ~10K summaries. These are trivially small PostgreSQL datasets.
- **PDF storage**: ~20 GB/year. A 500GB VPS volume handles 25 years of data.
- **Closure table** (`office_ancestors`): 100 offices, max depth ~5, max rows = 100 × 5 = 500. O(1) ancestor queries.
- **No horizontal scaling needed** for this scale. Single VPS is appropriate.

### Future Scale Path (if needed)

If the platform expands to multi-district or hundreds of offices:
1. Swap `bytea` for Minio (S3-compatible) — 1 day migration.
2. Add read replica for dashboards.
3. Extract PDF serving to a dedicated media service.
4. Add Celery + Redis for async tasks (email notifications, report generation).

---

## 18. Security Considerations

### Authentication & Sessions
- JWT with 24-hour access token + 7-day refresh token.
- Token denylist in Redis (or DB table) for logout invalidation.
- Brute-force protection: 5 failed logins → 15-minute lockout.

### Authorization
- All API endpoints enforce office-based RBAC.
- Object-level permissions: users can only read/write resources belonging to their office or descendants.
- Ancestor visibility enforced server-side — never trusted from client.

### Input Sanitization
- Rich text HTML sanitized with `bleach` (Python) on ingest — whitelist of allowed tags (p, h1-h4, ul, ol, li, b, i, a, table, etc.).
- PDF uploads: MIME type validated server-side (not just file extension).

### Data at Rest
- PostgreSQL connection over TLS (even on localhost for defense in depth).
- VPS disk encryption at the infrastructure level (Hetzner/DigitalOcean encrypted volumes).

### Data in Transit
- All traffic over HTTPS (Let's Encrypt via Coolify/Caddy).
- HSTS enabled.

### Audit
- Every create, update, delete, and status transition logged to `audit_log`.
- Audit logs are append-only (no update/delete permissions on the table for the app DB user).

---

## 19. Open Questions & Future Scope

### Open Questions

1. **Notification system**: Should guests receive email notifications when added to a meeting? This requires an SMTP configuration decision. Recommend: optional in Phase 3.
2. **External guest notifications**: Chief Minister's office or other external guests — do they need any system access or email delivery?
3. **Summary approval workflow**: Should a parent office be able to "acknowledge" or "approve" a submitted summary? This adds an approval state to the summary model.
4. **Offline support**: Field officers in block offices may have intermittent connectivity. Does the platform need offline-first PWA capabilities?
5. **Multi-language**: Should the platform support Bengali (primary regional language of Tripura) in addition to English?

### Future Scope (Post v1)

- **AI Meeting Summarizer**: Paste meeting notes → Claude/GPT generates structured summary draft.
- **WhatsApp notifications** via the WhatsApp Business API for meeting reminders.
- **Action item tracking dashboard** across all offices (cross-cutting view for DM office).
- **Analytics**: Meeting frequency heatmaps, action item completion rates, office engagement scores.
- **Mobile app** (Flutter) with offline support for field office use.
- **Digital signature** on submitted PDFs using a government-approved PKI.
- **Multi-district** expansion with a new root level above DM.
- **Calendar integration** (Google Calendar / Outlook) for meeting scheduling sync.

---

*End of Document*

---

**Document maintained by:** Archilect Studio  
**Next review:** After Phase 1 demo with stakeholders