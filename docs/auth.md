# Auth And Account Architecture

## Goal

Build FastAPI + PostgreSQL authentication for a hierarchy-driven MoM system. The auth system must support:

- A central platform `SUPER_ADMIN` who can see every DM account, office account, user account, hierarchy record, status, and audit event.
- A DM-level admin account that owns one district hierarchy root.
- Office admin accounts under the DM, such as NIC, DIT, SCERT, TRML, and nested sub-offices.
- Parent approval before a newly registered child office account becomes active.
- Auto-generated unique office codes based on the selected parent hierarchy.
- Password login only for now. No OTP, no two-factor authentication.

The current frontend mock personas should become real accounts. The `Parent Office` view is not a separate role; it is derived from hierarchy. If a user's office has child offices, they can see permitted child-office information.

## Core Hierarchy

The account tree has four practical levels:

1. Central superadmin
   - Platform-level authority.
   - Not under any DM.
   - Can monitor and manage every account and hierarchy.

2. DM account
   - District root account.
   - Example generated code: `dm-001`.
   - Created directly under central superadmin control.
   - Can approve or reject first-level offices under that DM.

3. Offices under DM
   - Example: NIC under DM.
   - Example generated code: `dm-nic-001`.
   - The user selects parent as the DM account and enters office/account details.
   - The parent DM receives the registration request and must approve it.

4. Sub-offices under offices
   - Example: a sub-office under NIC.
   - Example generated code: `dm-nic-network-001` or `dm-nic-xxx-001`.
   - The user selects parent from existing offices under the DM, such as NIC.
   - The selected parent office receives the registration request and must approve it.

NIC monitoring requirement:

- NIC can monitor office and account creation activity within its permitted hierarchy.
- If NIC is a normal office under DM, it monitors its descendants.
- If NIC must monitor the whole DM hierarchy, assign designated NIC users a scoped permission such as `HIERARCHY_MONITOR` for that DM.

## Roles

Use a small role set and derive visibility from hierarchy.

- `SUPER_ADMIN`
  - Central system operator.
  - Can view all accounts and all offices.
  - Can block, deactivate, reactivate, and reset/change passwords.
  - Can approve or override any account request.
  - Can edit hierarchy metadata if needed.

- `DM_ADMIN`
  - Admin of one DM root office.
  - Can view all offices and accounts under their DM.
  - Can approve first-level child office accounts.
  - Can deactivate or block accounts under their DM, except central superadmins.
  - Can reset passwords for users under their DM if policy allows.

- `OFFICE_ADMIN`
  - Admin of one office or sub-office.
  - Can manage meetings for their office.
  - Can view approved descendant offices.
  - Can approve direct child office registration requests.
  - Can view account details for direct descendants or full descendants depending on policy.

- `OFFICE_MEMBER`
  - Normal staff account attached to an approved office.
  - Can view assigned or visible meetings and action items.
  - Cannot approve office registrations.

Optional permission flags:

- `HIERARCHY_MONITOR`: view registration and account status across a DM hierarchy without approval authority.
- `PASSWORD_MANAGER`: reset passwords inside assigned scope.
- `ACCOUNT_STATUS_MANAGER`: block, deactivate, or reactivate accounts inside assigned scope.

## Account Status Model

Separate login status from approval status.

Approval status:

- `PENDING_PARENT_APPROVAL`
- `APPROVED`
- `REJECTED`

User status:

- `ACTIVE`
- `INACTIVE`
- `BLOCKED`

Rules:

- New office registrations start as `PENDING_PARENT_APPROVAL`.
- Pending accounts cannot log in.
- Rejected accounts cannot log in.
- Approved accounts can log in only when `user.status = ACTIVE` and `office.is_active = true`.
- Blocked users cannot log in until unblocked by an authorized parent or superadmin.
- Deactivated users cannot log in but remain in audit/history.

## Registration Rules

### DM Account Creation

DM account creation is controlled by the central superadmin.

Flow:

1. Central superadmin opens "Create DM Account".
2. Enters DM office details and account holder details.
3. System generates a code like `dm-001`.
4. System creates the DM office and DM admin user as active, or pending if manual verification is desired.

Required office details:

