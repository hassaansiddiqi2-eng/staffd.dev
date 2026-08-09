/* ═══════════════════════════════════════════════════════
   BOOKING MODAL — Book a Call widget logic
   Requires: Flatpickr (CDN), EmailJS (CDN)
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Configuration ── */
  var EMAILJS_PUBLIC_KEY = 'wvLRELr4XwX6qVLbt'; // Account → API Keys
  var EMAILJS_SERVICE_ID = 'service_npny57s';         // Email Services → Service ID
  var EMAILJS_TEMPLATE_ID = 'template_t3z59qc';       // Email Templates → Template ID
  var RECIPIENT_EMAIL = 'info@staffd.dev';

  /* ── DOM refs ── */
  var overlay, modal, form, successEl, errorBanner;
  var dateInput, selectedTime, selectedTimeRaw, autoCloseTimer;

  /* ── Initialise when DOM is ready ── */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    overlay      = document.getElementById('bookCallOverlay');
    modal        = document.getElementById('bookCallModal');
    form         = document.getElementById('bookCallForm');
    successEl    = document.getElementById('bookingSuccess');
    errorBanner  = document.getElementById('bookingErrorBanner');

    if (!overlay || !modal) return;

    /* Init EmailJS if available */
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    /* Init Flatpickr if available */
    if (typeof flatpickr !== 'undefined') {
      dateInput = flatpickr('#bookingDate', {
        inline: true,
        minDate: 'today',
        dateFormat: 'Y-m-d',
        disable: [
          function (date) {
            return date.getDay() === 0 || date.getDay() === 6;
          }
        ],
        onChange: function () {
          /* Clear any existing time selection visual when date changes */
          var slots = document.querySelectorAll('.time-slot');
          slots.forEach(function (s) { s.classList.remove('selected'); });
          selectedTime = null;
          selectedTimeRaw = null;
        }
      });
    }

    /* Generate time slots */
    generateTimeSlots();

    /* Event delegation for opening the modal */
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action="open-booking-modal"]');
      if (btn) {
        e.preventDefault();
        openModal();
      }
    });

    /* Close button */
    var closeBtn = modal.querySelector('.booking-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    /* Click outside to close */
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    /* Escape key to close */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        closeModal();
      }
    });

    /* Form submit */
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
  }

  /* ── Time slot generation (9am–6pm UK Time) ── */
  function generateTimeSlots() {
    var container = document.getElementById('timeSlots');
    if (!container) return;

    var slots = [];
    for (var h = 9; h < 18; h++) {
      for (var m = 0; m < 60; m += 30) {
        var hour12 = h > 12 ? h - 12 : h;
        var ampm = h >= 12 ? 'PM' : 'AM';
        var label = hour12 + ':' + (m === 0 ? '00' : m) + ' ' + ampm;
        slots.push({ label: label, hour: h, minute: m });
      }
    }

    slots.forEach(function (slot) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-slot';
      btn.textContent = slot.label;
      btn.addEventListener('click', function () {
        container.querySelectorAll('.time-slot').forEach(function (s) {
          s.classList.remove('selected');
        });
        btn.classList.add('selected');
        selectedTime = slot.label;
        selectedTimeRaw = { hour: slot.hour, minute: slot.minute };
      });
      container.appendChild(btn);
    });
  }

  /* ── UK Time to Pakistani Time (PKT) converter ── */
  function convertUKtoPKT(dateObj, hour24, minute) {
    var year = dateObj.getFullYear();
    var month = dateObj.getMonth();
    var day = dateObj.getDate();

    /* Determine if UK is in BST (UTC+1) or GMT (UTC+0).
       BST is active from last Sunday in March to last Sunday in October. */
    var isBST = false;
    if (month > 2 && month < 9) {
      isBST = true;
    } else if (month === 2) {
      var lastSunMar = 31 - (new Date(year, 2, 31).getDay());
      if (day >= lastSunMar) isBST = true;
    } else if (month === 9) {
      var lastSunOct = 31 - (new Date(year, 9, 31).getDay());
      if (day < lastSunOct) isBST = true;
    }

    var diffHours = isBST ? 4 : 5; // PKT is UTC+5
    var pktHour24 = (hour24 + diffHours) % 24;
    var pktAmPm = pktHour24 >= 12 ? 'PM' : 'AM';
    var pktHour12 = pktHour24 % 12 || 12;
    var pktMinuteStr = minute === 0 ? '00' : (minute < 10 ? '0' + minute : minute);

    return pktHour12 + ':' + pktMinuteStr + ' ' + pktAmPm + ' PKT';
  }

  /* ── UK Time to US Eastern Time (ET) converter ── */
  function convertUKtoET(dateObj, hour24, minute) {
    var year = dateObj.getFullYear();
    var month = dateObj.getMonth();
    var day = dateObj.getDate();

    /* UK in BST (UTC+1), US ET in EDT (UTC-4) -> Diff is 5 hours.
       UK in GMT (UTC+0), US ET in EST (UTC-5) -> Diff is 5 hours. */
    var etHour24 = (hour24 - 5 + 24) % 24;
    var etAmPm = etHour24 >= 12 ? 'PM' : 'AM';
    var etHour12 = etHour24 % 12 || 12;
    var etMinuteStr = minute === 0 ? '00' : (minute < 10 ? '0' + minute : minute);

    return etHour12 + ':' + etMinuteStr + ' ' + etAmPm + ' ET';
  }

  /* ── Modal open / close ── */
  function openModal() {
    if (!overlay) return;

    if (form) form.style.display = '';
    if (successEl) successEl.style.display = 'none';
    if (errorBanner) errorBanner.classList.remove('visible');
    clearAutoClose();

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    setTimeout(function () {
      var first = modal.querySelector('input:not([type="hidden"]), textarea, select');
      if (first) first.focus();
    }, 200);

    if (typeof gtag === 'function') {
      gtag('event', 'booking_modal_open', { event_category: 'engagement' });
    }
  }

  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    clearAutoClose();
  }

  function clearAutoClose() {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
  }

  /* ── Form validation ── */
  function validateForm() {
    var valid = true;
    var fields = [
      { id: 'bookingName', msg: 'Name is required' },
      { id: 'bookingEmail', msg: 'Valid email is required' },
      { id: 'bookingCompany', msg: 'Company is required' },
      { id: 'bookingStack', msg: 'Stack / role is required' }
    ];

    form.querySelectorAll('.booking-field').forEach(function (f) {
      f.classList.remove('has-error');
    });

    fields.forEach(function (field) {
      var input = document.getElementById(field.id);
      if (!input) return;
      var value = input.value.trim();
      var parent = input.closest('.booking-field');

      if (!value) {
        if (parent) parent.classList.add('has-error');
        valid = false;
      }

      if (field.id === 'bookingEmail' && value) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          if (parent) parent.classList.add('has-error');
          valid = false;
        }
      }
    });

    if (!dateInput || !dateInput.selectedDates || dateInput.selectedDates.length === 0) {
      valid = false;
    }

    if (!selectedTime || !selectedTimeRaw) {
      valid = false;
    }

    return valid;
  }

  /* ── Form submission ── */
  function handleSubmit(e) {
    e.preventDefault();

    var honeypot = document.getElementById('bookingWebsite');
    if (honeypot && honeypot.value) {
      showSuccess('User', '', '', '');
      return;
    }

    if (!validateForm()) return;

    var name    = document.getElementById('bookingName').value.trim();
    var email   = document.getElementById('bookingEmail').value.trim();
    var company = document.getElementById('bookingCompany').value.trim();
    var stack   = document.getElementById('bookingStack').value.trim();
    var notes   = document.getElementById('bookingNotes').value.trim();
    var date    = dateInput.selectedDates[0];
    var dateStr = formatDate(date);

    var ukTimeStr = selectedTime + ' UK Time';
    var pktTimeStr = convertUKtoPKT(date, selectedTimeRaw.hour, selectedTimeRaw.minute);
    var usTimeStr = convertUKtoET(date, selectedTimeRaw.hour, selectedTimeRaw.minute);
    var combinedTimeStr = ukTimeStr + ' (' + usTimeStr + ' / ' + pktTimeStr + ')';

    var submitBtn = form.querySelector('.booking-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
      submitBtn.textContent = 'Sending…';
    }

    var templateParams = {
      to_email: RECIPIENT_EMAIL,
      name: name,
      email: email,
      company: company,
      stack: stack,
      notes: notes || '(none)',
      requested_date: dateStr,
      requested_time: combinedTimeStr,
      uk_time: ukTimeStr,
      us_time: usTimeStr,
      pkt_time: pktTimeStr
    };

    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function () {
          showSuccess(name, dateStr, ukTimeStr, pktTimeStr);
          trackBookingSuccess();
        })
        .catch(function (err) {
          console.error('EmailJS Error:', err);
          showError(name, email, company, stack, notes, dateStr, combinedTimeStr);
        })
        .finally(function () {
          resetSubmitBtn(submitBtn);
        });
    } else {
      showSuccess(name, dateStr, ukTimeStr, pktTimeStr);
      resetSubmitBtn(submitBtn);
    }
  }

  function resetSubmitBtn(btn) {
    if (!btn) return;
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.textContent = 'Book My Call →';
  }

  /* ── Success state ── */
  function showSuccess(name, date, ukTime, pktTime) {
    if (form) form.style.display = 'none';
    if (!successEl) return;

    successEl.style.display = 'block';

    var heading = successEl.querySelector('h3');
    if (heading) {
      heading.textContent = "You're booked, " + name + ".";
    }

    var details = successEl.querySelector('.booking-success-details');
    if (details && date && ukTime) {
      details.textContent = "We'll see you " + date + ' at ' + ukTime + '.';
    }

    var icsBtn = successEl.querySelector('.booking-ics-btn');
    if (icsBtn && date && ukTime) {
      icsBtn.onclick = function () {
        downloadICS(name, date, ukTime);
      };
    }

    autoCloseTimer = setTimeout(function () {
      closeModal();
    }, 8000);
  }

  /* ── Error state (mailto fallback) ── */
  function showError(name, email, company, stack, notes, date, timeStr) {
    if (!errorBanner) return;
    errorBanner.classList.add('visible');

    var subject = encodeURIComponent('Call Request — ' + name + ' (' + company + ')');
    var body = encodeURIComponent(
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Company: ' + company + '\n' +
      'Stack/Role: ' + stack + '\n' +
      'Notes: ' + (notes || 'N/A') + '\n' +
      'Preferred Date: ' + date + '\n' +
      'Preferred Time: ' + timeStr
    );

    var link = errorBanner.querySelector('a');
    if (link) {
      link.href = 'mailto:' + RECIPIENT_EMAIL + '?subject=' + subject + '&body=' + body;
    }
  }

  /* ── .ics file generation (using Europe/London timezone) ── */
  function downloadICS(name, dateStr, ukTimeStr) {
    var parts = dateStr.match(/(\w+)\s+(\d+),\s+(\d+)/);
    if (!parts) return;

    var months = {
      'January':1,'February':2,'March':3,'April':4,'May':5,'June':6,
      'July':7,'August':8,'September':9,'October':10,'November':11,'December':12
    };

    var month = months[parts[1]];
    var day = parseInt(parts[2], 10);
    var year = parseInt(parts[3], 10);

    var timeParts = ukTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeParts) return;

    var hour = parseInt(timeParts[1], 10);
    var minute = parseInt(timeParts[2], 10);
    var ampm = timeParts[3].toUpperCase();

    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;

    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    var dtStart = year + pad(month) + pad(day) + 'T' + pad(hour) + pad(minute) + '00';
    var endHour = hour;
    var endMin = minute + 30;
    if (endMin >= 60) { endHour++; endMin -= 60; }
    var dtEnd = year + pad(month) + pad(day) + 'T' + pad(endHour) + pad(endMin) + '00';

    var icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Staffd//Booking//EN',
      'BEGIN:VEVENT',
      'DTSTART;TZID=Europe/London:' + dtStart,
      'DTEND;TZID=Europe/London:' + dtEnd,
      'SUMMARY:Staffd Discovery Call — ' + name,
      'DESCRIPTION:A quick 20-minute call with the Staffd team.\\nNo pitch deck. We\'ll ask about your stack and what needs to ship.\\n\\nVideo call link will be sent via email.',
      'LOCATION:Video Call (link to follow)',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    var blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'staffd-call-' + year + pad(month) + pad(day) + '.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ── Helpers ── */
  function formatDate(date) {
    var months = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ];
    return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
  }

  function trackBookingSuccess() {
    if (typeof gtag === 'function') {
      gtag('event', 'booking_submitted', {
        event_category: 'conversion',
        event_label: 'book_a_call'
      });
    }
  }

  window.openBookingModal = openModal;

})();
