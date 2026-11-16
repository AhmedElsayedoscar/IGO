const PRODUCT_STORE_KEY = 'igo-products-preview-v1';
let products = [];
let toastTimer;
const $ = selector => document.querySelector(selector);
const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const formatPrice = value => `${Number(value || 0).toLocaleString('ar-EG')} ج.م`;

async function loadProducts() {
  try {
    const saved = localStorage.getItem(PRODUCT_STORE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) { console.warn('تعذر قراءة نسخة المعاينة المحلية.', error); }
  const response = await fetch('./data/products.json', {cache:'no-store'});
  if (!response.ok) throw new Error('تعذر تحميل المنتجات.');
  const parsed = await response.json();
  return Array.isArray(parsed) ? parsed : [];
}
function persistLocal() {
  localStorage.setItem(PRODUCT_STORE_KEY, JSON.stringify(products, null, 2));
  renderProducts();
  showToast('تم الحفظ في هذا المتصفح فقط.');
}
function renderProducts() {
  $('#admin-count').textContent = String(products.length).padStart(2,'0');
  const list = $('#admin-product-list');
  list.innerHTML = products.length ? products.map(product => `
    <article class="admin-product-row">
      <img src="${escapeHTML(product.image)}" alt="">
      <div><strong>${escapeHTML(product.name)}</strong><small>${escapeHTML(product.category)} · ${formatPrice(product.price)} · ${escapeHTML(product.id)}</small></div>
      <div class="row-actions"><button type="button" data-edit="${escapeHTML(product.id)}">تعديل</button><button class="delete-button" type="button" data-delete="${escapeHTML(product.id)}">حذف</button></div>
    </article>`).join('') : '<p class="loading-card">لا توجد منتجات. أضف منتجًا جديدًا من النموذج.</p>';
}
function clearForm() {
  $('#product-form').reset();
  $('#product-id').value = '';
  $('#form-heading').textContent = 'إضافة منتج';
  $('#save-product').textContent = 'حفظ في هذا المتصفح';
  $('#cancel-edit').hidden = true;
}
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2500);
}
function downloadProducts() {
  const blob = new Blob([JSON.stringify(products, null, 2) + '\n'], {type:'application/json;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'products.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast('تم تنزيل products.json. ارفعه إلى GitHub لنشر التغييرات.');
}

document.addEventListener('DOMContentLoaded', async () => {
  try { products = await loadProducts(); renderProducts(); }
  catch (error) { $('#admin-product-list').innerHTML = '<p class="loading-card">تعذر تحميل بيانات المنتجات. افتح الموقع عبر خادم محلي أو بعد النشر.</p>'; console.error(error); }

  $('#product-form').addEventListener('submit', event => {
    event.preventDefault();
    const id = $('#product-id').value || `igo-${Date.now().toString(36)}`;
    const item = {
      id,
      name: $('#product-name').value.trim(),
      category: $('#product-category').value,
      price: Number($('#product-price').value),
      description: $('#product-description').value.trim(),
      image: $('#product-image').value.trim(),
      featured: $('#product-featured').checked
    };
    if (!item.name || !item.image || !Number.isFinite(item.price)) return;
    const existing = products.findIndex(product => String(product.id) === id);
    if (existing >= 0) products[existing] = item;
    else products.unshift(item);
    persistLocal();
    clearForm();
  });
  $('#admin-product-list').addEventListener('click', event => {
    const editButton = event.target.closest('[data-edit]');
    const deleteButton = event.target.closest('[data-delete]');
    if (editButton) {
      const product = products.find(item => String(item.id) === editButton.dataset.edit);
      if (!product) return;
      $('#product-id').value = product.id;
      $('#product-name').value = product.name || '';
      $('#product-category').value = product.category || 'أخرى';
      $('#product-price').value = product.price ?? '';
      $('#product-description').value = product.description || '';
      $('#product-image').value = product.image || '';
      $('#product-featured').checked = Boolean(product.featured);
      $('#form-heading').textContent = 'تعديل منتج';
      $('#save-product').textContent = 'حفظ التعديل محليًا';
      $('#cancel-edit').hidden = false;
      $('#product-name').focus();
    }
    if (deleteButton) {
      const product = products.find(item => String(item.id) === deleteButton.dataset.delete);
      if (product && window.confirm(`حذف «${product.name}» من نسخة هذا المتصفح؟`)) {
        products = products.filter(item => String(item.id) !== String(product.id));
        persistLocal();
        if ($('#product-id').value === String(product.id)) clearForm();
      }
    }
  });
  $('#cancel-edit').addEventListener('click', clearForm);
  $('#export-products').addEventListener('click', downloadProducts);
  $('#reset-products').addEventListener('click', async () => {
    if (!window.confirm('استعادة أمثلة البداية؟ ستُمسح التعديلات المحلية الحالية من هذا المتصفح.')) return;
    localStorage.removeItem(PRODUCT_STORE_KEY);
    try { products = await (await fetch('./data/products.json', {cache:'no-store'})).json(); renderProducts(); clearForm(); showToast('استُعيدت أمثلة البداية في هذا المتصفح.'); }
    catch (error) { showToast('تعذر استعادة الملف الأساسي.'); }
  });
});
