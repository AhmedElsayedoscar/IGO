# IGO Clothing Brand — نسخة React للتجربة

المستودع يستخدم React وVite لبناء الواجهة. ملفات الموقع السابقة محفوظة في `legacy-static/` للمقارنة؛ الملفات التي يقدمها Vercel تخرج من `dist/`.

## التشغيل المحلي

```bash
npm install
npm run dev
```

لإنشاء وفحص بناء محلي:

```bash
npm run build
npm run preview
```

ناتج البناء داخل `dist/`. يحتوي التطبيق على واجهة المتجر في `/` وصفحة `/admin`، ويعيد استخدام الشعار وصور الأمثلة وتنسيقات الموقع الحالي. يظل كل منتج وسعر وصورة في النسخة الحالية توضيحيًا.

## ما يعمل الآن

واجهة React تعرض المنتجات الثلاثة التجريبية، وتدعم البحث والتصنيف ونموذج طلب يفتح واتساب على الرقم المحدد. مسار الإدارة يُظهر معاينة للمنتجات وخطوات إعداد الباك-إند، لكنه **لا يسجّل دخولًا ولا يحفظ أو يرفع ملفات**.

## الباك-إند والإدارة

لا توجد قاعدة بيانات أو مزامنة بين الأجهزة في هذه النسخة. لإكمال إدارة حقيقية، يلزم ربط مشروع Supabase يملكه المستخدم: Project URL ومفتاح النشر العام (`publishable` أو `anon`) وإيميل مدير المتجر، ثم إنشاء جداول المنتجات وسياسات صلاحيات RLS وتفعيل تسجيل الدخول. لا تضع كلمة مرور أو `service_role`/secret key في واجهة المتصفح أو المستودع العام.

خطة Supabase Free الحالية $0 وتشمل 500MB لقاعدة البيانات و1GB للملفات، وقد توقف المشاريع المجانية بعد أسبوع من عدم النشاط؛ راجع [الأسعار الرسمية](https://supabase.com/pricing). لا يشمل هذا أي شراء أو اشتراك مدفوع.

## إعداد Vercel

`vercel.json` يحدد أمر البناء `npm run build`، ومجلد الخرج `dist`، وإعادة توجيه مسار `/admin` لتطبيق React. البناء لا يحتاج قاعدة بيانات أو أي متغيرات سرية.

## مصادر صور المثال

- الهودي: [Arturo Mendez / Unsplash](https://unsplash.com/photos/man-in-beige-hoodie-and-blue-denim-jeans-standing-on-white-concrete-wall-during-daytime-Apcpq1RXkio).
- الطقم: [Monstera Production / Pexels](https://www.pexels.com/photo/young-woman-wearing-gray-sweatpants-and-sweatshirt-6311642/).
- البنطال: [Engin Akyurt / Pexels](https://www.pexels.com/photo/stylish-gray-women-s-joggers-on-white-background-39457735/).
