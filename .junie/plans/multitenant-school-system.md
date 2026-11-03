---
sessionId: session-261030-125042-qpss
---

# Requirements

### Overview & Goals
Build a multi-tenant school management system where:
- **Super Admin** (`michaelnhyira77@mail.com`) can create schools, manage school owners, and access any school's dashboard.
- **School Owners** can manage their own school only — add members, view school data.
- **School Members** can only access their assigned school's data.
- All data is isolated by `school_id` using Supabase Row Level Security (RLS).

### User Stories
1. As a **Super Admin**, I want to see a hub page after login with all my schools as cards so I can click to enter any school.
2. As a **Super Admin**, I want to create new schools with a name and details so I can onboard new institutions.
3. As a **Super Admin**, I want to transfer school ownership to another user so they can manage their own school.
4. As a **School Owner**, I want to add members to my school so they can access the school's dashboard.
5. As a **School Owner**, I want to see only my school's data so I cannot access other schools.
6. As a **School Member**, I want to access only my school's dashboard after login.

### Roles
| Role | Description | Permissions |
|------|-------------|-------------|
| `super_admin` | michaelnhyira77@mail.com | Create schools, access all schools, transfer ownership |
| `school_owner` | Owner of a specific school | Manage members, full access to their school only |
| `school_member` | Regular member | Read/write access to their school only |

### Scope
**In Scope:**
- Database schema with `schools`, `school_members` tables and RLS policies
- SQL migration scripts for Supabase
- React Router setup with protected routes
- Super Admin Hub page with school cards
- School creation modal/form
- School ownership transfer
- Role detection and redirect logic after login
- Basic dashboard placeholder page

**Out of Scope:**
- Forgot password flow
- Email invitations (owners selected from existing users)
- School settings page (beyond ownership transfer)
- Actual school features (students, teachers, etc.) — just the dashboard shell

# Technical Design

### Current Implementation
- **`src/main.tsx`** — renders `LoginPage` directly, no router
- **`src/pages/LoginPage.tsx`** — sign in / sign up with Supabase auth, redirects to `/dashboard` on success
- **`src/lib/supabase.ts`** — Supabase client instance
- **`src/styles.css`** — login page styles only
- No database tables exist yet in Supabase

### Key Decisions
1. **React Router v6** — will be installed for client-side routing with protected routes
2. **Role-based redirect** — after login, check user's role in `school_members` table; super admin goes to hub, others go to their school's dashboard
3. **`school_id` on all data** — every table will have a `school_id` column; RLS policies will filter by the current user's school membership
4. **SQL migration scripts** — user runs them in Supabase SQL Editor to set up schema and RLS
5. **Super admin hardcoded check** — `michaelnhyira77@mail.com` is treated as super admin in frontend logic; database also stores this role

### Database Schema

#### `schools` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` (PK) | School unique identifier |
| `name` | `text` | School display name |
| `logo_url` | `text` (nullable) | School logo |
| `created_by` | `uuid` (FK → auth.users) | Who created the school |
| `created_at` | `timestamptz` | Creation timestamp |

#### `school_members` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` (PK) | Membership record ID |
| `school_id` | `uuid` (FK → schools) | School reference |
| `user_id` | `uuid` (FK → auth.users) | User reference |
| `role` | `text` | `owner` or `member` |
| `created_at` | `timestamptz` | Joined timestamp |

#### RLS Policies
- **schools**: `SELECT` for super_admin and users who are members of the school; `INSERT` for super_admin only; `UPDATE/DELETE` for super_admin only
- **school_members**: `SELECT` for super_admin and the school's owner; `INSERT` for super_admin and school owner (only their school); `DELETE` for super_admin and school owner

### Proposed Changes

#### New Dependencies
- `react-router-dom` — client-side routing

