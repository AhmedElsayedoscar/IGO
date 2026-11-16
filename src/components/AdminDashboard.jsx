import { useState, useRef } from 'react'
import { useProducts } from '../context/ProductsContext'
import { useAuth } from '../context/AuthContext'
import AdminLogin from './AdminLogin'
import CountdownTimer from './CountdownTimer'
import { ASSET, compressImageFile } from '../utils/asset'

const priceText = (p) => `${Number(p || 0).toLocaleString('ar-EG')} ج.م`

export default function AdminDashboard() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetToDefault,
    exportProductsJson,
    backendConnected,
  } = useProducts()

  const { user, logout } = useAuth()

  // Admin security gate check
  const [isAuthed, setIsAuthed] = useState(() => {
    return user?.role === 'admin' || localStorage.getItem('igo_admin_logged') === 'true'
  })

  // Navigation tabs
  const [activeTab, setActiveTab] = useState('list') // 'list' | 'form' | 'backend'
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('الكل')
  const [notice, setNotice] = useState('')

  // Admin credentials management state
  const [newAdminEmail, setNewAdminEmail] = useState(
    () => localStorage.getItem('igo_admin_email') || 'admin@igo.com'
  )
  const [newAdminPassword, setNewAdminPassword] = useState(
    () => localStorage.getItem('igo_admin_pass') || 'admin123'
  )

  // Form states
  const [name, setName] = useState('')
  const [category, setCategory] = useState('هوديز')
  const [price, setPrice] = useState('')
  const [oldPrice, setOldPrice] = useState('')
  const [stock, setStock] = useState('10')
  const [badge, setBadge] = useState('جديد')
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('assets/sample-hoodie.jpg')
  const [galleryImages, setGalleryImages] = useState(['assets/sample-hoodie.jpg'])
  const [selectedSizes, setSelectedSizes] = useState(['M', 'L', 'XL'])
  const [colorsText, setColorsText] = useState('أسود, رملي, رمادي')

  // Discount Timer States
  const [hasDiscountTimer, setHasDiscountTimer] = useState(false)
  const [discountEndsAt, setDiscountEndsAt] = useState('')

  // Upload ref & drag state
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const showNotice = (msg) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 3000)
  }

  // Handle image files from device with automatic optimization
  const handleFiles = async (files) => {
    if (!files || files.length === 0) return
    showNotice('⏳ جاري فحص وضغط الصور المحددة من جهازك...')

    try {
      const fileList = Array.from(files)
      const compressedList = []

      for (const file of fileList) {
        if (!file.type.startsWith('image/')) continue
        // Compress to optimal JPEG max 1200px width with 0.85 quality
        const dataUrl = await compressImageFile(file, 1200, 0.85)
        if (dataUrl) compressedList.push(dataUrl)
      }

      if (compressedList.length > 0) {
        setGalleryImages((prev) => {
          // Put new uploaded images first
          const updated = [...compressedList, ...prev.filter((img) => !compressedList.includes(img))]
          setImageUrl(updated[0])
          return updated
        })
        showNotice(`✓ تم رفع وتجهيز ${compressedList.length} صورة من جهازك بنجاح!`)
      }
    } catch (err) {
      console.error('Image compression error:', err)
      showNotice('حدث خطأ أثناء معالجة الصورة. يرجى تجربة ملف صورة آخر.')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = (indexToRemove) => {
    setGalleryImages((prev) => {
      const filtered = prev.filter((_, idx) => idx !== indexToRemove)
      const fallback = filtered.length > 0 ? filtered : ['assets/sample-hoodie.jpg']
      setImageUrl(fallback[0])
      return fallback
    })
  }

  const handleSetCoverImage = (indexToCover) => {
    setGalleryImages((prev) => {
      const selected = prev[indexToCover]
      const remaining = prev.filter((_, idx) => idx !== indexToCover)
      const updated = [selected, ...remaining]
      setImageUrl(updated[0])
      return updated
    })
    showNotice('✓ تم تعيين هذه الصورة كصورة غلاف رئيسية!')
  }

  // Quick preset helper for discount duration
  const setDiscountPreset = (hours) => {
    const target = new Date(Date.now() + hours * 60 * 60 * 1000)
    // Format YYYY-MM-DDTHH:mm for datetime-local input
    const pad = (n) => String(n).padStart(2, '0')
    const formatted = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(target.getHours())}:${pad(target.getMinutes())}`
    setDiscountEndsAt(formatted)
    setHasDiscountTimer(true)
    showNotice(`✓ تم ضبط مدة العرض لمدة ${hours} ساعة من الآن!`)
  }

  // Populate form for editing
  const startEdit = (product) => {
    setEditingId(product.id)
    setName(product.name || '')
    setCategory(product.category || 'هوديز')
    setPrice(product.price || '')
    setOldPrice(product.oldPrice || '')
    setStock(product.stock || 5)
    setBadge(product.badge || '')
    setTagline(product.tagline || '')
    setDescription(product.description || '')
    setImageUrl(product.image || 'assets/sample-hoodie.jpg')
    setGalleryImages(
      product.images && product.images.length > 0
        ? product.images
        : [product.image || 'assets/sample-hoodie.jpg']
    )
    setSelectedSizes(product.sizes || ['M', 'L', 'XL'])
    setColorsText(
      product.colors
        ?.map((c) => (typeof c === 'object' ? c.name : c))
        .join(', ') || ''
    )
    if (product.discountEndsAt) {
      setHasDiscountTimer(true)
      try {
        const d = new Date(product.discountEndsAt)
        const pad = (n) => String(n).padStart(2, '0')
        setDiscountEndsAt(
          `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
        )
      } catch {
        setDiscountEndsAt('')
      }
    } else {
      setHasDiscountTimer(false)
      setDiscountEndsAt('')
    }
    setActiveTab('form')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    resetForm()
    setActiveTab('list')
  }

  const resetForm = () => {
    setName('')
    setCategory('هوديز')
    setPrice('')
    setOldPrice('')
    setStock('10')
    setBadge('جديد')
    setTagline('')
    setDescription('')
    setImageUrl('assets/sample-hoodie.jpg')
    setGalleryImages(['assets/sample-hoodie.jpg'])
    setSelectedSizes(['M', 'L', 'XL'])
    setColorsText('أسود, رملي, رمادي')
    setHasDiscountTimer(false)
    setDiscountEndsAt('')
  }

  const handleToggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name.trim() || !price) {
      alert('يرجى كتابة اسم المنتج وتحديد السعر.')
      return
    }

    const parsedColors = colorsText
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
      .map((cName) => {
        let hex = '#333333'
        if (cName.includes('رملي') || cName.includes('بيج')) hex = '#d6c7b2'
        if (cName.includes('أسود')) hex = '#1a1a18'
        if (cName.includes('رمادي') || cName.includes('فحم')) hex = '#666666'
        if (cName.includes('أبيض') || cName.includes('كريم')) hex = '#f5f5f0'
        if (cName.includes('زيتي') || cName.includes('أخضر')) hex = '#4e5444'
        if (cName.includes('كحلي') || cName.includes('أزرق')) hex = '#1d232a'
        return { name: cName, hex }
      })

    const finalCoverImg = galleryImages[0] || imageUrl.trim() || 'assets/sample-hoodie.jpg'
    const finalImages = galleryImages.length > 0 ? galleryImages : [finalCoverImg]

    const payload = {
      name: name.trim(),
      category,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      stock: Number(stock) || 5,
      badge: badge.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      image: finalCoverImg,
      images: finalImages,
      sizes: selectedSizes,
      colors: parsedColors.length > 0 ? parsedColors : [{ name: 'افتراضي', hex: '#222' }],
      discountEndsAt: hasDiscountTimer && discountEndsAt ? new Date(discountEndsAt).toISOString() : null,
    }

    if (editingId) {
      updateProduct(editingId, payload)
      showNotice(`✓ تم تعديل المنتج (${payload.name}) بنجاح!`)
    } else {
      addProduct(payload)
      showNotice(`✓ تمت إضافة المنتج الجديد (${payload.name}) إلى المتجر!`)
    }

    cancelEdit()
  }

  const handleDelete = (id, prodName) => {
    if (confirm(`هل أنت متأكد من حذف المنتج: "${prodName}"؟`)) {
      deleteProduct(id)
      showNotice(`تم حذف المنتج (${prodName}) من المتجر.`)
    }
  }

  // Filter products for the list
  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === 'الكل' || p.category === categoryFilter
    const matchesSearch =
      !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCat && matchesSearch
  })

  // KPI Calculations
  const totalProductsCount = products.length
  const totalStockCount = products.reduce((sum, p) => sum + (Number(p.stock) || 1), 0)
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 1),
    0
  )
  const lowStockCount = products.filter((p) => (Number(p.stock) || 1) <= 3).length

  // Admin Credentials update
  const handleSaveAdminCreds = (e) => {
    e.preventDefault()
    if (!newAdminEmail.trim() || newAdminPassword.length < 4) {
      alert('يرجى إدخال إيميل صالح وكلمة مرور لا تقل عن 4 أحرف')
      return
    }
    localStorage.setItem('igo_admin_email', newAdminEmail.trim().toLowerCase())
    localStorage.setItem('igo_admin_pass', newAdminPassword.trim())
    showNotice('✓ تم حفظ وتحديث بيانات دخول الأدمن بنجاح!')
  }

  // Security Gate Guard
  if (!isAuthed) {
    return (
      <AdminLogin
        onLoginSuccess={() => {
          localStorage.setItem('igo_admin_logged', 'true')
          setIsAuthed(true)
        }}
      />
    )
  }

  return (
    <div className="admin-dashboard-wrapper">
      {/* Admin Top Navigation */}
      <header className="admin-navbar">
        <div className="admin-nav-left">
          <a className="brand" href="/" aria-label="العودة للرئيسية">
            <img src={ASSET('assets/igo-logo.jpg')} alt="شعار IGO" />
            <span className="brand-copy">
              <strong>IGO</strong>
              <small>ADMIN CONTROL</small>
            </span>
          </a>
          <span className="admin-tag-pill">لوحة الإدارة</span>
        </div>

        <div className="admin-nav-right">
          <div className="admin-conn-status">
            <span
              className={`status-dot ${backendConnected ? 'is-online' : 'is-local'}`}
            />
            <span>{backendConnected ? 'Mongoose متصل' : 'تخزين محلي مباشر'}</span>
          </div>

          <span style={{ fontSize: '12px', color: '#dedad0' }}>
            👤 {user?.email || localStorage.getItem('igo_admin_email') || 'admin@igo.com'}
          </span>

          <button
            type="button"
            className="button button-outline-dark admin-export-top"
            onClick={exportProductsJson}
            title="تصدير ملف products.json لتحديث مستودع GitHub"
          >
            ⬇ تصدير JSON
          </button>

          <a className="button button-dark admin-store-btn" href="/">
            معاينة المتجر ↗
          </a>

          <button
            type="button"
            className="admin-logout-btn"
            onClick={() => {
              localStorage.removeItem('igo_admin_logged')
              if (logout) logout()
              setIsAuthed(false)
            }}
            title="قفل وتسجيل الخروج من لوحة التحكم"
          >
            قفل الإدارة 🔒
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-body-wrap">
        {/* Notice Banner */}
        {notice && (
          <div className="admin-floating-toast" role="alert">
            {notice}
          </div>
        )}

        {/* Dashboard Title & KPIs */}
        <section className="admin-dashboard-intro">
          <div className="admin-title-head">
            <div>
              <span className="eyebrow eyebrow-dark">
                <span></span> IGO STORE MANAGEMENT // DASHBOARD
              </span>
              <h1>لوحة تحكم وإدارة المتجر</h1>
              <p>
                تحكّم في المنتجات، عدّل الأسعار والمخزون، وتواصل مباشرة مع قاعدة بيانات MongoDB عبر Mongoose.
              </p>
            </div>

            <button
              type="button"
              className="button button-accent admin-add-top-btn"
              onClick={() => {
                setEditingId(null)
                resetForm()
                setActiveTab('form')
              }}
            >
              <span>+ إضافة منتج جديد</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="admin-kpi-grid">
            <div className="kpi-card">
              <span className="kpi-label">إجمالي المنتجات</span>
              <strong className="kpi-value">{totalProductsCount}</strong>
              <small className="kpi-sub">قطع معروضة في المتجر</small>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">قيمة المخزون الإجمالية</span>
              <strong className="kpi-value">{priceText(totalInventoryValue)}</strong>
              <small className="kpi-sub">محسوبة بناءً على {totalStockCount} قطعة</small>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">قطع منخفضة المخزون</span>
              <strong className="kpi-value" style={{ color: lowStockCount > 0 ? '#dc3545' : '#28a745' }}>
                {lowStockCount}
              </strong>
              <small className="kpi-sub">أقل من 3 قطع بالمخزن</small>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">نظام الحفظ الفوري</span>
              <strong className="kpi-value" style={{ color: '#2b8a3e', fontSize: '20px' }}>
                نشط وتلقائي
              </strong>
              <small className="kpi-sub">أي تعديل يظهر فوراً للزوار</small>
            </div>
          </div>
        </section>

        {/* Admin Navigation Tabs */}
        <div className="admin-tabs-nav" role="tablist">
          <button
            type="button"
            className={`admin-nav-tab ${activeTab === 'list' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            📋 قائمة المنتجات ({products.length})
          </button>
          <button
            type="button"
            className={`admin-nav-tab ${activeTab === 'form' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('form')}
          >
            {editingId ? '✏️ تعديل القطعة' : '➕ إضافة منتج جديد'}
          </button>
          <button
            type="button"
            className={`admin-nav-tab ${activeTab === 'backend' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('backend')}
          >
            ⚙️ إعدادات Mongoose و MongoDB
          </button>
        </div>

        {/* TAB 1: Products List */}
        {activeTab === 'list' && (
          <section className="admin-tab-pane">
            {/* Toolbar */}
            <div className="admin-table-toolbar">
              <div className="toolbar-search-wrap">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو التصنيف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="toolbar-filters">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="admin-cat-select"
                >
                  <option value="الكل">كل التصنيفات</option>
                  <option value="هوديز">هوديز</option>
                  <option value="أطقم">أطقم</option>
                  <option value="بناطيل">بناطيل</option>
                </select>

                <button
                  type="button"
                  className="button button-outline-dark"
                  onClick={resetToDefault}
                  title="استعادة التشكيلة الافتراضية الأولية"
                >
                  ↺ استعادة الافتراضي
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="admin-table-responsive">
              <table className="admin-pro-table">
                <thead>
                  <tr>
                    <th>الصورة</th>
                    <th>اسم المنتج</th>
                    <th>التصنيف</th>
                    <th>السعر</th>
                    <th>سعر العرض</th>
                    <th>المخزون</th>
                    <th>الشارة</th>
                    <th>المقاسات</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td style={{ width: '70px' }}>
                        <img
                          src={ASSET(p.image)}
                          alt={p.name}
                          className="table-thumb"
                        />
                      </td>
                      <td>
                        <strong>{p.name}</strong>
                        <small className="table-id-sub">{p.id}</small>
                      </td>
                      <td>
                        <span className="table-cat-badge">{p.category}</span>
                      </td>
                      <td>
                        <strong>{priceText(p.price)}</strong>
                      </td>
                      <td>
                        {p.oldPrice ? (
                          <span style={{ color: '#999', textDecoration: 'line-through' }}>
                            {priceText(p.oldPrice)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <span
                          className={`stock-pill ${
                            (Number(p.stock) || 1) <= 3 ? 'is-low' : 'is-ok'
                          }`}
                        >
                          {p.stock || 5} قطع
                        </span>
                      </td>
                      <td>
                        {p.badge ? (
                          <span className="table-badge-tag">{p.badge}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <span className="table-sizes-summary">
                          {p.sizes?.join(', ') || 'M, L'}
                        </span>
                      </td>
                      <td>
                        <div className="table-action-btns">
                          <button
                            type="button"
                            className="btn-action btn-edit"
                            onClick={() => startEdit(p)}
                            title="تعديل القطعة"
                          >
                            تعديل ✏️
                          </button>
                          <button
                            type="button"
                            className="btn-action btn-del"
                            onClick={() => handleDelete(p.id, p.name)}
                            title="حذف القطعة"
                          >
                            حذف 🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="9" className="table-empty-row">
                        لا توجد منتجات مطابقة للبحث أو التصنيف المختار.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 2: Add / Edit Product Form */}
        {activeTab === 'form' && (
          <section className="admin-tab-pane">
            <div className="admin-form-container">
              <div className="form-header-row">
                <h2>{editingId ? `تعديل القطعة: ${name}` : 'إضافة قطعة جديدة إلى المتجر'}</h2>
                {editingId && (
                  <button
                    type="button"
                    className="button button-outline-dark"
                    onClick={cancelEdit}
                  >
                    إلغاء التعديل
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="admin-crud-form">
                <div className="form-split-grid">
                  {/* Right Column: Main Info */}
                  <div className="form-col-main">
                    <div className="form-field">
                      <label htmlFor="p-name">اسم المنتج *</label>
                      <input
                        id="p-name"
                        type="text"
                        placeholder="مثال: هودي أوفرسايز رملي مطرز"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-row-2">
                      <div className="form-field">
                        <label htmlFor="p-cat">التصنيف *</label>
                        <select
                          id="p-cat"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          required
                        >
                          <option value="هوديز">هوديز</option>
                          <option value="أطقم">أطقم</option>
                          <option value="بناطيل">بناطيل</option>
                          <option value="تيشيرتات">تيشيرتات</option>
                          <option value="جاكيتات">جاكيتات</option>
                          <option value="إكسسوارات">إكسسوارات</option>
                        </select>
                      </div>

                      <div className="form-field">
                        <label htmlFor="p-badge">الشارة الترويجية (Badge)</label>
                        <input
                          id="p-badge"
                          type="text"
                          placeholder="مثال: الأكثر طلباً، جديد، حصري"
                          value={badge}
                          onChange={(e) => setBadge(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row-3">
                      <div className="form-field">
                        <label htmlFor="p-price">السعر الحالي (ج.م) *</label>
                        <input
                          id="p-price"
                          type="number"
                          min="1"
                          placeholder="1290"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="p-old-price">سعر العرض القديم (ج.م)</label>
                        <input
                          id="p-old-price"
                          type="number"
                          min="0"
                          placeholder="1550"
                          value={oldPrice}
                          onChange={(e) => setOldPrice(e.target.value)}
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="p-stock">كمية المخزون (قطع)</label>
                        <input
                          id="p-stock"
                          type="number"
                          min="0"
                          placeholder="10"
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-field">
                      <label htmlFor="p-tagline">شعار فرعي تسويقي (Tagline)</label>
                      <input
                        id="p-tagline"
                        type="text"
                        placeholder="مثال: خامة قطنية ثقيلة بوزن 450 جرام"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="p-desc">الوصف التفصيلي للقطعة</label>
                      <textarea
                        id="p-desc"
                        rows="4"
                        placeholder="اكتب تفاصيل القصة، الخياطة، ونوع القماش..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    {/* Sizes Selection */}
                    <div className="form-field">
                      <label>المقاسات المتاحة للطلب:</label>
                      <div className="admin-size-checkboxes">
                        {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`admin-size-toggle ${
                              selectedSizes.includes(s) ? 'is-active' : ''
                            }`}
                            onClick={() => handleToggleSize(s)}
                          >
                            {s} {selectedSizes.includes(s) ? '✓' : ''}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="form-field">
                      <label htmlFor="p-colors">الألوان المتاحة (مفصولة بفواصل)</label>
                      <input
                        id="p-colors"
                        type="text"
                        placeholder="مثال: أسود, رملي هادئ, رمادي إسمنتي"
                        value={colorsText}
                        onChange={(e) => setColorsText(e.target.value)}
                      />
                    </div>

                    {/* Discount & Countdown Timer Controls */}
                    <div className="admin-discount-box">
                      <label className="discount-toggle-label">
                        <input
                          type="checkbox"
                          checked={hasDiscountTimer}
                          onChange={(e) => {
                            setHasDiscountTimer(e.target.checked)
                            if (e.target.checked && !discountEndsAt) {
                              setDiscountPreset(48) // default 48h
                            }
                          }}
                        />
                        <span>⚡ تفعيل مؤقت تنازلي للعرض والخصم (Flash Sale Timer)</span>
                      </label>

                      {hasDiscountTimer && (
                        <div className="discount-timer-body">
                          <label htmlFor="p-timer-date" style={{ fontSize: '12px', fontWeight: '700' }}>
                            تاريخ وتوقيت انتهاء الخصم والعرض:
                          </label>
                          <input
                            id="p-timer-date"
                            type="datetime-local"
                            value={discountEndsAt}
                            onChange={(e) => setDiscountEndsAt(e.target.value)}
                            style={{ minHeight: '40px', padding: '6px 10px', fontSize: '13px' }}
                          />

                          <div className="discount-preset-pills">
                            <span style={{ fontSize: '11px', color: 'var(--muted)', alignSelf: 'center' }}>
                              مدد جاهزة سريعة:
                            </span>
                            <button type="button" onClick={() => setDiscountPreset(24)}>
                              + 24 ساعة (يوم)
                            </button>
                            <button type="button" onClick={() => setDiscountPreset(48)}>
                              + 48 ساعة (يومان)
                            </button>
                            <button type="button" onClick={() => setDiscountPreset(72)}>
                              + 3 أيام
                            </button>
                            <button type="button" onClick={() => setDiscountPreset(168)}>
                              + أسبوع (7 أيام)
                            </button>
                            <button
                              type="button"
                              style={{ color: '#dc3545' }}
                              onClick={() => {
                                setDiscountEndsAt('')
                                setHasDiscountTimer(false)
                              }}
                            >
                              إلغاء المؤقت ✕
                            </button>
                          </div>

                          {discountEndsAt && (
                            <div className="discount-live-preview">
                              <strong>معاينة العداد التنازلي المباشر كما سيظهر للمشترين:</strong>
                              <CountdownTimer targetDate={discountEndsAt} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Left Column: Image Upload & Gallery Preview */}
                  <div className="form-col-side">
                    <div className="image-preview-panel">
                      <label style={{ fontSize: '13px', fontWeight: '800', display: 'block', marginBottom: '8px' }}>
                        صور القطعة (رفع من الجهاز + ألبوم الصور) *
                      </label>

                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFiles(e.target.files)}
                        style={{ display: 'none' }}
                      />

                      {/* Drag & Drop Upload Zone */}
                      <div
                        className={`admin-upload-zone ${isDragging ? 'is-dragging' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault()
                          setIsDragging(true)
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault()
                          setIsDragging(false)
                          handleFiles(e.dataTransfer.files)
                        }}
                      >
                        <span className="upload-icon">📸</span>
                        <strong>اضغط لاختيار صور من جهازك أو اسحبها هنا</strong>
                        <small>يمكنك اختيار صورة أو عدة صور معاً (JPG, PNG, WebP)</small>
                      </div>

                      {/* Uploaded Thumbnails Grid */}
                      {galleryImages.length > 0 && (
                        <div>
                          <span className="preview-label">
                            الصور المحملة ({galleryImages.length} صور) — اضغط على صورة لجعلها الغلاف:
                          </span>
                          <div className="admin-gallery-strip">
                            {galleryImages.map((imgSrc, idx) => (
                              <div
                                key={idx}
                                className={`gallery-thumb-item ${idx === 0 ? 'is-cover' : ''}`}
                                onClick={() => handleSetCoverImage(idx)}
                                title={idx === 0 ? 'الصورة الرئيسية' : 'اضغط لجعلها الصورة الرئيسية'}
                              >
                                <img src={ASSET(imgSrc)} alt={`صورة ${idx + 1}`} />
                                {idx === 0 && <span className="cover-badge">الرئيسية</span>}
                                {galleryImages.length > 1 && (
                                  <button
                                    type="button"
                                    className="remove-thumb-btn"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRemoveImage(idx)
                                    }}
                                    title="حذف الصورة"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Manual URL Input Alternative */}
                      <div style={{ marginTop: '14px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
                        <label htmlFor="p-img" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          أو أدخل مسار / رابط الصورة يدوياً:
                        </label>
                        <input
                          id="p-img"
                          type="text"
                          placeholder="assets/sample-hoodie.jpg أو https://"
                          value={imageUrl}
                          onChange={(e) => {
                            setImageUrl(e.target.value)
                            if (e.target.value) {
                              setGalleryImages((prev) => [e.target.value, ...prev.filter((i) => i !== e.target.value)])
                            }
                          }}
                          dir="ltr"
                          style={{ marginTop: '4px' }}
                        />
                      </div>

                      {/* Short Cuts */}
                      <div className="admin-form-shortcuts">
                        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)' }}>
                          نماذج صور سريعة للاختبار:
                        </span>
                        <div className="shortcut-btn-row">
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrl('assets/sample-hoodie.jpg')
                              setGalleryImages((prev) => ['assets/sample-hoodie.jpg', ...prev])
                            }}
                          >
                            هودي
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrl('assets/sample-set.jpg')
                              setGalleryImages((prev) => ['assets/sample-set.jpg', ...prev])
                            }}
                          >
                            طقم
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrl('assets/sample-joggers.jpg')
                              setGalleryImages((prev) => ['assets/sample-joggers.jpg', ...prev])
                            }}
                          >
                            جوجر
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-form-submit-row">
                  <button type="submit" className="button button-accent admin-save-btn">
                    <span>{editingId ? 'حفظ تعديلات القطعة' : 'نشر القطعة بالمتجر فوراً'}</span>
                    <span aria-hidden="true">✓</span>
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="button button-quiet"
                      onClick={cancelEdit}
                    >
                      إلغاء
                    </button>
                  )}
                </div>
              </form>
            </div>
          </section>
        )}

        {/* TAB 3: Mongoose & MongoDB Backend Integration */}
        {activeTab === 'backend' && (
          <section className="admin-tab-pane">
            <div className="admin-backend-card">
              <div className="backend-header">
                <div>
                  <h2>الربط مع سيرفر Mongoose و MongoDB</h2>
                  <p>تم إعداد وتجهيز كود السيرفر الخلفي بالكامل في مجلد <code>backend-example/</code> داخل مشروعك.</p>
                </div>
                <span className="backend-ready-badge">جاهز للربط الفوري</span>
              </div>

              <div className="backend-grid-steps">
                <div className="backend-step-box">
                  <h3>1. بنية الموديل والمسارات (Model & Routes)</h3>
                  <p>ملف المخطط: <code>backend-example/models/User.js</code></p>
                  <p>متحكم المصادقة: <code>backend-example/controllers/authController.js</code></p>
                  <p>تشفير كلمات المرور بـ <code>bcryptjs</code> والتحقق من Google Token بـ <code>google-auth-library</code>.</p>
                </div>

                <div className="backend-step-box">
                  <h3>2. تشغيل السيرفر الخلفي</h3>
                  <div className="code-snippet">
                    <code>
                      cd backend-example<br />
                      npm install<br />
                      node server.js
                    </code>
                  </div>
                  <p style={{ marginTop: '8px', fontSize: '12px' }}>
                    سيعمل السيرفر فوراً على المنفذ <code>http://localhost:5000</code>.
                  </p>
                </div>

                <div className="backend-step-box">
                  <h3>3. تصدير التعديلات لمستودع GitHub</h3>
                  <p>
                    بعد إضافة أو تعديل منتجاتك، اضغط على زر "تنزيل ملف JSON" ثم استبدل الملف <code>src/products.json</code> وارفع التغييرات لمستودعك في GitHub لتظهر لجميع الزوار على الإنترنت.
                  </p>
                  <button
                    type="button"
                    className="button button-accent"
                    style={{ marginTop: '10px', minHeight: '40px', fontSize: '13px' }}
                    onClick={exportProductsJson}
                  >
                    ⬇ تنزيل products.json المعدل
                  </button>
                </div>
              </div>

              {/* Admin Credentials Customizer Box */}
              <div style={{ marginTop: '28px', borderTop: '1px solid var(--line)', paddingTop: '24px' }}>
                <h3 style={{ fontSize: '17px', margin: '0 0 8px' }}>🔐 تخصيص بريد وكلمة مرور المشرف (Admin Credentials)</h3>
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 16px' }}>
                  يمكنك تعديل بيانات تسجيل دخول لوحة التحكم في أي وقت وحفظها بأمان.
                </p>

                <form onSubmit={handleSaveAdminCreds} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-field" style={{ margin: 0 }}>
                    <label>بريد المشرف المعتمد:</label>
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      required
                      dir="ltr"
                    />
                  </div>
                  <div className="form-field" style={{ margin: 0 }}>
                    <label>كلمة المرور الجديدة:</label>
                    <input
                      type="text"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      required
                      dir="ltr"
                    />
                  </div>
                  <button
                    type="submit"
                    className="button button-dark"
                    style={{ minHeight: '42px', fontSize: '13px', alignSelf: 'flex-start' }}
                  >
                    حفظ وتحديث بيانات المشرف ✓
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

