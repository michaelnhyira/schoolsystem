export type UserRole = 'super_admin' | 'owner' | 'teacher' | 'accountant'

export interface School {
  id: string
  name: string
  logo_url: string | null
  created_by: string | null
  created_at: string
}

export interface SchoolMember {
  id: string
  school_id: string
  user_id: string
  email: string | null
  role: 'owner' | 'teacher' | 'accountant'
  created_at: string
}

export interface AuthContextType {
  user: { id: string; email: string } | null
  role: UserRole | null
  schools: School[]
  currentSchool: School | null
  loading: boolean
  setCurrentSchool: (school: School | null) => void
  refreshSchools: () => Promise<void>
  signOut: () => Promise<void>
}

export interface Student {
  id: string
  school_id: string
  full_name: string
  date_of_birth: string | null
  gender: string | null
  place_of_birth: string | null
  religion: string | null
  address: string | null
  previous_school: string | null
  last_class_completed: string | null
  special_needs: string | null
  parent_name: string
  parent_relationship: string | null
  parent_occupation: string | null
  parent_contact: string
  parent_address: string | null
  photo_url: string | null
  admission_number: string | null
  assigned_class: string | null
  house: string | null
  created_at: string
}

export interface Teacher {
  id: string
  school_id: string
  full_name: string
  email: string | null
  phone: string
  subjects: string
  assigned_class: string | null
  hire_date: string
  photo_url: string | null
  created_at: string

  // Personal Information
  date_of_birth: string | null
  gender: string | null
  marital_status: string | null
  nationality: string | null
  religion: string | null
  address: string | null

  // Professional/Academic Information
  qualification: string | null
  experience: string | null
  appointment_date: string | null
  assigned_subjects: string[] | null

  // Next of Kin Information
  next_of_kin_name: string | null
  next_of_kin_relationship: string | null
  next_of_kin_contact: string | null
  next_of_kin_address: string | null
}

export interface Class {
  id: string
  school_id: string
  name: string
  level: 'early-childhood' | 'primary' | 'junior-high'
  grade: string
  subdivision: string | null
  class_teacher_id: string | null
  max_students: number
  room: string | null
  assigned_subjects: string[] | null
  created_at: string
}

export interface Subject {
  id: string
  school_id: string
  name: string
  code: string | null
  description: string | null
  is_active: boolean
  created_at: string
}

export interface Message {
  id: string
  school_id: string
  recipient_type: string
  subject: string
  body: string
  status: string
  sent_at: string | null
  created_at: string
}

export interface SmsPoints {
  id: string
  school_id: string
  points_remaining: number
  points_total: number
  updated_at: string
}

export interface FeePayment {
  id: string
  school_id: string
  student_id: string
  amount: number
  payment_type: string
  payment_method: string
  term: string
  status: string
  transaction_ref: string | null
  paid_at: string
  created_at: string
}

export interface FeeSettings {
  id: string
  school_id: string
  term: string
  total_fees: number
  created_at: string
  updated_at: string
}

export const SUPER_ADMIN_EMAIL = 'michaelnhyira77@gmail.com'
