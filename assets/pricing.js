const rates = {
  fullstack: { junior: [2800, 7000], mid: [4800, 12000], senior: [7200, 18000] },
  react:     { junior: [2400, 6500], mid: [4200, 11000], senior: [6800, 17000] },
  node:      { junior: [2600, 6500], mid: [4500, 11500], senior: [7000, 17500] },
  python:    { junior: [2600, 7000], mid: [4800, 12000], senior: [7500, 18500] },
  qa:        { junior: [1800, 5000], mid: [3200, 8000],  senior: [5000, 12000] },
};

function updateCalc() {
  const role = document.getElementById('calc-role').value;
  const level = document.getElementById('calc-level').value;
  const engage = document.getElementById('calc-engage').value;
  const [staffd, us] = rates[role][level];
  const multiplier = engage === 'part' ? 0.5 : 1;
  const s = Math.round(staffd * multiplier);
  const u = Math.round(us * multiplier);
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
