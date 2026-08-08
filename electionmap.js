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
  // Colours follow coalition lineage, so a run of historical maps reads
  // coherently: the Alliance→BN thread stays teal, the DAP/PKR-led opposition
  // thread stays red, and the PAS-led thread stays green.
  var NODATA = "__nodata";
  var COLORS = {
    PERIKATAN: "#2AA9BF", BN: "#2AA9BF",                       // governing lineage
    GR: "#FF3B30", BA: "#FF3B30", PR: "#FF3B30", PH: "#FF3B30", // DAP/PKR-led lineage
    APU: "#34C759", GS: "#34C759", PN: "#34C759", HAK: "#34C759", // PAS-led lineage
    SF: "#AF52DE",                                             // Socialist Front
    GPS: "#5856D6",                                            // Sarawak
    GRS: "#FF9500", USA: "#FF9500",                            // Sabah
    WARISAN: "#FF3B30", UPKO: "#AF52DE", STAR: "#5856D6",      // Sabah parties
    KDM: "#64D2FF", PSB: "#8E8E93",
    ALONE: "#8E8E93", IND: "#8E8E93", BEBAS: "#8E8E93",
    __nodata: "#D8D8DE"
  };
  var LABELS = {
    PERIKATAN: "Alliance", BN: "Barisan Nasional",
    GR: "Gagasan Rakyat", BA: "Barisan Alternatif",
    PR: "Pakatan Rakyat", PH: "Pakatan Harapan",
    APU: "Angkatan Perpaduan Ummah", GS: "Gagasan Sejahtera",
    PN: "Perikatan Nasional", HAK: "HAK (PAS)",
    SF: "Socialist Front", GPS: "Gabungan Parti Sarawak",
    GRS: "Gabungan Rakyat Sabah", USA: "United Sabah Alliance",
    WARISAN: "Warisan", UPKO: "UPKO", STAR: "STAR",
    KDM: "KDM", PSB: "PSB",
    ALONE: "Unaligned / others", IND: "Independent", BEBAS: "Independent",
    __nodata: "Not mapped"
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

  function fmtNum(n) { return n == null ? "" : n.toLocaleString("en-US"); }

  function buildTable(feats) {
    var rows = feats.slice().sort(function (a, b) {
      return (a.properties.n || "").localeCompare(b.properties.n || "");
    });
    var body = rows.map(function (f) {
      var p = f.properties;
      var w = p.w || NODATA;
      var cells =
        '<td class="emap-tbl-seat">' + (p.c ? '<span class="emap-tbl-code">' + p.c + '</span> ' : "") + (p.n || "") + "</td>"
        + '<td>' + (p.cand || "—") + "</td>"
        + '<td><span class="emap-swatch" style="background:' + colorFor(w) + '"></span>' + (p.p || labelFor(w)) + "</td>"
        + '<td class="emap-tbl-num">' + (p.pct != null ? p.pct + "%" : "—") + "</td>"
        + (p.unc
            ? '<td class="emap-tbl-unc" colspan="3">Uncontested</td>'
            : '<td>' + (p.rcand || "—") + (p.rp ? " (" + p.rp + ")" : "") + "</td>"
              + '<td class="emap-tbl-num">' + (p.rpct != null ? p.rpct + "%" : "—") + "</td>"
              + '<td class="emap-tbl-num">' + (p.maj != null ? fmtNum(p.maj) : "—") + "</td>")
        + '<td class="emap-tbl-num">' + (p.tv != null ? fmtNum(p.tv) : "—") + "</td>";
      return '<tr data-color="' + colorFor(w) + '">' + cells + "</tr>";
    }).join("");
    return '<div class="emap-tblwrap"><table class="emap-tbl">'
      + "<thead><tr>"
      + "<th>Seat</th><th>Representative</th><th>Party</th><th>Vote %</th>"
      + "<th>Runner-up</th><th>Runner-up %</th><th>Majority</th><th>Total votes</th>"
      + "</tr></thead><tbody>" + body + "</tbody></table></div>";
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
        return '<path d="' + p.d + '" fill="' + colorFor(pr.w || NODATA) + '" class="emap-seat"'
          + ' data-c="' + (pr.c || "") + '"'
          + ' data-n="' + (pr.n || "").replace(/"/g, "&quot;") + '"'
          + ' data-w="' + (pr.w || NODATA) + '"'
          + ' data-p="' + (pr.p || "") + '"'
          + ' data-cand="' + (pr.cand || "").replace(/"/g, "&quot;") + '"'
          + ' data-pct="' + (pr.pct != null ? pr.pct : "") + '"'
          + ' data-s="' + (pr.s || "").replace(/"/g, "&quot;") + '"'
          + ' data-maj="' + (pr.maj != null ? pr.maj : "") + '"'
          + ' data-rcand="' + (pr.rcand || "").replace(/"/g, "&quot;") + '"'
          + ' data-rp="' + (pr.rp || "") + '"'
          + ' data-unc="' + (pr.unc ? "1" : "") + '"></path>';
      }).join("");
      return '<svg class="emap-svg" viewBox="0 0 ' + W.toFixed(0) + ' ' + H + '" '
        + 'style="flex:' + aspect.toFixed(3) + ' 1 0" preserveAspectRatio="xMidYMid meet" '
        + 'role="img" aria-label="Constituency results map">' + body + "</svg>";
    }).join("");

    // legend from the coalitions actually present, ordered by seat count
    var tally = {};
    feats.forEach(function (f) {
      var w = f.properties.w || NODATA;
      tally[w] = (tally[w] || 0) + 1;
    });
    var order = Object.keys(tally).sort(function (a, b) { return tally[b] - tally[a]; });
    var legend = order.map(function (w) {
      return '<button class="emap-key" data-key="' + w + '" type="button">'
        + '<span class="emap-swatch" style="background:' + colorFor(w) + '"></span>'
        + labelFor(w) + ' <strong>' + tally[w] + "</strong></button>";
    }).join("");

    var hasTable = feats.some(function (f) { return f.properties.cand; });
    var tableHtml = hasTable ? buildTable(feats) : "";

    el.innerHTML =
      '<div class="emap">'
      + (hasTable
          ? '<div class="emap-viewtoggle" role="tablist">'
            + '<button type="button" class="emap-viewbtn is-active" data-view="map">Map</button>'
            + '<button type="button" class="emap-viewbtn" data-view="table">Table</button>'
            + "</div>"
          : "")
      + '<div class="emap-view" data-view="map">'
      + '<div class="emap-panels">' + svgs + "</div>"
      + '<div class="emap-tip" hidden></div>'
      + '<div class="emap-legend">' + legend + "</div>"
      + "</div>"
      + (hasTable ? '<div class="emap-view" data-view="table" hidden>' + tableHtml + "</div>" : "")
      + (cfg.caption ? '<p class="emap-caption">' + cfg.caption + "</p>" : "")
      + "</div>";

    if (hasTable) {
      var views = el.querySelectorAll(".emap-view");
      el.querySelectorAll(".emap-viewbtn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          el.querySelectorAll(".emap-viewbtn").forEach(function (b) { b.classList.toggle("is-active", b === btn); });
          views.forEach(function (v) { v.hidden = v.dataset.view !== btn.dataset.view; });
        });
      });
    }

    var tip = el.querySelector(".emap-tip");
    var wrap = el.querySelector(".emap");

    function showTip(path, ev) {
      var d = path.dataset;
      var html = '<span class="emap-tip-seat">' + (d.c ? d.c + " " : "") + d.n + "</span>";
      if (d.s) html += '<span class="emap-tip-state">' + d.s + "</span>";
      html += '<span class="emap-tip-win"><span class="emap-swatch" style="background:'
        + colorFor(d.w) + '"></span>' + labelFor(d.w)
        + (d.p && d.p !== d.w && d.w !== NODATA ? " · " + d.p : "") + "</span>";
      if (d.cand) html += '<span class="emap-tip-cand">' + d.cand
        + (d.pct ? " · " + d.pct + "%" : "") + "</span>";
      if (d.unc === "1") {
        html += '<span class="emap-tip-maj">Uncontested</span>';
      } else if (d.rcand) {
        html += '<span class="emap-tip-maj">beat ' + d.rcand + (d.rp ? " (" + d.rp + ")" : "")
          + (d.maj ? " · majority " + Number(d.maj).toLocaleString("en-US") : "") + "</span>";
      }
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
    var allSeats = wrap.querySelectorAll(".emap-seat");
    el.querySelectorAll(".emap-key").forEach(function (btn) {
      function on() {
        var k = btn.dataset.key;
        allSeats.forEach(function (p) {
          p.classList.toggle("is-dim", p.dataset.w !== k);
        });
      }
      function off() {
        allSeats.forEach(function (p) { p.classList.remove("is-dim"); });
      }
      btn.addEventListener("mouseenter", on);
      btn.addEventListener("mouseleave", off);
      btn.addEventListener("focus", on);
      btn.addEventListener("blur", off);
    });
  }

  // ---- fetch cache: shared boundary layers are reused across elections ----
  var CACHE = {};
  function getJSON(url) {
    if (!CACHE[url]) {
      CACHE[url] = fetch(url).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status + " for " + url);
        return r.json();
      }).catch(function (e) { delete CACHE[url]; throw e; });
    }
    return CACHE[url];
  }

  // Layered mode: boundary layers are keyed by `k`, results are a {k: {...}} map.
  function load(cfg) {
    if (cfg.src) return getJSON(cfg.src);
    return Promise.all([
      Promise.all((cfg.layers || []).map(getJSON)),
      cfg.results ? getJSON(cfg.results) : Promise.resolve({})
    ]).then(function (both) {
      var layers = both[0], results = both[1];
      var feats = [];
      layers.forEach(function (fc) {
        fc.features.forEach(function (f) {
          var r = results[f.properties.k];
          var p = { c: "", n: f.properties.n, s: f.properties.s };
          if (r) {
            p.w = r.w; p.p = r.p; p.cand = r.cand; p.pct = r.pct;
            p.rw = r.rw; p.rp = r.rp; p.rcand = r.rcand; p.rpct = r.rpct;
            p.maj = r.maj; p.nc = r.nc; p.tv = r.tv; p.unc = r.unc;
          }
          feats.push({ type: "Feature", properties: p, geometry: f.geometry });
        });
      });
      return { type: "FeatureCollection", features: feats };
    });
  }

  function mount(el, cfg) {
    el.innerHTML = '<p class="emap-loading">Loading map…</p>';
    return load(cfg)
      .then(function (geo) { render(el, cfg, geo); })
      .catch(function (err) {
        el.innerHTML = '<p class="emap-loading">Map could not be loaded ('
          + err.message + ").</p>";
      });
  }

  function init(el) {
    var cfg;
    try { cfg = JSON.parse(el.getAttribute("data-electionmap")); }
    catch (e) { return; }
    if (!cfg || (!cfg.src && !cfg.layers)) return;
    mount(el, cfg);
  }

  // Exposed so other scripts (e.g. the history explorer) can swap the map.
  window.renderElectionMap = mount;

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-electionmap]").forEach(init);
  });

  // A hemicycle legend chip on the same page (hemicycle.js) dispatches this
  // when clicked. Rows carry the same lineage colour as the seat dots and
  // the hemicycle's own legend, so filtering by exact colour match works
  // across every page without needing to reconcile label text.
  document.addEventListener("hemicycle:filter", function (ev) {
    var color = ev.detail && ev.detail.color;
    document.querySelectorAll(".emap-tbl tbody tr[data-color]").forEach(function (tr) {
      tr.style.display = (!color || tr.getAttribute("data-color") === color) ? "" : "none";
    });
  });
})();
