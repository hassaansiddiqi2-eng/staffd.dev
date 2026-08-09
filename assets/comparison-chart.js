/* ═══════════════════════════════════════════════════════
   INTERACTIVE COMPARISON VISUALIZATION & MATRIX
   Chart.js + Interactive Filter Tabs + Feature Breakdown Callouts
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var canvas = document.getElementById('comparisonRadar');
  if (!canvas || typeof Chart === 'undefined') return;

  var ctx = canvas.getContext('2d');

  /* 7 Comparison Axes Data */
  var allFeatures = [
    {
      id: 0,
      title: 'No fees until hire',
      cat: 'guarantee',
      staffd: true,
      agency: false,
      upwork: false,
      detail: 'Staffd charges $0 upfront with a 14-day trial. Agencies charge $15k–$25k before candidate writes code; Upwork bills hourly immediately.'
    },
    {
      id: 1,
      title: '4-stage technical vetting',
      cat: 'vetting',
      staffd: true,
      agency: false,
      upwork: false,
      detail: 'Every Staffd engineer survives CV audit, comms interview, tech test, and live coding. Agencies resume-match; Upwork leaves vetting to you.'
    },
    {
      id: 2,
      title: 'Matched in 48 hours',
      cat: 'vetting',
      staffd: true,
      agency: false,
      upwork: false,
      detail: 'Hand-matched 2-3 candidates from our bench in 48 hours. Agencies take 3–6 weeks; Upwork dumps 100+ unverified applicants on your desk.'
    },
    {
      id: 3,
      title: '7-day replacement guarantee',
      cat: 'guarantee',
      staffd: true,
      agency: false,
      upwork: false,
      detail: 'If an engineer isn\'t the right fit in week 1, we replace them free with zero invoice. Agencies require multi-month contracts.'
    },
    {
      id: 4,
      title: 'No long-term contracts',
      cat: 'guarantee',
      staffd: true,
      agency: false,
      upwork: true,
      detail: 'Month-to-month rolling engagements. Scale up or scale down with 2 weeks notice. No recruiter lock-in fees.'
    },
    {
      id: 5,
      title: 'Dedicated matching support',
      cat: 'cost',
      staffd: true,
      agency: true,
      upwork: false,
      detail: 'Dedicated account lead handles intake, matching, onboarding, and feedback. Upwork is 100% self-serve.'
    },
    {
      id: 6,
      title: '40–60% below US rates',
      cat: 'cost',
      staffd: true,
      agency: false,
      upwork: true,
      detail: 'Senior Pakistani talent at $4.8k–$7.5k/mo vs US equivalents at $12k–$18k/mo, without quality tradeoffs.'
    }
  ];

  /* Active State */
  var activeCategory = 'all';
  var activeView = 'all';
  var selectedFeatureId = 0;
  var chartInstance = null;

  /* Gradient Creators */
  function getStaffdGradient(ctx) {
    var grad = ctx.createLinearGradient(0, 0, 400, 0);
    grad.addColorStop(0, '#3b82f6');
    grad.addColorStop(1, '#60a5fa');
    return grad;
  }

  function getAgencyGradient(ctx) {
    var grad = ctx.createLinearGradient(0, 0, 400, 0);
    grad.addColorStop(0, '#333333');
    grad.addColorStop(1, '#444444');
    return grad;
  }

  function getUpworkGradient(ctx) {
    var grad = ctx.createLinearGradient(0, 0, 400, 0);
    grad.addColorStop(0, '#555555');
    grad.addColorStop(1, '#777777');
    return grad;
  }

  /* Filter items based on activeCategory */
  function getFilteredFeatures() {
    if (activeCategory === 'all') return allFeatures;
    return allFeatures.filter(function (f) { return f.cat === activeCategory; });
  }

  /* Create/Update Chart */
  function renderChart() {
    var features = getFilteredFeatures();
    var labels = features.map(function (f) { return f.title; });

    var staffdData = features.map(function (f) { return f.staffd ? 1 : 0; });
    var agencyData = features.map(function (f) { return f.agency ? 1 : 0; });
    var upworkData = features.map(function (f) { return f.upwork ? 1 : 0; });

    var datasets = [];

    if (activeView === 'all' || activeView === 'staffd') {
      datasets.push({
        label: 'Staffd',
        data: staffdData,
        backgroundColor: getStaffdGradient(ctx),
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.7
      });
    }

    if (activeView === 'all' || activeView === 'agency') {
      datasets.push({
        label: 'Traditional Agency',
        data: agencyData,
        backgroundColor: getAgencyGradient(ctx),
        borderColor: '#555555',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.7
      });
    }

    if (activeView === 'all' || activeView === 'upwork') {
      datasets.push({
        label: 'Upwork / Freelance',
        data: upworkData,
        backgroundColor: getUpworkGradient(ctx),
        borderColor: '#777777',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.7
      });
    }

    if (chartInstance) {
      chartInstance.data.labels = labels;
      chartInstance.data.datasets = datasets;
      chartInstance.update({ duration: 400 });
    } else {
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: datasets
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          onClick: function (event, elements) {
            if (elements && elements.length > 0) {
              var index = elements[0].index;
              var filtered = getFilteredFeatures();
              if (filtered[index]) {
                selectFeature(filtered[index].id);
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: '#aaaaaa',
                font: { family: "'DM Sans', sans-serif", size: 13, weight: '500' },
                padding: 16,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(17, 17, 17, 0.95)',
              titleColor: '#ffffff',
              bodyColor: '#bbbbbb',
              borderColor: '#333333',
              borderWidth: 1,
              cornerRadius: 8,
              padding: 12,
              titleFont: { family: "'DM Sans', sans-serif", size: 13, weight: '600' },
              bodyFont: { family: "'DM Sans', sans-serif", size: 12 },
              callbacks: {
                label: function (context) {
                  var val = context.raw;
                  return ' ' + context.dataset.label + ': ' + (val === 1 ? '✓ Included' : '✕ Not Offered');
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              max: 1,
              ticks: { display: false },
              grid: { display: false, drawBorder: false }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: {
                color: '#f0f0f0',
                font: {
                  family: "'DM Sans', sans-serif",
                  size: window.innerWidth < 600 ? 11 : 13,
                  weight: '500'
                }
              }
            }
          }
        }
      });
    }
  }

  /* Select feature and highlight breakdown card + callout */
  function selectFeature(id) {
    selectedFeatureId = id;
    var feat = allFeatures[id];
    if (!feat) return;

    /* Update list item active state */
    var items = document.querySelectorAll('.comp-matrix-item');
    items.forEach(function (item) {
      if (parseInt(item.getAttribute('data-id'), 10) === id) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    /* Update dynamic detail callout box */
    var calloutTitle = document.getElementById('compCalloutTitle');
    var calloutText  = document.getElementById('compCalloutText');
    var badgeStaffd = document.getElementById('badgeStaffd');
    var badgeAgency = document.getElementById('badgeAgency');
    var badgeUpwork = document.getElementById('badgeUpwork');

    if (calloutTitle) calloutTitle.textContent = feat.title;
    if (calloutText)  calloutText.textContent  = feat.detail;

    if (badgeStaffd) badgeStaffd.className = feat.staffd ? 'comp-badge pass' : 'comp-badge fail';
    if (badgeStaffd) badgeStaffd.textContent = feat.staffd ? '✓ Staffd Included' : '✕ Staffd Excluded';

    if (badgeAgency) badgeAgency.className = feat.agency ? 'comp-badge pass' : 'comp-badge fail';
    if (badgeAgency) badgeAgency.textContent = feat.agency ? '✓ Agency Included' : '✕ Agency Excluded';

    if (badgeUpwork) badgeUpwork.className = feat.upwork ? 'comp-badge pass' : 'comp-badge fail';
    if (badgeUpwork) badgeUpwork.textContent = feat.upwork ? '✓ Upwork Included' : '✕ Upwork Excluded';
  }

  /* Render Interactive Matrix Cards */
  function renderMatrixList() {
    var container = document.getElementById('compMatrixList');
    if (!container) return;

    container.innerHTML = '';

    allFeatures.forEach(function (feat) {
      var item = document.createElement('div');
      item.className = 'comp-matrix-item' + (feat.id === selectedFeatureId ? ' active' : '');
      item.setAttribute('data-id', feat.id);
      item.setAttribute('data-cat', feat.cat);

      item.innerHTML =
        '<div class="comp-item-header">' +
          '<span class="comp-item-title">' + feat.title + '</span>' +
          '<div class="comp-item-badges">' +
            '<span class="mini-badge staffd">' + (feat.staffd ? '✓ Staffd' : '✕ Staffd') + '</span>' +
            '<span class="mini-badge agency">' + (feat.agency ? '✓ Agency' : '✕ Agency') + '</span>' +
            '<span class="mini-badge upwork">' + (feat.upwork ? '✓ Upwork' : '✕ Upwork') + '</span>' +
          '</div>' +
        '</div>';

      item.addEventListener('click', function () {
        selectFeature(feat.id);
      });

      container.appendChild(item);
    });
  }

  /* Setup Filter Button Handlers */
  function setupControls() {
    var catButtons = document.querySelectorAll('.comp-cat-btn');
    catButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        catButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-cat');
        renderChart();

        /* Filter list view */
        var items = document.querySelectorAll('.comp-matrix-item');
        items.forEach(function (item) {
          var itemCat = item.getAttribute('data-cat');
          if (activeCategory === 'all' || itemCat === activeCategory) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });

    var viewButtons = document.querySelectorAll('.comp-view-btn');
    viewButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        viewButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeView = btn.getAttribute('data-view');
        renderChart();
      });
    });
  }

  /* Initialise Component */
  document.addEventListener('DOMContentLoaded', function () {
    renderChart();
    renderMatrixList();
    setupControls();
    selectFeature(0);
  });

})();
