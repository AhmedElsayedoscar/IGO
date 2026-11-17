import { useEffect, useMemo, useState } from 'react'
import demoProducts from './products.json'
import { useAuth } from './context/AuthContext'
import { useCart } from './context/CartContext'
import { useProducts } from './context/ProductsContext'
import AuthModal from './components/AuthModal'
import AuthPage from './components/AuthPage'
import CartDrawer from './components/CartDrawer'
import ProductDetailModal from './components/ProductDetailModal'
import ProductCard from './components/ProductCard'
import AdminDashboard from './components/AdminDashboard'
import UserDashboard from './components/UserDashboard'
import { ASSET } from './utils/asset'

import { motion, useReducedMotion } from 'framer-motion'

const WHATSAPP_NUMBER = '201000364250'
const CATEGORIES = ['الكل', 'هوديز', 'أطقم', 'بناطيل', 'ملابس رياضية']
const priceText = (price) => `${Number(price || 0).toLocaleString('ar-EG')} ج.م`
const whatsappLink = (message) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

function Brand({ footer = false }) {
  return (
    <a className={`brand${footer ? ' footer-brand' : ''}`} href={footer ? '#home' : '/'} aria-label="IGO Clothing Brand - الرئيسية">
      <img src={ASSET('assets/igo-logo.jpg')} alt="شعار IGO Clothing Brand" />
      <span className="brand-copy">
        <strong>IGO</strong>
        <small>CLOTHING BRAND</small>
      </span>
    </a>
  )
}

function SiteHeader({ admin = false, onOpenAuth }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { totalCount, setIsCartOpen, wishlist, orders } = useCart()
  const hello = 'مرحباً IGO، عايز أعرف تفاصيل المنتجات وتشكيلة الموسم الجديد'

  if (admin) {
    return (
      <header className="site-header admin-header">
        <Brand />
        <a className="text-link admin-back" href="/">العودة للمتجر <span aria-hidden="true">↗</span></a>
      </header>
    )
  }

  return (
    <header className="site-header">
      <Brand />

      <nav className={`main-nav${menuOpen ? ' is-open' : ''}`} aria-label="التنقل الرئيسي">
        <a className="active" href="/#home" onClick={() => setMenuOpen(false)}>الرئيسية</a>
        <a href="/#products" onClick={() => setMenuOpen(false)}>المجموعة الجديدة</a>
        <a href="/#about" onClick={() => setMenuOpen(false)}>عن IGO</a>
        <a href="/profile" onClick={() => setMenuOpen(false)}>لوحة العضو 👤</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>لوحة الإدارة ⚙️</a>
      </nav>

      <div className="header-actions">
        {/* Wishlist Indicator */}
        <button
          type="button"
          className="header-icon-btn"
          onClick={() => {
            const el = document.getElementById('products')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }}
          title="المفضلة"
          aria-label="المفضلة"
        >
          <span style={{ fontSize: '18px' }}>♥</span>
          {wishlist.length > 0 && <span className="badge-counter">{wishlist.length}</span>}
        </button>

        {/* Shopping Cart Button */}
        <button
          type="button"
          className="header-icon-btn"
          onClick={() => setIsCartOpen(true)}
          title="حقيبة التسوق"
          aria-label="حقيبة التسوق"
        >
          <span style={{ fontSize: '18px' }}>🛍</span>
          {totalCount > 0 && <span className="badge-counter">{totalCount}</span>}
        </button>

        {/* User Account / Profile */}
        {user ? (
          <div className="user-menu-wrap">
            <button
              type="button"
              className="user-profile-btn"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-expanded={userMenuOpen}
            >
              <span className="user-avatar-badge">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                  />
                ) : (
                  (user.name || 'U').charAt(0).toUpperCase()
                )}
              </span>
              <span>{user.name?.split(' ')[0] || 'حسابي'}</span>
              <span style={{ fontSize: '10px' }}>▾</span>
            </button>

            {userMenuOpen && (
              <div className="user-dropdown">
                <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--line)', fontSize: '11px', color: 'var(--muted)' }}>
                  {user.email}
                </div>
                <a className="user-dropdown-item" href="/profile">
                  لوحة حسابي (Dashboard) 👤
                </a>
                <a className="user-dropdown-item" href="/profile#orders">
                  طلباتي ({orders?.length || 0}) 🛍️
                </a>
                <a className="user-dropdown-item" href="/profile#wishlist">
                  المفضلة ({wishlist?.length || 0}) ♥
                </a>
                {user.role === 'admin' && (
                  <a className="user-dropdown-item" href="/admin">
                    لوحة الإدارة ↗
                  </a>
                )}
                <button
                  type="button"
                  className="user-dropdown-item is-logout"
                  onClick={() => {
                    logout()
                    setUserMenuOpen(false)
                  }}
                >
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="auth-header-btn"
            onClick={onOpenAuth || (() => { window.location.href = '/login' })}
          >
            تسجيل الدخول
          </button>
        )}

        {/* WhatsApp CTA */}
        <a className="button button-accent header-cta" href={whatsappLink(hello)} target="_blank" rel="noreferrer">
          <span>طلب واتساب</span>
          <span aria-hidden="true">↗</span>
        </a>

        {/* Mobile Toggle */}
        <button
          className="mobile-menu-button"
          type="button"
          aria-label="فتح القائمة"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span />
        </button>
      </div>
    </header>
  )
}

