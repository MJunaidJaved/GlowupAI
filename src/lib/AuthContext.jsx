import { createContext, useState, useContext, useEffect } from 'react'
import { api, setToken, removeToken, getStoredToken } from '@/api/client'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  useEffect(() => {
    const token = getStoredToken()
    if (token) {
      api.get('/api/auth/me')
        .then(userData => {
          setUser(userData)
          setIsAuthenticated(true)
        })
        .catch(() => {
          removeToken()
          setIsAuthenticated(false)
        })
        .finally(() => setIsLoadingAuth(false))
    } else {
      setIsLoadingAuth(false)
    }
  }, [])

  const signup = async (full_name, email, password) => {
    const data = await api.post('/api/auth/signup', { full_name, email, password })
    setToken(data.token)
    setUser(data.user)
    setIsAuthenticated(true)
    return data
  }

  const login = async (email, password) => {
    const data = await api.post('/api/auth/login', { email, password })
    setToken(data.token)
    setUser(data.user)
    setIsAuthenticated(true)
    return data
  }

  const logout = () => {
    removeToken()
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isLoadingAuth,
      signup, login, logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
