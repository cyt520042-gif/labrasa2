const products = {
  brasa: { name: 'Brasa Clássico', description: 'Pão brioche, burger na brasa, queijo e molho da casa.', price: 29.9 },
  duplo: { name: 'Brasa Duplo', description: 'Dois burgers, cheddar cremoso, bacon crocante e barbecue.', price: 36.9 },
  especial: { name: 'Brasa Especial', description: 'Burger na brasa, queijo derretido e molho especial.', price: 33.9 },
  combo: { name: 'Combo da Casa', description: 'Brasa Clássico, batata crocante e bebida gelada.', price: 39.9 }
};
const cart = {};
const WHATSAPP_NUMBER = ''; // Número com DDI e DDD, somente dígitos.
const DELIVERY_FEE = 6; // Ajustar conforme a regra de entrega da loja.
const money = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const drawer = document.querySelector('#cartDrawer');
const backdrop = document.querySelector('#drawerBackdrop');
const toast = document.querySelector('#toast');
let toastTimer;
let returnFocus = null;
const pageRegions = [...document.querySelectorAll('.site-header, .mobile-nav, main, .site-footer')];
const heroSlides = [
  { id: 'brasa', name: 'Brasa Clássico', description: 'Pão brioche, burger na brasa, queijo e molho da casa.', price: 29.9, image: 'assets/brasa-classico-optimized.png', alt: 'Hambúrguer Brasa Clássico com batatas douradas' },
  { id: 'duplo', name: 'Brasa Duplo', description: 'Dois burgers, cheddar cremoso, bacon crocante e barbecue.', price: 36.9, image: 'assets/brasa-duplo.jpg', alt: 'Hambúrguer duplo com bacon crocante' },
  { id: 'especial', name: 'Brasa Especial', description: 'Burger na brasa, queijo derretido e molho especial.', price: 33.9, image: 'assets/brasa-especial.jpg', alt: 'Hambúrguer especial em luz quente cinematográfica' }
];
let currentSlide = 0;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}
function openCart() {
  returnFocus = document.activeElement;
  drawer.classList.add('open'); backdrop.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); document.body.classList.add('drawer-open');
  pageRegions.forEach(region => { region.inert = true; });
  document.querySelector('#cartClose').focus();
}
function closeCart() {
  drawer.classList.remove('open'); backdrop.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); document.body.classList.remove('drawer-open');
  pageRegions.forEach(region => { region.inert = false; });
  const target = returnFocus instanceof HTMLElement && returnFocus.isConnected ? returnFocus : document.querySelector('#cartOpen');
  target.focus();
}
function renderCart() {
  const cartItems = document.querySelector('#cartItems');
  const entries = Object.entries(cart).filter(([, qty]) => qty > 0);
  const count = entries.reduce((sum, [, qty]) => sum + qty, 0);
  const subtotal = entries.reduce((sum, [id, qty]) => sum + products[id].price * qty, 0);
  const isDelivery = document.querySelector('input[name="fulfillment"]:checked').value === 'delivery';
  const fee = isDelivery && count ? DELIVERY_FEE : 0;
  document.querySelector('#cartCount').textContent = count;
  document.querySelector('#cartOpen').setAttribute('aria-label', `Abrir sacola, ${count} ${count === 1 ? 'item' : 'itens'}`);
  document.querySelector('#subtotal').textContent = money(subtotal);
  document.querySelector('#deliveryFee').textContent = money(fee);
  document.querySelector('#total').textContent = money(subtotal + fee);
  document.querySelector('#addressField').classList.toggle('hidden', !isDelivery);
  document.querySelector('.delivery-row').classList.toggle('hidden', !isDelivery || !count);
  if (!count) {
    cartItems.innerHTML = '<div class="empty-cart">Sua sacola ainda está vazia.<br><a href="#cardapio" id="goMenu">Bora escolher um lanche ↗</a></div>';
    document.querySelector('#checkout').disabled = true;
    document.querySelector('#checkout').style.opacity = '.55';
    return;
  }
  document.querySelector('#checkout').disabled = false;
  document.querySelector('#checkout').style.opacity = '1';
  cartItems.innerHTML = entries.map(([id, qty]) => `<div class="cart-line"><div><strong>${products[id].name}</strong><small>${money(products[id].price)} · ${products[id].description}</small></div><div class="quantity"><button data-qty="${id}" data-change="-1" aria-label="Diminuir ${products[id].name}">−</button><span>${qty}</span><button data-qty="${id}" data-change="1" aria-label="Aumentar ${products[id].name}">+</button></div></div>`).join('');
}
function addItem(id) { cart[id] = (cart[id] || 0) + 1; renderCart(); showToast(`${products[id].name} adicionado à sacola.`); }
function showHeroSlide(index) {
  currentSlide = (index + heroSlides.length) % heroSlides.length;
  const burger = document.querySelector('#heroBurger');
  burger.classList.add('changing');
  setTimeout(() => {
    burger.src = heroSlides[currentSlide].image;
    burger.alt = heroSlides[currentSlide].alt;
    burger.classList.toggle('dark-photo', currentSlide !== 0);
    document.querySelector('#featureName').textContent = heroSlides[currentSlide].name;
    document.querySelector('#featureDescription').textContent = heroSlides[currentSlide].description;
    document.querySelector('#featurePrice').textContent = money(heroSlides[currentSlide].price);
    document.querySelector('#featureKicker').textContent = `DESTAQUE · 0${currentSlide + 1}`;
    document.querySelector('#featureAdd').dataset.add = heroSlides[currentSlide].id;
    document.querySelectorAll('.hero-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
      dot.setAttribute('aria-pressed', String(i === currentSlide));
    });
    burger.classList.remove('changing');
  }, 150);
}
function orderMessage() {
  const entries = Object.entries(cart).filter(([, qty]) => qty > 0);
  const isDelivery = document.querySelector('input[name="fulfillment"]:checked').value === 'delivery';
  const lines = entries.map(([id, qty]) => `• ${qty}x ${products[id].name} — ${money(products[id].price * qty)}`);
  const subtotal = entries.reduce((sum, [id, qty]) => sum + products[id].price * qty, 0);
  const fee = isDelivery ? DELIVERY_FEE : 0;
  const address = document.querySelector('#addressInput').value.trim();
  return `Olá, La Brasa Burger! Quero fazer este pedido:\n\n${lines.join('\n')}\n\nRecebimento: ${isDelivery ? 'Delivery' : 'Retirada'}${isDelivery ? `\nEndereço: ${address || '(informar endereço)'}` : ''}\nSubtotal: ${money(subtotal)}${isDelivery ? `\nEntrega: ${money(fee)}` : ''}\nTotal: ${money(subtotal + fee)}`;
}