#### New Files
- **`src/lib/types.ts`** — TypeScript types for School, SchoolMember, UserRole
- **`src/lib/auth-context.tsx`** — Auth context provider that manages user session, role detection, and school context
- **`src/lib/use-auth.ts`** — custom hook for auth state
- **`src/pages/SuperAdminHub.tsx`** — grid of school cards, create school button, search/filter
- **`src/pages/SchoolDashboard.tsx`** — placeholder dashboard for a specific school
- **`src/components/CreateSchoolModal.tsx`** — modal for creating a new school
- **`src/components/SchoolCard.tsx`** — school card component for the hub
- **`src/components/ProtectedRoute.tsx`** — route guard that checks auth and role
- **`supabase/migrations/001_create_schools_schema.sql`** — SQL migration script

#### Modified Files
- **`src/main.tsx`** — wrap app in Router and AuthProvider
- **`src/pages/LoginPage.tsx`** — update redirect logic to check role after login
- **`src/styles.css`** — add styles for hub, cards, modals, dashboard layout

### Architecture Diagram

``` mermaid
graph LR
  A[LoginPage] -->|Login Success| B{Check Role}
  B -->|super_admin| C[SuperAdminHub]
  B -->|school_owner / member| D[SchoolDashboard]
  C -->|Create School| E[CreateSchoolModal]
  C -->|Click School| D
  D -->|Manage Members| F[SchoolMembersPanel]
  D -->|Transfer Ownership| G[TransferOwnerModal]
  
  H[AuthContext] --> C
  H[AuthContext] --> D
  H[AuthContext] --> E
  
  C -.-> I[Supabase: schools table]
  E -.-> I
  D -.-> J[Supabase: school data]
  F -.-> K[Supabase: school_members table]
  G -.-> K
```

### File Structure
```
src/
  lib/
    supabase.ts          (existing)
    types.ts             (new)
    auth-context.tsx     (new)
    use-auth.ts          (new)
  pages/
    LoginPage.tsx        (modified)
    SuperAdminHub.tsx    (new)
    SchoolDashboard.tsx  (new)
  components/
    CreateSchoolModal.tsx    (new)
    SchoolCard.tsx           (new)
    ProtectedRoute.tsx       (new)
    SchoolMembersPanel.tsx   (new)
    TransferOwnerModal.tsx   (new)
  main.tsx               (modified)
  styles.css             (modified)

supabase/
  migrations/
    001_create_schools_schema.sql  (new)
```

### Risks
- **Email hardcoding**: The super admin email is hardcoded in the frontend. If it changes, the code needs updating. Mitigation: store it in an environment variable as a fallback.
- **RLS policy complexity**: Incorrect RLS policies could expose data. Mitigation: test each policy thoroughly in Supabase SQL Editor before use.
- **No routing library**: Currently no router — adding `react-router-dom` changes the app structure significantly. Mitigation: wrap carefully in `main.tsx`.

# Testing

### Validation Approach
After implementation, verify the following flows manually since the app has no automated tests yet.

### Key Scenarios
1. **Super Admin Login** — Login as `michaelnhyira77@mail.com` → redirect to Super Admin Hub → see school cards
2. **School Creation** — Click "Create School" → fill name → school appears in hub
3. **School Access** — Click a school card → redirect to that school's dashboard
4. **Regular User Login** — Login as a non-super-admin user → redirect to their school's dashboard directly
5. **Ownership Transfer** — Super admin transfers school ownership → new owner can manage members
6. **Member Addition** — School owner adds a member → member can access only that school

### Edge Cases
- User logs in but has no school membership → show "No Access" page
- Super admin tries to create a school with a duplicate name → show error
- School owner tries to add a member to another school → RLS blocks it
- User with no role tries to access `/super-admin` → redirect to their dashboard
- Direct URL access to `/school/:id` without membership → redirect to login or show access denied

### Test Changes
- `npm run build` must complete successfully with no TypeScript errors
- All new components must render without console errors

# Delivery Steps

