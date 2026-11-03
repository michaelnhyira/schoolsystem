# Create Classes Page

# Requirements

### Overview & Goals
Create a Classes page that displays class cards organized by educational hierarchy (Early Childhood, Primary, Junior High), along with an "Add New Class" modal for creating new classes.

### Scope

**In Scope:**
- Create `ClassesPage.tsx` with stats cards, search, level filter, educational hierarchy section, and class cards grid
- Create `AddClassModal.tsx` with class information, additional information, and subject selection
- Create `ClassCard.tsx` component for rendering individual class cards
- Add `Class` TypeScript interface in `types.ts`
- Add database migration for `classes` table
- Add route for `/school/:schoolId/classes` in `main.tsx`
- Add CSS styles for the new components

**Out of Scope:**
- Edit class functionality (UI buttons only, no modal yet)
- View class detail page
- Teacher assignment logic beyond storing the reference
- Student count calculation from the students table

### Functional Requirements

**Classes Page:**
- Page header with "Classes" title, subtitle, and "+ Add Class" button
- Stats cards: Total Classes, Total Students, Primary Classes, JHS Classes
- Search bar and "All Levels" filter dropdown
- Educational Hierarchy section with 3 level cards: Early Childhood, Primary, Junior High
- Class cards grid showing: class name, level badge, class teacher, student count, subjects, and action buttons

**Add Class Modal:**
- Section 1 - Class Information: Class Teacher (dropdown, optional), Max Class Number (default 30)
- Section 2 - Additional Information: Grade (dropdown), Room (text input), Subdivision (dropdown, optional)
- Section 3 - Assigned Subject(s): Checkbox grid with 10 predefined subjects
- Cancel and Save Class buttons

# Technical Design

### Key Decisions
- **Class data model**: Store classes in a dedicated `classes` table with fields for name, level, grade, subdivision, teacher reference, max students, room, and assigned subjects (TEXT[] array)
- **Levels**: Three levels — `early-childhood`, `primary`, `junior-high` — stored as TEXT
- **Grades**: Predefined per level (Creche, Nursery 1, Nursery 2, Kindergarten 1, Kindergarten 2 for Early Childhood; Primary 1-6 for Primary; JHS 1-3 for Junior High)
- **Class name**: Auto-generated from grade + subdivision (e.g., "Primary 1" or "Primary 1A")
- **Component structure**: `ClassesPage` (page), `ClassCard` (card component), `AddClassModal` (modal)

### Proposed Changes

**1. Database Migration** - `supabase/migrations/009_create_classes_schema.sql`
Create `classes` table with columns: id, school_id, name, level, grade, subdivision, class_teacher_id, max_students, room, assigned_subjects (TEXT[]), created_at. Add RLS policies.

**2. Class Interface** - `src/lib/types.ts`
Add `Class` interface with all fields.

**3. ClassesPage** - `src/pages/ClassesPage.tsx`
New page with stats cards, search, level filter, educational hierarchy section, and class cards grid.

**4. ClassCard** - `src/components/ClassCard.tsx`
New card component showing class name, level badge, teacher, student count, subjects, and action buttons.

**5. AddClassModal** - `src/components/AddClassModal.tsx`
New modal with 2 sections, grade dropdown, room, subdivision, teacher dropdown, and subject checkbox grid.

**6. Route** - `src/main.tsx`
Add route for `/school/:schoolId/classes`.

**7. Styles** - `src/styles.css`
Add styles for stats cards, educational hierarchy, level cards, classes grid, class card, level badge, and add class modal.

# Delivery Steps

### ✓ Step 1: Create database migration and Class interface
Add the classes table schema and TypeScript type.
- Create `supabase/migrations/009_create_classes_schema.sql`
- Add `Class` interface to `src/lib/types.ts`
- Add route for `/school/:schoolId/classes` in `src/main.tsx`

### ✓ Step 2: Implement ClassesPage with stats, hierarchy, and class cards
Create the main Classes page component with full layout.
- Create `src/pages/ClassesPage.tsx`
- Add stats cards row (Total Classes, Total Students, Primary Classes, JHS Classes)
- Add search bar and level filter dropdown
- Add Educational Hierarchy section with 3 colored level cards
- Create `src/components/ClassCard.tsx`
- Wire up fetch, delete, and search/filter logic

### ✓ Step 3: Implement AddClassModal component
Create the Add Class modal with form sections and subject selection.
- Create `src/components/AddClassModal.tsx`
- Section 1: Class Teacher dropdown, Max Class Number
- Section 2: Grade dropdown, Room, Subdivision dropdown
- Section 3: Subject checkbox grid
- Auto-generate class name from grade + subdivision
- Supabase insert with all fields

### ✓ Step 4: Add CSS styles for Classes page and modal
Add all CSS styles for the new components.
- Stats cards, educational hierarchy, level cards
- Classes grid, class card, level badge
- Add class modal styling
- Verify TypeScript compilation passes
