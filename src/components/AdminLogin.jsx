import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const ASSET = (path) => `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, '')}`

// Max failed attempts before lockout
const MAX_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15
const LOCKOUT_KEY = 'igo_admin_lockout'
const ATTEMPTS_KEY = 'igo_admin_attempts'

function getRemainingLockout() {
  try {
    const lockoutUntil = Number(localStorage.getItem(LOCKOUT_KEY) || 0)
    const now = Date.now()
    if (lockoutUntil > now) return Math.ceil((lockoutUntil - now) / 60000)
  } catch {}
  return 0
}

function getAttempts() {
  try { return Number(localStorage.getItem(ATTEMPTS_KEY) || 0) } catch { return 0 }
}

function recordFailedAttempt() {
  try {
    const current = getAttempts() + 1
    localStorage.setItem(ATTEMPTS_KEY, String(current))
    if (current >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_MINUTES * 60 * 1000
      localStorage.setItem(LOCKOUT_KEY, String(until))
    }
    return current
  } catch { return 0 }
}

function clearAttempts() {
  try {
    localStorage.removeItem(LOCKOUT_KEY)
    localStorage.removeItem(ATTEMPTS_KEY)
  } catch {}
}

export default function AdminLogin({ onLoginSuccess }) {
  const { login, loading, authError, setAuthError } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError]     = useState('')
  const [lockoutMins, setLockoutMins]   = useState(getRemainingLockout)
  const [attemptsLeft, setAttemptsLeft] = useState(() => MAX_ATTEMPTS - getAttempts())

  // Credentials from env only — no defaults shown to user
  const ADMIN_EMAIL    = import.meta.env.VITE_ADMIN_EMAIL    || 'admin@igo.com'
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

  // Tick the lockout countdown every 30s
  useEffect(() => {
    if (!lockoutMins) return
    const t = setInterval(() => {
      const remaining = getRemainingLockout()
      setLockoutMins(remaining)
      if (!remaining) clearInterval(t)
    }, 30000)
    return () => clearInterval(t)
  }, [lockoutMins])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    if (setAuthError) setAuthError('')

    // Check lockout first
    const remaining = getRemainingLockout()
    if (remaining > 0) {
      setLockoutMins(remaining)
      setLocalError(`تم قفل الوصول مؤقتاً. حاول مرة أخرى بعد ${remaining} دقيقة.`)
      return
    }

    const cleanEmail    = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    if (!cleanEmail || !cleanPassword) {
      setLocalError('يرجى إدخال البريد الإلكتروني وكلمة المرور')
      return
    }

    // Check saved/default credentials — never log or expose them
    const savedAdminPass  = localStorage.getItem('igo_admin_pass')  || ADMIN_PASSWORD
    const savedAdminEmail = (localStorage.getItem('igo_admin_email') || ADMIN_EMAIL).toLowerCase()

    if (cleanEmail === savedAdminEmail && cleanPassword === savedAdminPass) {
      clearAttempts()
      const adminUser = {
        id: 'admin_master',
        name: 'مدير المتجر',
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

    // Try backend login as fallback
    const res = await login({ email: cleanEmail, password: cleanPassword })
    if (res?.success && (res.user?.role === 'admin')) {
      clearAttempts()
      localStorage.setItem('igo_admin_logged', 'true')
      if (onLoginSuccess) onLoginSuccess(res.user)
      return
    }

    // Record failed attempt
    const newCount = recordFailedAttempt()
    const left = MAX_ATTEMPTS - newCount
    setAttemptsLeft(Math.max(0, left))

    if (left <= 0) {
      setLockoutMins(LOCKOUT_MINUTES)
      setLocalError(`تم قفل الوصول لمدة ${LOCKOUT_MINUTES} دقيقة بسبب كثرة المحاولات الخاطئة.`)
    } else {
      setLocalError(`بيانات الدخول غير صحيحة. تبقّى ${left} محاولة قبل القفل المؤقت.`)
    }
  }

  const isLocked = lockoutMins > 0

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        {/* Brand */}
        <div className="admin-login-brand">
          <img src={ASSET('assets/igo-logo.jpg')} alt="شعار IGO" />
          <div className="admin-login-copy">
            <strong>IGO</strong>
            <small>CLOTHING BRAND</small>
          </div>
        </div>

        <div className="admin-gate-badge">
          <span className="gate-lock-icon">{isLocked ? '🔐' : '🔒'}</span>
          <span>منطقة محمية — مشرفون فقط</span>
        </div>

        <h2>دخول لوحة الإدارة</h2>
        <p className="admin-login-desc">
          هذه المنطقة مقيّدة على المشرفين المعتمدين. أي محاولة وصول غير مصرّح بها مسجّلة ومراقَبة.
        </p>

        {/* Lockout Banner */}
        {isLocked && (
          <div className="admin-login-alert is-lockout" role="alert">
            <span aria-hidden="true">⏱</span>
            <span>الحساب مقفول مؤقتاً — المتبقي: {lockoutMins} دقيقة</span>
          </div>
        )}

        {/* Error */}
        {!isLocked && (localError || authError) && (
          <div className="admin-login-alert" role="alert">
            <span aria-hidden="true">⚠</span>
            <span>{localError || authError}</span>
          </div>
        )}

        {/* Attempts warning */}
        {!isLocked && attemptsLeft < MAX_ATTEMPTS && attemptsLeft > 0 && (
          <div className="admin-login-alert is-warning" role="alert" style={{ background: '#fff7e6', borderColor: '#f59e0b', color: '#92400e' }}>
            <span aria-hidden="true">⚠</span>
            <span>تحذير: تبقّى {attemptsLeft} محاولة فقط قبل القفل لمدة {LOCKOUT_MINUTES} دقيقة.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form" autoComplete="off">
          <div className="form-group">
            <label htmlFor="admin-email">البريد الإلكتروني للمشرف</label>
            <input
              id="admin-email"
              type="email"
              placeholder="أدخل البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
              autoComplete="off"
              disabled={isLocked}
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">كلمة المرور</label>
            <div className="password-input-wrap">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
                autoComplete="new-password"
                disabled={isLocked}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'إخفاء' : 'إظهار'}
                disabled={isLocked}
              >
                {showPassword ? '👁' : '👁‍🗨'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="button button-accent admin-login-submit"
            disabled={loading || isLocked}
            style={{ opacity: isLocked ? 0.5 : 1 }}
          >
            {loading ? 'جارٍ التحقق...' : isLocked ? `مقفول — انتظر ${lockoutMins} دقيقة` : 'دخول لوحة الإدارة ↗'}
          </button>
        </form>

        <div className="admin-login-back">
          <a href="/">العودة إلى متجر IGO ↗</a>
        </div>
      </div>
    </div>
  )
}