function Eyebrow({ children, dark = false }) {
  return <span className={`eyebrow${dark ? ' eyebrow-dark' : ''}`}><span />{children}</span>
}

function Storefront() {
  const { products } = useProducts()
  const [activeFilter, setActiveFilter] = useState('الكل')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [gridCols, setGridCols] = useState(3)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [toast, setToast] = useState('')
  const { wishlist } = useCart()
  const prefersReducedMotion = useReducedMotion()

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('ar')
    let list = products.filter((product) => {
      const categoryMatches =
        activeFilter === 'الكل' ||
        product.category === activeFilter ||
        (activeFilter === 'ملابس رياضية' &&
          (product.category?.includes('رياض') || product.category === 'ملابس رياضية'))

      const text = `${product.name || ''} ${product.category || ''} ${product.description || ''} ${product.tagline || ''}`.toLocaleLowerCase('ar')
      return categoryMatches && (!normalized || text.includes(normalized))
    })

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } else if (sortBy === 'discount') {
      list.sort((a, b) => {
        const discA = a.oldPrice ? a.oldPrice - a.price : 0
        const discB = b.oldPrice ? b.oldPrice - b.price : 0
        return discB - discA
      })
    } else {
      // featured
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    return list
  }, [products, activeFilter, query, sortBy])

  function announce(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2500)
  }

  return (
    <div className="winter-storefront">
      {/* Top Banner */}
      <div className="announcement">
        <span className="announcement-dot" />
        <span>شحن مجاني لكافة محافظات مصر للطلبات فوق 2,000 ج.م</span>
        <span className="announcement-code">كود: IGO10</span>
      </div>

      <SiteHeader onOpenAuth={() => setAuthModalOpen(true)} />

      <main>
        {/* Hero Section */}
        <section className="hero" id="home">
          <motion.div
            className="hero-copy"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.68, delay: 0.08, ease: 'easeOut' }}
          >
            <Eyebrow>WINTER 2026 // THE COLD EDIT</Eyebrow>
            <h1>
              أناقة الشتاء.<br />
              <em>بروح IGO.</em>
            </h1>
            <p>
              قطع IGO الأساسية بخامات قطنية مدروسة وقصات واسعة، تجمع بين الراحة والحضور الهادئ في الأيام الباردة.
            </p>
            <div className="hero-actions">
              <a className="button button-accent" href="#products">
                <span>اكتشف تشكيلة الشتاء</span>
                <span aria-hidden="true">←</span>
              </a>
              <a
                className="button button-outline"
                href={whatsappLink('مرحباً IGO، عايز أستفسر عن الموديلات والمقاسات')}
                target="_blank"
                rel="noreferrer"
              >
                <span>محادثة فورية على واتساب</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="hero-footnote">
              <span className="footnote-line" />
              <span>معاينة وقياس عند الاستلام قبل دفع أي جنيه</span>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.82, delay: 0.16, ease: 'easeOut' }}
          >
            <img
              src={ASSET('assets/sample-set.jpg')}
              alt="طقم ستريت وير راقي IGO Clothing"
              fetchPriority="high"
            />
            <div className="hero-image-shade" />
            <div className="hero-stamp">
              <span>IGO</span>
              <small>WINTER<br />EDITION</small>
            </div>
            <div className="hero-image-caption">
              <span className="caption-index">WINTER EDIT // 2026</span>
              <span>MINIMAL LUXURY STREETWEAR</span>
            </div>
          </motion.div>
          <span className="hero-watermark" aria-hidden="true">IGO</span>
        </section>

        {/* Value Proposition Trust Strip */}
        <section className="trust-strip" aria-label="مميزات المتجر">
          <div className="trust-item">
            <div className="trust-icon-wrap">🚚</div>
            <div className="trust-text">
              <strong>شحن سريع 48 ساعة</strong>
              <small>توصيل آمن لجميع محافظات مصر</small>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon-wrap">📦</div>
            <div className="trust-text">
              <strong>معاينة قبل الدفع</strong>
              <small>افتح الشحنة وقيس قبل الاستلام</small>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon-wrap">🧵</div>
            <div className="trust-text">
              <strong>خامات قطنية 100%</strong>
              <small>أقمشة معالجة ضد الانكماش والوبر</small>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon-wrap">🔄</div>
            <div className="trust-text">
              <strong>استبدال سهل ومجاني</strong>
              <small>تغيير المقاس خلال 14 يوم بكل مرونة</small>
            </div>
          </div>
        </section>

        {/* Products Catalog */}
        <section className="products-section section-wrap" id="products">
          <div className="section-heading">
            <div>
              <Eyebrow dark>THE IGO WINTER EDIT</Eyebrow>
              <h2>تشكيلة <em>الشتاء</em></h2>
              <p>قطع أساسية بتفاصيل مينيمال راقية وقصات أوفرسايز مدروسة.</p>
            </div>

            <div className="product-tools">
              <label className="search-box">
                <span className="search-icon" aria-hidden="true">⌕</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث عن هودي، طقم، بنطال..."
                  aria-label="ابحث عن منتج"
                />
              </label>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="filter-row" role="group" aria-label="تصفية المنتجات">
            {CATEGORIES.map((category) => {
              const count =
                category === 'الكل'
                  ? products.length
                  : products.filter(
                      (p) =>
                        p.category === category ||
                        (category === 'ملابس رياضية' &&
                          (p.category?.includes('رياض') || p.category === 'ملابس رياضية'))
                    ).length

              return (
                <button
                  key={category}
                  className={`filter-chip${activeFilter === category ? ' is-selected' : ''}`}
                  type="button"
                  aria-pressed={activeFilter === category}
                  onClick={() => setActiveFilter(category)}
                >
                  {category}
                  {count > 0 && <span>{String(count).padStart(2, '0')}</span>}
                </button>
              )
            })}
          </div>

          {/* Pro Catalog Toolbar */}
          <div className="pro-catalog-toolbar">
            <div className="pro-results-count">
              عرض <strong>{visibleProducts.length}</strong> من أصل <strong>{products.length}</strong> قطعة حصرية
            </div>

            <div className="pro-toolbar-controls">
              <label htmlFor="sort-select" style={{ fontSize: '12px', fontWeight: '700' }}>
                ترتيب حسب:
              </label>
              <select
                id="sort-select"
                className="pro-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">المميز أولاً (Editorial Pick)</option>
                <option value="rating">الأعلى تقييماً (Top Rated)</option>
                <option value="discount">أعلى نسبة خصم</option>
                <option value="price-asc">السعر: من الأقل للأعلى</option>
                <option value="price-desc">السعر: من الأعلى للأقل</option>
              </select>

              <div className="pro-view-toggles" role="group" aria-label="طريقة العرض">
                <button
                  type="button"
                  className={`pro-view-btn ${gridCols === 2 ? 'is-active' : ''}`}
                  onClick={() => setGridCols(2)}
                  title="عرض عريض (2 أعمدة)"
                >
                  2 ☷
                </button>
                <button
                  type="button"
                  className={`pro-view-btn ${gridCols === 3 ? 'is-active' : ''}`}
                  onClick={() => setGridCols(3)}
                  title="عرض كلاسيكي (3 أعمدة)"
                >
                  3 ▦
                </button>
                <button
                  type="button"
                  className={`pro-view-btn ${gridCols === 4 ? 'is-active' : ''}`}
                  onClick={() => setGridCols(4)}
                  title="عرض مكثف (4 أعمدة)"
                >
                  4 ▩
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className={`product-grid grid-cols-${gridCols}`} id="product-grid" aria-live="polite">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setSelectedProduct}
              />
            ))}

            {!visibleProducts.length && (
              <div className="loading-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px 20px', background: '#fff', border: '1px solid var(--line)', borderRadius: '4px' }}>
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}>🔍</span>
                <h3 style={{ margin: '0 0 6px', fontSize: '18px' }}>لم نجد قطعاً مطابقة لبحثك</h3>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>
                  جرب البحث بكلمة مختلفة أو اختر تصنيفاً آخر من الأعلى.
                </p>
                <button
                  type="button"
                  className="button button-accent"
                  style={{ marginTop: '16px', minHeight: '38px', fontSize: '12px' }}
                  onClick={() => {
                    setActiveFilter('الكل')
                    setQuery('')
                  }}
                >
                  إعادة ضبط الفلاتر
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Editorial Story */}
        <section className="brand-story" id="about">
          <div className="story-mark">I<span>G</span>O</div>
          <div className="story-copy">
            <Eyebrow>MINIMALIST LUXURY</Eyebrow>
            <h2>ستايل يعبر عنك<br /><em>بدون ما تتكلم.</em></h2>
            <p>
              علامة IGO نشأت لتقديم قطع ملابس تحترم التفاصيل: خامات قطنية ثقيلة،
              خياطة مزدوجة، ومقاسات أوفرسايز تمنحك الثقة المطلقة في كل مناسبة.
            </p>
            <a
              className="button button-outline"
              href={whatsappLink('مرحباً IGO، حابب أعرف أكتر عن البراند')}
              target="_blank"
              rel="noreferrer"
            >
              <span>تواصل مع الإدارة مباشرة</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="story-image logo-showcase">
            <span className="logo-showcase-halo" aria-hidden="true" />
            <div className="logo-showcase-card">
              <span className="logo-showcase-label" aria-hidden="true"><i>01</i> / SIGNATURE</span>
              <img src={ASSET('assets/igo-logo.jpg')} alt="الشعار الرسمي لعلامة IGO Clothing Brand" loading="lazy" />
              <span className="logo-showcase-caption" aria-hidden="true"><i /> ORIGINAL BRAND MARK</span>
            </div>
            <span className="logo-showcase-side-note" aria-hidden="true">IGO · CLOTHING BRAND</span>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="reviews-section" id="reviews">
          <div className="section-wrap" style={{ padding: '0' }}>
            <div style={{ textAlign: 'center' }}>
              <Eyebrow dark>VERIFIED REVIEWS</Eyebrow>
              <h2 style={{ fontSize: '36px', margin: '12px 0 6px', fontWeight: '800' }}>
                ماذا يقول <em>عملاؤنا</em>
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                تقييمات حقيقية من زبائن اشتروا وجربوا خاماتنا في جميع المحافظات.
              </p>
            </div>

            <div className="reviews-grid">
              <div className="review-card">
                <div>
                  <div className="review-stars">★★★★★</div>
                  <p>
                    "الهودي الرملي خامته تقيلة بجد مش كلام دعاية، والتقفيل نضيف جداً.
                    المعاينة قبل الدفع طمنتني والطلب وصلني في يومين بالظبط."
                  </p>
                </div>
                <div className="review-author">
                  <div className="author-avatar">ع</div>
                  <div className="author-info">
                    <strong>عمر الشريف</strong>
                    <small>القاهرة · اشترى هودي أوفرسايز</small>
                  </div>
                </div>
              </div>

              <div className="review-card">
                <div>
                  <div className="review-stars">★★★★★</div>
                  <p>
                    "طقم الكاجوال ممتاز جداً ومريح في اللبس والقصة أوفرسايز مظبوطة مش واسعة بهدلة.
                    شكراً لفريق خدمة العملاء على الواتساب على سرعة الرد."
                  </p>
                </div>
                <div className="review-author">
                  <div className="author-avatar">م</div>
                  <div className="author-info">
                    <strong>محمد حسام</strong>
                    <small>الإسكندرية · اشترى طقم ستريت وير</small>
                  </div>
                </div>
              </div>

              <div className="review-card">
                <div>
                  <div className="review-stars">★★★★★</div>
                  <p>
                    "كنت قلقان من المقاس بس غيروهولي مجاناً ومن غير أي تعقيد في 48 ساعة.
                    براند مصري يشرف وستايل ينافس المستورد."
                  </p>
                </div>
                <div className="review-author">
                  <div className="author-avatar">ك</div>
                  <div className="author-info">
                    <strong>كريم عبد العزيز</strong>
                    <small>المنصورة · اشترى بنطال جوجر كارجو</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Band */}
        <section className="contact-band">
          <div>
            <Eyebrow>DIRECT ASSISTANCE</Eyebrow>
            <h2>جاهز تطلب أو عندك استفسار عن المقاس؟</h2>
            <p>فريقنا متاح عبر واتساب للرد عليك واختيار المقاس المثالي لجسمك.</p>
          </div>
          <a
            className="button button-accent"
            href={whatsappLink('مرحباً IGO، محتاج مساعدة في اختيار المقاس')}
            target="_blank"
            rel="noreferrer"
          >
            <span>تحدث معنا عبر واتساب</span>
            <span aria-hidden="true">↗</span>
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer" id="footer">
        <div className="footer-top">
          <div className="footer-about">
            <Brand footer />
            <p>
              براند أزياء كاجوال وستريت وير مصري بمعايير عالمية. نصنع قطعاً تتحدث عن أناقتك
              بأجود خامات القطن المعالج.
            </p>
          </div>

          <div className="footer-col">
            <h4>روابط سريعة</h4>
            <ul>
              <li><a href="#home">الرئيسية</a></li>
              <li><a href="#products">جميع المنتجات</a></li>
              <li><a href="#about">قصة البراند</a></li>
              <li><a href="#reviews">آراء الزبائن</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>الحساب والمساعدة</h4>
            <ul>
              <li><a href="/login">تسجيل الدخول</a></li>
              <li><a href="/register">إنشاء حساب جديد</a></li>
              <li><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">سياسة الاستبدال والاسترجاع</a></li>
              <li><a href="/admin">لوحة إدارة المتجر</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>التواصل</h4>
            <ul>
              <li><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">واتساب: 01000364250</a></li>
              <li><span>التوصيل: كافة محافظات مصر</span></li>
              <li><span>ساعات العمل: يومياً من 10 ص حتى 11 م</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} IGO Clothing Brand. جميع الحقوق محفوظة.</p>
          <span>صُمم بعناية للملابس الفاخرة</span>
          <span className="winter-music-footer-credit">
            <span>موسيقى الشتاء:</span>
            <a href="https://soundcloud.com/scottbuckley" target="_blank" rel="noreferrer">Snowfall by Scott Buckley</a>
            <span aria-hidden="true">·</span>
            <a href="https://www.free-stock-music.com/scott-buckley-snowfall.html" target="_blank" rel="noreferrer">Free Stock Music</a>
            <span aria-hidden="true">·</span>
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>
          </span>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <CartDrawer />

      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <div className={`toast${toast ? ' is-visible' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  )
}

function AdminPage() {
  useEffect(() => {
    document.title = 'لوحة إدارة المتجر | IGO Admin Dashboard'
    window.scrollTo(0, 0)
  }, [])

  return <AdminDashboard />
}

function ProfilePage() {
  useEffect(() => {
    document.title = 'لوحة تحكم العضو | IGO Member Dashboard'
    window.scrollTo(0, 0)
  }, [])

  return <UserDashboard />
}

function getRoute() {
  const p = window.location.pathname.replace(/\/+$/, '')
  const h = window.location.hash.replace(/^#\/?/, '').split('?')[0]
  if (p === '/admin' || p === '/admin.html' || h === 'admin') return 'admin'
  if (
    p === '/profile' ||
    p === '/account' ||
    p === '/dashboard' ||
    h === 'profile' ||
    h === 'dashboard' ||
    h === 'account'
  )
    return 'profile'
  if (p === '/login' || h === 'login') return 'login'
  if (p === '/register' || h === 'register') return 'register'
  if (p === '/auth' || h === 'auth') return 'login'
  return 'store'
}

export default function App() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    const handleNav = () => setRoute(getRoute())
    window.addEventListener('popstate', handleNav)
    window.addEventListener('hashchange', handleNav)
    return () => {
      window.removeEventListener('popstate', handleNav)
      window.removeEventListener('hashchange', handleNav)
    }
  }, [])

  if (route === 'admin') return <AdminPage />
  if (route === 'profile') return <ProfilePage />
  if (route === 'login') return <AuthPage initialMode="login" />
  if (route === 'register') return <AuthPage initialMode="register" />
  return <Storefront />
}
