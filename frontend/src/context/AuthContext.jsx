import { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [redirectAfterAuth, setRedirectAfterAuth] = useState(null)

  // Check if user is already logged in on app load
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated')
    const storedUser = localStorage.getItem('user')

    if (storedAuth === 'true' && storedUser) {
      // Verify session with backend to get fresh user data
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      fetch(`${apiBaseUrl}/auth/verify`, {
        method: 'GET',
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setUser(data.user)
            setIsAuthenticated(true)
            localStorage.setItem('user', JSON.stringify(data.user))
          } else {
            // Session invalid, clear auth
            setIsAuthenticated(false)
            setUser(null)
            localStorage.removeItem('user')
            localStorage.removeItem('isAuthenticated')
          }
        })
        .catch(err => {
          console.error('Session verification failed:', err)
          // Fallback to stored user data
          setUser(JSON.parse(storedUser))
          setIsAuthenticated(true)
        })
    }
  }, [])

  const login = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('isAuthenticated', 'true')
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    setRedirectAfterAuth(null)
  }

  const setAuthRedirect = (page) => {
    setRedirectAfterAuth(page)
  }

  const getAndClearRedirect = () => {
    const redirect = redirectAfterAuth
    setRedirectAfterAuth(null)
    return redirect
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      login,
      logout,
      setAuthRedirect,
      getAndClearRedirect,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
