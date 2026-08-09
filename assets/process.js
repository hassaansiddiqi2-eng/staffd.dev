function showPage(id, btn) {
  if (btn && btn.preventDefault) btn.preventDefault();
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (!page) return;
  page.classList.add('active');
  page.classList.add('page-enter');
  setTimeout(() => page.classList.remove('page-enter'), 400);
  document.querySelectorAll('[data-page="' + id + '"]').forEach(t => t.classList.add('active'));
  if (history.replaceState) {
    const path = window.location.pathname.split('/').pop() || 'process.html';
    history.replaceState(null, '', id === 'vetting' ? path + '#vetting' : path + '#hiw');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleFaq(el) {
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(f => f.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
}

function initHashRouting() {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'vetting' || hash === 'page-vetting') {
    const btn = document.querySelector('[data-page="vetting"]');
    showPage('vetting', btn);
  } else if (hash === 'hiw' || hash === 'page-hiw' || hash === 'how-it-works') {
    const btn = document.querySelector('[data-page="hiw"]');
    showPage('hiw', btn);
  } else {
    const btn = document.querySelector('[data-page="hiw"]');
    showPage('hiw', btn);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initHashRouting();
  window.addEventListener('hashchange', initHashRouting);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'none';
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.step-item').forEach(el => observer.observe(el));
});
