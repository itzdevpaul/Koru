import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import KoruLoader from './KoruLoader'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#FBF9F5' }}
      >
        <KoruLoader />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/signin" replace />
  }

  return <>{children}</>
}
