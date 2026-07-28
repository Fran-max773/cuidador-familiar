(function () {
  var STORAGE_KEY = 'mgl_cookie_consent';
  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}

  function applyConsent(granted) {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' });
    }
  }

  if (stored === 'granted') { applyConsent(true); return; }
  if (stored === 'denied') { applyConsent(false); return; }

  function showBanner() {
    var bar = document.createElement('div');
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Aviso de cookies');
    bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9999;' +
      'background:#5a8a5a;color:#ffffff;padding:16px 20px;display:flex;' +
      'flex-wrap:wrap;gap:12px;align-items:center;justify-content:center;' +
      'font-family:inherit;font-size:14px;box-shadow:0 -2px 10px rgba(0,0,0,0.15);';

    var text = document.createElement('span');
    text.style.cssText = 'flex:1 1 260px;min-width:200px;line-height:1.4;';
    text.innerHTML = 'Usamos cookies de analítica para saber qué funciona y mejorar la app. ' +
      '<a href="https://huertosurbanos.mygardenlive.com/politica-de-cookies-ue/" target="_blank" rel="noopener" style="color:#ffffff;text-decoration:underline;">Más información</a>';

    var actions = document.createElement('span');
    actions.style.cssText = 'display:flex;gap:10px;flex-shrink:0;';

    var rejectBtn = document.createElement('button');
    rejectBtn.type = 'button';
    rejectBtn.textContent = 'Rechazar';
    rejectBtn.style.cssText = 'background:transparent;color:#ffffff;border:1px solid rgba(255,255,255,0.6);' +
      'border-radius:6px;padding:8px 16px;cursor:pointer;font-size:14px;';

    var acceptBtn = document.createElement('button');
    acceptBtn.type = 'button';
    acceptBtn.textContent = 'Aceptar';
    acceptBtn.style.cssText = 'background:#ffffff;color:#5a8a5a;border:0;border-radius:6px;' +
      'padding:8px 16px;cursor:pointer;font-weight:700;font-size:14px;';

    function decide(granted) {
      try { localStorage.setItem(STORAGE_KEY, granted ? 'granted' : 'denied'); } catch (e) {}
      applyConsent(granted);
      bar.remove();
    }
    rejectBtn.addEventListener('click', function () { decide(false); });
    acceptBtn.addEventListener('click', function () { decide(true); });

    actions.appendChild(rejectBtn);
    actions.appendChild(acceptBtn);
    bar.appendChild(text);
    bar.appendChild(actions);
    document.body.appendChild(bar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showBanner);
  } else {
    showBanner();
  }
})();
