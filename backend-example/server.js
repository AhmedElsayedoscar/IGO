import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() })
})

// Connect to MongoDB using Mongoose
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/igo_store'

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB via Mongoose successfully.')
    app.listen(PORT, () => {
      console.log(`🚀 IGO Auth Server running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message)
  })

