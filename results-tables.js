/*
  Renders data-driven result tables from the ElectionData.MY-derived datasets
  in data/tables/ (CC0). Four table types, selected by which data attribute
  an element carries:

    data-partytable='{"election":"GE-15"}'
      Full party-by-party breakdown for one election — every party that
      contested, not lumped into "Others". Reads data/tables/party_breakdown_all_ge.json.

    data-statetable='{"election":"GE-15"}'
      Coalition votes/seats broken out by state for GE14 or GE15.
      Reads data/tables/by_state_ge14_ge15.json.

    data-mptable="retiring"
      GE14 MPs who did not contest GE15 (matched by candidate name across
      elections), with confirmed reasons where independently verified.
      Reads data/tables/ge14_not_recontesting.json.

    data-changedtable='{"pair":"ge14_ge15"}'
      Seats where the winning coalition's lineage genuinely changed (BN<->
      opposition<->PAS-led bloc), excluding pure coalition rebrands (e.g.
      Pakatan Rakyat becoming Pakatan Harapan is not counted as a flip).
      Reads data/tables/changed_<pair>.json.
*/
(function () {
  var CACHE = {};
  function getJSON(url) {
    if (!CACHE[url]) {
      CACHE[url] = fetch(url).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      }).catch(function (e) { delete CACHE[url]; throw e; });
    }
    return CACHE[url];
  }

  var COAL_LABEL = {
    PH: "Pakatan Harapan", PN: "Perikatan Nasional", BN: "Barisan Nasional",
    GPS: "Gabungan Parti Sarawak", GRS: "Gabungan Rakyat Sabah", GS: "Gagasan Sejahtera",
    PR: "Pakatan Rakyat", BA: "Barisan Alternatif", PERIKATAN: "Alliance",
    ALONE: "Unaligned / independent", USA: "United Sabah Alliance", GTA: "Gerakan Tanah Air"
  };
  function coalLabel(c) { return COAL_LABEL[c] || c || "—"; }
  function fmt(n) { return n == null ? "—" : Number(n).toLocaleString("en-US"); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

  function renderPartyTable(el, cfg) {
    getJSON("data/tables/party_breakdown_all_ge.json").then(function (all) {
      var d = all[cfg.election];
      if (!d) { el.innerHTML = '<p class="emap-loading">No data for ' + esc(cfg.election) + "</p>"; return; }
      var rows = d.parties.map(function (p) {
        return "<tr><td>" + esc(p.party) + "</td><td>" + esc(coalLabel(p.coalition)) + "</td>"
          + '<td class="emap-tbl-num">' + fmt(p.votes) + "</td>"
          + '<td class="emap-tbl-num">' + p.pct.toFixed(2) + "%</td>"
          + '<td class="emap-tbl-num">' + p.seats + "</td></tr>";
      }).join("");
      el.innerHTML = '<div class="emap-tblwrap"><table class="emap-tbl">'
        + "<thead><tr><th>Party</th><th>Coalition</th><th>Votes</th><th>%</th><th>Seats</th></tr></thead>"
        + "<tbody>" + rows
        + '<tr class="rt-total"><td colspan="2">Total</td><td class="emap-tbl-num">' + fmt(d.total_votes) + "</td>"
        + '<td class="emap-tbl-num">100.00%</td><td class="emap-tbl-num">' + d.total_seats + "</td></tr>"
        + "</tbody></table></div>"
        + '<p class="emap-caption">Every party that fielded a candidate in ' + esc(cfg.election)
        + ", by votes won — not lumped into an \"Others\" category. Source: ElectionData.MY candidate-level ballots (CC0).</p>";
    }).catch(function (e) { el.innerHTML = '<p class="emap-loading">Could not load (' + e.message + ")</p>"; });
  }

  function renderStateTable(el, cfg) {
    getJSON("data/tables/by_state_ge14_ge15.json").then(function (all) {
      var d = all[cfg.election];
      if (!d) { el.innerHTML = '<p class="emap-loading">No data for ' + esc(cfg.election) + "</p>"; return; }
      var coals = {};
      Object.keys(d).forEach(function (st) { Object.keys(d[st]).forEach(function (c) { coals[c] = true; }); });
      var coalList = Object.keys(coals).sort(function (a, b) {
        var ta = 0, tb = 0;
        Object.keys(d).forEach(function (st) { ta += (d[st][a] || {}).seats || 0; tb += (d[st][b] || {}).seats || 0; });
        return tb - ta;
      });
      var head = "<th>State</th>" + coalList.map(function (c) { return "<th>" + esc(coalLabel(c)) + "</th>"; }).join("");
      var states = Object.keys(d).sort();
      var rows = states.map(function (st) {
        var cells = coalList.map(function (c) {
          var v = d[st][c];
          return "<td>" + (v ? v.seats + ' <span class="rt-muted">(' + fmt(v.votes) + ")</span>" : "—") + "</td>";
        }).join("");
        return "<tr><td class=\"emap-tbl-seat\">" + esc(st) + "</td>" + cells + "</tr>";
      }).join("");
      el.innerHTML = '<div class="emap-tblwrap"><table class="emap-tbl rt-statetable">'
        + "<thead><tr>" + head + "</tr></thead><tbody>" + rows + "</tbody></table></div>"
        + '<p class="emap-caption">Seats won per coalition by state in ' + esc(cfg.election)
        + " (votes cast for that coalition's candidates in parentheses). Source: ElectionData.MY (CC0).</p>";
    }).catch(function (e) { el.innerHTML = '<p class="emap-loading">Could not load (' + e.message + ")</p>"; });
  }

  function renderMpTable(el) {
    getJSON("data/tables/ge14_not_recontesting.json").then(function (list) {
      var rows = list.map(function (x) {
        var reasonCell = x.reason_confirmed
          ? '<span class="rt-reason-ok">' + esc(x.reason) + "</span>"
          : '<span class="rt-reason-unconfirmed">' + esc(x.reason) + "</span>";
        return "<tr><td>" + esc(x.name) + "</td><td>" + esc(x.seat) + "</td>"
          + "<td>" + esc(x.party) + "</td><td>" + esc(x.first_elected) + "</td>"
          + "<td>" + reasonCell + "</td></tr>";
      }).join("");
      el.innerHTML = '<div class="emap-tblwrap"><table class="emap-tbl">'
        + "<thead><tr><th>MP</th><th>Seat</th><th>Party</th><th>First elected</th><th>Reason</th></tr></thead>"
        + "<tbody>" + rows + "</tbody></table></div>"
        + '<p class="emap-caption">' + list.length + " of the 222 MPs elected at GE14 (2018) did not contest GE15 (2022),"
        + " identified by matching candidate names across elections. Reasons marked in grey are not independently"
        + " confirmed for this page — a name's absence from the GE15 candidate list doesn't by itself establish why."
        + " Source: ElectionData.MY candidate-level ballots (CC0), cross-referenced against public reporting"
        + " where a reason is shown in green.</p>";
    }).catch(function (e) { el.innerHTML = '<p class="emap-loading">Could not load (' + e.message + ")</p>"; });
  }

  function renderChangedTable(el, cfg) {
    getJSON("data/tables/changed_" + cfg.pair + ".json").then(function (list) {
      var rows = list.map(function (x) {
        return "<tr><td>" + esc(x.seat) + "</td><td>" + esc(x.state) + "</td>"
          + "<td>" + esc(coalLabel(x.prev_coalition)) + " (" + esc(x.prev_party) + ")</td>"
          + "<td>" + esc(coalLabel(x.cur_coalition)) + " (" + esc(x.cur_party) + ")</td>"
          + "<td>" + esc(x.cur_name) + "</td></tr>";
      }).join("");
      var labels = { ge13_ge14: ["GE13 (2013)", "GE14 (2018)"], ge14_ge15: ["GE14 (2018)", "GE15 (2022)"] };
      var lab = labels[cfg.pair] || ["Previous", "Current"];
      el.innerHTML = '<div class="emap-tblwrap"><table class="emap-tbl">'
        + "<thead><tr><th>Seat</th><th>State</th><th>" + lab[0] + "</th><th>" + lab[1] + "</th><th>New MP</th></tr></thead>"
        + "<tbody>" + rows + "</tbody></table></div>"
        + '<p class="emap-caption">' + list.length + " seats where the winning bloc genuinely changed between "
        + lab[0] + " and " + lab[1] + " — grouped by lineage, so a coalition rebranding"
        + " (e.g. Pakatan Rakyat becoming Pakatan Harapan) is not counted as a flip, only a real swing between rival"
        + " blocs. Source: ElectionData.MY (CC0).</p>";
    }).catch(function (e) { el.innerHTML = '<p class="emap-loading">Could not load (' + e.message + ")</p>"; });
  }

  function init(root) {
    (root || document).querySelectorAll("[data-partytable]").forEach(function (el) {
      try { renderPartyTable(el, JSON.parse(el.getAttribute("data-partytable"))); } catch (e) {}
    });
    (root || document).querySelectorAll("[data-statetable]").forEach(function (el) {
      try { renderStateTable(el, JSON.parse(el.getAttribute("data-statetable"))); } catch (e) {}
    });
    (root || document).querySelectorAll("[data-mptable]").forEach(function (el) { renderMpTable(el); });
    (root || document).querySelectorAll("[data-changedtable]").forEach(function (el) {
      try { renderChangedTable(el, JSON.parse(el.getAttribute("data-changedtable"))); } catch (e) {}
    });
  }

  window.renderResultTables = init;
  document.addEventListener("DOMContentLoaded", function () { init(document); });
})();
