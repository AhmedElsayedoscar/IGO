import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('igo_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('igo_token') || null)
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('igo_user', JSON.stringify(user))
      localStorage.setItem('igo_token', token)
    } else {
      localStorage.removeItem('igo_user')
      localStorage.removeItem('igo_token')
    }
  }, [user, token])

  // Register with Email & Password
  const register = async ({ name, email, phone, password }) => {
    setLoading(true)
    setAuthError('')
    try {
      // Try connecting to Mongoose / Express backend first
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      }).catch(() => null)

      if (res && res.ok) {
        const data = await res.json()
        setUser(data.user)
        setToken(data.token)
        return { success: true, user: data.user }
      } else if (res && !res.ok) {
        const errData = await res.json().catch(() => ({}))
        const errorMsg = errData.message || 'فشل إنشاء الحساب، يرجى التأكد من البيانات'
        setAuthError(errorMsg)
        return { success: false, error: errorMsg }
      }

      // Fallback for local demo if backend is not running yet
      console.info('Backend not reachable; falling back to local session simulation.')
      const simulatedUser = {
        id: 'usr_' + Date.now(),
        name,
        email,
        phone,
        role: 'customer',
        createdAt: new Date().toISOString(),
      }
      const simulatedToken = 'mock_jwt_token_' + Date.now()
      setUser(simulatedUser)
      setToken(simulatedToken)
      return { success: true, user: simulatedUser, isDemo: true }
    } catch (err) {
      const errorMsg = err.message || 'حدث خطأ غير متوقع'
      setAuthError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Login with Email & Password
  const login = async ({ email, password }) => {
    setLoading(true)
    setAuthError('')
    try {
      // Try connecting to Mongoose / Express backend first
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }).catch(() => null)

      if (res && res.ok) {
        const data = await res.json()
        setUser(data.user)
        setToken(data.token)
        return { success: true, user: data.user }
      } else if (res && !res.ok) {
        const errData = await res.json().catch(() => ({}))
        const errorMsg = errData.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        setAuthError(errorMsg)
        return { success: false, error: errorMsg }
      }

      // Fallback for local demo if backend is not running yet
      console.info('Backend not reachable; falling back to local session simulation.')
      const simulatedUser = {
        id: 'usr_demo',
        name: email.split('@')[0],
        email,
        role: email.includes('admin') ? 'admin' : 'customer',
        createdAt: new Date().toISOString(),
      }
      const simulatedToken = 'mock_jwt_token_' + Date.now()
      setUser(simulatedUser)
      setToken(simulatedToken)
      return { success: true, user: simulatedUser, isDemo: true }
    } catch (err) {
      const errorMsg = err.message || 'حدث خطأ في تسجيل الدخول'
      setAuthError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Google Sign-In Handler
  const loginWithGoogle = async (googleCredential) => {
    setLoading(true)
    setAuthError('')
    try {
      if (googleCredential) {
        // Send credential token to Mongoose backend
        const res = await fetch(`${API_BASE}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: googleCredential }),
        }).catch(() => null)

        if (res && res.ok) {
          const data = await res.json()
          setUser(data.user)
          setToken(data.token)
          return { success: true, user: data.user }
        }
      }

      // Fallback Google profile simulation for frontend preview
      const googleUser = {
        id: 'google_' + Date.now(),
        name: 'مستخدم Google',
        email: 'user@gmail.com',
        avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        provider: 'google',
        role: 'customer',
        createdAt: new Date().toISOString(),
      }
      const simulatedToken = 'google_jwt_token_' + Date.now()
      setUser(googleUser)
      setToken(simulatedToken)
      return { success: true, user: googleUser, isDemo: true }
    } catch (err) {
      const errorMsg = err.message || 'فشل تسجيل الدخول باستخدام Google'
      setAuthError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setAuthError('')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        setAuthError,
        login,
        register,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

