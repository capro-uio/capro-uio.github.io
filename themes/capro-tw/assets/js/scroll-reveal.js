(function () {
  var root = document.documentElement;
  try {
    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    root.classList.add('js');

    var arm = function () {
      try {
        document.querySelectorAll('.reveal').forEach(function (el) {
          observer.observe(el);
        });
      } catch (e) {
        root.classList.remove('js');
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', arm);
    } else {
      arm();
    }
  } catch (e) {
    root.classList.remove('js');
  }
})();
