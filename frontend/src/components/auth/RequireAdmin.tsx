import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export const RequireAdmin = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // logged in but not admin → bounce away from users page
  if (user?.role !== 'admin') {
    return <Navigate to="/activities" replace state={{ from: location }} />
  }

  return <>{children}</>
}
