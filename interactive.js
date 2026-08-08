/*
  Shared interaction layer, applied site-wide via one script tag per page.
  Everything here is progressive enhancement: classes are added at runtime,
  so a page with JS disabled renders exactly as before (nothing is hidden by
  default in CSS). Three independent pieces:

    1. Scroll-reveal — cards/entries fade and lift in as they cross the
       viewport, once, so a long page reads as a sequence of things worth
       looking at rather than a wall of text to scroll past.
    2. Count-up numbers — stat tiles and topline seat counts animate from 0
       to their value the first time they're seen, instead of appearing as
       static text.
    3. Signal-log filter — a tag filter bar injected above any `.log`
       container, letting a reader narrow a long log to one category.

  Respects prefers-reduced-motion: reveal and count-up both short-circuit to
  their end state immediately for users who've asked for reduced motion.
*/
(function () {
  var REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------------
  // 1. Scroll-reveal
  // ---------------------------------------------------------------------
  var REVEAL_SELECTOR = [
    '.about-card', '.log-entry', '.state-card', '.stat-tile', '.topline-cell',
    '.glossary-term', '.pm-card', '.party-card', '.emap-tblwrap', '.src-legend'
  ].join(',');

  function initReveal() {
    var els = document.querySelectorAll(REVEAL_SELECTOR);
    if (!els.length) return;

    if (REDUCED_MOTION || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('reveal', 'is-visible'); });
      return;
    }

    els.forEach(function (el) { el.classList.add('reveal'); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 8, 7) * 45) + 'ms';
      io.observe(el);
    });
  }

  // ---------------------------------------------------------------------
  // 2. Count-up numbers
  // ---------------------------------------------------------------------
  var COUNTER_SELECTOR = '.stat-tile-value, .topline-seats';

  function animateCounter(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';

    var target = el.firstChild;
    if (!target || target.nodeType !== 3) return;
    var text = target.textContent;
    var m = text.match(/^(~?)([\d,]+)(.*)$/);
    if (!m) return;

    var prefix = m[1], rawNum = m[2], suffix = m[3];
    var value = parseInt(rawNum.replace(/,/g, ''), 10);
    if (isNaN(value) || value > 100000) return;
    var useComma = rawNum.indexOf(',') !== -1;

    if (REDUCED_MOTION) return; // leave the static value as-is

    var duration = 700, start = null;
    function fmt(n) { return useComma ? n.toLocaleString('en-US') : String(n); }
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      target.textContent = prefix + fmt(Math.round(value * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else target.textContent = prefix + fmt(value) + suffix;
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    var els = document.querySelectorAll(COUNTER_SELECTOR);
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    els.forEach(function (el) { io.observe(el); });
  }

  // ---------------------------------------------------------------------
  // 3. Signal-log filter
  // ---------------------------------------------------------------------
  // Entries carry a specific per-story label ("Coalition friction", "Ground
  // conditions", ...) but only ever one of these five underlying category
  // classes. Filtering by category keeps the chip bar to a handful of
  // meaningful buckets instead of one chip per distinct headline topic.
  var CATEGORY_NAMES = {
    'tag-result': 'Results',
    'tag-reax': 'Reaction & analysis',
    'tag-market': 'Markets',
    'tag-social': 'Polling & social',
    'tag-campaign': 'Campaign'
  };

  function categoryOf(tagEl) {
    if (!tagEl) return null;
    for (var i = 0; i < tagEl.classList.length; i++) {
      if (CATEGORY_NAMES[tagEl.classList[i]]) return tagEl.classList[i];
    }
    return null;
  }

  function initLogFilters(root) {
    (root || document).querySelectorAll('.log').forEach(function (log) {
      if (log.dataset.filterInit) return;
      log.dataset.filterInit = '1';

      var entries = Array.prototype.slice.call(log.querySelectorAll('.log-entry'));
      if (entries.length < 4) return; // not worth a filter bar for a short log

      var counts = {};
      entries.forEach(function (entry) {
        var cat = categoryOf(entry.querySelector('.log-tag'));
        if (!cat) return;
        counts[cat] = (counts[cat] || 0) + 1;
      });
      var cats = Object.keys(counts);
      if (cats.length < 2) return;

      var bar = document.createElement('div');
      bar.className = 'log-filterbar';
      bar.setAttribute('role', 'group');
      bar.setAttribute('aria-label', 'Filter signal log by category');

      var allBtn = document.createElement('button');
      allBtn.type = 'button';
      allBtn.className = 'log-filter-chip is-active';
      allBtn.textContent = 'All (' + entries.length + ')';
      allBtn.dataset.filter = '';
      bar.appendChild(allBtn);

      cats.forEach(function (cat) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'log-filter-chip';
        btn.textContent = CATEGORY_NAMES[cat] + ' (' + counts[cat] + ')';
        btn.dataset.filter = cat;
        bar.appendChild(btn);
      });

      log.parentNode.insertBefore(bar, log);

      bar.addEventListener('click', function (ev) {
        var btn = ev.target.closest('.log-filter-chip');
        if (!btn) return;
        bar.querySelectorAll('.log-filter-chip').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var filter = btn.dataset.filter;
        entries.forEach(function (entry) {
          var cat = categoryOf(entry.querySelector('.log-tag'));
          entry.style.display = (!filter || cat === filter) ? '' : 'none';
        });
      });
    });
  }

  function init(root) {
    initReveal();
    initCounters();
    initLogFilters(root);
  }

  window.renderInteractive = init;
  document.addEventListener('DOMContentLoaded', function () { init(document); });
})();
