// FidelizaSucre - auth.js

var tipoActual = 'cliente';

// Detectar tipo desde sessionStorage o URL
(function() {
  var params = new URLSearchParams(window.location.search);
  var tipo = params.get('tipo') || sessionStorage.getItem('tipoRegistro');
  if (tipo === 'negocio') {
    var tabNegocio = document.getElementById('tabNegocio');
    if (tabNegocio) {
      cambiarTipo('negocio', tabNegocio);
    }
  }
})();

// Cambiar entre tipo cliente y negocio
function cambiarTipo(tipo, boton) {
  tipoActual = tipo;

  // Actualizar tabs
  document.querySelectorAll('.tipo-tab').forEach(function(tab) {
    tab.classList.remove('active');
  });
  boton.classList.add('active');

  // Mostrar/ocultar campos
  var camposCliente = document.getElementById('campos-cliente');
  var camposNegocio = document.getElementById('campos-negocio');

  if (camposCliente) {
    camposCliente.style.display = tipo === 'cliente' ? 'block' : 'none';
  }
  if (camposNegocio) {
    camposNegocio.style.display = tipo === 'negocio' ? 'block' : 'none';
  }
}

// Mostrar/ocultar contrasena
function togglePassword(inputId, boton) {
  var input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    boton.textContent = 'ocultar';
  } else {
    input.type = 'password';
    boton.textContent = 'ver';
  }
}

// Validar fuerza de contrasena
var passwordInput = document.getElementById('password');
if (passwordInput) {
  passwordInput.addEventListener('input', function() {
    var valor = this.value;
    var fortaleza = 0;
    var indicador = document.getElementById('passwordStrength');
    if (!indicador) return;

    if (valor.length >= 8) fortaleza++;
    if (/[A-Z]/.test(valor)) fortaleza++;
    if (/[0-9]/.test(valor)) fortaleza++;
    if (/[^A-Za-z0-9]/.test(valor)) fortaleza++;

    var color = '#EF4444';
    var width = '25%';
    if (fortaleza >= 2) { color = '#F59E0B'; width = '50%'; }
    if (fortaleza >= 3) { color = '#10B981'; width = '75%'; }
    if (fortaleza === 4) { color = '#059669'; width = '100%'; }

    indicador.style.setProperty('--strength-width', valor.length > 0 ? width : '0%');
    indicador.style.setProperty('--strength-color', color);
  });
}

// Mostrar mensaje de error o exito
function mostrarMensaje(tipo, texto) {
  var errorEl = document.getElementById('mensajeError');
  var exitoEl = document.getElementById('mensajeExito');

  if (errorEl) errorEl.style.display = 'none';
  if (exitoEl) exitoEl.style.display = 'none';

  if (tipo === 'error' && errorEl) {
    errorEl.textContent = texto;
    errorEl.style.display = 'block';
  } else if (tipo === 'exito' && exitoEl) {
    exitoEl.textContent = texto;
    exitoEl.style.display = 'block';
  }
}

// Funcion de registro
async function registrarse() {
  var btn = document.getElementById('btnRegistro');
  var email = document.getElementById('email').value.trim();
  var password = document.getElementById('password').value;
  var aceptaTerminos = document.getElementById('aceptaTerminos');

  if (!email || !password) {
    mostrarMensaje('error', 'Por favor llena todos los campos obligatorios.');
    return;
  }

  if (password.length < 8) {
    mostrarMensaje('error', 'La contrasena debe tener al menos 8 caracteres.');
    return;
  }

  if (aceptaTerminos && !aceptaTerminos.checked) {
    mostrarMensaje('error', 'Debes aceptar los terminos de uso.');
    return;
  }

  var datos = { email: email, password: password };
  var endpoint = '';

  if (tipoActual === 'cliente') {
    var nombre = document.getElementById('nombre').value.trim();
    var apellido = document.getElementById('apellido').value.trim();
    var telefono = document.getElementById('telefono').value.trim();

    if (!nombre || !apellido) {
      mostrarMensaje('error', 'Nombre y apellido son obligatorios.');
      return;
    }

    datos.nombre = nombre;
    datos.apellido = apellido;
    datos.telefono = telefono;
    endpoint = '/api/auth/registro-cliente';
  } else {
    var nombreNegocio = document.getElementById('nombre_negocio').value.trim();
    var tipoNegocio = document.getElementById('tipo_negocio').value;
    var telefonoNeg = document.getElementById('telefono_neg').value.trim();
    var direccion = document.getElementById('direccion').value.trim();

    if (!nombreNegocio) {
      mostrarMensaje('error', 'El nombre del negocio es obligatorio.');
      return;
    }

    datos.nombre_negocio = nombreNegocio;
    datos.tipo_negocio = tipoNegocio;
    datos.telefono = telefonoNeg;
    datos.direccion = direccion;
    endpoint = '/api/auth/registro-negocio';
  }

  btn.disabled = true;
  btn.textContent = 'Creando cuenta...';

  try {
    var respuesta = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    var resultado = await respuesta.json();

    if (resultado.success) {
      localStorage.setItem('token', resultado.token);
      localStorage.setItem('usuario', JSON.stringify(resultado.usuario));
      localStorage.setItem('tipo', resultado.tipo || tipoActual);
      mostrarMensaje('exito', 'Cuenta creada. Redirigiendo...');

      setTimeout(function() {
        if (tipoActual === 'negocio') {
          window.location.href = '/panel-negocio.html';
        } else {
          window.location.href = '/panel-cliente.html';
        }
      }, 1200);
    } else {
      mostrarMensaje('error', resultado.message || 'Error al crear la cuenta.');
    }
  } catch (error) {
    mostrarMensaje('error', 'Error de conexion. Verifica tu internet e intenta de nuevo.');
    console.error('Error de registro:', error);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Crear cuenta gratis';
  }
}

// Funcion de login
async function iniciarSesion() {
  var btn = document.getElementById('btnLogin');
  var email = document.getElementById('email').value.trim();
  var password = document.getElementById('password').value;

  if (!email || !password) {
    mostrarMensaje('error', 'Por favor llena email y contrasena.');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Ingresando...';

  try {
    var respuesta = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password, tipo: tipoActual })
    });

    var resultado = await respuesta.json();

    if (resultado.success) {
      localStorage.setItem('token', resultado.token);
      localStorage.setItem('usuario', JSON.stringify(resultado.usuario));
      localStorage.setItem('tipo', resultado.tipo);
      mostrarMensaje('exito', 'Sesion iniciada. Redirigiendo...');

      setTimeout(function() {
        if (resultado.tipo === 'negocio') {
          window.location.href = '/panel-negocio.html';
        } else {
          window.location.href = '/panel-cliente.html';
        }
      }, 1000);
    } else {
      mostrarMensaje('error', resultado.message || 'Email o contrasena incorrectos.');
    }
  } catch (error) {
    mostrarMensaje('error', 'Error de conexion. Verifica tu internet e intenta de nuevo.');
    console.error('Error de login:', error);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Ingresar';
  }
}

// Permitir presionar Enter para enviar el formulario
document.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    var btnLogin = document.getElementById('btnLogin');
    var btnRegistro = document.getElementById('btnRegistro');
    if (btnLogin) iniciarSesion();
    if (btnRegistro) registrarse();
  }
});