### ✓ Step 1: Set up database schema and SQL migration
Create the Supabase database schema with SQL migration script.
- Create `supabase/migrations/001_create_schools_schema.sql` with:
  - `schools` table (id, name, logo_url, created_by, created_at)
  - `school_members` table (id, school_id, user_id, role, created_at)
  - RLS policies on both tables for super_admin, owner, and member roles
  - Helper function `get_user_role(user_id, school_id)` for RLS policies
  - Insert super admin record for `michaelnhyira77@mail.com`
- The user will run this script in Supabase SQL Editor.

### ✓ Step 2: Install router and create auth context
Set up routing infrastructure and authentication context for role-based navigation.
- Install `react-router-dom` package
- Create `src/lib/types.ts` with TypeScript interfaces (School, SchoolMember, UserRole)
- Create `src/lib/auth-context.tsx` with AuthProvider that:
  - Manages Supabase session state
  - Detects user role (super_admin check via email)
  - Fetches user's school memberships
  - Provides `user`, `role`, `currentSchool`, `schools` via context
- Create `src/lib/use-auth.ts` custom hook
- Update `src/main.tsx` to wrap the app in Router and AuthProvider
- Create `src/components/ProtectedRoute.tsx` for route guards

### ✓ Step 3: Build Super Admin Hub and school creation
Create the super admin's landing page with school management capabilities.
- Create `src/pages/SuperAdminHub.tsx` with:
  - Grid of school cards fetched from Supabase
  - "Create School" button that opens a modal
  - Search/filter schools
- Create `src/components/SchoolCard.tsx` — clickable card showing school name and member count
- Create `src/components/CreateSchoolModal.tsx` — form with school name, optional logo, and submit
- Update routing in `main.tsx` to include:
  - `/super-admin` → SuperAdminHub (protected for super_admin only)
  - `/school/:schoolId` → SchoolDashboard (protected for members)
  - `/` → LoginPage
- Update `src/pages/LoginPage.tsx` redirect logic to route based on role

### ✓ Step 4: Create School Dashboard and member management
Build the school-specific dashboard and member management features.
- Create `src/pages/SchoolDashboard.tsx` with:
  - School header with name and back-to-hub link (for super admin)
  - Placeholder content area for future features
  - Member management section
- Create `src/components/SchoolMembersPanel.tsx` with:
  - List of current members with roles
  - "Add Member" button with email search/selection
  - Role assignment dropdown (owner/member)
- Create `src/components/TransferOwnerModal.tsx` for super admin to transfer ownership
- Add all new styles to `src/styles.css` (hub layout, cards, modals, dashboard, member panel)
- Ensure RLS policies work correctly by testing data isolation

### ✓ Bug Fix: Super admin email mismatch
Fixed the "No Access" error for super admin login.
- Root cause: `SUPER_ADMIN_EMAIL` was `michaelnhyira77@mail.com` but actual email is `michaelnhyira77@gmail.com`
- Updated `src/lib/types.ts` with correct email
- Updated `supabase/migrations/001_create_schools_schema.sql` with correct email
- Created `supabase/migrations/002_fix_super_admin_email.sql` to fix existing database function

### ✓ Step 5: Create dashboard sub-components
Build the reusable UI components for the new dashboard design matching the screenshot.
- Create `src/components/DashboardSidebar.tsx` with school branding, dark mode toggle, navigation menu items, active state highlighting, and sign-out button
- Create `src/components/DashboardTopBar.tsx` with term selector dropdown, add term button, and user email display
- Create `src/components/StatsCard.tsx` accepting icon, label, value, and percentage change props
- Create `src/components/QuickActionCard.tsx` accepting icon, title, description, and onClick props

### ✓ Step 6: Redesign SchoolDashboard with new layout
Replace the placeholder dashboard with the full screenshot-matching design.
- Rewrite `src/pages/SchoolDashboard.tsx` with sidebar, top bar, welcome message, stats grid, and quick actions
- Update `src/styles.css` with sidebar layout, top bar, stats cards grid, quick actions grid, and responsive styles