- DM/district name
- State
- District
- Office display name
- Official office email
- Official phone number
- Office address
- Office type: `DM`

Required account holder details:

- Full name
- Designation
- Official email
- Mobile number
- Password
- Optional employee/government ID

### Office Under DM Creation

Flow:

1. User chooses parent as a DM account, for example `dm-001`.
2. User enters office details and account holder details.
3. System generates a code like `dm-nic-001`.
4. Registration is sent to the parent DM admin.
5. Parent DM approves or rejects.
6. On approval, account becomes active.

Required parent selection:

- Parent office id/code
- Parent must be an approved active DM office.

Required office details:

- Office name, such as NIC Tripura
- Office short code/slug input, such as `nic`
- Office type, such as `NIC`, `DIT`, `SCERT`, `TRML`, `ADM`, `OTHER`
- Official office email
- Official phone number
- Office address
- Department/category
- Optional website

Required account holder details:

- Full name
- Designation
- Official email
- Mobile number
- Password
- Optional employee/government ID

### Sub-Office Creation

Flow:

1. User chooses the DM hierarchy first.
2. User chooses parent office under that DM, such as NIC.
3. User enters sub-office and account holder details.
4. System generates a code like `dm-nic-network-001`.
5. Registration is sent to the selected parent office.
6. Parent office approves or rejects.
7. On approval, account becomes active.

Rules:

- Parent must be active and approved.
- A child office cannot become active before its parent is active.
- Parent office receives notification and can view all submitted details before approval.
- Central superadmin can override approval if needed.

## Office Code Generation

Codes are generated after office details are submitted and parent is selected.

Code pattern:

- DM root: `{dm_slug}-{sequence}`
- Child office: `{parent_code}-{office_slug}-{sequence}`
- Sub-office: `{parent_code}-{office_slug}-{sequence}`

Examples:

- `dm-001`
- `dm-nic-001`
- `dm-nic-network-001`
- `dm-nic-network-support-001`

Generation rules:

- Convert office short code to lowercase slug.
- Allow only `a-z`, `0-9`, and hyphen.
- Collapse repeated hyphens.
- Sequence is scoped to the same parent and slug.
- Use a database transaction and uniqueness constraint to prevent duplicate codes.
- Final code must be immutable after approval unless central superadmin performs a controlled migration.

Recommended implementation:

1. User submits `office_slug`.
2. Backend normalizes it.
3. Backend locks code-generation row or queries current max sequence inside a transaction.
4. Backend creates the next code.
5. Backend saves `code`, `code_slug`, and `code_sequence`.

## Backend Skeleton

```text
backend/
  app/
    main.py
    core/
      config.py
      database.py
      security.py
    auth/
      router.py
      schemas.py
      service.py
      dependencies.py
    accounts/
      router.py
      schemas.py
      service.py
    offices/
      models.py
      router.py
      schemas.py
      service.py
      codegen.py
    approvals/
      router.py
      schemas.py
      service.py
    audit/
      models.py
      service.py
  alembic/
  pyproject.toml
  alembic.ini
```

Use:

- FastAPI
- SQLAlchemy 2.x async ORM
- asyncpg
- Alembic
- Pydantic Settings
- PyJWT or python-jose
- passlib with bcrypt or argon2

## Database Tables

### `offices`

Stores each DM, office, and sub-office node.

Columns:

- `id uuid primary key`
- `parent_id uuid null references offices(id)`
- `dm_root_id uuid null references offices(id)`
- `name text not null`
- `code text unique not null`
- `code_slug text not null`
- `code_sequence integer not null`
- `type text not null`
- `department text null`
- `official_email citext not null`
- `official_phone text not null`
- `address_line_1 text not null`
- `address_line_2 text null`
- `city text null`
- `district text not null`
- `state text not null`
- `pincode text null`
- `website text null`
- `approval_status text not null`
- `approved_by_user_id uuid null references users(id)`
- `approved_at timestamptz null`
- `rejected_by_user_id uuid null references users(id)`
- `rejected_at timestamptz null`
- `rejection_reason text null`
- `is_active boolean not null default false`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Indexes:

- unique `code`
- unique `(parent_id, code_slug, code_sequence)`
- index `parent_id`
- index `dm_root_id`
- index `approval_status`

