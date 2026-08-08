/*
  Interactive uniform-swing calculator for any element carrying
  data-swing='{"src":"data/tables/swing_<state>.json"}'.

  Model: the classic "uniform swing" used by psephologists (the UK/Australia
  swingometer) — every seat's winner loses N points to that seat's own
  runner-up and the runner-up gains N points, so a seat flips once its
  original margin (winner% - runner-up%) is smaller than 2N. This is a
  simplification: it assumes the same swing applies everywhere in the state,
  ignores three-plus-corner fights beyond the top two, and says nothing
  about turnout change. It's a what-if tool, not a forecast.

  Data: data/tables/swing_<state>.json, generated from the same enriched
  dun_<state>.geojson results used by the state assembly maps.
*/
(function () {
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

  function computeResult(seats, swing) {
    var tally = {}; // label -> {n, color}
    var flips = [];
    seats.forEach(function (s) {
      var margin = s.pct - s.rpct;
      var newMargin = margin - 2 * swing;
      var flipped = newMargin < 0;
      var winnerLabel = flipped ? s.rwLabel : s.wLabel;
      var winnerColor = flipped ? s.rwColor : s.wColor;
      if (!tally[winnerLabel]) tally[winnerLabel] = { n: 0, color: winnerColor };
      tally[winnerLabel].n++;
      if (flipped) {
        flips.push({
          seat: s.seat, from: s.wLabel, fromColor: s.wColor, to: s.rwLabel, toColor: s.rwColor,
          margin: margin, newMargin: newMargin
        });
      }
    });
    return { tally: tally, flips: flips };
  }

  function render(el, cfg) {
    fetch(cfg.src).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (data) {
      var seats = data.seats;
      var stateLabel = data.state.charAt(0).toUpperCase() + data.state.slice(1).replace(/-/g, " ");

      el.innerHTML =
        '<div class="swing-controls">'
        + '<label class="swing-label" for="swing-range-' + data.state + '">Uniform swing toward each seat’s runner-up</label>'
        + '<div class="swing-range-row">'
        + '<span class="swing-range-end">‒20</span>'
        + '<input type="range" min="-20" max="20" step="0.5" value="0" id="swing-range-' + data.state + '" class="swing-range">'
        + '<span class="swing-range-end">+20</span>'
        + "</div>"
        + '<div class="swing-value" id="swing-value-' + data.state + '">No swing (last result)</div>'
        + "</div>"
        + '<div class="swing-tally" id="swing-tally-' + data.state + '"></div>'
        + '<div class="swing-flips" id="swing-flips-' + data.state + '"></div>';

      var range = el.querySelector(".swing-range");
      var valueEl = el.querySelector(".swing-value");
      var tallyEl = el.querySelector(".swing-tally");
      var flipsEl = el.querySelector(".swing-flips");

      function paint(swing) {
        var result = computeResult(seats, swing);
        valueEl.textContent = swing === 0
          ? "No swing (last result)"
          : (swing > 0 ? "+" : "") + swing.toFixed(1) + " points toward each seat's runner-up";

        var order = Object.keys(result.tally).sort(function (a, b) { return result.tally[b].n - result.tally[a].n; });
        tallyEl.innerHTML = order.map(function (label) {
          var v = result.tally[label];
          var pct = (v.n / seats.length * 100).toFixed(1);
          return '<div class="swing-tally-row">'
            + '<span class="swing-tally-label">' + esc(label) + "</span>"
            + '<span class="dv-bar-track"><span class="dv-bar-fill" style="width:' + pct + '%;background:' + v.color + '"></span></span>'
            + '<span class="swing-tally-n">' + v.n + "</span></div>";
        }).join("");

        if (!result.flips.length) {
          flipsEl.innerHTML = swing === 0 ? "" : '<p class="dv-muted">No seats flip at this swing.</p>';
        } else {
          flipsEl.innerHTML = '<p class="dv-muted" style="margin:10px 0 6px;">' + result.flips.length + " seat" + (result.flips.length === 1 ? "" : "s") + " would flip:</p>"
            + '<div class="emap-tblwrap"><table class="emap-tbl"><thead><tr><th>Seat</th><th>From</th><th>To</th><th>Original margin</th></tr></thead><tbody>'
            + result.flips.sort(function (a, b) { return Math.abs(a.margin) - Math.abs(b.margin); }).map(function (f) {
              return "<tr><td class=\"emap-tbl-seat\">" + esc(f.seat) + "</td>"
                + '<td><span class="emap-swatch" style="background:' + f.fromColor + '"></span>' + esc(f.from) + "</td>"
                + '<td><span class="emap-swatch" style="background:' + f.toColor + '"></span>' + esc(f.to) + "</td>"
                + '<td class="emap-tbl-num">' + f.margin.toFixed(1) + " pts</td></tr>";
            }).join("") + "</tbody></table></div>";
        }
      }

      range.addEventListener("input", function () { paint(parseFloat(range.value)); });
      paint(0);

      el.insertAdjacentHTML("beforeend",
        '<p class="emap-caption">Uniform-swing model: assumes the same swing applies in every seat and only ever moves votes between each seat’s original top two finishers. A real election never swings perfectly evenly — treat this as a what-if tool for ' + esc(stateLabel) + ', not a forecast. Based on the ' + esc(stateLabel) + " state election result already shown above. Source: ElectionData.MY candidate-level ballots (CC0).</p>");
    }).catch(function (e) {
      el.innerHTML = '<p class="emap-loading">Could not load (' + e.message + ")</p>";
    });
  }

  function init(root) {
    (root || document).querySelectorAll("[data-swing]").forEach(function (el) {
      try { render(el, JSON.parse(el.getAttribute("data-swing"))); } catch (e) {}
    });
  }

  window.renderSwing = init;
  document.addEventListener("DOMContentLoaded", function () { init(document); });
})();
