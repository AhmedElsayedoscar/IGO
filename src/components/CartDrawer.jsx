import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { ASSET } from '../utils/asset'

const WHATSAPP_NUMBER = '201000364250'
const priceText = (p) => `${Number(p || 0).toLocaleString('ar-EG')} ج.م`

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, totalCount, clearCart } = useCart()
  const [promo, setPromo] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [promoError, setPromoError] = useState('')

  if (!isCartOpen) return null

  const handleApplyPromo = (e) => {
    e.preventDefault()
    setPromoError('')
    const clean = promo.trim().toUpperCase()
    if (clean === 'IGO10' || clean === 'FIRST10') {
      setDiscountPercent(10)
    } else {
      setPromoError('كود الخصم غير صحيح أو منتهي')
    }
  }

  const discountAmount = Math.round((subtotal * discountPercent) / 100)
  const finalTotal = subtotal - discountAmount
  const freeShippingThreshold = 2000
  const remainingForFreeShipping = freeShippingThreshold - subtotal

  const handleCheckoutWhatsApp = () => {
    if (cart.length === 0) return

    let msg = `🛍️ *طلب جديد من متجر IGO Clothing Brand*\n`
    msg += `--------------------------------------\n`
    cart.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.product.name}*\n`
      msg += `   • المقاس: ${item.size} | اللون: ${item.color}\n`
      msg += `   • الكمية: ${item.quantity} × ${priceText(item.product.price)}\n`
      msg += `   • الإجمالي: ${priceText(item.product.price * item.quantity)}\n\n`
    })
    msg += `--------------------------------------\n`
    msg += `💵 *المجموع الفرعي:* ${priceText(subtotal)}\n`
    if (discountPercent > 0) {
      msg += `🏷️ *الخصم (${discountPercent}%):* -${priceText(discountAmount)}\n`
    }
    msg += `💰 *الإجمالي النهائي:* ${priceText(finalTotal)}\n`
    msg += `🚚 *الشحن:* ${subtotal >= freeShippingThreshold ? 'شحن مجاني' : 'حسب المحافظة'}\n\n`
    msg += `يرجى تأكيد الطلب وتحديد عنوان التوصيل.`

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="cart-backdrop" onClick={() => setIsCartOpen(false)}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-header">
          <div className="cart-title-row">
            <h2>حقيبة المشتريات</h2>
            <span className="cart-badge-count">{totalCount} قطعة</span>
          </div>
          <button
            type="button"
            className="cart-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="إغلاق السلة"
          >
            ×
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="cart-shipping-bar">
          {remainingForFreeShipping > 0 ? (
            <p>
              أضف بـ <strong>{priceText(remainingForFreeShipping)}</strong> للحصول على <strong>شحن مجاني! 🚚</strong>
            </p>
          ) : (
            <p className="free-shipping-success">🎉 مبروك! حصلت على شحن مجاني لكافة محافظات مصر</p>
          )}
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="cart-items-scroll">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <span className="empty-cart-icon">🛍️</span>
              <h3>حقيبة التسوق فارغة</h3>
              <p>تصفح التشكيلة الجديدة واختر القطع اللي تناسب ستايلك.</p>
              <button
                type="button"
                className="button button-accent"
                onClick={() => setIsCartOpen(false)}
              >
                اكتشف المنتجات الآن
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-item-card" key={item.cartItemId}>
                <img
                  src={ASSET(item.product.image)}
                  alt={item.product.name}
                  className="cart-item-thumb"
                />
                <div className="cart-item-info">
                  <div className="cart-item-top">
                    <h4>{item.product.name}</h4>
                    <button
                      type="button"
                      className="cart-remove-item"
                      onClick={() => removeFromCart(item.cartItemId)}
                      title="حذف المنتج"
                    >
                      🗑
                    </button>
                  </div>
                  <div className="cart-item-tags">
                    <span className="cart-tag">المقاس: {item.size}</span>
                    <span className="cart-tag">اللون: {item.color}</span>
                  </div>
                  <div className="cart-item-bottom">
                    <div className="qty-control">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, -1)}
                        aria-label="تقليل الكمية"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, 1)}
                        aria-label="زيادة الكمية"
                      >
                        +
                      </button>
                    </div>
                    <div className="cart-item-price">
                      {priceText(item.product.price * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {cart.length > 0 && (
          <div className="cart-footer">
            {/* Promo Form */}
            <form onSubmit={handleApplyPromo} className="promo-form">
              <input
                type="text"
                placeholder="كود الخصم (جرب IGO10)"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
              />
              <button type="submit">تطبيق</button>
            </form>
            {promoError && <small className="promo-err">{promoError}</small>}
            {discountPercent > 0 && (
              <small className="promo-succ">تم تطبيق خصم {discountPercent}% بنجاح!</small>
            )}

            <div className="cart-summary-lines">
              <div className="summary-line">
                <span>المجموع الفرعي</span>
                <span>{priceText(subtotal)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="summary-line discount-line">
                  <span>الخصم ({discountPercent}%)</span>
                  <span>-{priceText(discountAmount)}</span>
                </div>
              )}
              <div className="summary-line total-line">
                <span>الإجمالي المقدر</span>
                <strong>{priceText(finalTotal)}</strong>
              </div>
            </div>

            <button
              type="button"
              className="button button-accent cart-checkout-btn"
              onClick={handleCheckoutWhatsApp}
            >
              <span>إتمام الطلب عبر واتساب</span>
              <span aria-hidden="true">←</span>
            </button>

            <button
              type="button"
              className="cart-clear-all"
              onClick={clearCart}
            >
              تفريغ الحقيبة
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

