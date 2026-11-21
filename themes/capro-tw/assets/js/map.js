/*
 * The map sits at the very bottom of the home page, but loading it eagerly cost
 * the initial page load three third-party origins, 41 KiB of Leaflet and ~130
 * KiB of OpenStreetMap tiles. Leaflet and its stylesheet are therefore fetched
 * only once the map is close to the viewport. #contact-map has a fixed height
 * in CSS, so arriving late shifts nothing.
 */
(function () {
  var el = document.getElementById('contact-map');
  if (!el) return;

  var cfg = document.currentScript.dataset;
  var started = false;

  function draw() {
    var lat = parseFloat(el.dataset.lat);
    var lng = parseFloat(el.dataset.lng);
    var title = el.dataset.title;

    var map = L.map(el, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    var markerIcon = L.divIcon({
      className: '',
      html: '<svg width="28" height="42" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12zm0 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" fill="#c04545"/></svg>',
      iconSize: [28, 42],
      iconAnchor: [14, 42],
    });

    L.marker([lat, lng], { icon: markerIcon, title: title }).addTo(map);
  }

  function load() {
    if (started) return;
    started = true;

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cfg.leafletCss;
    if (cfg.leafletCssIntegrity) link.integrity = cfg.leafletCssIntegrity;
    document.head.appendChild(link);

    var script = document.createElement('script');
    script.src = cfg.leafletJs;
    if (cfg.leafletJsIntegrity) script.integrity = cfg.leafletJsIntegrity;
    script.onload = draw;
    document.head.appendChild(script);
  }

  if (!('IntersectionObserver' in window)) {
    load();
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          observer.disconnect();
          load();
          return;
        }
      }
    },
    { rootMargin: '300px' },
  );
  observer.observe(el);
})();
