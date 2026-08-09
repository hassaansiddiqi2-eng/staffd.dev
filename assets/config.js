/* ═══════════════════════════════════════════════════════
   SITE CONFIG — Booking modal + Partial loader
   ═══════════════════════════════════════════════════════ */

/* Event delegation for booking modal — single listener for all CTAs site-wide */
document.addEventListener('click', function (e) {
  var btn = e.target.closest('[data-action="open-booking-modal"]');
  if (btn) {
    e.preventDefault();
    if (typeof window.openBookingModal === 'function') {
      window.openBookingModal();
    }
  }
});

/* ── Partial loader (progressive enhancement) ── */
function loadPartial(containerId, partialPath) {
  var container = document.getElementById(containerId);
  if (!container) return;

  fetch(partialPath)
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    })
    .then(function (html) {
      container.innerHTML = html;

      /* Re-init mobile nav toggle for the newly loaded nav */
      if (containerId === 'site-nav') {
        var toggle = container.querySelector('.nav-toggle');
        var nav = container.querySelector('nav');
        if (toggle && nav) {
          toggle.addEventListener('click', function () {
            nav.classList.toggle('nav-open');
          });
          nav.querySelectorAll('.nav-links a').forEach(function (link) {
            link.addEventListener('click', function () {
              nav.classList.remove('nav-open');
            });
          });
        }
      }
    })
    .catch(function () {
      /* Fetch failed — keep the static fallback HTML already in the container */
    });
}

/* Load partials on DOMContentLoaded */
document.addEventListener('DOMContentLoaded', function () {
  loadPartial('site-nav', 'partials/nav.html');
  loadPartial('site-footer', 'partials/footer.html');
});
