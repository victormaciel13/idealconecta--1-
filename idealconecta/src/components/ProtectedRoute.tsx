import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children, requireGestao = false }: { children: React.ReactNode; requireGestao?: boolean }) {
  const { session, loading, isGestao } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (!session) return <Navigate to="/login" replace />
  if (requireGestao && !isGestao) return <Navigate to="/" replace />
  return <>{children}</>
}
