import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth()

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-pulse mb-4" style={{ fontSize: 28, color: '#3D5A3E' }}>✦</div>
          <p style={{ fontSize: 18, color: '#1A1F1A' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/" replace />
  return children
}

export default ProtectedRoute
