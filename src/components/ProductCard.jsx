import { useState } from 'react'
import { useCart } from '../context/CartContext'
import CountdownTimer from './CountdownTimer'
import { ASSET } from '../utils/asset'
import { motion, useReducedMotion } from 'framer-motion'
const priceText = (p) => `${Number(p || 0).toLocaleString('ar-EG')} ج.م`

export default function ProductCard({ product, onQuickView }) {
  const { addToCart, wishlist, toggleWishlist } = useCart()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)
  const [addedSize, setAddedSize] = useState('')
  const prefersReducedMotion = useReducedMotion()

  const isFavorite = wishlist.includes(product.id)
  const images = product.images && product.images.length > 0 ? product.images : [product.image]
  const currentImage = images[activeImageIndex] || images[0]
  const hoverImage = images[1] || images[0]

  const discountAmount = product.oldPrice ? product.oldPrice - product.price : 0
  const discountPercent = product.oldPrice
    ? Math.round((discountAmount / product.oldPrice) * 100)
    : 0

  const handleQuickAddSize = (size, e) => {
    e.stopPropagation()
    const colorName = product.colors?.[selectedColorIndex]?.name || 'افتراضي'
    addToCart(product, size, colorName, 1)
    setAddedSize(size)
    setTimeout(() => setAddedSize(''), 1200)
  }

  return (
    <motion.article
      className="pro-product-card"
      onClick={() => onQuickView(product)}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.46, ease: [0.22, 0.65, 0.3, 1] }}
      whileHover={prefersReducedMotion ? undefined : { y: -5, transition: { duration: 0.22, ease: 'easeOut' } }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.995 }}
    >
      {/* Image Wrap */}
      <div
        className="pro-image-wrap"
        onMouseEnter={() => {
          if (images.length > 1) setActiveImageIndex(1)
        }}
        onMouseLeave={() => setActiveImageIndex(0)}
      >
        <img
          src={ASSET(currentImage)}
          alt={product.name}
          className="pro-product-img"
          loading="lazy"
        />

        {/* Badges */}
        <div className="pro-card-badges">
          <span className="pro-badge pro-badge-winter">WINTER EDIT</span>
          {product.badge && <span className="pro-badge pro-badge-main">{product.badge}</span>}
          {discountPercent > 0 && (
            <span className="pro-badge pro-badge-discount">-{discountPercent}%</span>
          )}
          {product.stock && product.stock <= 3 && (
            <span className="pro-badge pro-badge-urgency">متبقي {product.stock} فقط 🔥</span>
          )}
          {product.discountEndsAt && (
            <CountdownTimer targetDate={product.discountEndsAt} compact />
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          className={`pro-wishlist-btn ${isFavorite ? 'is-active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            toggleWishlist(product.id)
          }}
          aria-label={isFavorite ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
          title={isFavorite ? 'في المفضلة' : 'إضافة للمفضلة'}
        >
          {isFavorite ? '♥' : '♡'}
        </button>

        {/* Quick Size Pills Overlay (Streetwear Brand Signature Feature) */}
        <div className="pro-quick-sizes-bar" onClick={(e) => e.stopPropagation()}>
          <span className="sizes-bar-label">إضافة سريعة:</span>
          <div className="sizes-bar-pills">
            {product.sizes?.map((size) => (
              <button
                key={size}
                type="button"
                className={`pro-size-quick-btn ${addedSize === size ? 'is-added' : ''}`}
                onClick={(e) => handleQuickAddSize(size, e)}
                title={`أضف مقاس ${size} للسلة`}
              >
                {addedSize === size ? '✓' : size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Meta Content */}
      <div className="pro-meta-content">
        {/* Category & Rating */}
        <div className="pro-category-rating-row">
          <span className="pro-category-tag">{product.category} // OVERSIZED</span>
          {product.rating && (
            <div className="pro-stars-row">
              <span className="pro-star-icon">★</span>
              <span className="pro-rating-score">{product.rating}</span>
              <span className="pro-rating-count">({product.reviewsCount || 10})</span>
            </div>
          )}
        </div>

        {/* Product Title */}
        <h3 className="pro-product-title">{product.name}</h3>

        {/* Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="pro-color-swatches" onClick={(e) => e.stopPropagation()}>
            <span className="swatches-label">الألوان:</span>
            {product.colors.map((c, idx) => (
              <button
                key={c.name}
                type="button"
                className={`pro-color-dot ${selectedColorIndex === idx ? 'is-selected' : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => {
                  setSelectedColorIndex(idx)
                  setActiveImageIndex(idx % images.length)
                }}
                title={c.name}
                aria-label={c.name}
              />
            ))}
            <span className="selected-color-name">
              {product.colors[selectedColorIndex]?.name}
            </span>
          </div>
        )}

        {/* Pricing & CTA */}
        <div className="pro-card-footer">
          <div className="pro-price-block">
            <span className="pro-current-price">{priceText(product.price)}</span>
            {product.oldPrice && (
              <span className="pro-old-price">{priceText(product.oldPrice)}</span>
            )}
          </div>

          <button
            type="button"
            className="pro-view-details-btn"
            onClick={(e) => {
              e.stopPropagation()
              onQuickView(product)
            }}
          >
            <span>تفاصيل ومعاينة</span>
            <span aria-hidden="true">←</span>
          </button>
        </div>
      </div>
    </motion.article>
  )
}
