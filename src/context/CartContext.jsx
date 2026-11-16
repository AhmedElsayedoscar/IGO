import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('igo_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('igo_wishlist')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('igo_cart', JSON.stringify(cart))
    } catch (e) {
      console.error(e)
    }
  }, [cart])

  useEffect(() => {
    try {
      localStorage.setItem('igo_wishlist', JSON.stringify(wishlist))
    } catch (e) {
      console.error(e)
    }
  }, [wishlist])

  const addToCart = (product, size = 'M', color = '', quantity = 1) => {
    const chosenColor = color || (product.colors && product.colors[0]) || 'افتراضي'
    const chosenSize = size || (product.sizes && product.sizes[0]) || 'M'
    const cartItemId = `${product.id}-${chosenSize}-${chosenColor}`

    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId)
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + Number(quantity) }
            : item
        )
      }
      return [
        ...prev,
        {
          cartItemId,
          product,
          size: chosenSize,
          color: chosenColor,
          quantity: Number(quantity),
        },
      ]
    })
    setIsCartOpen(true)
  }

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId))
  }

  const updateQuantity = (cartItemId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean)
    )
  }

  const clearCart = () => setCart([])

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.product.price || 0) * item.quantity,
    0
  )
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        subtotal,
        totalCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

