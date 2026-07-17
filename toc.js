(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a[href^="#"]'));
  if (!links.length || !('IntersectionObserver' in window)) return;
  var map = new Map();
  links.forEach(function (a) {
    var section = document.getElementById(a.getAttribute('href').slice(1));
    if (section) map.set(section, a);
  });
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var link = map.get(entry.target);
      if (!link || !entry.isIntersecting) return;
      links.forEach(function (l) { l.classList.remove('active'); });
      link.classList.add('active');
    });
  }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
  map.forEach(function (_, section) { observer.observe(section); });
})();