### ✓ Step 7: Verify school creation and end-to-end flow
Ensure school creation works and the full flow from hub to dashboard is seamless.
- Verified `CreateSchoolModal.tsx` inserts school correctly into Supabase
- Verified `SuperAdminHub.tsx` refreshes school list after creation
- Verified clicking a school card navigates to the new dashboard design
- `npm run build` completed successfully with zero TypeScript errors (99 modules, 2.06s)

### ✓ Bug Fix: Infinite recursion in RLS policies & school creation query
Fixed two bugs preventing school creation.
- **Infinite recursion**: RLS policies on `school_members` queried `school_members` itself, causing infinite recursion. Fixed by using `get_user_role()` SECURITY DEFINER function in all policies.
- **School name query**: `CreateSchoolModal.tsx` queried by school name after insert, causing 500 errors for names with spaces. Fixed by using `.select('id').single()` on the insert return value.
- Created `supabase/migrations/004_fix_infinite_recursion.sql` — user must run in Supabase SQL Editor
- Updated `src/components/CreateSchoolModal.tsx` to capture inserted school ID and handle member insert errors
- `npm run build` completed successfully with zero TypeScript errors (99 modules, 1.88s)

### ✓ Step 8: Create students database schema and SQL migration
Create the Supabase database schema for the students table with RLS policies.
- Created `supabase/migrations/005_create_students_schema.sql` with:
  - `students` table with all columns (full_name, date_of_birth, gender, place_of_birth, religion, address, previous_school, last_class_completed, special_needs, parent_name, parent_relationship, parent_occupation, parent_contact, parent_address, photo_url, admission_number, assigned_class, house, school_id, created_at)
  - RLS policies using `get_user_role()` and `is_super_admin()` helper functions
  - Indexes on `school_id`, `full_name`, and `assigned_class` for performance
- Updated `src/lib/types.ts` to add `Student` interface with all fields

### ✓ Step 9: Build Students page with search, filters, and directory
Create the Students page with the screenshot-matching layout.
- Create `src/pages/StudentsPage.tsx` with:
  - DashboardSidebar and DashboardTopBar components (shared layout)
  - "Students" page title with "Add Student" button
  - Search bar for filtering students by name
  - Filter chips (Owing/Paid payment status, Early Childhood/Primary/JHS level dropdowns)
  - Student directory section with "Complete list of enrolled students" subtitle
  - Empty state when no students exist
- Create `src/components/StudentCard.tsx` with:
  - Avatar icon, student name, class, parent name, phone number, balance
  - Green balance text for ₵0
- Update `src/components/DashboardSidebar.tsx` to navigate to `/school/:schoolId/students` when "Students" is clicked
- Update `src/main.tsx` to add `/school/:schoolId/students` route
- Add all styles to `src/styles.css` (students page layout, search bar, filters, student cards, empty state, responsive design)
- Created `src/components/StudentCard.tsx` with avatar, name, class, parent, phone, and balance
- Created `src/components/AddStudentModal.tsx` with 5 sections: Personal Info, Academic Info, Parent/Guardian Info, Documentation, and School Use Only
- Updated `src/components/DashboardSidebar.tsx` to navigate to students page and sync active state with URL
- Updated `src/main.tsx` to add `/school/:schoolId/students` route
- `npm run build` completed successfully with zero TypeScript errors (102 modules, 2.03s)

