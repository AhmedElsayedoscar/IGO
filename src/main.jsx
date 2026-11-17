import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { WinterAtmosphere, WinterMusicPlayer } from './components/WinterExperience.jsx'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ProductsProvider } from './context/ProductsContext'
import './styles.css'
import './react-overrides.css'
import './auth.css'
import './admin.css'
import './user-dashboard.css'

import './responsive.css'

import './winter.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          <App />
          <WinterAtmosphere />
          <WinterMusicPlayer />
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  </React.StrictMode>,
)
