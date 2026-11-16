import { useEffect } from 'react'
import AuthForm from './AuthForm'

const ASSET = (path) => `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, '')}`

export default function AuthPage({ initialMode = 'login' }) {
  useEffect(() => {
    document.title = initialMode === 'register' ? 'إنشاء حساب جديد | IGO Clothing' : 'تسجيل الدخول | IGO Clothing'
    window.scrollTo(0, 0)
  }, [initialMode])

  return (
    <div className="auth-page-wrapper">
      <header className="auth-page-header">
        <a className="brand" href="/" aria-label="العودة للرئيسية">
          <img src={ASSET('assets/igo-logo.jpg')} alt="شعار IGO Clothing Brand" />
          <span className="brand-copy">
            <strong>IGO</strong>
            <small>CLOTHING BRAND</small>
          </span>
        </a>
        <a className="text-link auth-back-link" href="/">
          العودة للمتجر <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main className="auth-page-main">
        <div className="auth-page-grid">
          {/* Brand Visual Side */}
          <section className="auth-visual-side">
            <div className="auth-visual-inner">
              <span className="eyebrow">
                <span></span> IGO CLUB & MEMBERS
              </span>
              <h1>
                انضم لعالم<br />
                <em>IGO CLOTHING</em>
              </h1>
              <p>
                احصل على تجربة تسوق مخصصة، إمكانية حفظ مقاساتك وقطعك المفضلة،
                والتواصل المباشر مع فريقنا عبر واتساب لتأكيد طلبياتك.
              </p>

              <div className="auth-perks-list">
                <div className="auth-perk-item">
                  <span className="perk-num">01</span>
                  <span>حساب آمن ومحفوظ</span>
                </div>
                <div className="auth-perk-item">
                  <span className="perk-num">02</span>
                  <span>دخول فوري بنقرة واحدة بحساب Google</span>
                </div>
                <div className="auth-perk-item">
                  <span className="perk-num">03</span>
                  <span>أولوية الحجز في تشكيلات القطع المحدودة (Limited Drops)</span>
                </div>
              </div>
            </div>
            <div className="auth-bg-watermark" aria-hidden="true">IGO</div>
          </section>

          {/* Form Side */}
          <section className="auth-form-side">
            <div className="auth-form-container">
              <AuthForm
                initialMode={initialMode}
                onSuccess={() => {
                  window.location.href = '/'
                }}
              />
            </div>
          </section>
        </div>
      </main>

      <footer className="auth-page-footer">
        <p>© {new Date().getFullYear()} IGO Clothing Brand. جميع الحقوق محفوظة.</p>
        <div className="footer-links">
          <a href="/">الرئيسية</a>
          <a href="/#products">المنتجات</a>
          <a href="https://wa.me/201000364250" target="_blank" rel="noreferrer">الدعم الفني</a>
        </div>
      </footer>
    </div>
  )
}

