/* Full-time monthly rates: [staffd, usEquivalent] */
const rates = {
  fullstack: { junior: [2800, 7000], mid: [4800, 12000], senior: [7200, 18000] },
  react:     { junior: [2400, 6500], mid: [4200, 11000], senior: [6800, 17000] },
  node:      { junior: [2600, 6500], mid: [4500, 11500], senior: [7000, 17500] },
  python:    { junior: [2600, 7000], mid: [4800, 12000], senior: [7500, 18500] },
  aiml:      { junior: [3500, 9000], mid: [6000, 14000], senior: [9000, 20000] },
  mobile:    { junior: [3000, 8000], mid: [5500, 13000], senior: [8000, 18000] },
  qa:        { junior: [1800, 5000], mid: [3200, 8000],  senior: [5000, 12000] },
};

/* Explicit part-time rates where they are NOT simply half of full-time.
   Roles not listed here fall back to a 0.5 multiplier. */
const partRates = {
  aiml:   { junior: [2000, 5000], mid: [3500, 8000],  senior: [5500, 12000] },
  mobile: { junior: [1800, 4500], mid: [3200, 7500],  senior: [5000, 11000] },
};

function updateCalc() {
  const role = document.getElementById('calc-role').value;
  const level = document.getElementById('calc-level').value;
  const engage = document.getElementById('calc-engage').value;

  let s, u;
  if (engage === 'part' && partRates[role]) {
    [s, u] = partRates[role][level];
  } else {
    const [fs, fu] = rates[role][level];
    const multiplier = engage === 'part' ? 0.5 : 1;
    s = Math.round(fs * multiplier);
    u = Math.round(fu * multiplier);
  }

  const save = u - s;
  const pct = Math.round((save / u) * 100);
  document.getElementById('staffd-rate').textContent = '$' + s.toLocaleString();
  document.getElementById('us-rate').textContent = '$' + u.toLocaleString();
  document.getElementById('savings').textContent = '$' + save.toLocaleString();
  document.getElementById('savings-pct').textContent = pct + '% below US market';
}

if (document.getElementById('calc-role')) {
  updateCalc();
}
