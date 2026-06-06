/* =============================================================
   poster-fit.js — scales .poster to fit the viewport on screen.
   Print is untouched (CSS clears the transform). If the URL has
   ?embed the toolbar is hidden and the page reports its scale to
   a parent (used by the comparison gallery).
   ============================================================= */
(function () {
  function fit() {
    var poster = document.querySelector('.poster');
    if (!poster) return;
    var pad = document.body.classList.contains('embed') ? 0 : 48;
    var availW = window.innerWidth - pad;
    var availH = window.innerHeight - pad;
    // Guard against zero/negative viewport (iframe not laid out yet).
    if (availW <= 0 || availH <= 0) return;
    // offsetWidth/Height are layout px (mm@96dpi) — unaffected by transform.
    var s = Math.min(availW / poster.offsetWidth, availH / poster.offsetHeight);
    if (s <= 0) return;
    poster.style.transform = 'scale(' + s + ')';
    // Centre the scaled poster (transform-origin is top-left).
    var w = poster.offsetWidth * s, h = poster.offsetHeight * s;
    poster.style.left = Math.max(0, (window.innerWidth - w) / 2) + 'px';
    poster.style.top = Math.max(0, (window.innerHeight - h) / 2) + 'px';
  }

  if (new URLSearchParams(location.search).has('embed')) {
    document.body.classList.add('embed');
  }

  window.addEventListener('resize', fit);
  window.addEventListener('load', fit);
  if (document.readyState !== 'loading') fit();
  else document.addEventListener('DOMContentLoaded', fit);
  // refit once webfonts settle (title metrics shift slightly)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  // Catch the case where the iframe gets its real size after load (preview panes).
  if (window.ResizeObserver) {
    new ResizeObserver(fit).observe(document.documentElement);
  } else {
    var n = 0, iv = setInterval(function () { fit(); if (++n > 20) clearInterval(iv); }, 150);
  }
})();