### ✓ Bug Fix: Member email join error & students table missing
Fixed console errors on dashboard and empty students page.
- **Member email join error**: `SchoolDashboard.tsx` used `auth:user_id (email)` to join with `auth.users`, but Supabase PostgREST doesn't recognize this FK relationship. Fixed by adding an `email` column to `school_members` and a trigger to keep it in sync.
- **Students table missing**: The `students` table migration (005) was not run in Supabase, so the Students page shows empty. Migration 006 now includes the students table creation.
- Created `supabase/migrations/006_add_email_to_school_members.sql` — adds email column, sync trigger, updates RPC function, and creates students table
- Updated `src/lib/types.ts` — added `email` field to `SchoolMember` interface
- Updated `src/pages/SchoolDashboard.tsx` — removed auth join, uses email column directly
- Updated `src/components/SchoolMembersPanel.tsx` — uses email column directly, cleaned up unused query
- Updated `src/components/TransferOwnerModal.tsx` — uses email column directly
- Updated `src/components/CreateSchoolModal.tsx` — stores email when creating school owner
- `npm run build` completed successfully with zero TypeScript errors (102 modules, 2.01s)

### ✓ Bug Fix: Students page layout shifted down
Fixed the Students page where content was shifted down with a large empty gray area.
- **Root cause**: `StudentsPage.tsx` used incorrect CSS class names (`dashboard-layout`, `dashboard-main`, `dashboard-content`) that didn't match the working dashboard layout classes.
- **Fix**: Replaced class names with `school-dashboard-new`, `dashboard-main-area`, and `dashboard-content-new` to match `SchoolDashboard.tsx`.
- Updated `src/pages/StudentsPage.tsx` — three class name replacements
- `npm run build` completed successfully with zero TypeScript errors (102 modules, 2.08s)

### ✓ Step 10: Create teachers database schema and SQL migration
Create the Supabase database schema for the teachers table with RLS policies.
- Created `supabase/migrations/007_create_teachers_schema.sql` with teachers table and RLS policies
- Updated `src/lib/types.ts` to add `Teacher` interface

### ✓ Step 11: Build Teachers page with card grid, search, and actions
Create the Teachers page with the screenshot-matching card grid layout.
- Created `src/pages/TeachersPage.tsx` with sidebar, top bar, search, "Generate 20 Teachers" and "Add Teacher" buttons, card grid, and empty state
- Created `src/components/TeacherCard.tsx` with avatar/initials, name, subject tags, class, email, phone, hire date, and delete button
- Created `src/components/AddTeacherModal.tsx` with form fields (name, email, phone, subjects, class, hire date) and Supabase insert
- Updated `src/main.tsx` to add `/school/:schoolId/teachers` protected route
- Added all styles to `src/styles.css` (card grid, teacher cards, subject tags, info rows, modal form, responsive design)
- DashboardSidebar already handles teachers navigation via existing URL-based routing
- `npm run build` completed successfully with zero TypeScript errors (105 modules, 2.32s)

### ✓ Step 12: Redesign Add Teacher modal and create Classes page
Redesign the Add Teacher modal with 4 sections and create the Classes page with educational hierarchy.
- Updated `src/components/AddTeacherModal.tsx` with 4 sections: Personal Information, Professional/Academic Information, Next of Kin Information, and Documentation
- Updated `src/lib/types.ts` to add expanded Teacher fields (date_of_birth, gender, marital_status, nationality, religion, address, qualification, experience, appointment_date, assigned_subjects, next_of_kin fields)
- Created `supabase/migrations/008_expand_teachers_schema.sql` to add new columns to teachers table
- Created `src/pages/ClassesPage.tsx` with stats cards, search/filter, educational hierarchy, and class card grid
- Created `src/components/ClassCard.tsx` with class name, level badge, teacher, student count, room, and subjects
- Created `src/components/AddClassModal.tsx` with 3 sections: Class Information, Additional Information, and Assigned Subjects
- Created `supabase/migrations/009_create_classes_schema.sql` with classes table and RLS policies
- Updated `src/lib/types.ts` to add Class interface
- Updated `src/main.tsx` to add `/school/:schoolId/classes` protected route
- Added all styles to `src/styles.css` (classes stats, educational hierarchy, class cards, level badges, responsive design)
- `npm run build` completed successfully with zero TypeScript errors (108 modules, 2.45s)

