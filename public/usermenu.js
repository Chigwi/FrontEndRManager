/* usermenu.js — menú de usuario y cierre de sesión para las páginas de administración.
   Requiere auth.js (Auth.user, Auth.logout) y un contenedor .navbar__actions en el navbar.
   Uso: <script src="usermenu.js"></script> al final del <body>. */
(function () {
  const CSS = `
.user-btn { display:flex; align-items:center; gap:.65rem; padding:.25rem .6rem .25rem .25rem; font:inherit; color:var(--white);
  background:transparent; border:1px solid rgba(255,255,255,.14); border-radius:999px; cursor:pointer; transition:background .15s, border-color .15s; }
.user-btn:hover, .dropdown.is-open .user-btn { background:rgba(255,255,255,.08); border-color:var(--gold); }
.user-btn__text { display:flex; flex-direction:column; align-items:flex-start; line-height:1.15; text-align:left; }
.user-btn__name { font-weight:600; font-size:.9rem; }
.user-btn__rol { font-size:.75rem; color:var(--gold-light); text-transform:capitalize; }
.user-btn__chev { width:8px; height:8px; border-right:2px solid var(--gray-300); border-bottom:2px solid var(--gray-300); transform:rotate(45deg) translateY(-2px); transition:transform .15s; }
.dropdown.is-open .user-btn__chev { transform:rotate(-135deg) translateY(-2px); }
.user-menu { min-width:270px; padding:0; overflow:hidden; }
.user-card { display:flex; align-items:center; gap:.8rem; padding:1rem; background:var(--gray-50); border-bottom:1px solid var(--gray-200); }
.user-card .avatar { width:44px; height:44px; font-size:1rem; flex:none; }
.user-card__name { font-weight:600; color:var(--black); line-height:1.2; }
.user-card__mail { font-size:.82rem; color:var(--gray-500); overflow-wrap:anywhere; }
.user-card .badge { margin-top:.35rem; text-transform:capitalize; }
.user-menu__list { padding:.35rem; }
.dropdown__item--icon { display:flex; align-items:center; gap:.65rem; font-weight:500; }
.dropdown__item--danger:hover { background:var(--danger-bg); }
.dropdown__item svg { width:18px; height:18px; flex:none; }
.modal__icon { width:48px; height:48px; margin-bottom:1rem; display:flex; align-items:center; justify-content:center; border-radius:50%; background:var(--danger-bg); color:var(--danger); }
.modal__icon svg { width:24px; height:24px; }
@media (max-width:700px) { .user-btn__text { display:none; } .user-btn { padding-right:.5rem; } }`;

  const ICONO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>';

  const MENU = `
<div class="dropdown" id="um-dropdown">
  <button class="user-btn" id="um-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Menú de usuario">
    <span class="avatar" id="um-avatar">?</span>
    <span class="user-btn__text"><span class="user-btn__name" id="um-nombre">Usuario</span><span class="user-btn__rol" id="um-rol"></span></span>
    <span class="user-btn__chev" aria-hidden="true"></span>
  </button>
  <div class="dropdown__menu user-menu" role="menu">
    <div class="user-card">
      <span class="avatar" id="um-avatar2">?</span>
      <div>
        <div class="user-card__name" id="um-nombre2">Usuario</div>
        <div class="user-card__mail" id="um-correo"></div>
        <span class="badge badge--dark" id="um-rol2"></span>
      </div>
    </div>
    <div class="user-menu__list">
      <button class="dropdown__item dropdown__item--icon dropdown__item--danger" id="um-salir" type="button" role="menuitem">${ICONO} Cerrar sesión</button>
    </div>
  </div>
</div>`;

  const MODAL = `
<div class="modal-backdrop" id="um-modal">
  <div class="modal modal--sm" role="dialog" aria-modal="true" aria-labelledby="um-titulo">
    <div class="modal__body">
      <div class="modal__icon">${ICONO}</div>
      <h2 class="modal__title" id="um-titulo">¿Cerrar sesión?</h2>
      <p class="text-muted" style="margin:.5rem 0 0">Tendrás que ingresar de nuevo con tu cédula y contraseña.</p>
    </div>
    <div class="modal__footer">
      <button class="btn btn--outline" id="um-cancelar" type="button">Seguir aquí</button>
      <button class="btn btn--danger" id="um-confirmar" type="button">Cerrar sesión</button>
    </div>
  </div>
</div>`;

  const $ = id => document.getElementById(id);
  const contenedor = document.querySelector('.navbar__actions');
  if (!contenedor) return;

  const estilo = document.createElement('style');
  estilo.textContent = CSS;
  document.head.appendChild(estilo);
  contenedor.innerHTML = MENU;
  document.body.insertAdjacentHTML('beforeend', MODAL);

  // Datos del usuario
  const u = (typeof Auth !== 'undefined' && Auth.user && Auth.user()) || {};
  const nombre = [u.nombre, u.apellido].filter(Boolean).join(' ') || 'Usuario';
  const iniciales = (((u.nombre || '')[0] || '') + ((u.apellido || '')[0] || '')).toUpperCase() || '?';
  const rol = u.rol || '';
  $('um-avatar').textContent = $('um-avatar2').textContent = iniciales;
  $('um-nombre').textContent = $('um-nombre2').textContent = nombre;
  $('um-rol').textContent = $('um-rol2').textContent = rol;
  $('um-rol2').hidden = !rol;
  $('um-correo').textContent = u.correo || '';

  // Menú desplegable
  function menu(abrir) {
    const d = $('um-dropdown');
    const abierto = abrir === undefined ? !d.classList.contains('is-open') : abrir;
    d.classList.toggle('is-open', abierto);
    $('um-btn').setAttribute('aria-expanded', abierto);
  }
  $('um-btn').addEventListener('click', e => { e.stopPropagation(); menu(); });
  document.addEventListener('click', e => { if (!$('um-dropdown').contains(e.target)) menu(false); });

  // Confirmación de cierre de sesión
  function pedirSalir() { menu(false); $('um-modal').classList.add('is-open'); $('um-cancelar').focus(); }
  function cancelar() { $('um-modal').classList.remove('is-open'); $('um-btn').focus(); }
  $('um-salir').addEventListener('click', pedirSalir);
  $('um-cancelar').addEventListener('click', cancelar);
  $('um-modal').addEventListener('click', e => { if (e.target === $('um-modal')) cancelar(); });
  $('um-confirmar').addEventListener('click', () => Auth.logout());
  document.addEventListener('keydown', e => { if (e.key === 'Escape') menu(false); });
})();
