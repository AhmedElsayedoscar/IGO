import { useEffect, useMemo, useRef, useState } from 'react'
import demoProducts from './products.json'

const WHATSAPP_NUMBER = '201000364250'
const CATEGORIES = ['الكل', 'هوديز', 'أطقم', 'بناطيل']
const ASSET = (path) => `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, '')}`
const priceText = (price) => `${Number(price || 0).toLocaleString('ar-EG')} ج.م`
const whatsappLink = (message) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

function Brand({ footer = false }) {
  return (
    <a className={`brand${footer ? ' footer-brand' : ''}`} href={footer ? '#home' : '/'} aria-label="IGO Clothing Brand - الرئيسية">
      <img src={ASSET('assets/igo-logo.jpg')} alt="شعار IGO Clothing Brand" />
      <span className="brand-copy"><strong>IGO</strong><small>CLOTHING BRAND</small></span>
    </a>
  )
}

function SiteHeader({ admin = false }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const hello = 'مرحباً IGO، عايز أعرف تفاصيل المنتجات'

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
        <a className="active" href="#home" onClick={() => setMenuOpen(false)}>الرئيسية</a>
        <a href="#products" onClick={() => setMenuOpen(false)}>المنتجات</a>
        <a href="#about" onClick={() => setMenuOpen(false)}>عن IGO</a>
      </nav>
      <a className="button button-light header-cta" href={whatsappLink(hello)} target="_blank" rel="noreferrer">
        كلمنا على واتساب <span aria-hidden="true">↗</span>
      </a>
      <button className="mobile-menu-button" type="button" aria-label="فتح القائمة" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
        <span /><span />
      </button>
    </header>
  )
}

function Eyebrow({ children, dark = false }) {
  return <span className={`eyebrow${dark ? ' eyebrow-dark' : ''}`}><span />{children}</span>
}

