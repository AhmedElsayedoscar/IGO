const WHATSAPP_NUMBER = '201000364250';
const PRODUCT_STORE_KEY = 'igo-products-preview-v1';
let allProducts = [];
let activeFilter = 'الكل';
let selectedProduct = null;
let toastTimer;

const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const formatPrice = value => `${Number(value || 0).toLocaleString('ar-EG')} ج.م`;

async function getProducts() {
  try {
    const local = localStorage.getItem(PRODUCT_STORE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) { console.warn('تعذر قراءة نسخة المعاينة المحلية.', error); }
  const response = await fetch('./data/products.json', {cache:'no-store'});
  if (!response.ok) throw new Error('لم يتم تحميل ملف المنتجات.');
  const products = await response.json();
  return Array.isArray(products) ? products : [];
}

function renderProducts() {
  const grid = document.getElementById('product-grid');
  const empty = document.getElementById('no-products');
  const query = (document.getElementById('product-search')?.value || '').trim().toLocaleLowerCase('ar');
  const filtered = allProducts.filter(product => {
    const filterMatch = activeFilter === 'الكل' || product.category === activeFilter;
    const text = `${product.name || ''} ${product.category || ''} ${product.description || ''}`.toLocaleLowerCase('ar');
    return filterMatch && (!query || text.includes(query));
  });
  grid.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)} — صورة توضيحية" loading="lazy">
        <span class="product-badge">${product.featured ? 'اختيارنا' : 'مثال'}</span>
        <button class="product-card-action" type="button" data-order="${escapeHTML(product.id)}" aria-label="اطلب ${escapeHTML(product.name)} عبر واتساب"><span>اسأل عن القطعة</span><span aria-hidden="true">↗</span></button>
      </div>
      <div class="product-meta">
        <div><h3>${escapeHTML(product.name)}</h3><p class="product-category">${escapeHTML(product.category || 'IGO EDIT')}</p></div>
        <div class="product-price">${formatPrice(product.price)}<small>سعر تجريبي</small></div>
      </div>
    </article>`).join('');
  empty.hidden = filtered.length > 0;
  if (!allProducts.length) {
    grid.innerHTML = '<p class="loading-card">لا توجد منتجات حاليًا. أضف منتجات من صفحة الإدارة.</p>';
    empty.hidden = true;
  }
}

function openOrder(productId) {
  selectedProduct = allProducts.find(product => String(product.id) === String(productId));
  if (!selectedProduct) return;
  document.getElementById('dialog-product-name').textContent = selectedProduct.name;
  document.getElementById('dialog-product-price').textContent = `سعر توضيحي: ${formatPrice(selectedProduct.price)}`;
  document.getElementById('order-size').value = '';
  document.getElementById('order-color').value = '';
  document.getElementById('order-quantity').value = '1';
  const dialog = document.getElementById('order-dialog');
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open','');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  try {
    allProducts = await getProducts();
    renderProducts();
  } catch (error) {
    document.getElementById('product-grid').innerHTML = '<p class="loading-card">تعذر تحميل المنتجات. حدّث الصفحة بعد قليل.</p>';
    console.error(error);
  }

  document.querySelectorAll('.filter-chip').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('is-selected'));
    button.classList.add('is-selected');
    activeFilter = button.dataset.filter;
    renderProducts();
  }));
  document.getElementById('product-search').addEventListener('input', renderProducts);
  document.getElementById('product-grid').addEventListener('click', event => {
    const button = event.target.closest('[data-order]');
    if (button) openOrder(button.dataset.order);
  });
  const dialog = document.getElementById('order-dialog');
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close?.());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close?.(); });
  document.getElementById('order-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!selectedProduct) return;
    const size = document.getElementById('order-size').value;
    const color = document.getElementById('order-color').value.trim();
    const quantity = document.getElementById('order-quantity').value;
    const message = `مرحباً IGO، عايز أطلب المنتج: ${selectedProduct.name}\nالسعر المعروض تجريبي: ${formatPrice(selectedProduct.price)}\nالمقاس: ${size}\nاللون: ${color}\nالكمية: ${quantity}\nممكن تأكيد السعر والتوفر؟`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    dialog.close?.();
    showToast('فتحنا واتساب برسالة الطلب. أكّد السعر والتوفر مع المتجر.');
  });
  const menuButton = document.querySelector('.mobile-menu-button');
  const nav = document.querySelector('.main-nav');
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('is-open', !expanded);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded','false');
  }));
});
