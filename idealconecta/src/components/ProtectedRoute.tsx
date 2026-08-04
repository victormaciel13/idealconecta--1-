import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children, requireGestao = false, loginPath = '/login' }: { children: React.ReactNode; requireGestao?: boolean; loginPath?: string }) {
  const { session, loading, isGestao } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (!session) return <Navigate to={loginPath} replace />
  if (requireGestao && !isGestao) return <Navigate to="/" replace />
  return <>{children}</>
}