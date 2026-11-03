---
sessionId: session-261030-163738-1lfk
---

# Requirements

### Overview & Goals
Redesign the "Add New Teacher" modal to match the provided design mockups, expanding from a simple 6-field form to a comprehensive multi-section modal with personal information, professional/academic information, next of kin details, and documentation upload.

### Scope

**In Scope:**
- Expand `AddTeacherModal.tsx` with 4 sections matching the design images
- Add database migration for new teacher fields
- Update Teacher TypeScript interface
- Add checkbox grid for subject selection (predefined subjects)
- Add styles for the new modal layout

**Out of Scope:**
- Photo upload functionality (UI placeholder only, no backend integration)
- Edit teacher modal (only add is in scope)

### Functional Requirements

**Section 1 - Personal Information:**
- Full Name (required)
- Date of Birth (required)
- Gender dropdown (required): Male, Female
- Marital Status dropdown (required): Single, Married, Divorced, Widowed
- Nationality (required, default: Ghanaian)
- Religion/Denomination dropdown (required): Christian, Muslim, Traditional, Other
- Residential/Digital Address (required)
- Contact Number(s) (required)
- Email (required)

**Section 2 - Professional/Academic Information:**
- Highest Academic Qualification (required)
- Previous Teaching Experience (optional)
- Date of Appointment/Employment (optional)
- Assigned Subject(s) - Checkbox grid (required, multiple selection): English, Environmental Studies, French, Home Economics, Integrated Science, Maths, Pre-Technical Skills, RME, Social Studies, Twi
- Assigned Class dropdown (optional)

**Section 3 - Parent/Next of Kin Information:**
- Full Name
- Relationship to Teacher
- Contact Number
- Address

**Section 4 - Documentation:**
- Passport-sized Photo upload area (UI only)

# Technical Design

### Current Implementation
- **`AddTeacherModal.tsx`** (175 lines): Simple modal with `formData` state object containing 6 fields. Inserts into `teachers` table.
- **`teachers` table**: Columns: id, school_id, full_name, email, phone, subjects, assigned_class, hire_date, photo_url, created_at
- **Teacher interface**: Matches current DB schema with 9 fields
- **Reference pattern**: `AddStudentModal.tsx` (318 lines) uses individual state variables per field, form sections with `.form-section`, `.section-title`, `.form-grid`, and `.form-group` classes

### Key Decisions
- **State management**: Follow `AddStudentModal.tsx` pattern with individual `useState` calls per field
- **Subjects**: Store as TEXT[] array in `assigned_subjects` column; checkbox grid with predefined subjects
- **Database**: New migration `008_expand_teachers_schema.sql` adds new columns
- **UI structure**: 4 form sections matching design, using existing CSS classes

### Proposed Changes

**1. Database Migration** - `supabase/migrations/008_expand_teachers_schema.sql`
Add new columns: date_of_birth, gender, marital_status, nationality, religion, address, qualification, experience, appointment_date, assigned_subjects (TEXT[]), next_of_kin_name, next_of_kin_relationship, next_of_kin_contact, next_of_kin_address

**2. Teacher Interface** - `src/lib/types.ts`
Update Teacher interface to include all new fields.

**3. AddTeacherModal Component** - `src/components/AddTeacherModal.tsx`
Complete rewrite with 4 form sections, checkbox grid for subjects, dropdown selects, and updated Supabase insert call.

**4. Styles** - `src/styles.css`
Add `.add-teacher-modal`, `.subjects-checkbox-grid`, and `.checkbox-item` styling.

# Testing

### Key Scenarios
- Modal opens with all 4 sections visible and scrollable
- Required fields show validation errors when empty
- Subject checkboxes allow multiple selection
- Form submission inserts record with all fields into Supabase
- Cancel button closes modal without saving

### Edge Cases
- Optional fields should save as null when empty
- Multiple subjects selected should all be saved
- Modal should be scrollable on smaller screens

# Delivery Steps

### ✓ Step 1: Create database migration for new teacher fields
Add new columns to the teachers table to support the expanded modal fields.
- Create `supabase/migrations/008_expand_teachers_schema.sql`
- Add columns: date_of_birth, gender, marital_status, nationality, religion, address, qualification, experience, appointment_date, assigned_subjects (TEXT[]), next_of_kin_name, next_of_kin_relationship, next_of_kin_contact, next_of_kin_address

### ✓ Step 2: Update Teacher interface and add modal styles
Update the TypeScript interface and add CSS for the new modal layout.
- Update `src/lib/types.ts` Teacher interface with all new fields
- Add `.add-teacher-modal` styles to `src/styles.css` (max-width: 700px, scrollable)
- Add `.subjects-checkbox-grid` for 3-column checkbox layout
- Add `.checkbox-item` styling for individual checkboxes

### ✓ Step 3: Implement expanded AddTeacherModal component
Rewrite the modal with 4 sections matching the design mockups.
- Replace `AddTeacherModal.tsx` with individual state variables per field
- Add Section 1: Personal Information (Full Name, Date of Birth, Gender, Marital Status, Nationality, Religion, Address, Contact Numbers, Email)
- Add Section 2: Professional/Academic Information (Qualification, Experience, Appointment Date, Subject checkboxes, Assigned Class)
- Add Section 3: Parent/Next of Kin Information (Name, Relationship, Contact, Address)
- Add Section 4: Documentation (Photo upload placeholder)
- Update validation and Supabase insert call with all new fields
- Use checkbox grid for 10 predefined subjects