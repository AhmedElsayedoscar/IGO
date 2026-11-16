import { createContext, useContext, useState, useEffect } from 'react'
import initialProducts from '../products.json'

const ProductsContext = createContext(null)

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('igo_products')
      return saved ? JSON.parse(saved) : initialProducts
    } catch {
      return initialProducts
    }
  })

  const [backendConnected, setBackendConnected] = useState(false)
  const [loading, setLoading] = useState(false)

  // Save to localStorage whenever products change
  useEffect(() => {
    try {
      localStorage.setItem('igo_products', JSON.stringify(products))
    } catch (e) {
      console.error('Failed to save products locally', e)
    }
  }, [products])

  // Check backend health
  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') setBackendConnected(true)
      })
      .catch(() => setBackendConnected(false))
  }, [])

  const addProduct = (productData) => {
    const id = productData.id || `igo-${Date.now().toString(36)}`
    const newProduct = {
      ...productData,
      id,
      rating: productData.rating || 5.0,
      reviewsCount: productData.reviewsCount || 1,
      createdAt: new Date().toISOString(),
    }
    setProducts((prev) => [newProduct, ...prev])
    return newProduct
  }

  const updateProduct = (id, updatedData) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item))
    )
  }

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id))
  }

  const resetToDefault = () => {
    setProducts(initialProducts)
    localStorage.removeItem('igo_products')
  }

  const exportProductsJson = () => {
    const jsonStr = JSON.stringify(products, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        resetToDefault,
        exportProductsJson,
        backendConnected,
        loading,
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider')
  }
  return context
}

