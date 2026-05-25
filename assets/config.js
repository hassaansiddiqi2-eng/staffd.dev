/* Set your Calendly or booking URL here — updates all .book-call links */
window.BOOK_CALL_URL = '#';

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.book-call, a.nav-cta').forEach(el => {
    if (window.BOOK_CALL_URL && window.BOOK_CALL_URL !== '#') {
      el.setAttribute('href', window.BOOK_CALL_URL);
    }
  });
});
