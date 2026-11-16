import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'يرجى إدخال الاسم'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'يرجى إدخال البريد الإلكتروني'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // ليس إجباري في حال كان التسجيل عن طريق Google
      required: function () {
        return !this.googleId
      },
      minlength: 6,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
  },
  {
    timestamps: true,
  }
)

// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// مقارنة كلمة المرور عند تسجيل الدخول
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model('User', userSchema)
export default User

