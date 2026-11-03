/* =========================================================
   auth.js — sesión compartida para todas las pantallas
   Incluir en cada página:  <script src="auth.js"></script>
   ========================================================= */
(function () {
  var KEY = 'ml_session';
  var LOGIN_PAGE = 'login.html';

  // Pantalla de inicio según el rol. Cambia aquí el destino de cada uno.
  var ROLE_HOME = {
    admin:    'menu.html',
    gerente:  'menu.html',
    mesero:   'menu.html',
    cocinero: 'cocinero.html',
    cajero:   'menu.html'
  };
  var DEFAULT_HOME = 'menu.html'; // para cualquier rol que no esté en la lista
  var DURATION_MS = 8 * 60 * 60 * 1000; // la sesión dura 8 horas

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || !s.expiresAt || Date.now() > s.expiresAt) {
        localStorage.removeItem(KEY);
        return null;
      }
      return s;
    } catch (e) { return null; }
  }

  var Auth = {
    // Guarda la sesión después de un login correcto
    save: function (data) {
      var u = Object.assign({}, data.user || {});
      delete u.contrasenna;             // nunca se guarda la contraseña
      if (u.rol && typeof u.rol === 'object') {   // { id_rol, nombre } -> texto
        u.rolId = u.rol.id_rol;
        u.rol = u.rol.nombre;
      }
      var session = {
        token: data.token || null,
        user: u,                        // { cedula, nombre, apellido, correo, rol, rolId }
        createdAt: Date.now(),
        expiresAt: Date.now() + DURATION_MS
      };
      localStorage.setItem(KEY, JSON.stringify(session));
      return session;
    },

    get: read,
    isLoggedIn: function () { return !!read(); },
    user: function () { var s = read(); return s ? s.user : null; },
    token: function () { var s = read(); return s ? s.token : null; },

    // Pantalla de inicio que le corresponde a un rol
    homeFor: function (rol) {
      return ROLE_HOME[String(rol || '').toLowerCase()] || DEFAULT_HOME;
    },

    // Úsalo arriba de cada pantalla protegida.
    // Opcional: Auth.require(['admin','gerente']) limita la pantalla a esos roles;
    // si el rol no coincide, lo manda a su pantalla de inicio.
    require: function (roles) {
      var s = read();
      if (!s) {
        window.location.replace(LOGIN_PAGE);
        return false;
      }
      if (roles && roles.length) {
        var rol = String(s.user.rol || '').toLowerCase();
        var allowed = roles.map(function (r) { return String(r).toLowerCase(); });
        if (allowed.indexOf(rol) === -1) {
          window.location.replace(Auth.homeFor(rol));
          return false;
        }
      }
      return true;
    },

    // Úsalo en login.html: si ya hay sesión, pasa directo a la app
    redirectIfLoggedIn: function () {
      var s = read();
      if (s) window.location.replace(Auth.homeFor(s.user.rol));
    },

    logout: function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      window.location.replace(LOGIN_PAGE);
    },

    // fetch que envía el token y cierra sesión si el servidor responde 401
    fetch: function (url, options) {
      options = options || {};
      options.headers = Object.assign({}, options.headers, {
        'Authorization': 'Bearer ' + (Auth.token() || '')
      });
      return fetch(url, options).then(function (res) {
        if (res.status === 401) Auth.logout();
        return res;
      });
    }
  };

  // Si se cierra sesión en otra pestaña, esta también se cierra
  window.addEventListener('storage', function (e) {
    if (e.key === KEY && !e.newValue && !/login\.html$/.test(location.pathname)) {
      window.location.replace(LOGIN_PAGE);
    }
  });

  window.Auth = Auth;
})();