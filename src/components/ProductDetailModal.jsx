import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import CountdownTimer from './CountdownTimer'
import { ASSET } from '../utils/asset'

const WHATSAPP_NUMBER = '201000364250'
const priceText = (p) => `${Number(p || 0).toLocaleString('ar-EG')} ج.م`

export default function ProductDetailModal({ product, isOpen, onClose }) {
  const { addToCart, wishlist, toggleWishlist } = useCart()
  const [activeImgIndex, setActiveImgIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [showSizeTable, setShowSizeTable] = useState(false)
  const [activeTab, setActiveTab] = useState('specs') // 'specs' | 'care' | 'shipping'
  const [addedToast, setAddedToast] = useState(false)

  useEffect(() => {
    if (product) {
      setActiveImgIndex(0)
      setSelectedSize((product.sizes && product.sizes[0]) || 'M')
      setSelectedColor(
        typeof product.colors?.[0] === 'object'
          ? product.colors[0].name
          : product.colors?.[0] || 'افتراضي'
      )
      setQuantity(1)
      setShowSizeTable(false)
      setAddedToast(false)
    }
  }, [product])

  if (!isOpen || !product) return null

  const images = product.images && product.images.length > 0 ? product.images : [product.image]
  const currentImg = images[activeImgIndex] || images[0]
  const isFavorite = wishlist.includes(product.id)

  const discountAmount = product.oldPrice ? product.oldPrice - product.price : 0
  const discountPercent = product.oldPrice
    ? Math.round((discountAmount / product.oldPrice) * 100)
    : 0

  const handleAdd = () => {
    addToCart(product, selectedSize, selectedColor, quantity)
    setAddedToast(true)
    setTimeout(() => {
      setAddedToast(false)
      onClose()
    }, 800)
  }

  const handleDirectWhatsApp = () => {
    const msg = `مرحباً IGO Clothing Brand،\nأود طلب المنتج التالي:\n• اسم القطعة: *${product.name}*\n• المقاس المختار: *${selectedSize}*\n• اللون المفضل: *${selectedColor}*\n• الكمية: *${quantity}*\n• السعر الإجمالي: *${priceText(product.price * quantity)}*\n\nيرجى تأكيد التوفر وترتيب موعد المعاينة والتوصيل.`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="product-modal-backdrop" onClick={onClose}>
      <div className="product-modal-card pro-detail-dialog" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="product-modal-close"
          onClick={onClose}
          aria-label="إغلاق النافذة"
        >
          ×
        </button>

        <div className="pro-modal-grid">
          {/* Gallery Side */}
          <div className="pro-modal-gallery-pane">
            <div className="pro-main-img-wrap">
              <img src={ASSET(currentImg)} alt={product.name} className="pro-main-img" />
              {product.badge && <span className="modal-badge">{product.badge}</span>}
              {discountPercent > 0 && (
                <span className="modal-discount-tag">وفر {discountPercent}% ({priceText(discountAmount)})</span>
              )}
              <button
                type="button"
                className={`wishlist-btn-large ${isFavorite ? 'is-active' : ''}`}
                onClick={() => toggleWishlist(product.id)}
                aria-label="إضافة للمفضلة"
              >
                {isFavorite ? '♥' : '♡'}
              </button>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="pro-thumb-strip">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`pro-thumb-btn ${activeImgIndex === idx ? 'is-active' : ''}`}
                    onClick={() => setActiveImgIndex(idx)}
                  >
                    <img src={ASSET(img)} alt={`زاوية ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Pane */}
          <div className="pro-modal-details-pane">
            <div className="pro-modal-header">
              <span className="eyebrow eyebrow-dark">
                <span></span> {product.category} // HEAVYWEIGHT 450 GSM
              </span>
              <h2>{product.name}</h2>
              {product.tagline && <p className="pro-tagline">{product.tagline}</p>}

              <div className="pro-rating-row-lg">
                <span className="stars">★★★★★</span>
                <strong>{product.rating || 4.9}</strong>
                <span>(بناءً على {product.reviewsCount || 30} تقييم مشترين حقيقيين)</span>
              </div>

              <div className="modal-price-row">
                <span className="modal-current-price">{priceText(product.price)}</span>
                {product.oldPrice && (
                  <span className="modal-old-price">{priceText(product.oldPrice)}</span>
                )}
                {discountAmount > 0 && (
                  <span className="pro-saving-pill">وفرت {priceText(discountAmount)}</span>
                )}
              </div>

              {product.discountEndsAt && (
                <CountdownTimer targetDate={product.discountEndsAt} />
              )}
            </div>

            <p className="modal-description">{product.description}</p>

            {/* Stock Alert */}
            {product.stock && product.stock <= 4 && (
              <div className="pro-stock-alert">
                <span>🔥</span>
                <span>إقبال مرتفع على هذا الموديل: متبقي <strong>{product.stock} قطع فقط</strong> في المخزن!</span>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="selector-group">
                <div className="selector-label-row">
                  <label>اللون: <strong>{selectedColor}</strong></label>
                </div>
                <div className="pro-color-swatch-picker">
                  {product.colors.map((c) => {
                    const cName = typeof c === 'object' ? c.name : c
                    const cHex = typeof c === 'object' ? c.hex : '#888'
                    return (
                      <button
                        key={cName}
                        type="button"
                        className={`pro-swatch-item ${selectedColor === cName ? 'is-selected' : ''}`}
                        onClick={() => setSelectedColor(cName)}
                      >
                        <span className="swatch-circle" style={{ backgroundColor: cHex }} />
                        <span>{cName}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size Selection & Guide */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="selector-group">
                <div className="selector-label-row">
                  <label>المقاس المتاح: <strong>{selectedSize}</strong></label>
                  <button
                    type="button"
                    className="pro-size-table-toggle"
                    onClick={() => setShowSizeTable(!showSizeTable)}
                  >
                    📐 {showSizeTable ? 'إخفاء جدول المقاسات' : 'جدول القياسات بالسنتيمتر'}
                  </button>
                </div>

                <div className="size-pills">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`size-pill ${selectedSize === s ? 'is-selected' : ''}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Size Table Accordion */}
                {showSizeTable && product.sizeGuide && (
                  <div className="pro-size-guide-table-wrap">
                    <table className="pro-size-table">
                      <thead>
                        <tr>
                          <th>المقاس</th>
                          <th>محيط الصدر</th>
                          <th>الطول</th>
                          <th>الوزن المقترح</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.sizeGuide.map((row) => (
                          <tr
                            key={row.size}
                            className={selectedSize === row.size ? 'active-row' : ''}
                          >
                            <td><strong>{row.size}</strong></td>
                            <td>{row.chest}</td>
                            <td>{row.length}</td>
                            <td>{row.weight}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <small className="size-table-note">💡 جميع القطع بقصة Oversized مريحة؛ اختر مقاسك المعتاد للحصول على الستايل المطلوب.</small>
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="selector-group">
              <label>الكمية:</label>
              <div className="modal-qty-row">
                <div className="qty-control">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  >
                    +
                  </button>
                </div>
                <span className="modal-total-calc">
                  الإجمالي: <strong>{priceText(product.price * quantity)}</strong>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-action-buttons">
              <button
                type="button"
                className="button button-accent modal-add-btn"
                onClick={handleAdd}
              >
                <span>{addedToast ? '✓ تم الإضافة للحقيبة' : 'أضف لحقيبة التسوق'}</span>
              </button>
              <button
                type="button"
                className="button button-dark modal-wa-btn"
                onClick={handleDirectWhatsApp}
              >
                <span>طلب مباشر واتساب</span>
                <span aria-hidden="true">↗</span>
              </button>
            </div>

            {/* Trust Assurances */}
            <div className="modal-perks">
              <div>📦 <strong>معاينة وقياس قبل الدفع:</strong> يمكنك فتح الشحنة وقياسها والتأكد من الخامة مع المندوب.</div>
              <div>🚚 <strong>توصيل سريع:</strong> خلال 24 - 48 ساعة لكافة محافظات مصر.</div>
              <div>🔄 <strong>استبدال سهل ومجاني:</strong> في حال كان المقاس بحاجة لتعديل.</div>
            </div>

            {/* Informational Tabs Accordion */}
            <div className="pro-info-tabs">
              <div className="pro-tab-buttons">
                <button
                  type="button"
                  className={activeTab === 'specs' ? 'is-active' : ''}
                  onClick={() => setActiveTab('specs')}
                >
                  المواصفات والخامة
                </button>
                <button
                  type="button"
                  className={activeTab === 'care' ? 'is-active' : ''}
                  onClick={() => setActiveTab('care')}
                >
                  إرشادات الغسيل
                </button>
                <button
                  type="button"
                  className={activeTab === 'shipping' ? 'is-active' : ''}
                  onClick={() => setActiveTab('shipping')}
                >
                  الشحن والمعاينة
                </button>
              </div>

              <div className="pro-tab-body">
                {activeTab === 'specs' && (
                  <ul className="pro-specs-list">
                    {product.specs?.map((spec, i) => (
                      <li key={i}>{spec}</li>
                    )) || (
                      <>
                        <li>قطن مصري 100% مغسول عالي النعومة</li>
                        <li>وزن ثقيل 450 GSM لمظهر ثابت وفخم</li>
                        <li>قصة أوفرسايز مدروسة بعناية</li>
                      </>
                    )}
                  </ul>
                )}

                {activeTab === 'care' && (
                  <div className="pro-care-content">
                    <p>• يُفضل الغسيل بماء بارد (30 درجة مئوية) مقلوباً على الوجه الداخلي للحفاظ على الصبغة والألوان.</p>
                    <p>• تجنب استخدام المبيضات (Clorox) أو التنظيف الجاف القاسي.</p>
                    <p>• يُنصح بالكي بدرجة حرارة متوسطة من الجهة الخلفية للطباعة والتطريز.</p>
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div className="pro-shipping-content">
                    <p>• يتم توصيل جميع الطلبات عبر مندوب شحن خاص خلال 48 ساعة بحد أقصى.</p>
                    <p>• يحق للعميل تجربة وقياس القطعة بحضور المندوب قبل سداد المبلغ.</p>
                    <p>• الشحن مجاني تماماً لأي طلبية تتجاوز 2,000 ج.م.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
