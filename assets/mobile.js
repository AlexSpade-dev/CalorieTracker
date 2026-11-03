/* CalorieTracker+ shared mobile interactivity */
(function () {
  var d = document;
  var css = d.createElement('style');
  css.textContent =
    'html{-webkit-text-size-adjust:100%}' +
    'a,button,[onclick],[role=button],input,select,textarea,label{touch-action:manipulation;-webkit-tap-highlight-color:transparent}' +
    'body{overscroll-behavior-y:none;min-height:100dvh}' +
    '.ct-pressed{transform:scale(.96)!important;opacity:.85}' +
    '#ct-toast{position:fixed;left:50%;bottom:96px;transform:translate(-50%,20px);background:#242749;color:#e0e0ff;border:1px solid rgba(121,209,255,.4);padding:10px 18px;border-radius:9999px;font:600 13px "Plus Jakarta Sans",sans-serif;opacity:0;pointer-events:none;transition:all .25s;z-index:9999;max-width:90vw;text-align:center}' +
    '#ct-toast.show{opacity:1;transform:translate(-50%,0)}' +
    'body.ct-leave{opacity:0;transition:opacity .2s}' +
    'body{animation:ctIn .25s ease-out}@keyframes ctIn{from{opacity:0}to{opacity:1}}';
  d.head.appendChild(css);

  function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms || 8); } catch (e) {} }

  var toastEl;
  window.ctToast = function (msg) {
    if (!toastEl) { toastEl = d.createElement('div'); toastEl.id = 'ct-toast'; d.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove('show'); }, 1800);
  };

  // Press feedback + haptics on touch
  var sel = 'button,a,[role=button],[onclick]';
  d.addEventListener('touchstart', function (e) {
    var el = e.target.closest && e.target.closest(sel);
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    el.classList.add('ct-pressed'); buzz(8);
  }, { passive: true });
  ['touchend', 'touchcancel'].forEach(function (ev) {
    d.addEventListener(ev, function () {
      d.querySelectorAll('.ct-pressed').forEach(function (n) { n.classList.remove('ct-pressed'); });
    }, { passive: true });
  });

  // Dashboard bottom nav + swipe between tabs
  var PAGES = { log: 'Dashboard - Logs.html', recipes: 'Dashboard - Recipes.html', analytics: 'Dashboard - Analytics.html' };
  var ORDER = ['log', 'recipes', 'analytics'];
  function go(url) {
    d.body.classList.add('ct-leave');
    setTimeout(function () { location.href = encodeURI(url); }, 180);
  }
  d.addEventListener('DOMContentLoaded', function () {
    var nav = d.querySelector('nav.fixed');
    if (!nav || !/DASHBOARD/i.test(location.pathname.replace(/%20/g, ' ')) ) return;
    var current = 'log';
    Array.prototype.forEach.call(nav.children, function (item) {
      if (item.nodeType !== 1) return;
      var label = (item.textContent || '').trim().toLowerCase();
      if (item.className.indexOf('text-primary') > -1 && PAGES[label]) current = label;
      item.addEventListener('click', function (e) {
        e.preventDefault(); buzz(10);
        if (label === 'profile') return ctToast('Profile page coming soon');
        if (PAGES[label] && label !== current) go(PAGES[label]);
      });
    });
    // swipe left/right to change tab
    var x0 = null, y0 = null;
    d.addEventListener('touchstart', function (e) {
      if (e.target.closest('input,textarea,select,[class*=overflow-x]')) { x0 = null; return; }
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    d.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) < 80 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      var i = ORDER.indexOf(current) + (dx < 0 ? 1 : -1);
      if (i >= 0 && i < ORDER.length) { buzz(12); go(PAGES[ORDER[i]]); }
    }, { passive: true });
  });
})();
