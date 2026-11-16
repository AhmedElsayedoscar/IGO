import { useEffect, useRef } from 'react'
import AuthForm from './AuthForm'

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      className="auth-dialog"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="auth-dialog-content">
        <button
          type="button"
          className="auth-dialog-close"
          aria-label="إغلاق"
          onClick={onClose}
        >
          ×
        </button>
        <div className="auth-dialog-header">
          <div className="auth-brand-badge">
            <span>IGO</span>
            <small>AUTHENTICATION</small>
          </div>
          <h2>مرحباً بك في IGO</h2>
          <p>سجّل دخولك لمتابعة طلباتك والحصول على أحدث العروض والقطع الحصرية.</p>
        </div>
        <AuthForm initialMode={initialMode} onSuccess={onClose} />
      </div>
    </dialog>
  )
}

