/* Mobile navigation toggle — shared across all pages */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('nav-open');
  });

  // Close the menu after tapping any link inside it
  nav.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('nav-open'));
  });
});

/* Scroll-reveal for .fade-up elements (e.g. the guarantee cards) */
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.fade-up');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(el => observer.observe(el));
});