### `users`

Stores account holders and future staff users.

Columns:

- `id uuid primary key`
- `office_id uuid null references offices(id)`
- `full_name text not null`
- `designation text not null`
- `email citext unique not null`
- `mobile_number text not null`
- `employee_id text null`
- `password_hash text not null`
- `role text not null`
- `status text not null default 'INACTIVE'`
- `must_change_password boolean not null default false`
- `password_changed_at timestamptz null`
- `last_login_at timestamptz null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Rules:

- Central superadmin may have `office_id = null`.
- DM admin must belong to a DM office.
- Office admins and members must belong to an approved office.

### `account_registration_requests`

Stores the submitted account creation request and approval workflow.

Columns:

- `id uuid primary key`
- `office_id uuid not null references offices(id)`
- `primary_user_id uuid not null references users(id)`
- `parent_office_id uuid null references offices(id)`
- `requested_role text not null`
- `status text not null`
- `submitted_payload jsonb not null`
- `submitted_at timestamptz not null`
- `reviewed_by_user_id uuid null references users(id)`
- `reviewed_at timestamptz null`
- `review_note text null`

Status enum:

- `PENDING`
- `APPROVED`
- `REJECTED`
- `CANCELLED`

### `office_ancestors`

Precomputed hierarchy closure for fast permission checks.

Columns:

- `ancestor_office_id uuid not null references offices(id)`
- `descendant_office_id uuid not null references offices(id)`
- `depth integer not null`

Primary key:

- `(ancestor_office_id, descendant_office_id)`

Rules:

- Each office should include a self-row with `depth = 0`.
- When creating a child office, copy parent ancestors and add the child.

### `refresh_tokens`

Columns:

- `id uuid primary key`
- `user_id uuid not null references users(id)`
- `token_hash text unique not null`
- `expires_at timestamptz not null`
- `revoked_at timestamptz null`
- `created_at timestamptz not null`
- `created_ip inet null`
- `user_agent text null`

### `audit_events`

Columns:

- `id uuid primary key`
- `actor_user_id uuid null references users(id)`
- `event_type text not null`
- `entity_type text not null`
- `entity_id uuid null`
- `metadata jsonb not null default '{}'`
- `created_at timestamptz not null`
- `ip_address inet null`

Important event types:

- `AUTH_LOGIN_SUCCESS`
- `AUTH_LOGIN_FAILED`
- `AUTH_REFRESH`
- `AUTH_LOGOUT`
- `REGISTRATION_SUBMITTED`
- `REGISTRATION_APPROVED`
- `REGISTRATION_REJECTED`
- `OFFICE_CREATED`
- `OFFICE_ACTIVATED`
- `OFFICE_DEACTIVATED`
- `USER_CREATED`
- `USER_BLOCKED`
- `USER_UNBLOCKED`
- `USER_DEACTIVATED`
- `USER_REACTIVATED`
- `USER_PASSWORD_CHANGED`
- `USER_PASSWORD_RESET_BY_ADMIN`

## Password And Login Policy

For v1:

- Email + password login only.
- No OTP.
- No 2FA.
- Minimum 10 characters.
- Require at least one letter and one number.
- Hash with bcrypt or argon2.
- Never return password hashes from any API.
- Block login for pending, rejected, inactive, blocked, or deactivated accounts.
- Central superadmin can reset any password.
- DM admin can reset passwords inside their DM hierarchy if granted `PASSWORD_MANAGER`.
- Office admin can reset passwords only for direct child accounts if granted `PASSWORD_MANAGER`.

## Token Model

Use short-lived access tokens and revocable refresh tokens.

Access token claims:

```json
{
  "sub": "user_uuid",
  "email": "maya.nic@gov.in",
  "role": "OFFICE_ADMIN",
  "office_id": "office_uuid",
  "office_code": "dm-nic-001",
  "dm_root_id": "dm_office_uuid",
  "type": "access",
  "exp": 1234567890
}
```

Refresh token claims:

```json
{
  "sub": "user_uuid",
  "jti": "refresh_token_uuid",
  "type": "refresh",
  "exp": 1234567890
}
```

Hash refresh tokens before storing them in PostgreSQL.

## Auth Endpoints

### `POST /auth/login`

Request:

```json
{
  "email": "maya.nic@gov.in",
  "password": "nic@tripura2026"
}
```

Rules:

- Reject invalid credentials with a generic error.
- Reject pending approval accounts.
- Reject inactive or blocked users.
- Reject users whose office is inactive.
- Update `last_login_at`.
- Write audit event on success and failure.

### `POST /auth/refresh`

Rules:

- Rotate refresh tokens.
- Revoke old refresh token after successful rotation.
- Reject expired or revoked refresh tokens.

### `POST /auth/logout`

Rules:

- Revoke submitted refresh token.
- Client removes tokens.

### `GET /auth/me`

Response should include:

- user id
- full name
- designation
- email
- mobile number
- role
- status
- office id/code/name/type
- DM root id/code
- approval status
- permissions
- whether the office has children

The frontend should use this endpoint to replace `mom_role`, hardcoded profiles, and fake persona selection.

### `POST /auth/change-password`

Rules:

- Requires authenticated user.
- Validate current password.
- Enforce password policy.
- Update password hash.
- Clear `must_change_password`.
- Audit the change.

## Registration And Account Endpoints

### `POST /registrations/dm`

Creates a DM office and DM admin account.

Access:

- `SUPER_ADMIN` only for the production flow.

Behavior:

- Generate code like `dm-001`.
- Create office with `type = DM`.
- Create primary user with `role = DM_ADMIN`.
- Activate immediately or set pending central review based on deployment policy.

### `POST /registrations/offices`

Creates an office or sub-office registration request.

Request includes:

- parent office id
- office name
- office slug
- office type
- official email
- official phone
- full address
- account holder full name
- account holder designation
- account holder email
- account holder mobile
- password
- optional employee id

Behavior:

- Validate parent exists, active, and approved.
- Generate code from parent code and office slug.
- Create office as inactive and pending.
- Create primary user as inactive and pending.
- Create registration request.
- Notify parent office admin queue.
- Audit submission.

### `GET /registrations/pending`

Returns pending requests visible to the current user.

Visibility:

- `SUPER_ADMIN`: all pending requests.
- `DM_ADMIN`: requests under their DM hierarchy, especially direct children of DM.
- `OFFICE_ADMIN`: direct child requests for their office.
- `HIERARCHY_MONITOR`: read-only pending requests inside assigned DM hierarchy.

### `POST /registrations/{id}/approve`

Approves a pending request.

Behavior:

- Verify reviewer can approve this request.
- Set request status to `APPROVED`.
- Set office `approval_status = APPROVED`.
- Set office `is_active = true`.
- Set primary user `status = ACTIVE`.
- Set approval metadata.
- Create `office_ancestors` rows.
- Audit approval.

### `POST /registrations/{id}/reject`

Rejects a pending request.

Behavior:

- Require rejection reason.
- Set request status to `REJECTED`.
- Set office `approval_status = REJECTED`.
- Keep office inactive.
- Keep user inactive.
- Audit rejection.

### `GET /accounts`

Returns accounts in the current user's scope.

Visibility:

- `SUPER_ADMIN`: all accounts.
- `DM_ADMIN`: all accounts under their DM hierarchy.
- `OFFICE_ADMIN`: descendant accounts according to policy.
- `HIERARCHY_MONITOR`: read-only accounts in assigned scope.

### `POST /accounts/{user_id}/block`

Blocks a user from logging in.

### `POST /accounts/{user_id}/deactivate`

Deactivates a user without deleting history.

### `POST /accounts/{user_id}/reactivate`

Reactivates an inactive user if their office is active and approved.

### `POST /accounts/{user_id}/reset-password`

Admin password reset endpoint.

Rules:

- `SUPER_ADMIN` can reset any password according to internal policy.
- `DM_ADMIN` can reset passwords inside their DM hierarchy if allowed.
- `OFFICE_ADMIN` can reset direct child users only if allowed.
- Audit every reset.

## Authorization Rules

Create reusable FastAPI dependencies:

- `get_current_user`
- `require_active_user`
- `require_roles(*roles)`
- `require_super_admin`
- `require_dm_admin_or_super_admin`
- `require_account_manager`
- `require_registration_approver`

Hierarchy helpers:

- `is_same_office(user.office_id, office_id)`
- `is_ancestor(user.office_id, target_office_id)`
- `is_in_same_dm_root(user.dm_root_id, target_dm_root_id)`
- `can_view_account(user, target_user)`
- `can_manage_account_status(user, target_user)`
- `can_reset_password(user, target_user)`
- `can_approve_registration(user, registration)`

Initial rules:

- Central superadmin can view and manage all.
- DM admin can view the full hierarchy under their DM.
- DM admin approves direct offices under DM.
- Office admin approves direct child office registrations.
- NIC monitoring is read-only unless explicit approval or account-management permissions are granted.
- Parent office visibility is computed from `office_ancestors`, not stored as a role.

## Seed Data

Development seed should include:

- Central superadmin user with no office.
- One DM office with generated code `dm-001`.
- One DM admin for `dm-001`.
- NIC under DM with generated code `dm-nic-001`.
- One NIC office admin.
- Optional DIT, SCERT, TRML, ADM offices under DM.

Production setup should force password reset for seeded accounts.

## Frontend Integration

Replace localStorage mock auth in stages:

1. Replace persona buttons with email/password login.
2. Add registration screens for DM, office, and sub-office creation.
3. Add parent office selector. For sub-offices, first select DM, then select parent office under that DM.
4. Show generated code after submission or in a confirmation screen.
5. Add pending approval screen for newly registered accounts.
6. Add parent approval inbox.
7. Add central superadmin account directory with block, deactivate, reactivate, and reset password actions.
8. On app load, call `GET /auth/me`.
9. Use role, office code, DM root, and permissions from the backend to build navigation.
10. Remove `mom_authenticated`, `mom_role`, hardcoded profiles, and fake credential selection.

Frontend route mapping:

- `SUPER_ADMIN` -> `/super/overview`
- `DM_ADMIN` -> `/dm/overview`
- `OFFICE_ADMIN` -> `/office-admin/overview`
- `OFFICE_MEMBER` -> `/member/overview`

## Tests

Backend auth and registration tests:

- Superadmin can create DM account.
- DM code is generated as `dm-001`.
- Office under DM gets code like `dm-nic-001`.
- Sub-office under NIC gets code like `dm-nic-network-001`.
- Pending office account cannot log in.
- Parent DM can approve office under DM.
- Parent office can approve direct sub-office.
- Approval activates office and primary user.
- Rejection keeps office and user inactive.
- Superadmin can view all accounts.
- DM admin can view accounts under their DM.
- Office admin cannot manage accounts outside their hierarchy.
- Superadmin can block and deactivate users.
- Blocked user cannot log in.
- Password reset changes login credentials and writes audit event.
- Refresh token rotation works.
- Logout revokes refresh token.

Use pytest, pytest-asyncio, httpx AsyncClient, and a disposable PostgreSQL test database.

## Implementation Order

1. Create backend skeleton and health endpoint.
2. Add database config, async SQLAlchemy session, and Alembic.
3. Add `offices`, `users`, `account_registration_requests`, `office_ancestors`, `refresh_tokens`, and `audit_events`.
4. Implement code generation utility with transaction-safe uniqueness.
5. Create first migration.
6. Add password hashing and JWT helpers.
7. Implement central superadmin seed.
8. Implement `POST /auth/login` and `GET /auth/me`.
9. Implement refresh/logout/change-password.
10. Implement `POST /registrations/dm`.
11. Implement `POST /registrations/offices`.
12. Implement pending registration inbox.
13. Implement approve/reject.
14. Implement account directory and account status actions.
15. Add audit events across all writes.
16. Add backend tests.
17. Wire frontend login.
18. Wire registration forms.
19. Wire approval inbox.
20. Wire central superadmin account management.

## Open Decisions

- Whether DM accounts are always created only by central superadmin, or whether public DM registration can exist with central approval.
- Whether NIC has special monitor rights across the whole DM hierarchy or only over NIC descendants.
- Whether DM admins can reset passwords by default or need explicit `PASSWORD_MANAGER`.
- Whether office admins can view all descendant account information or only direct child office requests.
- Whether refresh tokens should start in localStorage for prototype speed or move directly to HTTP-only cookies.
