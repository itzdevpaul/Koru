import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import KoruLoader from './KoruLoader'
import Admin from '../pages/Admin'

const ADMIN_EMAIL = 'pauladamu600@gmail.com'

export default function AdminRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FBF9F5' }}>
        <KoruLoader />
      </div>
    )
  }

  if (!user) return <Navigate to="/signin" replace />
  if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return <Navigate to="/home" replace />

  return <Admin />
}