import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// دالة مساعدة لإنشاء JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'igo_secret_jwt_key_2026', {
    expiresIn: '30d',
  })
}

// @desc    تسجيل مستخدم جديد
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'يرجى إدخال جميع الحقول المطلوبة' })
    }

    const userExists = await User.findOne({ email: email.toLowerCase() })
    if (userExists) {
      return res.status(400).json({ message: 'هذا البريد الإلكتروني مسجل بالفعل' })
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
    })

    if (user) {
      res.status(201).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token: generateToken(user._id),
      })
    } else {
      res.status(400).json({ message: 'بيانات المستخدم غير صالحة' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'حدث خطأ في السيرفر' })
  }
}

// @desc    تسجيل دخول المستخدم
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email: email?.toLowerCase() })

    if (user && (await user.matchPassword(password))) {
      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
        },
        token: generateToken(user._id),
      })
    } else {
      res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'حدث خطأ في السيرفر' })
  }
}

// @desc    تسجيل الدخول باستخدام Google
// @route   POST /api/auth/google
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ message: 'Google Token مطلوب' })
    }

    // التحقق من صحة Google Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const { sub: googleId, email, name, picture } = payload

    // البحث عن المستخدم أو إنشائه
    let user = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }],
    })

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId
        if (!user.avatar && picture) user.avatar = picture
        await user.save()
      }
    } else {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        googleId,
        avatar: picture || '',
      })
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      token: generateToken(user._id),
    })
  } catch (error) {
    res.status(401).json({ message: 'فشل التحقق من حساب Google', error: error.message })
  }
}

