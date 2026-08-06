/*
  Renders an interactive constituency choropleth into any element carrying
  data-electionmap='{"src":"data/parlimen_ge15.geojson","split":105}'.

  Boundary geometry: ElectionData.MY delimitation datasets (CC0 / public domain),
  simplified for web delivery. Results merged from the same project's
  candidate-level ballots dataset (CC0).

  Config keys:
    src    — URL of a FeatureCollection whose feature properties carry
             c (code), n (name), w (winning coalition), p (party),
             cand (candidate), pct (vote share)
    split  — optional longitude; features are separated into two side-by-side
             panels either side of it (used to close the South China Sea gap)
    ratio  — optional height/width hint for the panel box
*/
(function () {
  var COLORS = {
    PH: "#FF3B30", PN: "#34C759", BN: "#2AA9BF", GPS: "#5856D6",
    GRS: "#FF9500", ALONE: "#8E8E93", IND: "#8E8E93"
  };
  var LABELS = {
    PH: "Pakatan Harapan", PN: "Perikatan Nasional", BN: "Barisan Nasional",
    GPS: "Gabungan Parti Sarawak", GRS: "Gabungan Rakyat Sabah",
    ALONE: "Unaligned / others", IND: "Independent"
  };
  function colorFor(w) { return COLORS[w] || "#8E8E93"; }
  function labelFor(w) { return LABELS[w] || w || "Unknown"; }

  function eachRing(geom, fn) {
    var polys = geom.type === "MultiPolygon" ? geom.coordinates : [geom.coordinates];
    for (var i = 0; i < polys.length; i++) {
      for (var j = 0; j < polys[i].length; j++) fn(polys[i][j]);
    }
  }

  function bounds(features) {
    var b = [Infinity, Infinity, -Infinity, -Infinity];
    features.forEach(function (f) {
      eachRing(f.geometry, function (ring) {
        for (var k = 0; k < ring.length; k++) {
          var x = ring[k][0], y = ring[k][1];
          if (x < b[0]) b[0] = x;
          if (y < b[1]) b[1] = y;
          if (x > b[2]) b[2] = x;
          if (y > b[3]) b[3] = y;
        }
      });
    });
    return b;
  }

  function pathFor(geom, project) {
    var d = "";
    eachRing(geom, function (ring) {
      for (var k = 0; k < ring.length; k++) {
        var p = project(ring[k]);
        d += (k === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1);
      }
      d += "Z";
    });
    return d;
  }

  function buildPanel(features, width, height, pad) {
    var b = bounds(features);
    var w = b[2] - b[0], h = b[3] - b[1];
    var s = Math.min((width - pad * 2) / w, (height - pad * 2) / h);
    var ox = (width - w * s) / 2, oy = (height - h * s) / 2;
    function project(pt) {
      return [(pt[0] - b[0]) * s + ox, height - ((pt[1] - b[1]) * s + oy)];
    }
    return features.map(function (f) {
      return { f: f, d: pathFor(f.geometry, project) };
    });
  }

  function render(el, cfg, geo) {
    var feats = geo.features;
    var groups;
    if (cfg.split != null) {
      var west = [], east = [];
      feats.forEach(function (f) {
        var b = bounds([f]);
        ((b[0] + b[2]) / 2 < cfg.split ? west : east).push(f);
      });
      groups = [west, east].filter(function (g) { return g.length; });
    } else {
      groups = [feats];
    }

    var H = 460, pad = 6;
    var svgs = groups.map(function (g) {
      // width proportional to each group's aspect so panels sit naturally
      var b = bounds(g);
      var aspect = (b[2] - b[0]) / (b[3] - b[1]);
      var W = Math.max(160, Math.min(760, H * aspect));
      var paths = buildPanel(g, W, H, pad);
      var body = paths.map(function (p) {
        var pr = p.f.properties;
        return '<path d="' + p.d + '" fill="' + colorFor(pr.w) + '" class="emap-seat"'
          + ' data-c="' + (pr.c || "") + '"'
          + ' data-n="' + (pr.n || "").replace(/"/g, "&quot;") + '"'
          + ' data-w="' + (pr.w || "") + '"'
          + ' data-p="' + (pr.p || "") + '"'
          + ' data-cand="' + (pr.cand || "").replace(/"/g, "&quot;") + '"'
          + ' data-pct="' + (pr.pct != null ? pr.pct : "") + '"'
          + ' data-s="' + (pr.s || "").replace(/"/g, "&quot;") + '"></path>';
      }).join("");
      return '<svg class="emap-svg" viewBox="0 0 ' + W.toFixed(0) + ' ' + H + '" '
        + 'style="flex:' + aspect.toFixed(3) + ' 1 0" preserveAspectRatio="xMidYMid meet" '
        + 'role="img" aria-label="Constituency results map">' + body + "</svg>";
    }).join("");

    // legend from the coalitions actually present, ordered by seat count
    var tally = {};
    feats.forEach(function (f) {
      var w = f.properties.w || "Unknown";
      tally[w] = (tally[w] || 0) + 1;
    });
    var order = Object.keys(tally).sort(function (a, b) { return tally[b] - tally[a]; });
    var legend = order.map(function (w) {
      return '<button class="emap-key" data-key="' + w + '" type="button">'
        + '<span class="emap-swatch" style="background:' + colorFor(w) + '"></span>'
        + labelFor(w) + ' <strong>' + tally[w] + "</strong></button>";
    }).join("");

    el.innerHTML =
      '<div class="emap">'
      + '<div class="emap-panels">' + svgs + "</div>"
      + '<div class="emap-tip" hidden></div>'
      + '<div class="emap-legend">' + legend + "</div>"
      + (cfg.caption ? '<p class="emap-caption">' + cfg.caption + "</p>" : "")
      + "</div>";

    var tip = el.querySelector(".emap-tip");
    var wrap = el.querySelector(".emap");

    function showTip(path, ev) {
      var d = path.dataset;
      var html = '<span class="emap-tip-seat">' + (d.c ? d.c + " " : "") + d.n + "</span>";
      if (d.s) html += '<span class="emap-tip-state">' + d.s + "</span>";
      if (d.w) {
        html += '<span class="emap-tip-win"><span class="emap-swatch" style="background:'
          + colorFor(d.w) + '"></span>' + labelFor(d.w)
          + (d.p && d.p !== d.w ? " · " + d.p : "") + "</span>";
      }
      if (d.cand) html += '<span class="emap-tip-cand">' + d.cand
        + (d.pct ? " · " + d.pct + "%" : "") + "</span>";
      tip.innerHTML = html;
      tip.hidden = false;
      var r = wrap.getBoundingClientRect();
      var x = ev.clientX - r.left, y = ev.clientY - r.top;
      var tw = tip.offsetWidth, th = tip.offsetHeight;
      tip.style.left = Math.max(4, Math.min(r.width - tw - 4, x - tw / 2)) + "px";
      tip.style.top = Math.max(4, y - th - 12) + "px";
    }

    wrap.addEventListener("mousemove", function (ev) {
      var t = ev.target;
      if (t && t.classList && t.classList.contains("emap-seat")) showTip(t, ev);
    });
    wrap.addEventListener("mouseleave", function () { tip.hidden = true; });
    // touch: tap a seat to pin the tooltip
    wrap.addEventListener("click", function (ev) {
      var t = ev.target;
      if (t && t.classList && t.classList.contains("emap-seat")) showTip(t, ev);
      else tip.hidden = true;
    });

    // legend hover dims everything else
    el.querySelectorAll(".emap-key").forEach(function (btn) {
      function on() { wrap.setAttribute("data-focus", btn.dataset.key); }
      function off() { wrap.removeAttribute("data-focus"); }
      btn.addEventListener("mouseenter", on);
      btn.addEventListener("mouseleave", off);
      btn.addEventListener("focus", on);
      btn.addEventListener("blur", off);
    });
    wrap.querySelectorAll(".emap-seat").forEach(function (p) {
      p.setAttribute("data-key", p.dataset.w || "");
    });
  }

  function init(el) {
    var cfg;
    try { cfg = JSON.parse(el.getAttribute("data-electionmap")); }
    catch (e) { return; }
    if (!cfg || !cfg.src) return;
    el.innerHTML = '<p class="emap-loading">Loading map…</p>';
    fetch(cfg.src)
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (geo) { render(el, cfg, geo); })
      .catch(function (err) {
        el.innerHTML = '<p class="emap-loading">Map could not be loaded ('
          + err.message + ").</p>";
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-electionmap]").forEach(init);
  });
})();
