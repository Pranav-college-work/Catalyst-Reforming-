/* FCC study material · interactive charts
   1) three-lump kinetic model (Fahim et al. 2010, Eqs 8.19–8.21, Ex. E8.3)
   2) yield calculator from the FCC yield correlations (Table 8.6, Ex. E8.1) */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const fmt = (v, d = 1) => (Math.round(v * 10 ** d) / 10 ** d).toFixed(d);

  /* ---------- 1. three-lump model ---------- */
  function lumpModel(k1, k2, k3) {
    // dy1/dt = -(k1+k3) y1^2 ; dy2/dt = k1 y1^2 - k2 y2   (phi = 1), t in hours
    let y1 = 1, y2 = 0, t = 0;
    const dt = 2e-4, pts = [[0, 0, 0]];
    let best = { x: 0, y: 0, t: 0 };
    const f = (a, b) => [-(k1 + k3) * a * a, k1 * a * a - k2 * b];
    let n = 0;
    while (1 - y1 < 0.95 && t < 8) {
      const A = f(y1, y2), B = f(y1 + dt / 2 * A[0], y2 + dt / 2 * A[1]);
      const C = f(y1 + dt / 2 * B[0], y2 + dt / 2 * B[1]), D = f(y1 + dt * C[0], y2 + dt * C[1]);
      y1 += dt / 6 * (A[0] + 2 * B[0] + 2 * C[0] + D[0]);
      y2 += dt / 6 * (A[1] + 2 * B[1] + 2 * C[1] + D[1]);
      t += dt;
      if (y2 > best.y) best = { x: 1 - y1, y: y2, t };
      if (++n % 10 === 0) pts.push([1 - y1, y2, t]);
    }
    return { pts, best };
  }

  // Table 8.7: conversion, gasoline, gas + coke (weight fractions) at 548.9 °C, C/O = 4
  const DATA = [[0.8238, 0.5416, 0.2822], [0.7118, 0.4865, 0.2253], [0.6204, 0.4385, 0.1819], [0.4926, 0.3767, 0.1159]];

  function drawLump() {
    const box = document.getElementById('lumpChart');
    if (!box) return;
    const k1 = +document.getElementById('k1').value;
    const k2 = +document.getElementById('k2').value;
    const k3 = +document.getElementById('k3').value;
    document.getElementById('k1v').textContent = k1;
    document.getElementById('k2v').textContent = k2;
    document.getElementById('k3v').textContent = k3;
    const { pts, best } = lumpModel(k1, k2, k3);

    const W = 560, H = 380, L = 54, R = 16, T = 16, B = 46;
    const X = x => L + x * (W - L - R), Y = y => T + (1 - y) * (H - T - B);
    let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="${NS}">`;
    for (let g = 0; g <= 10; g += 2) {
      const v = g / 10;
      s += `<line class="grid" x1="${X(0)}" y1="${Y(v)}" x2="${X(1)}" y2="${Y(v)}"/>`;
      s += `<text x="${L - 8}" y="${Y(v) + 4}" text-anchor="end">${g * 10}</text>`;
      s += `<line class="grid" x1="${X(v)}" y1="${Y(0)}" x2="${X(v)}" y2="${Y(1)}"/>`;
      s += `<text x="${X(v)}" y="${H - B + 18}" text-anchor="middle">${g * 10}</text>`;
    }
    s += `<line class="axis" x1="${X(0)}" y1="${Y(0)}" x2="${X(1)}" y2="${Y(0)}"/><line class="axis" x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(1)}"/>`;
    s += `<text class="lbl" x="${(L + W - R) / 2}" y="${H - 8}" text-anchor="middle">conversion, wt%</text>`;
    s += `<text class="lbl" transform="translate(16 ${(T + H - B) / 2}) rotate(-90)" text-anchor="middle">yield, wt%</text>`;
    const path = (fn, col, dash) => {
      const d = pts.map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(fn(p)).toFixed(1)).join('');
      return `<path d="${d}" fill="none" stroke="${col}" stroke-width="3" ${dash ? 'stroke-dasharray="7 5"' : ''}/>`;
    };
    s += `<line x1="${X(0)}" y1="${Y(1)}" x2="${X(1)}" y2="${Y(0)}" stroke="#C06A1F" stroke-width="2" stroke-dasharray="3 4"/>`;
    s += path(p => p[0] - p[1], '#8A929B', true);
    s += path(p => p[1], '#2E9B63', false);
    DATA.forEach(d => {
      s += `<circle cx="${X(d[0])}" cy="${Y(d[1])}" r="5.5" fill="#2E9B63" stroke="#fff" stroke-width="1.5"/>`;
      s += `<rect x="${X(d[0]) - 5}" y="${Y(d[2]) - 5}" width="10" height="10" fill="#8A929B" stroke="#fff" stroke-width="1.5"/>`;
    });
    s += `<line x1="${X(best.x)}" y1="${Y(best.y)}" x2="${X(best.x)}" y2="${Y(0)}" stroke="#2E9B63" stroke-width="1.2" stroke-dasharray="2 3"/>`;
    s += `<circle cx="${X(best.x)}" cy="${Y(best.y)}" r="7" fill="none" stroke="#2E9B63" stroke-width="2.5"/>`;
    const lx = Math.min(X(best.x) + 10, W - 150);
    s += `<text class="lbl" x="${lx}" y="${Y(best.y) - 12}">max ${fmt(best.y * 100)} wt%</text>`;
    s += '</svg>';
    box.innerHTML = s;

    const whsv = best.t > 0 ? 1 / best.t : 0;
    document.getElementById('lumpOut').innerHTML =
      `<p><b>Gasoline maximum:</b> ${fmt(best.y * 100)} wt% at ${fmt(best.x * 100)} % conversion ` +
      `(space time ${fmt(best.t, 3)} h, WHSV ≈ ${fmt(whsv)} h⁻¹).</p>` +
      `<p>Past this point, running harder (more time, temperature or catalyst) only turns gasoline into gas and coke.</p>`;
  }

  function initLump() {
    if (!document.getElementById('lumpChart')) return;
    ['k1', 'k2', 'k3'].forEach(id => document.getElementById(id).addEventListener('input', drawLump));
    document.getElementById('kreset').addEventListener('click', () => {
      document.getElementById('k1').value = 23; document.getElementById('k2').value = 3.1; document.getElementById('k3').value = 7.5; drawLump();
    });
    drawLump();
  }

  /* ---------- 2. yield calculator (Table 8.6) ---------- */
  function yields(C, API) {
    const gasoline = 0.7754 * C - 0.7778;
    const lco = 0.0047 * C * C - 0.8564 * C + 53.576;
    return [
      { k: 'Gasoline', v: gasoline, b: 'LV%', c: '#2E9B63' },
      { k: 'LCO', v: lco, b: 'LV%', c: '#B7791F' },
      { k: 'HCO', v: 100 - C - lco, b: 'LV%', c: '#8B5A2B' },
      { k: 'C₄=', v: 0.0993 * C - 0.1556, b: 'LV%', c: '#4F7FC0' },
      { k: 'C₃=', v: 0.0003 * C * C + 0.0633 * C + 0.0143, b: 'LV%', c: '#4F7FC0' },
      { k: 'iC₄', v: 0.0007 * C * C + 0.0047 * C + 1.40524, b: 'LV%', c: '#7FA3D6' },
      { k: 'nC₄', v: 0.0002 * C * C + 0.019 * C + 0.0476, b: 'LV%', c: '#7FA3D6' },
      { k: 'C₃', v: 0.0436 * C - 0.8714, b: 'LV%', c: '#7FA3D6' },
      { k: 'Coke', v: 0.05356 * C - 0.18598 * API + 5.966975, b: 'wt%', c: '#4B4F55' },
      { k: 'Gases', v: 0.0552 * C + 0.597, b: 'wt%', c: '#8A929B' },
    ].concat([
      { k: 'Gasoline API', v: -0.19028 * C + 0.02772 * gasoline + 64.08, b: '°API', prop: true },
      { k: 'LCO API', v: -0.34661 * C + 1.725715 * API, b: '°API', prop: true },
    ]);
  }

  function drawYield() {
    const box = document.getElementById('yieldChart');
    if (!box) return;
    const C = +document.getElementById('conv').value;
    let API = parseFloat(document.getElementById('api').value);
    if (!isFinite(API)) API = 20.02;
    document.getElementById('cv').textContent = C;
    const rows = yields(C, API);
    const bars = rows.filter(r => !r.prop);

    const W = 520, rowH = 30, L = 92, R = 60, T = 8;
    const H = T + bars.length * rowH + 30, max = 70;
    const X = v => L + Math.max(0, v) / max * (W - L - R);
    let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="${NS}">`;
    for (let g = 0; g <= max; g += 10) {
      s += `<line class="grid" x1="${X(g)}" y1="${T}" x2="${X(g)}" y2="${T + bars.length * rowH}"/>`;
      s += `<text x="${X(g)}" y="${T + bars.length * rowH + 16}" text-anchor="middle">${g}</text>`;
    }
    bars.forEach((r, i) => {
      const y = T + i * rowH;
      s += `<text class="lbl" x="${L - 10}" y="${y + 19}" text-anchor="end">${r.k}</text>`;
      s += `<rect x="${X(0)}" y="${y + 6}" width="${(X(r.v) - X(0)).toFixed(1)}" height="${rowH - 12}" rx="3" fill="${r.c}"/>`;
      s += `<text x="${X(r.v) + 6}" y="${y + 19}">${fmt(r.v)} <tspan font-size="10">${r.b}</tspan></text>`;
    });
    s += `<text x="${(L + W - R) / 2}" y="${H - 2}" text-anchor="middle">yield (LV% or wt%, see label)</text></svg>`;
    box.innerHTML = s;

    const warn = rows.find(r => r.k === 'HCO').v < 0;
    let t = '<div class="tw" style="margin:0"><table class="t"><thead><tr><th>Product</th><th class="num">Value</th><th>Basis</th></tr></thead><tbody>';
    rows.forEach(r => { t += `<tr><td>${r.k}</td><td class="num">${fmt(r.v, 2)}</td><td>${r.b}</td></tr>`; });
    t += '</tbody></table></div>';
    if (warn) t += '<p class="small" style="color:var(--warn)">HCO is negative: outside the correlation range.</p>';
    document.getElementById('yieldTable').innerHTML = t;
  }

  function initYield() {
    if (!document.getElementById('yieldChart')) return;
    document.getElementById('conv').addEventListener('input', drawYield);
    document.getElementById('api').addEventListener('input', drawYield);
    document.getElementById('ex81').addEventListener('click', () => {
      document.getElementById('conv').value = 75; document.getElementById('api').value = 20.02; drawYield();
    });
    drawYield();
  }

  document.addEventListener('DOMContentLoaded', () => { initLump(); initYield(); });
})();
