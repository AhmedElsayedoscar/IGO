import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  )
}

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export default function AuthForm({ initialMode = 'login', onSuccess }) {
  const [mode, setMode] = useState(initialMode) // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')
  const [successNotice, setSuccessNotice] = useState('')

  const { login, register, loginWithGoogle, loading, authError, setAuthError } = useAuth()

  // Google OAuth Client ID setup (from Vite environment or default placeholder)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    setLocalError('')
    setAuthError('')
    setSuccessNotice('')
  }, [mode, setAuthError])

  // Optional: Initialize Google Identity Services script if Google Client ID is configured
  useEffect(() => {
    if (!googleClientId || window.google?.accounts?.id) return

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      window.google?.accounts?.id?.initialize({
        client_id: googleClientId,
        callback: handleGoogleResponse,
      })
    }
    document.body.appendChild(script)
  }, [googleClientId])

  const handleGoogleResponse = async (response) => {
    const res = await loginWithGoogle(response.credential)
    if (res.success) {
      setSuccessNotice(`مرحباً بك مجدداً، ${res.user.name}!`)
      if (onSuccess) setTimeout(onSuccess, 800)
    }
  }

  const handleGoogleClick = async () => {
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt()
    } else {
      // Direct sign-in or simulation for developer preview
      const res = await loginWithGoogle(null)
      if (res.success) {
        setSuccessNotice(`تم تسجيل الدخول بواسطة Google بنجاح (${res.user.name})`)
        if (onSuccess) setTimeout(onSuccess, 800)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    setAuthError('')

    if (mode === 'register') {
      if (!name.trim()) {
        setLocalError('يرجى إدخال الاسم بالكامل')
        return
      }
      if (password.length < 6) {
        setLocalError('كلمة المرور يجب ألا تقل عن 6 أحرف')
        return
      }
      if (password !== confirmPassword) {
        setLocalError('كلمتا المرور غير متطابقتين')
        return
      }

      const res = await register({ name, email, phone, password })
      if (res.success) {
        setSuccessNotice('تم إنشاء الحساب بنجاح!')
        if (onSuccess) setTimeout(onSuccess, 800)
      }
    } else {
      // Login mode
      if (!email.trim() || !password) {
        setLocalError('يرجى ملء جميع الحقول المطلوبة')
        return
      }

      const res = await login({ email, password })
      if (res.success) {
        setSuccessNotice(`مرحباً بعودتك، ${res.user.name}!`)
        if (onSuccess) setTimeout(onSuccess, 800)
      }
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          className={`auth-tab ${mode === 'login' ? 'is-active' : ''}`}
          onClick={() => setMode('login')}
        >
          تسجيل الدخول
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'register'}
          className={`auth-tab ${mode === 'register' ? 'is-active' : ''}`}
          onClick={() => setMode('register')}
        >
          إنشاء حساب جديد
        </button>
      </div>

      <div className="auth-content">
        {/* Google OAuth Button */}
        <button
          type="button"
          className="google-auth-button"
          onClick={handleGoogleClick}
          disabled={loading}
        >
          <GoogleIcon />
          <span>المتابعة باستخدام Google</span>
        </button>

        <div className="auth-divider">
          <span>أو عبر البريد الإلكتروني</span>
        </div>

        {/* Feedback Notices */}
        {(localError || authError) && (
          <div className="auth-alert auth-alert-error" role="alert">
            <span aria-hidden="true">⚠</span>
            <span>{localError || authError}</span>
          </div>
        )}

        {successNotice && (
          <div className="auth-alert auth-alert-success" role="status">
            <span aria-hidden="true">✓</span>
            <span>{successNotice}</span>
          </div>
        )}

        {/* The Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="reg-name">الاسم بالكامل *</label>
              <input
                id="reg-name"
                type="text"
                placeholder="أحمد علي"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">البريد الإلكتروني *</label>
            <input
              id="auth-email"
              type="email"
              placeholder="example@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              dir="ltr"
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="reg-phone">رقم الهاتف / واتساب (اختياري)</label>
              <input
                id="reg-phone"
                type="tel"
                placeholder="01012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                dir="ltr"
              />
            </div>
          )}

          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="auth-password">كلمة المرور *</label>
              {mode === 'login' && (
                <button
                  type="button"
                  className="auth-link-subtle"
                  onClick={() => alert('يمكنك التواصل معنا عبر واتساب لاسترجاع الحساب حالياً.')}
                >
                  نسيت كلمة المرور؟
                </button>
              )}
            </div>
            <div className="password-input-wrap">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                dir="ltr"
              />
              <button
                type="button"
                className="password-toggle-btn"
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                onClick={() => setShowPassword(!showPassword)}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="reg-confirm-password">تأكيد كلمة المرور *</label>
              <input
                id="reg-confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                dir="ltr"
              />
            </div>
          )}

          {mode === 'login' && (
            <label className="checkbox-wrap">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>تذكر تسجيل دخولي على هذا الجهاز</span>
            </label>
          )}

          <button
            type="submit"
            className="button button-accent auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-dots">جارٍ المعالجة...</span>
            ) : mode === 'login' ? (
              <>
                <span>تسجيل الدخول</span>
                <span aria-hidden="true">←</span>
              </>
            ) : (
              <>
                <span>إنشاء الحساب</span>
                <span aria-hidden="true">←</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-switch">
          {mode === 'login' ? (
            <p>
              ليس لديك حساب بعد؟{' '}
              <button type="button" onClick={() => setMode('register')}>
                أنشئ حسابك الآن
              </button>
            </p>
          ) : (
            <p>
              لديك حساب بالفعل؟{' '}
              <button type="button" onClick={() => setMode('login')}>
                تسجيل الدخول
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

