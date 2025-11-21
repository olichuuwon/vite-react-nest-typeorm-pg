import { Routes, Route, Navigate } from 'react-router-dom'
import { RequireAuth } from './features/auth/RequireAuth'

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
        <Route index element={<Navigate to="/activities" replace />} />

        <Route path="activities" element={<ActivitiesListPage />} />
        <Route path="activities/:activityId" element={<ActivityDetailPage />} />

        <Route path="users" element={<UsersListPage />} />
        <Route path="users/:userId" element={<UserDetailPage />} />

        <Route path="calendar" element={<ActivitiesCalendarPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
