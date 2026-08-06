/*
  Renders a parliament-style hemicycle seat diagram into any element carrying
  data-hemicycle='{"total":222,"majority":112,"parties":[{"label":"PH","n":82,"color":"#FF3B30"}]}'.
  Pure SVG, no dependencies. Seats are laid out in concentric arcs and filled
  left-to-right in the order the parties are listed.
*/
(function () {
  function layout(total, rows, innerR, outerR) {
    var radii = [];
    var i, j;
    for (i = 0; i < rows; i++) {
      radii.push(rows === 1 ? outerR : innerR + (outerR - innerR) * (i / (rows - 1)));
    }
    var sumR = radii.reduce(function (a, b) { return a + b; }, 0);
    var counts = radii.map(function (r) { return Math.max(1, Math.round(total * r / sumR)); });

    // Reconcile rounding drift against the true total.
    var drift = total - counts.reduce(function (a, b) { return a + b; }, 0);
    var guard = 0;
    while (drift !== 0 && guard < 10000) {
      var k = guard % rows;
      if (drift > 0) { counts[k]++; drift--; }
      else if (counts[k] > 1) { counts[k]--; drift++; }
      guard++;
    }

    var pts = [];
    for (i = 0; i < rows; i++) {
      var n = counts[i];
      for (j = 0; j < n; j++) {
        var t = n === 1 ? 0.5 : j / (n - 1);
        var ang = Math.PI - t * Math.PI;
        pts.push({ x: radii[i] * Math.cos(ang), y: -radii[i] * Math.sin(ang), ang: ang });
      }
    }
    // Left (angle PI) to right (angle 0), so party blocks read across the arc.
    pts.sort(function (a, b) { return b.ang - a.ang; });
    return pts;
  }

  function rowsFor(total) {
    if (total <= 40) return 3;
    if (total <= 80) return 4;
    if (total <= 160) return 5;
    return 6;
  }

  function render(el) {
    var cfg;
    try { cfg = JSON.parse(el.getAttribute("data-hemicycle")); }
    catch (e) { return; }
    if (!cfg || !cfg.parties || !cfg.total) return;

    var total = cfg.total;
    var rows = cfg.rows || rowsFor(total);
    var outerR = 100, innerR = 52;
    var pts = layout(total, rows, innerR, outerR);
    var seatR = Math.max(1.9, Math.min(3.6, 210 / total * 1.9));

    // Expand the party list into one colour per seat.
    var colors = [];
    cfg.parties.forEach(function (p) {
      for (var i = 0; i < p.n; i++) colors.push(p.color);
    });
    while (colors.length < pts.length) colors.push("var(--oth)");

    var pad = seatR + 2;
    var vb = [-(outerR + pad), -(outerR + pad), (outerR + pad) * 2, outerR + pad + 4].join(" ");
    var svg = '<svg class="hemicycle" viewBox="' + vb + '" role="img" aria-label="Seat distribution: '
      + cfg.parties.map(function (p) { return p.label + " " + p.n; }).join(", ") + '">';
    pts.forEach(function (p, i) {
      svg += '<circle cx="' + p.x.toFixed(2) + '" cy="' + p.y.toFixed(2) + '" r="' + seatR.toFixed(2)
        + '" fill="' + colors[i] + '"/>';
    });
    svg += "</svg>";

    var html = '<div class="hemicycle-wrap">' + svg
      + '<div class="hemicycle-total">' + total + "</div>";
    if (cfg.majority) {
      html += '<div class="hemicycle-majority">' + cfg.majority + " required for majority</div>";
    }
    html += '<div class="hemicycle-legend">';
    cfg.parties.forEach(function (p) {
      html += '<span class="hemicycle-chip" style="background:' + p.color + '">'
        + '<span class="hemicycle-chip-n">' + p.n + "</span>"
        + '<span class="hemicycle-chip-label">' + p.label + "</span></span>";
    });
    html += "</div></div>";

    el.innerHTML = html;
  }

  function renderAll(root) {
    (root || document).querySelectorAll("[data-hemicycle]").forEach(render);
  }

  window.renderHemicycles = renderAll;
  document.addEventListener("DOMContentLoaded", function () { renderAll(document); });
})();
