import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/auth-context'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import SuperAdminHub from './pages/SuperAdminHub'
import SchoolDashboard from './pages/SchoolDashboard'
import StudentsPage from './pages/StudentsPage'
import TeachersPage from './pages/TeachersPage'
import ClassesPage from './pages/ClassesPage'
import PromotionsPage from './pages/PromotionsPage'
import SubjectsPage from './pages/SubjectsPage'
import MessagingPage from './pages/MessagingPage'
import FeesPage from './pages/FeesPage'
import SettingsPage from './pages/SettingsPage'
import NoAccess from './pages/NoAccess'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute>
                <SuperAdminHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/:schoolId"
            element={
              <ProtectedRoute>
                <SchoolDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/:schoolId/students"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner', 'accountant']}>
                <StudentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/:schoolId/teachers"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner']}>
                <TeachersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/:schoolId/classes"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner', 'teacher']}>
                <ClassesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/:schoolId/promotions"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner', 'teacher']}>
                <PromotionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/:schoolId/subjects"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner']}>
                <SubjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/:schoolId/messaging"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner']}>
                <MessagingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/:schoolId/fees"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner', 'accountant']}>
                <FeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/:schoolId/settings"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner']}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/no-access"
            element={
              <ProtectedRoute>
                <NoAccess />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