document.querySelector('#cartOpen').addEventListener('click', openCart);
document.querySelector('#cartClose').addEventListener('click', closeCart);
backdrop.addEventListener('click', closeCart);
document.querySelector('#promoCart').addEventListener('click', openCart);
document.querySelectorAll('.hero-dot').forEach(dot => dot.addEventListener('click', () => showHeroSlide(Number(dot.dataset.slide))));
document.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => addItem(button.dataset.add)));
document.querySelector('#cartItems').addEventListener('click', event => {
  if (event.target.closest('#goMenu')) { closeCart(); return; }
  const button = event.target.closest('[data-qty]');
  if (!button) return;
  const id = button.dataset.qty;
  cart[id] = Math.max(0, (cart[id] || 0) + Number(button.dataset.change));
  renderCart();
});
document.querySelectorAll('input[name="fulfillment"]').forEach(input => input.addEventListener('change', renderCart));
document.querySelector('#checkout').addEventListener('click', async () => {
  if (!Object.values(cart).some(Boolean)) return;
  const isDelivery = document.querySelector('input[name="fulfillment"]:checked').value === 'delivery';
  const addressInput = document.querySelector('#addressInput');
  if (isDelivery && !addressInput.value.trim()) {
    addressInput.focus();
    showToast('Informe seu endereço para continuar.');
    return;
  }
  const message = orderMessage();
  if (WHATSAPP_NUMBER) {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  } else {
    try { await navigator.clipboard.writeText(message); showToast('Pedido copiado. Cole no WhatsApp para enviar.'); }
    catch {
      const helper = document.createElement('textarea');
      helper.value = message; helper.setAttribute('readonly', ''); helper.style.position = 'fixed'; helper.style.opacity = '0';
      document.body.appendChild(helper); helper.select();
      const copied = document.execCommand('copy'); helper.remove();
      showToast(copied ? 'Pedido copiado. Cole no WhatsApp para enviar.' : 'Não foi possível copiar o pedido.');
    }
  }
});
const menuToggle = document.querySelector('#menuToggle');
menuToggle.addEventListener('click', () => {
  const nav = document.querySelector('#mobileNav');
  const isOpen = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
});
document.querySelectorAll('#mobileNav a').forEach(link => link.addEventListener('click', () => { document.querySelector('#mobileNav').classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Abrir menu'); }));
document.addEventListener('keydown', event => {
  if (event.key === 'Tab' && drawer.classList.contains('open')) {
    const focusable = [...drawer.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),[tabindex]:not([tabindex="-1"])')].filter(item => item.getClientRects().length);
    if (!focusable.length) { event.preventDefault(); return; }
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  if (event.key !== 'Escape') return;
  if (drawer.classList.contains('open')) closeCart();
  if (document.querySelector('#mobileNav').classList.contains('open')) { document.querySelector('#mobileNav').classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Abrir menu'); menuToggle.focus(); }
});
const revealElements = document.querySelectorAll('.product-card,.about-image,.promo-photo,.section-heading,.category-row,.menu-foot');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('in-view'); revealObserver.unobserve(entry.target); }
  }), { threshold: 0.14 });
  revealElements.forEach(element => revealObserver.observe(element));
} else revealElements.forEach(element => element.classList.add('in-view'));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let scrollTicking = false;
function updateScrollEffects() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  document.querySelector('#scrollProgress').style.width = `${maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0}%`;
  if (!reduceMotion) {
    const heroSection = document.querySelector('.hero');
    const heroBounds = heroSection.getBoundingClientRect();
    const travel = Math.max(1, heroSection.offsetHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, -heroBounds.top / travel));
    const burger = document.querySelector('#heroBurger');
    burger.style.setProperty('--burger-y', `${-Math.sin(progress * Math.PI) * 58}px`);
    burger.style.setProperty('--burger-rotate', `${-2.5 + progress * 5}deg`);
    burger.style.setProperty('--burger-scale', `${1 + Math.sin(progress * Math.PI) * .035}`);
  }
  scrollTicking = false;
}
window.addEventListener('scroll', () => {
  if (!scrollTicking) { window.requestAnimationFrame(updateScrollEffects); scrollTicking = true; }
}, { passive: true });
window.addEventListener('resize', updateScrollEffects, { passive: true });
updateScrollEffects();
renderCart();
