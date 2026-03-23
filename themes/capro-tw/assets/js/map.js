(function () {
  var el = document.getElementById('contact-map');
  if (!el) return;

  var lat = parseFloat(el.dataset.lat);
  var lng = parseFloat(el.dataset.lng);
  var title = el.dataset.title;

  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);

  var script = document.createElement('script');
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  script.onload = function () {
    var map = L.map(el, {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    var markerIcon = L.divIcon({
      className: '',
      html: '<svg width="28" height="42" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12zm0 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" fill="#c04545"/></svg>',
      iconSize: [28, 42],
      iconAnchor: [14, 42]
    });

    L.marker([lat, lng], { icon: markerIcon, title: title }).addTo(map);
  };
  document.body.appendChild(script);
})();
