# سيرفر مصادقة IGO مع Mongoose و MongoDB

هذا المجلد يحتوي على كود السيرفر الخلفي الجاهز للربط مع تطبيق React:
- دعم **Mongoose** ومخطط مستخدم كامل مع تشفير كلمات المرور بـ `bcryptjs`.
- مسارات **التسجيل** (`/api/auth/register`) و**تسجيل الدخول** (`/api/auth/login`).
- مسار **تسجيل الدخول بواسطة Google** (`/api/auth/google`) مع التحقق التلقائي من `google-auth-library`.
- حماية وتوليد توكن **JWT**.

---

## طريقة التشغيل السريع:

1. ادخل إلى المجلد:
   ```bash
   cd backend-example
   ```

2. ثبّت الحزم:
   ```bash
   npm install
   ```

3. انسخ ملف المتغيرات:
   ```bash
   cp .env.example .env
   ```

4. شغّل السيرفر:
   ```bash
   npm run dev
   # أو
   node server.js
   ```