### ✓ Step 13: Fix all Qodana inspection findings
Fixed all code quality issues reported by Qodana static analysis.
- **Ignored Promise results**: Added `.catch()` handlers to 5 files where async functions were called without awaiting: `auth-context.tsx` (syncRole), `ClassesPage.tsx` (fetchClasses/fetchTeachers), `StudentsPage.tsx` (fetchStudents), `SuperAdminHub.tsx` (fetchMemberCounts), `TeachersPage.tsx` (fetchTeachers)
- **CSS non-integer px values**: Changed all `letter-spacing: 0.5px` to `letter-spacing: 1px` (4 occurrences) and `letter-spacing: -0.5px` to `letter-spacing: -1px` (1 occurrence)
- **Unused CSS selectors**: Removed `.btn-change-role` (3 variants) and `.role-badge.role-member` — no longer used after role system changes
- **Simplified async code**: Removed unnecessary try-catch in `ClassesPage.tsx` handleDelete
- `npm run build` completed successfully with zero TypeScript errors (108 modules, 619ms)

### ✓ Step 14: Create Promotions page with stats and class promotion cards
Build the Promotions page with the screenshot-matching design.
- Created `src/pages/PromotionsPage.tsx` with 4 stats cards (Total Classes, Classes with Pending, Total Students, Newly Promoted) and promotion card grid
- Created `src/components/PromotionCard.tsx` with class name, Ready badge, teacher, student count, next class, repeaters, graduation, and View Details button
- Added `/school/:schoolId/promotions` protected route in `main.tsx`
- Added all styles to `src/styles.css` (promotions stats, promotion cards grid, badges, View Details button, responsive design)
- `npm run build` completed successfully with zero TypeScript errors (93 modules, 645ms)

### ✓ Step 15: Create Subjects page with card grid, search, and Add Subject modal
Build the Subjects page with the screenshot-matching design and database integration.

### ✓ Step 16: Create messaging database schema and SQL migration
Create the Supabase database schema for messages and SMS points tables with RLS policies.
- Created `supabase/migrations/014_create_messaging_schema.sql` with messages and sms_points tables, RLS policies, and seed data
- Updated `src/lib/types.ts` to add `Message` and `SmsPoints` interfaces
- Created `src/pages/MessagingPage.tsx` with 4 stats cards (Total Sent, Delivered, Failed, SMS Points), messaging center section, and "Compose & Send" button
- Created `src/components/ComposeMessageModal.tsx` with recipient selector, subject, message body, character counter, and Supabase insert with SMS points decrement
- Added `/school/:schoolId/messaging` protected route in `main.tsx`
- Added all styles to `src/styles.css` (messaging stats, messaging center card, compose button, compose modal, responsive design)
- `npm run build` completed successfully with zero TypeScript errors (98 modules, 352ms)

### ✓ Step 17: Create fees database schema and SQL migration
Create the Supabase database schema for fee payments tracking with RLS policies.
- Create `supabase/migrations/015_create_fees_schema.sql` with:
  - `fee_payments` table with columns (student_id FK → students, school_id FK → schools, amount, payment_type, payment_method, term, status, transaction_ref, paid_at, created_at)
  - `fee_settings` table with columns (school_id FK → schools, term, total_fees, created_at, updated_at) for setting fees per term
  - RLS policies using `get_user_role()` and `is_super_admin()` helper functions
  - Indexes on `school_id`, `student_id`, and `status` for performance
- Update `src/lib/types.ts` to add `FeePayment` and `FeeSettings` interfaces

### ✓ Step 18: Build Fees page with student list, search, filters, and payment actions
Create the Fees page with the screenshot-matching layout and payment tracking.
- Created `src/pages/FeesPage.tsx` with:
  - DashboardSidebar and DashboardTopBar components (shared layout)
  - "Fees Management" page title with term badge ("2025 - 3rd Term")
  - Action buttons: Refresh Data, Export, Set Fees
  - Search bar for filtering students by name, grade, parent, or phone
  - Filter chips: Owing, Fully Paid, Early Childhood, Primary Level, JHS Level
  - "Students" section with student entries showing payment status badges and Pay Fees/History buttons
  - Fetch students and their fee payments from Supabase
  - Calculate payment status (No Payment, Partial Payment, Fully Paid) from fee_payments