function Storefront() {
  const [products] = useState(demoProducts)
  const [activeFilter, setActiveFilter] = useState('الكل')
  const [query, setQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [toast, setToast] = useState('')
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const dialogRef = useRef(null)

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('ar')
    return products.filter((product) => {
      const categoryMatches = activeFilter === 'الكل' || product.category === activeFilter
      const text = `${product.name || ''} ${product.category || ''} ${product.description || ''}`.toLocaleLowerCase('ar')
      return categoryMatches && (!normalized || text.includes(normalized))
    })
  }, [products, activeFilter, query])

  useEffect(() => {
    const dialog = dialogRef.current
    if (selectedProduct && dialog && !dialog.open) dialog.showModal()
    if (!selectedProduct && dialog?.open) dialog.close()
  }, [selectedProduct])

  function announce(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2500)
  }

  function startOrder(product) {
    setSelectedProduct(product)
    setSize('')
    setColor('')
    setQuantity('1')
  }

  function submitOrder(event) {
    event.preventDefault()
    if (!selectedProduct) return
    const message = `مرحباً IGO، عايز أطلب المنتج: ${selectedProduct.name}\nالسعر المعروض تجريبي: ${priceText(selectedProduct.price)}\nالمقاس: ${size}\nاللون: ${color.trim()}\nالكمية: ${quantity}\nممكن تأكيد السعر والتوفر؟`
    window.open(whatsappLink(message), '_blank', 'noopener,noreferrer')
    setSelectedProduct(null)
    announce('فتحنا واتساب برسالة الطلب. أكّد السعر والتوفر مع المتجر.')
  }

  return (
    <>
      <div className="announcement"><span className="announcement-dot" />كل المنتجات والأسعار الحالية أمثلة قابلة للتعديل</div>
      <SiteHeader />
      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <Eyebrow>IGO — CLOTHING BRAND</Eyebrow>
            <h1>ستايلك.<br /><em>على مزاجك.</em></h1>
            <p>قطع بسيطة بتفاصيل مختلفة. اختار الإطلالة اللي شبهك، واسألنا عن المقاس والتفاصيل على واتساب.</p>
            <div className="hero-actions">
              <a className="button button-accent" href="#products">اكتشف المنتجات <span aria-hidden="true">←</span></a>
              <a className="text-link" href={whatsappLink('مرحباً IGO، عايز أسأل عن المتجر')} target="_blank" rel="noreferrer">اسألنا مباشرة <span aria-hidden="true">↗</span></a>
            </div>
            <div className="hero-footnote"><span className="footnote-line" /><span>اختياراتك هي اللي بتكمّل اللوك</span></div>
          </div>
          <div className="hero-visual">
            <img src={ASSET('assets/sample-set.jpg')} alt="إطلالة ملابس كاجوال بلون محايد — صورة توضيحية" fetchPriority="high" />
            <div className="hero-image-shade" />
            <div className="hero-stamp"><span>IGO</span><small>FIND YOUR<br />OWN FIT</small></div>
            <div className="hero-image-caption"><span className="caption-index">01 / 03</span><span>LOOKS THAT<br />FEEL LIKE YOU</span></div>
          </div>
          <span className="hero-watermark" aria-hidden="true">IGO</span>
        </section>

        <section className="trust-strip" aria-label="معلومات المتجر">
          <div><span className="strip-number">01</span><span>تصفّح أمثلة المنتجات</span></div>
          <div><span className="strip-number">02</span><span>اختار المقاس واللون</span></div>
          <div><span className="strip-number">03</span><span>كمل طلبك على واتساب</span></div>
        </section>

        <section className="products-section section-wrap" id="products">
          <div className="section-heading">
            <div>
              <Eyebrow dark>THE IGO EDIT</Eyebrow>
              <h2>اختيارات <em>مميزة</em></h2>
              <p>دي أمثلة مؤقتة للمنتجات والأسعار — تقدر تعدّلها لاحقًا.</p>
            </div>
            <div className="product-tools">
              <label className="search-box">
                <span className="search-icon" aria-hidden="true">⌕</span>
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="دور على قطعة..." aria-label="ابحث عن منتج" />
              </label>
            </div>
          </div>
          <div className="filter-row" role="group" aria-label="تصفية المنتجات">
            {CATEGORIES.map((category) => (
              <button key={category} className={`filter-chip${activeFilter === category ? ' is-selected' : ''}`} type="button" aria-pressed={activeFilter === category} onClick={() => setActiveFilter(category)}>
                {category}{category === 'الكل' && <span>{String(products.length).padStart(2, '0')}</span>}
              </button>
            ))}
          </div>
          <p className="demo-banner"><span aria-hidden="true">✳</span> صور وأسعار توضيحية فقط في الوقت الحالي؛ تأكد من السعر والتوفر عبر واتساب.</p>
          <div className="product-grid" id="product-grid" aria-live="polite">
            {visibleProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image-wrap">
                  <img src={ASSET(product.image)} alt={`${product.name} — صورة توضيحية`} loading="lazy" />
                  <span className="product-badge">{product.featured ? 'اختيارنا' : 'مثال'}</span>
                  <button className="product-card-action" type="button" onClick={() => startOrder(product)} aria-label={`اسأل عن ${product.name} عبر واتساب`}>
                    <span>اسأل عن القطعة</span><span aria-hidden="true">↗</span>
                  </button>
                </div>
                <div className="product-meta">
                  <div><h3>{product.name}</h3><p className="product-category">{product.category || 'IGO EDIT'}</p></div>
                  <div className="product-price">{priceText(product.price)}<small>سعر تجريبي</small></div>
                </div>
              </article>
            ))}
            {!visibleProducts.length && products.length > 0 && <p className="loading-card">مفيش منتجات مطابقة للبحث دلوقتي.</p>}
            {!products.length && <p className="loading-card">لا توجد منتجات حاليًا. أضفها بعد ربط لوحة الإدارة.</p>}
          </div>
        </section>

        <section className="brand-story" id="about">
          <div className="story-mark">I<span>G</span>O</div>
          <div className="story-copy">
            <Eyebrow>YOUR STYLE, YOUR RULES</Eyebrow>
            <h2>مش لازم تقول<br /><em>كتير عشان تِبان.</em></h2>
            <p>IGO مساحة لستايل يومي يعبر عنك. ابدأ من القطعة اللي عجبتك، وخلّينا نساعدك تعرف تفاصيلها.</p>
            <a className="button button-outline" href={whatsappLink('مرحباً IGO، عايز أسأل عن المتجر')} target="_blank" rel="noreferrer">اسألنا عن IGO <span aria-hidden="true">↗</span></a>
          </div>
          <div className="story-image"><img src={ASSET('assets/sample-joggers.jpg')} alt="تفصيلة بنطال كاجوال — صورة توضيحية" loading="lazy" /><span>DETAILS<br />MATTER</span></div>
        </section>

        <section className="contact-band">
          <div><Eyebrow>LET'S TALK</Eyebrow><h2>لقيت اللي شبهك؟</h2><p>ابعتلنا على واتساب واسأل عن التفاصيل.</p></div>
          <a className="button button-accent" href={whatsappLink('مرحباً IGO، عايز أعرف تفاصيل المنتجات')} target="_blank" rel="noreferrer">ابدأ محادثة <span aria-hidden="true">↗</span></a>
        </section>
      </main>
      <footer className="site-footer" id="footer">
        <Brand footer />
        <p>© {new Date().getFullYear()} IGO Clothing Brand. جميع الحقوق محفوظة.</p>
        <div className="footer-links"><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">واتساب</a><a href="/admin">إدارة المنتجات</a></div>
      </footer>

      <dialog id="order-dialog" className="order-dialog" ref={dialogRef} aria-labelledby="dialog-title" onClose={() => setSelectedProduct(null)} onClick={(event) => { if (event.target === event.currentTarget) setSelectedProduct(null) }}>
        <form id="order-form" onSubmit={submitOrder}>
          <button className="dialog-close" type="button" aria-label="إغلاق" onClick={() => setSelectedProduct(null)}>×</button>
          <Eyebrow dark>QUICK ORDER</Eyebrow>
          <h2 id="dialog-title">اطلب القطعة</h2>
          {selectedProduct && <>
            <p className="dialog-product-name">{selectedProduct.name}</p>
            <p className="dialog-demo-price">سعر توضيحي: {priceText(selectedProduct.price)}</p>
          </>}
          <label className="form-label" htmlFor="order-size">المقاس</label>
          <select id="order-size" value={size} onChange={(event) => setSize(event.target.value)} required>
            <option value="" disabled>اختار المقاس</option><option>Small</option><option>Medium</option><option>Large</option><option>XL</option><option>XXL</option>
          </select>
          <label className="form-label" htmlFor="order-color">اللون المفضل</label>
          <input id="order-color" type="text" value={color} onChange={(event) => setColor(event.target.value)} placeholder="مثال: أسود" required />
          <label className="form-label" htmlFor="order-quantity">الكمية</label>
          <input id="order-quantity" type="number" min="1" max="10" value={quantity} onChange={(event) => setQuantity(event.target.value)} required />
          <button className="button button-dark dialog-submit" type="submit">كمل الطلب على واتساب <span aria-hidden="true">↗</span></button>
          <small className="dialog-note">السعر والتوفر في الرسالة توضيحيان؛ أكّد التفاصيل مع المتجر.</small>
        </form>
      </dialog>
      <div className={`toast${toast ? ' is-visible' : ''}`} role="status" aria-live="polite">{toast}</div>
    </>
  )
}

