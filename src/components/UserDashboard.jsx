import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'
import { ASSET } from '../utils/asset'

const priceText = (p) => `${Number(p || 0).toLocaleString('ar-EG')} ج.م`
const WHATSAPP_NUMBER = '201000364250'

export default function UserDashboard() {
  const { user, updateUser, logout } = useAuth()
  const { cart, wishlist, toggleWishlist, addToCart, orders } = useCart()
  const { products } = useProducts()

  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '')
    if (['overview', 'orders', 'wishlist', 'address', 'settings'].includes(hash)) {
      return hash
    }
    return 'overview'
  })
  const [toastMsg, setToastMsg] = useState('')

  // Profile Edit State
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [email] = useState(user?.email || '')

  // Password Edit State
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')

  // Address State
  const [savedAddress, setSavedAddress] = useState(() => {
    try {
      const saved = localStorage.getItem('igo_user_address')
      return saved
        ? JSON.parse(saved)
        : {
            city: 'القاهرة',
            area: 'المعادي',
            street: 'شارع 9، عمارة 14، شقة 5',
            extraPhone: '01012345678',
            notes: 'يرجى الاتصال قبل الوصول بنصف ساعة للمعاينة والقياس',
          }
    } catch {
      return { city: '', area: '', street: '', extraPhone: '', notes: '' }
    }
  })

  const [addressForm, setAddressForm] = useState(savedAddress)

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  // Handle Profile Save
  const handleSaveProfile = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      showToast('يرجى إدخال اسم صالح')
      return
    }
    updateUser({ name: name.trim(), phone: phone.trim() })
    showToast('✓ تم تحديث بيانات ملفك الشخصي بنجاح!')
  }

  // Handle Password Change
  const handleChangePassword = (e) => {
    e.preventDefault()
    if (newPass.length < 6) {
      showToast('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
      return
    }
    if (newPass !== confirmPass) {
      showToast('كلمتا المرور غير متطابقتين')
      return
    }
    setCurrentPass('')
    setNewPass('')
    setConfirmPass('')
    showToast('✓ تم تحديث كلمة المرور بنجاح!')
  }

  // Handle Address Save
  const handleSaveAddress = (e) => {
    e.preventDefault()
    setSavedAddress(addressForm)
    try {
      localStorage.setItem('igo_user_address', JSON.stringify(addressForm))
    } catch (err) {
      console.error(err)
    }
    showToast('✓ تم حفظ عنوان التوصيل المفضل بنجاح!')
  }

  // Wishlist products
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id))

  const copyVipCode = () => {
    navigator.clipboard?.writeText('IGO-VIP10')
    showToast('✓ تم نسخ كود الخصم (IGO-VIP10) إلى الحافظة!')
  }

  return (
    <div className="user-dashboard-wrapper">
      {/* Header */}
      <header className="user-dash-header">
        <a className="brand" href="/" aria-label="العودة للرئيسية">
          <img src={ASSET('assets/igo-logo.jpg')} alt="شعار IGO" />
          <span className="brand-copy">
            <strong>IGO</strong>
            <small>MEMBER CLUB</small>
          </span>
        </a>

        <div className="dash-header-actions">
          <a className="button button-outline-dark" href="/">
            تصفح المتجر ↗
          </a>
          <button
            type="button"
            className="button button-quiet is-logout"
            onClick={() => {
              logout()
              window.location.href = '/'
            }}
          >
            تسجيل الخروج ✕
          </button>
        </div>
      </header>

      {/* Floating Toast */}
      {toastMsg && (
        <div className="user-dash-toast" role="status">
          {toastMsg}
        </div>
      )}

      {/* Hero Welcome Card */}
      <section className="user-welcome-card">
        <div className="user-welcome-info">
          <div className="user-avatar-huge">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              (user?.name || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="user-vip-badge">
              <span>✦</span>
              <span>عضو معتمد في IGO CLUB</span>
            </div>
            <h1>مرحباً، {user?.name || 'عضو IGO'}</h1>
            <p className="user-email-text">{user?.email || 'member@igo.com'}</p>
          </div>
        </div>

        {/* Promo code for user */}
        <div className="user-vip-promo" onClick={copyVipCode} title="اضغط لنسخ كود الخصم">
          <div className="promo-tag">كود خصمك الحصري 10%:</div>
          <div className="promo-code-box">
            <code>IGO-VIP10</code>
            <span className="copy-icon">📋 نسخ</span>
          </div>
        </div>
      </section>

      {/* Stats Summary Bar */}
      <div className="user-stats-strip">
        <div className="stat-box" onClick={() => setActiveTab('orders')}>
          <span className="stat-num">{orders?.length || 0}</span>
          <span className="stat-label">طلباتي المسجلة</span>
        </div>
        <div className="stat-box" onClick={() => setActiveTab('wishlist')}>
          <span className="stat-num">{wishlist?.length || 0}</span>
          <span className="stat-label">القطع في المفضلة</span>
        </div>
        <div className="stat-box" onClick={() => setActiveTab('overview')}>
          <span className="stat-num">{cart?.length || 0}</span>
          <span className="stat-label">قطع في حقيبة التسوق</span>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="user-dashboard-body">
        {/* Navigation Sidebar Tabs */}
        <aside className="user-dash-sidebar">
          <nav className="user-dash-menu">
            <button
              type="button"
              className={`menu-item ${activeTab === 'overview' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="menu-icon">📊</span>
              <span>نظرة عامة</span>
            </button>
            <button
              type="button"
              className={`menu-item ${activeTab === 'orders' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <span className="menu-icon">🛍️</span>
              <span>طلباتي ({orders?.length || 0})</span>
            </button>
            <button
              type="button"
              className={`menu-item ${activeTab === 'wishlist' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              <span className="menu-icon">♥</span>
              <span>المفضلة ({wishlist?.length || 0})</span>
            </button>
            <button
              type="button"
              className={`menu-item ${activeTab === 'address' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('address')}
            >
              <span className="menu-icon">📍</span>
              <span>عنوان التوصيل</span>
            </button>
            <button
              type="button"
              className={`menu-item ${activeTab === 'settings' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <span className="menu-icon">⚙️</span>
              <span>إعدادات الحساب</span>
            </button>
          </nav>
        </aside>

        {/* Content Pane */}
        <main className="user-dash-content">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="dash-pane-wrap">
              <div className="pane-head">
                <h2>نظرة عامة على حسابك</h2>
                <p>تابع حالة شحناتك الحالية، استعرض قطعك المفضلة، واستفد من عروض العضوية.</p>
              </div>

              {/* Latest Order Card */}
              {orders && orders.length > 0 ? (
                <div className="overview-order-card">
                  <div className="order-card-header">
                    <div>
                      <span className="order-badge-status">{orders[0].status}</span>
                      <h3>آخر طلب: #{orders[0].id}</h3>
                    </div>
                    <span className="order-date">{orders[0].date}</span>
                  </div>

                  <div className="order-items-mini-list">
                    {orders[0].items?.map((item, idx) => (
                      <div className="mini-item" key={idx}>
                        <img src={ASSET(item.image)} alt={item.name} />
                        <div>
                          <strong>{item.name}</strong>
                          <small>المقاس: {item.size} · الكمية: {item.quantity}</small>
                        </div>
                        <span className="mini-item-price">{priceText(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
                    <span>الإجمالي: <strong>{priceText(orders[0].total)}</strong></span>
                    <a
                      className="button button-accent button-sm"
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        `مرحباً IGO، أستفسر عن حالة طلبي رقم ${orders[0].id}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      تتبع الشحنة واتساب ↗
                    </a>
                  </div>
                </div>
              ) : (
                <div className="empty-state-card">
                  <span>🛍️</span>
                  <h3>ليس لديك طلبات مسجلة بعد</h3>
                  <p>تصفح تشكيلة الموسم الجديد واختر ستايلك المفضل.</p>
                  <a className="button button-accent button-sm" href="/#products">
                    تصفح الكتالوج الآن
                  </a>
                </div>
              )}

              {/* Member Perks */}
              <div className="member-perks-box">
                <h3>مزايا عضويتك في IGO Club:</h3>
                <div className="perks-grid">
                  <div className="perk-card">
                    <span className="perk-emoji">🚚</span>
                    <strong>أولوية التوصيل</strong>
                    <small>شحن سريع خلال 24 - 48 ساعة كحد أقصى</small>
                  </div>
                  <div className="perk-card">
                    <span className="perk-emoji">📦</span>
                    <strong>معاينة مجانية</strong>
                    <small>افتح الشحنة وقيس القطعة أمام المندوب</small>
                  </div>
                  <div className="perk-card">
                    <span className="perk-emoji">🔥</span>
                    <strong>وصول مبكر (Early Access)</strong>
                    <small>أول من يعلم بتشكيلات الـ Limited Drops</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="dash-pane-wrap">
              <div className="pane-head">
                <h2>سجل طلباتي ({orders?.length || 0})</h2>
                <p>جميع طلباتك السابقة وتفاصيلها وإمكانية إعادة الطلب بنقرة واحدة.</p>
              </div>

              {orders && orders.length > 0 ? (
                <div className="orders-full-list">
                  {orders.map((order) => (
                    <article className="order-record-card" key={order.id}>
                      <div className="record-header">
                        <div>
                          <span className="order-id">طلب رقم: #{order.id}</span>
                          <span className="order-status-pill">{order.status}</span>
                        </div>
                        <span className="order-time">{order.date}</span>
                      </div>

                      <div className="record-items-body">
                        {order.items?.map((item, idx) => (
                          <div className="record-item-row" key={idx}>
                            <img src={ASSET(item.image)} alt={item.name} className="record-thumb" />
                            <div className="record-info">
                              <h4>{item.name}</h4>
                              <p>
                                <span>المقاس: <strong>{item.size}</strong></span>
                                {item.color && <span>اللون: <strong>{item.color}</strong></span>}
                                <span>الكمية: <strong>{item.quantity}</strong></span>
                              </p>
                            </div>
                            <span className="record-price">{priceText(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="record-footer">
                        <div className="record-total-block">
                          <span>الإجمالي المدفوع:</span>
                          <strong>{priceText(order.total)}</strong>
                        </div>
                        <div className="record-actions">
                          <a
                            className="button button-accent button-sm"
                            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                              `مرحباً IGO، أستفسر عن طلبي رقم ${order.id}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            متابعة على واتساب ↗
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state-card">
                  <span>📦</span>
                  <h3>لا توجد طلبات مسجلة حتى الآن</h3>
                  <p>ابدأ باختيار ما يعجبك من التشكيلة وسجل أول طلب لك الآن.</p>
                  <a className="button button-accent" href="/#products">
                    اكتشف المنتجات
                  </a>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="dash-pane-wrap">
              <div className="pane-head">
                <h2>قائمة أمنياتي والمفضلة ({wishlistProducts.length})</h2>
                <p>القطع التي قمت بحفظها للرجوع إليها لاحقاً وشرائها بسرعة.</p>
              </div>

              {wishlistProducts.length > 0 ? (
                <div className="wishlist-grid">
                  {wishlistProducts.map((p) => (
                    <div className="wishlist-item-card" key={p.id}>
                      <img src={ASSET(p.image)} alt={p.name} />
                      <div className="wish-content">
                        <h4>{p.name}</h4>
                        <span className="wish-price">{priceText(p.price)}</span>
                        <div className="wish-buttons">
                          <button
                            type="button"
                            className="button button-accent button-sm"
                            onClick={() => {
                              addToCart(p)
                              showToast(`تمت إضافة ${p.name} إلى حقيبة التسوق!`)
                            }}
                          >
                            + أضف للسلة
                          </button>
                          <button
                            type="button"
                            className="wish-del-btn"
                            onClick={() => toggleWishlist(p.id)}
                            title="إزالة من المفضلة"
                          >
                            حذف ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-card">
                  <span>♥</span>
                  <h3>قائمة أمنياتك فارغة</h3>
                  <p>اضغط على أيقونة القلب على أي قطعة في المتجر لحفظها هنا.</p>
                  <a className="button button-accent" href="/#products">
                    تصفح التشكيلة
                  </a>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SHIPPING ADDRESS */}
          {activeTab === 'address' && (
            <div className="dash-pane-wrap">
              <div className="pane-head">
                <h2>عنوان التوصيل المفضل</h2>
                <p>احفظ عنوانك المعتاد لسرعة تأكيد وشحن الطلبيات دون الحاجة لإدخاله كل مرة.</p>
              </div>

              <form onSubmit={handleSaveAddress} className="dash-form">
                <div className="form-row-2">
                  <div className="form-field">
                    <label>المحافظة *</label>
                    <select
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      required
                    >
                      <option>القاهرة</option>
                      <option>الجيزة</option>
                      <option>الإسكندرية</option>
                      <option>الدقهلية (المنصورة)</option>
                      <option>الغربية (طنطا)</option>
                      <option>الشرقية (الزقازيق)</option>
                      <option>القليوبية</option>
                      <option>المنوفية</option>
                      <option>بورسعيد</option>
                      <option>الإسماعيلية</option>
                      <option>السويس</option>
                      <option>محافظة أخرى</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>المنطقة / الحي *</label>
                    <input
                      type="text"
                      placeholder="مثال: المعادي / مدينة نصر / سموحة"
                      value={addressForm.area}
                      onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>العنوان بالتفصيل (اسم الشارع، رقم العمارة، الطابق، رقم الشقة) *</label>
                  <input
                    type="text"
                    placeholder="شارع 9، عمارة 15، الدور الثالث، شقة 6"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>رقم هاتف إضافي للطوارئ (اختياري)</label>
                  <input
                    type="tel"
                    placeholder="010XXXXXXXX"
                    value={addressForm.extraPhone}
                    onChange={(e) => setAddressForm({ ...addressForm, extraPhone: e.target.value })}
                    dir="ltr"
                  />
                </div>

                <div className="form-field">
                  <label>تعليمات خاصة لمندوب الشحن</label>
                  <textarea
                    rows="3"
                    placeholder="مثال: يرجى الاتصال قبل الوصول بنصف ساعة، الدفع عند الاستلام بعد المعاينة"
                    value={addressForm.notes}
                    onChange={(e) => setAddressForm({ ...addressForm, notes: e.target.value })}
                  />
                </div>

                <button type="submit" className="button button-accent" style={{ minHeight: '44px' }}>
                  حفظ عنوان التوصيل ✓
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: PROFILE & SETTINGS */}
          {activeTab === 'settings' && (
            <div className="dash-pane-wrap">
              <div className="pane-head">
                <h2>إعدادات الحساب والبيانات الشخصية</h2>
                <p>تعديل اسمك، رقم الهاتف المسجل، وكلمة المرور.</p>
              </div>

              {/* Personal Info */}
              <form onSubmit={handleSaveProfile} className="dash-form" style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 14px' }}>البيانات الأساسية</h3>

                <div className="form-row-2">
                  <div className="form-field">
                    <label>الاسم بالكامل *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>رقم الهاتف / واتساب</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010XXXXXXXX"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>البريد الإلكتروني (المسجل)</label>
                  <input type="email" value={email} disabled dir="ltr" style={{ background: '#f5f5f5' }} />
                  <small style={{ color: 'var(--muted)', fontSize: '11px' }}>
                    البريد الإلكتروني مرتبط بحسابك ولا يمكن تغييره حالياً.
                  </small>
                </div>

                <button type="submit" className="button button-dark" style={{ minHeight: '42px' }}>
                  حفظ التعديلات الشخصية ✓
                </button>
              </form>

              {/* Change Password */}
              <form onSubmit={handleChangePassword} className="dash-form" style={{ borderTop: '1px solid var(--line)', paddingTop: '24px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 14px' }}>تغيير كلمة المرور</h3>

                <div className="form-field">
                  <label>كلمة المرور الحالية</label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-field">
                    <label>كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="••••••••"
                      dir="ltr"
                    />
                  </div>

                  <div className="form-field">
                    <label>تأكيد كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="••••••••"
                      dir="ltr"
                    />
                  </div>
                </div>

                <button type="submit" className="button button-accent" style={{ minHeight: '42px' }}>
                  تحديث كلمة المرور ✓
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
