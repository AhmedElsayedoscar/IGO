import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const ASSET = (path) => `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, '')}`

export default function AdminLogin({ onLoginSuccess }) {
  const { login, loading, authError, setAuthError } = useAuth()
  const [email, setEmail] = useState('admin@igo.com')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')

  // Default credentials (can be overridden in localStorage or .env)
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@igo.com'
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    if (setAuthError) setAuthError('')

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    if (!cleanEmail || !cleanPassword) {
      setLocalError('يرجى إدخال البريد الإلكتروني وكلمة المرور')
      return
    }

    // Check custom saved admin password or default
    const savedAdminPass = localStorage.getItem('igo_admin_pass') || ADMIN_PASSWORD
    const savedAdminEmail = localStorage.getItem('igo_admin_email') || ADMIN_EMAIL

    if (cleanEmail === savedAdminEmail.toLowerCase() && cleanPassword === savedAdminPass) {
      // Local authorization success
      const adminUser = {
        id: 'admin_master',
        name: 'مدير المتجر (Master Admin)',
        email: cleanEmail,
        role: 'admin',
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem('igo_admin_logged', 'true')
      localStorage.setItem('igo_user', JSON.stringify(adminUser))
      localStorage.setItem('igo_token', 'admin_secure_token_' + Date.now())
      if (onLoginSuccess) onLoginSuccess(adminUser)
      return
    }

    // Otherwise, try backend login
    const res = await login({ email: cleanEmail, password: cleanPassword })
    if (res.success) {
      if (res.user.role === 'admin' || cleanEmail.includes('admin')) {
        localStorage.setItem('igo_admin_logged', 'true')
        if (onLoginSuccess) onLoginSuccess(res.user)
      } else {
        setLocalError('هذا الحساب ليس لديه صلاحيات إدارة المتجر.')
      }
    } else {
      setLocalError(res.error || 'بيانات الدخول غير صحيحة. يرجى التأكد من البريد وكلمة المرور.')
    }
  }

  const handleQuickDemoLogin = () => {
    const adminUser = {
      id: 'admin_master',
      name: 'مدير المتجر (Master Admin)',
      email: 'admin@igo.com',
      role: 'admin',
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem('igo_admin_logged', 'true')
    localStorage.setItem('igo_user', JSON.stringify(adminUser))
    localStorage.setItem('igo_token', 'admin_secure_token_' + Date.now())
    if (onLoginSuccess) onLoginSuccess(adminUser)
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        {/* Brand Emblem */}
        <div className="admin-login-brand">
          <img src={ASSET('assets/igo-logo.jpg')} alt="شعار IGO" />
          <div className="admin-login-copy">
            <strong>IGO</strong>
            <small>CLOTHING BRAND</small>
          </div>
        </div>

        <div className="admin-gate-badge">
          <span className="gate-lock-icon">🔒</span>
          <span>بوابة إدارة النظام المحمية</span>
        </div>

        <h2>تسجيل دخول الإدارة</h2>
        <p className="admin-login-desc">
          أدخل بيانات المشرف المعتمد للوصول إلى لوحة التحكم وتعديل المنتجات والمخزون.
        </p>

        {/* Error Alert */}
        {(localError || authError) && (
          <div className="admin-login-alert" role="alert">
            <span aria-hidden="true">⚠</span>
            <span>{localError || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="admin-email">بريد مدير المتجر</label>
            <input
              id="admin-email"
              type="email"
              placeholder="admin@igo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">كلمة المرور السرية</label>
            <div className="password-input-wrap">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'إخفاء' : 'إظهار'}
              >
                {showPassword ? '👁' : '👁‍🗨'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="button button-accent admin-login-submit"
            disabled={loading}
          >
            {loading ? 'جارٍ التحقق...' : 'دخول لوحة الإدارة ↗'}
          </button>

          <button
            type="button"
            className="button button-outline"
            onClick={handleQuickDemoLogin}
            style={{ width: '100%', marginTop: '10px', fontSize: '13px' }}
          >
            ⚡ دخول تجريبي فوري بنقرة واحدة
          </button>
        </form>

        {/* Credentials Quick Info */}
        <div className="admin-credentials-hint">
          <strong>بيانات الدخول الافتراضية المجهزة:</strong>
          <div className="hint-line">
            <span>البريد الإلكتروني:</span>
            <code>admin@igo.com</code>
          </div>
          <div className="hint-line">
            <span>كلمة المرور:</span>
            <code>admin123</code>
          </div>
          <small>(يمكنك تغيير كلمة المرور والبريد في أي وقت من داخل لوحة الإدارة)</small>
        </div>

        <div className="admin-login-back">
          <a href="/">العودة إلى متجر IGO ↗</a>
        </div>
      </div>
    </div>
  )
}

