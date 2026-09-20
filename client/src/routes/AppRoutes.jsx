import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layouts
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { ChangePasswordPage } from '../pages/auth/ChangePasswordPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { VerticalManagementPage } from '../pages/admin/VerticalManagementPage';
import { EventManagementPage } from '../pages/admin/EventManagementPage';
import { AttendanceOversightPage } from '../pages/admin/AttendanceOversightPage';
import { ReportsPage } from '../pages/admin/ReportsPage';
import { EmailAlertsPage } from '../pages/admin/EmailAlertsPage';
import { SettingsPage } from '../pages/admin/SettingsPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';

// Head Pages
import { HeadDashboardPage } from '../pages/head/HeadDashboardPage';
import { HeadMembersPage } from '../pages/head/HeadMembersPage';
import { MarkAttendancePage } from '../pages/head/MarkAttendancePage';
import { HeadAnalyticsPage } from '../pages/head/HeadAnalyticsPage';

// Member Pages
import { MemberDashboardPage } from '../pages/member/MemberDashboardPage';
import { MemberHistoryPage } from '../pages/member/MemberHistoryPage';
import { MemberProfilePage } from '../pages/member/MemberProfilePage';

// Fallbacks
import { NotFoundPage } from '../pages/NotFoundPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';

export const AppRoutes = () => {
  const { user, isAuthenticated, getDefaultRedirect } = useAuth();

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated && user ? (
            <Navigate to={getDefaultRedirect(user.role)} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            isAuthenticated && user ? (
              <Navigate to={getDefaultRedirect(user.role)} replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin Dashboard Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="verticals" element={<VerticalManagementPage />} />
        <Route path="events" element={<EventManagementPage />} />
        <Route path="attendance" element={<AttendanceOversightPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="alerts" element={<EmailAlertsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="profile" element={<MemberProfilePage />} />
      </Route>

      {/* Vertical Head Dashboard Routes (Shared by SECRETARY & LEAD) */}
      <Route
        path="/head"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SECRETARY', 'LEAD']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HeadDashboardPage />} />
        <Route path="members" element={<HeadMembersPage />} />
        <Route path="mark/:eventId" element={<MarkAttendancePage />} />
        <Route path="analytics" element={<HeadAnalyticsPage />} />
        <Route path="profile" element={<MemberProfilePage />} />
      </Route>

      {/* Member Dashboard Routes */}
      <Route
        path="/member"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SECRETARY', 'LEAD', 'MEMBER']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MemberDashboardPage />} />
        <Route path="history" element={<MemberHistoryPage />} />
        <Route path="profile" element={<MemberProfilePage />} />
      </Route>

      {/* Error / Unauthorized Pages */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