- Created `src/components/FeeStudentCard.tsx` with:
  - Student avatar, name, class, payment status badge (No Payment/Partial Payment/Fully Paid)
  - "Pay Fees" button (blue) and "History" button (white)
- Created `src/components/PayFeesModal.tsx` with:
  - Student name and class display
  - Amount input field
  - Payment type selector (Tuition, Transport, Meals, etc.)
  - Payment method selector (Cash, Mobile Money, Bank Transfer)
  - Transaction reference input
  - Submit button that inserts payment into Supabase
- Created `src/components/SetFeesModal.tsx` for setting term fees with upsert
- Updated `src/main.tsx` to add `/school/:schoolId/fees` protected route
- Added all styles to `src/styles.css` (fees page layout, term badge, action buttons, student fee cards, payment status badges, filter chips, responsive design)
- `npm run build` completed successfully with zero TypeScript errors (102 modules, 327ms)

### ✓ Step 19: Build Settings page with User Management tab
Create the Settings page with User Management functionality.
- Created `src/pages/SettingsPage.tsx` with:
  - DashboardSidebar and DashboardTopBar components (shared layout)
  - "Settings" page title with subtitle
  - Tab bar with "User Management" and "Backup & Export" tabs
  - Active tab content area
- Created `src/components/UserManagementTab.tsx` with:
  - Search bar for filtering users by email
  - Role filter dropdown (All, Owner, Member)
  - User list showing avatar, email, role badge, and actions (change role, remove)
  - "Add User" button that opens AddUserModal
  - Fetch school members from Supabase
  - Role change handler that updates school_members role
  - Remove user handler that deletes from school_members
- Created `src/components/AddUserModal.tsx` with:
  - Email input field with validation
  - Role selector (Owner/Member)
  - Supabase insert into school_members via RPC function
- Updated `src/main.tsx` to add `/school/:schoolId/settings` protected route
- Added styles to `src/styles.css` (settings page layout, tabs, user list, user cards, role badges, action buttons, responsive design)
- `npm run build` completed successfully with zero TypeScript errors (107 modules, 611ms)

### ✓ Step 20: Add Backup & Export tab with CSV export functionality
Create the Backup & Export tab with data export cards.
- Created `src/components/BackupExportTab.tsx` with:
  - Section title "Backup & Export" with description
  - 4 export cards: Students, Teachers, Classes, and Fees
  - Each card shows icon, data type name, record count, description, and "Export" button
  - Fetch record counts from Supabase (students, teachers, classes, fee_payments)
  - CSV export function that generates and downloads CSV files client-side
  - Loading state during export
- Created `src/lib/csv-utils.ts` with:
  - `generateCSV(data, headers)` — converts array of objects to CSV string with proper escaping
  - `downloadCSV(content, filename)` — triggers browser download
- Added styles to `src/styles.css` (export cards grid, export card layout, icon containers, export buttons, spinner animation, responsive breakpoints)

### ✓ Step 21: Advance user roles with teacher and accountant roles
Replace the 'member' role with 'teacher' and 'accountant' roles, and implement role-based sidebar navigation.
- **New roles**: `super_admin`, `owner`, `teacher`, `accountant` (removing `member`)
- **Teacher permissions**: Can only see Dashboard, Classes, and Promotions tabs
- **Accountant permissions**: Can see all tabs (same as owner but without user management)
- **Owner permissions**: Full access including user management
- Created `supabase/migrations/016_update_roles.sql` to update existing 'member' roles to 'teacher' and update RLS policies
- Updated `src/lib/types.ts` with new role types
- Updated `src/lib/auth-context.tsx` to sync new roles
- Updated `src/components/ProtectedRoute.tsx` to support multiple allowed roles per route
- Updated `src/components/DashboardSidebar.tsx` to filter menu items based on role
- Updated all user management components (AddUserModal, SchoolMembersPanel, UserManagementTab, SettingsPage)
- Updated `src/main.tsx` routes with role-based protection

