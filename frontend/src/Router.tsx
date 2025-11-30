import { Routes, Route, Navigate } from 'react-router-dom'
import { RequireAuth } from './components/auth/RequireAuth'
import { RequireAdmin } from './components/auth/RequireAdmin'

import { LoginPage } from './pages/login/LoginPage'
import { AppLayout } from './components/layout/AppLayout'

import { ActivitiesListPage } from './pages/activities/ActivitiesListPage'
import { ActivityDetailPage } from './pages/activities/ActivityDetailPage'

import { UsersListPage } from './pages/users/UsersListPage'
import { UserDetailPage } from './pages/users/UserDetailPage'

import { ActivitiesCalendarPage } from './pages/calendar/ActivitiesCalendarPage'

export const Router = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        {/* Default redirect */}
        <Route index element={<Navigate to="/activities" replace />} />

        {/* Activities */}
        <Route path="activities" element={<ActivitiesListPage />} />
        <Route path="activities/:activityId" element={<ActivityDetailPage />} />

        {/* Users – ADMIN ONLY */}
        <Route
          path="users"
          element={
            <RequireAdmin>
              <UsersListPage />
            </RequireAdmin>
          }
        />
        <Route
          path="users/:userId"
          element={
            <RequireAdmin>
              <UserDetailPage />
            </RequireAdmin>
          }
        />

        {/* Calendar */}
        <Route path="calendar" element={<ActivitiesCalendarPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