function AdminPage() {
  useEffect(() => {
    document.body.classList.add('admin-page')
    return () => document.body.classList.remove('admin-page')
  }, [])

  return (
    <>
      <SiteHeader admin />
      <main className="admin-main">
        <div className="admin-title-row">
          <div><Eyebrow dark>STORE CONTROL</Eyebrow><h1>إدارة <em>المنتجات</em></h1><p>هيكل لوحة الإدارة في نسخة React.</p></div>
          <a className="button button-dark" href="/#products">معاينة المتجر <span aria-hidden="true">↗</span></a>
        </div>
        <aside className="admin-warning" role="note">
          <strong><span aria-hidden="true">ⓘ</span> الإدارة الفعلية غير متصلة بعد.</strong>
          <p>هذه الصفحة لا تسجل دخولًا ولا تحفظ التعديلات. لن أضع حفظًا محليًا وأقدمه كأنه قاعدة بيانات مشتركة. بعد ربط مشروع Supabase سيتم تفعيل تسجيل الدخول، تعديل المنتجات وحفظها للزوار.</p>
        </aside>
        <div className="admin-layout">
          <section className="admin-products-panel">
            <div className="admin-panel-heading"><h2>أمثلة المنتجات</h2><span>عرض فقط</span></div>
            {demoProducts.map((product) => <div className="admin-demo-product" key={product.id}><span>{product.name}<small>{product.category} · {product.id}</small></span><strong>{priceText(product.price)}</strong></div>)}
          </section>
          <section className="admin-form-panel">
            <div className="admin-panel-heading"><h2>المطلوب لتفعيل الإدارة</h2><span>خطوة الإعداد التالية</span></div>
            <div className="admin-status-card">
              <span className="admin-status-badge">قاعدة البيانات غير متصلة</span>
              <ol className="admin-next-steps">
                <li>إنشاء مشروع مجاني في Supabase بحسابك.</li>
                <li>توفير Project URL وPublishable/anon key العام، مع إيميل مدير المتجر.</li>
                <li>ربط قاعدة المنتجات وتطبيق صلاحيات قراءة عامة وتعديل للمدير فقط.</li>
              </ol>
              <p className="admin-footnote">لا تضع كلمة مرور أو مفتاح <code>service_role</code> في هذه الصفحة أو في مستودع عام.</p>
            </div>
          </section>
        </div>
        <p className="admin-footnote">هذه واجهة React محلية غير منشورة. الصور والأسعار الحالية أمثلة فقط، وطلبات البيع تظل عبر واتساب بعد نشر الموقع.</p>
      </main>
      <footer className="site-footer"><Brand footer /><p>© IGO Clothing Brand</p><a href="/">العودة للمتجر</a></footer>
    </>
  )
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '')
  return path === '/admin' || path === '/admin.html' ? <AdminPage /> : <Storefront />
}