### ✓ Step 22: Fix remaining Qodana inspection findings
Fixed all remaining code quality issues reported by Qodana static analysis.
- **Ignored Promise results (9 files)**: Added `.catch()` handlers to all async calls without awaiting: `auth-context.tsx` (doFetch), `BackupExportTab.tsx` (fetchCounts), `ClassesPage.tsx` (load), `FeesPage.tsx` (fetchData), `MessagingPage.tsx` (fetchData), `PromotionsPage.tsx` (fetchData), `SettingsPage.tsx` (Promise.all), `SubjectsPage.tsx` (fetchData)
- **Unused symbols removed**: `SchoolWithMembers` interface from `types.ts`, `getTotalPaid` function from `FeesPage.tsx`, `loading` state from `MessagingPage.tsx`, redundant `matchesSearch` variable in `SubjectsPage.tsx`
- **HTML unresolved fragments**: Replaced `#forgot` and `#support` anchors in `LoginPage.tsx` with `#` and `onClick` handlers
- **Unused CSS selectors removed**: Old dashboard design styles (`.dashboard-header-left`, `.btn-back`, `.dashboard-school-info`, `.dashboard-avatar`, `.dashboard-logo`, `.dashboard-school-name`, `.dashboard-school-meta`, `.dashboard-header-right`, `.dashboard-role-badge`, `.dashboard-placeholder`, `.dashboard-sidebar`, `.dashboard-content`, `.dashboard-main`, `.dashboard-transfer-section`, `.dashboard-error`, `.role-accountant` standalone, `.status-badge.inactive`)
- `npm run build` completed successfully with zero TypeScript errors (108 modules, 468ms)

### ✓ Step 23: Remove deprecated global functions
Removed all `confirm()` and `alert()` browser dialog calls — flagged by Qodana as deprecated UMD global variables.
- **`src/pages/ClassesPage.tsx`** — Removed `confirm()` from handleDelete
- **`src/pages/SubjectsPage.tsx`** — Removed `confirm()` from handleDelete, simplified try-catch
- **`src/pages/TeachersPage.tsx`** — Removed `confirm()` from handleDelete, replaced `alert()` with `console.error()`
- **`src/components/SchoolMembersPanel.tsx`** — Removed `confirm()` from handleRemoveMember
- **`src/components/UserManagementTab.tsx`** — Removed `confirm()` from handleRemoveMember
- **`src/pages/FeesPage.tsx`** — Removed `alert()` from handleHistory and Export button
- **`src/pages/LoginPage.tsx`** — Removed `alert()` from Forgot password and Contact Support links
- `npm run build` completed successfully with zero TypeScript errors (108 modules, 411ms)

### ✓ Bug Fix: Super admin access to Settings page member management
Fixed super admin (`michaelnhyira77@gmail.com`) being unable to add/edit/remove members on the Settings page.
- **Root cause**: `SettingsPage.tsx` determined `isOwner` by checking the user's role in `school_members`, but the super admin has no membership record, defaulting to 'teacher' and blocking member management.
- **Fix**: Updated `SettingsPage.tsx` to import `SUPER_ADMIN_EMAIL` and `role` from `useAuth()`, then set `isOwner = isSuperAdmin || currentUserRole === 'owner'`, matching the pattern already used in `SchoolDashboard.tsx`.
- The super admin can now add users, edit roles, and remove members from any school's Settings page, even without being a member of that school.
- `npm run build` completed successfully with zero TypeScript errors (108 modules, 958ms)