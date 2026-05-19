// FidelizaSucre - panel.js

// Verificar autenticacion al cargar cualquier panel
(function() {
  var token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  var tipo = localStorage.getItem('tipo');
  var pagina = window.location.pathname;

  // Redirigir si el tipo no coincide con el panel
  if (pagina.includes('panel-negocio') && tipo !== 'negocio') {
    window.location.href = '/panel-cliente.html';
    return;
  }

  if (pagina.includes('panel-cliente') && tipo !== 'cliente') {
    window.location.href = '/panel-negocio.html';
    return;
  }

  // Cargar datos segun el tipo de panel
  if (pagina.includes('panel-negocio')) {
    cargarPanelNegocio();
  } else if (pagina.includes('panel-cliente')) {
    cargarPanelCliente();
  }
})();

// Cerrar sesion
function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  localStorage.removeItem('tipo');
  window.location.href = '/';
}

// Obtener token
function getToken() {
  return localStorage.getItem('token');
}

// Hacer peticiones autenticadas a la API
async function apiRequest(url, opciones) {
  var config = Object.assign({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getToken()
    }
  }, opciones);

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  var respuesta = await fetch(url, config);

  if (respuesta.status === 401 || respuesta.status === 403) {
    cerrarSesion();
    return null;
  }

  return respuesta.json();
}

// =========================================
// PANEL DE NEGOCIO
// =========================================

var datosPanel = null;

async function cargarPanelNegocio() {
  try {
    var resultado = await apiRequest('/api/businesses/panel');
    if (!resultado || !resultado.success) {
      console.error('Error al cargar panel');
      return;
    }

    datosPanel = resultado;
    var negocio = resultado.negocio;

    // Actualizar header
    var negocioNombreEl = document.getElementById('negocioNombre');
    var planBadgeEl = document.getElementById('planBadge');
    if (negocioNombreEl) negocioNombreEl.textContent = negocio.nombre_negocio;
    if (planBadgeEl) planBadgeEl.textContent = 'Plan ' + (negocio.plan || 'Gratuito');

    // Actualizar stats
    var totalClientesEl = document.getElementById('totalClientes');
    var totalRecompensasEl = document.getElementById('totalRecompensas');
    var planNombreEl = document.getElementById('planNombre');
    if (totalClientesEl) totalClientesEl.textContent = resultado.total_clientes;
    if (totalRecompensasEl) totalRecompensasEl.textContent = resultado.recompensas.length;
    if (planNombreEl) planNombreEl.textContent = negocio.plan || 'Gratuito';

    // Renderizar clientes frecuentes
    renderizarClientesFrecuentes(resultado.clientes_frecuentes);

    // Renderizar tabla de clientes
    renderizarTablaClientes(resultado.clientes_frecuentes);

    // Renderizar recompensas
    renderizarRecompensasNegocio(resultado.recompensas);

  } catch (error) {
    console.error('Error al cargar panel de negocio:', error);
  }
}

function renderizarClientesFrecuentes(clientes) {
  var container = document.getElementById('listaClientesFrecuentes');
  if (!container) return;

  if (!clientes || clientes.length === 0) {
    container.innerHTML = '<div class="vacio-text">Aun no tienes clientes registrados. Comparte tu QR con tus clientes.</div>';
    return;
  }

  var html = '<table class="tabla-clientes"><thead><tr>' +
    '<th>Cliente</th><th>Visitas</th><th>Puntos</th><th>Ultima visita</th>' +
    '</tr></thead><tbody>';

  clientes.slice(0, 5).forEach(function(c) {
    var iniciales = (c.nombre.charAt(0) + c.apellido.charAt(0)).toUpperCase();
    var fecha = c.ultima_visita ? new Date(c.ultima_visita).toLocaleDateString('es-BO') : 'N/A';
    html += '<tr>' +
      '<td><span class="cliente-avatar-small">' + iniciales + '</span>' + c.nombre + ' ' + c.apellido + '</td>' +
      '<td>' + (c.visitas || 0) + '</td>' +
      '<td>' + (c.puntos || 0) + ' pts</td>' +
      '<td>' + fecha + '</td>' +
      '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function renderizarTablaClientes(clientes) {
  var container = document.getElementById('tablaClientes');
  if (!container) return;

  if (!clientes || clientes.length === 0) {
    container.innerHTML = '<div class="vacio-text">Aun no tienes clientes.</div>';
    return;
  }

  var html = '<table class="tabla-clientes"><thead><tr>' +
    '<th>Cliente</th><th>Email</th><th>Visitas</th><th>Puntos acumulados</th>' +
    '</tr></thead><tbody>';

  clientes.forEach(function(c) {
    var iniciales = (c.nombre.charAt(0) + c.apellido.charAt(0)).toUpperCase();
    html += '<tr>' +
      '<td><span class="cliente-avatar-small">' + iniciales + '</span>' + c.nombre + ' ' + c.apellido + '</td>' +
      '<td>' + c.email + '</td>' +
      '<td>' + (c.visitas || 0) + '</td>' +
      '<td>' + (c.puntos || 0) + ' pts</td>' +
      '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function renderizarRecompensasNegocio(recompensas) {
  var container = document.getElementById('listaRecompensas');
  if (!container) return;

  if (!recompensas || recompensas.length === 0) {
    container.innerHTML = '<div class="vacio-text">No tienes recompensas. Crea una para motivar a tus clientes.</div>';
    return;
  }

  var html = '<div class="lista-recompensas">';
  recompensas.forEach(function(r) {
    html += '<div class="recompensa-item">' +
      '<div class="recompensa-info">' +
      '<h4>' + r.nombre + '</h4>' +
      '<p>' + (r.descripcion || 'Sin descripcion') + '</p>' +
      '</div>' +
      '<div class="recompensa-puntos">' +
      '<strong>' + r.puntos_requeridos + '</strong>' +
      '<span>puntos</span>' +
      '</div>' +
      '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

// Mostrar/ocultar formulario de nueva recompensa
function mostrarFormRecompensa() {
  var form = document.getElementById('formNuevaRecompensa');
  if (form) form.style.display = 'block';
}

function ocultarFormRecompensa() {
  var form = document.getElementById('formNuevaRecompensa');
  if (form) form.style.display = 'none';
}

// Crear nueva recompensa
async function crearRecompensa() {
  var nombre = document.getElementById('recompensaNombre').value.trim();
  var descripcion = document.getElementById('recompensaDesc').value.trim();
  var puntos = document.getElementById('recompensaPuntos').value;

  if (!nombre || !puntos) {
    alert('Nombre y puntos requeridos son obligatorios.');
    return;
  }

  try {
    var resultado = await apiRequest('/api/businesses/recompensa', {
      method: 'POST',
      body: { nombre: nombre, descripcion: descripcion, puntos_requeridos: parseInt(puntos) }
    });

    if (resultado && resultado.success) {
      alert('Recompensa creada exitosamente.');
      ocultarFormRecompensa();
      document.getElementById('recompensaNombre').value = '';
      document.getElementById('recompensaDesc').value = '';
      document.getElementById('recompensaPuntos').value = '';
      cargarPanelNegocio();
    } else {
      alert(resultado ? resultado.message : 'Error al crear la recompensa.');
    }
  } catch (error) {
    alert('Error de conexion. Intenta de nuevo.');
    console.error(error);
  }
}

// Sumar puntos a un cliente
async function sumarPuntos() {
  var codigo = document.getElementById('codigoCliente').value.trim().toUpperCase();
  var puntos = document.getElementById('puntosASumar').value;
  var descripcion = document.getElementById('descripcionPuntos').value.trim();
  var resultadoEl = document.getElementById('resultadoPuntos');

  if (!codigo || !puntos) {
    alert('Codigo de cliente y puntos son obligatorios.');
    return;
  }

  try {
    var resultado = await apiRequest('/api/points/sumar', {
      method: 'POST',
      body: { codigo_cliente: codigo, puntos: parseInt(puntos), descripcion: descripcion }
    });

    if (resultado && resultado.success) {
      resultadoEl.textContent = resultado.message + '. Total acumulado: ' + resultado.nuevos_puntos_totales + ' puntos.';
      resultadoEl.className = 'resultado-puntos success';
      resultadoEl.style.display = 'block';
      document.getElementById('codigoCliente').value = '';
      document.getElementById('puntosASumar').value = '';
      document.getElementById('descripcionPuntos').value = '';
    } else {
      resultadoEl.textContent = resultado ? resultado.message : 'Error al sumar puntos.';
      resultadoEl.className = 'resultado-puntos error';
      resultadoEl.style.display = 'block';
    }
  } catch (error) {
    resultadoEl.textContent = 'Error de conexion. Intenta de nuevo.';
    resultadoEl.className = 'resultado-puntos error';
    resultadoEl.style.display = 'block';
    console.error(error);
  }
}

// Generar QR del negocio
async function generarQR() {
  var container = document.getElementById('qrContainer');
  container.innerHTML = '<div class="loading-text">Generando QR...</div>';

  try {
    var resultado = await apiRequest('/api/businesses/qr');

    if (resultado && resultado.success) {
      container.innerHTML = '<img src="' + resultado.qr_imagen + '" alt="Codigo QR de mi negocio" style="max-width:300px;">';
      var instruccionesEl = document.getElementById('instruccionesQR');
      if (instruccionesEl) instruccionesEl.style.display = 'block';
    } else {
      container.innerHTML = '<button class="btn-primary" onclick="generarQR()">Generar mi QR</button>';
      alert('Error al generar el QR. Intenta de nuevo.');
    }
  } catch (error) {
    container.innerHTML = '<button class="btn-primary" onclick="generarQR()">Generar mi QR</button>';
    console.error('Error al generar QR:', error);
  }
}

// Cambiar seccion en el panel de negocio
function mostrarSeccion(seccion, enlace) {
  // Desactivar todas las secciones
  document.querySelectorAll('.panel-section').forEach(function(s) {
    s.classList.remove('active');
  });

  // Desactivar todos los links
  document.querySelectorAll('.sidebar-link').forEach(function(l) {
    l.classList.remove('active');
  });

  // Activar la seccion seleccionada
  var seccionEl = document.getElementById('seccion-' + seccion);
  if (seccionEl) seccionEl.classList.add('active');
  if (enlace) enlace.classList.add('active');

  // Actualizar titulo
  var titulos = {
    resumen: 'Resumen',
    clientes: 'Mis Clientes',
    recompensas: 'Recompensas',
    puntos: 'Sumar Puntos',
    qr: 'Mi Codigo QR'
  };

  var tituloEl = document.getElementById('panelTitulo');
  if (tituloEl) tituloEl.textContent = titulos[seccion] || seccion;
}

// =========================================
// PANEL DE CLIENTE
// =========================================

async function cargarPanelCliente() {
  try {
    var resultado = await apiRequest('/api/clients/perfil');
    if (!resultado || !resultado.success) return;

    var cliente = resultado.cliente;

    // Actualizar nombre en header
    var nombreEl = document.getElementById('clienteNombre');
    if (nombreEl) nombreEl.textContent = cliente.nombre + ' ' + cliente.apellido;

    // Actualizar tarjeta
    var misPuntosEl = document.getElementById('misPuntos');
    var miNombreEl = document.getElementById('miNombre');
    var miCodigoEl = document.getElementById('miCodigo');
    var codigoGrandeEl = document.getElementById('codigoGrande');

    if (misPuntosEl) misPuntosEl.textContent = (cliente.puntos_totales || 0).toLocaleString();
    if (miNombreEl) miNombreEl.textContent = cliente.nombre + ' ' + cliente.apellido;
    if (miCodigoEl) miCodigoEl.textContent = cliente.codigo_cliente;
    if (codigoGrandeEl) codigoGrandeEl.textContent = cliente.codigo_cliente;

    // Cargar recompensas
    cargarRecompensasCliente();

    // Cargar historial
    cargarHistorial();

  } catch (error) {
    console.error('Error al cargar panel de cliente:', error);
  }
}

async function cargarRecompensasCliente() {
  var container = document.getElementById('listaRecompensasCliente');
  if (!container) return;

  try {
    var resultado = await apiRequest('/api/clients/recompensas-disponibles');
    if (!resultado || !resultado.success) {
      container.innerHTML = '<div class="vacio-text">Error al cargar recompensas.</div>';
      return;
    }

    if (!resultado.recompensas || resultado.recompensas.length === 0) {
      container.innerHTML = '<div class="vacio-text">No hay recompensas disponibles por ahora.</div>';
      return;
    }

    var html = '<div class="lista-recompensas">';
    resultado.recompensas.forEach(function(r) {
      html += '<div class="recompensa-item">' +
        '<div class="recompensa-info">' +
        '<h4>' + r.nombre + '</h4>' +
        '<p>' + (r.descripcion || '') + '</p>' +
        '<p><small>En: ' + r.nombre_negocio + '</small></p>' +
        '</div>' +
        '<div class="recompensa-puntos">' +
        '<strong>' + r.puntos_requeridos + '</strong>' +
        '<span>puntos</span>' +
        '<button class="btn-small" style="margin-top:8px;" onclick="canjearRecompensa(' + r.id + ')">Canjear</button>' +
        '</div>' +
        '</div>';
    });
    html += '</div>';
    container.innerHTML = html;

  } catch (error) {
    container.innerHTML = '<div class="vacio-text">Error al cargar recompensas.</div>';
    console.error(error);
  }
}

async function canjearRecompensa(recompensaId) {
  if (!confirm('Confirmas el canje de esta recompensa?')) return;

  try {
    var resultado = await apiRequest('/api/points/canjear', {
      method: 'POST',
      body: { recompensa_id: recompensaId }
    });

    if (resultado && resultado.success) {
      alert(resultado.message + '\nPuntos restantes: ' + resultado.puntos_restantes);
      cargarPanelCliente();
    } else {
      alert(resultado ? resultado.message : 'Error al canjear.');
    }
  } catch (error) {
    alert('Error de conexion. Intenta de nuevo.');
    console.error(error);
  }
}

async function cargarHistorial() {
  var container = document.getElementById('historialMovimientos');
  if (!container) return;

  try {
    var resultado = await apiRequest('/api/points/historial');
    if (!resultado || !resultado.success) {
      container.innerHTML = '<div class="vacio-text">Error al cargar el historial.</div>';
      return;
    }

    if (!resultado.historial || resultado.historial.length === 0) {
      container.innerHTML = '<div class="vacio-text">No tienes movimientos de puntos aun. Visita un negocio para empezar.</div>';
      return;
    }

    var html = '';
    resultado.historial.forEach(function(mov) {
      var esSuma = mov.tipo === 'suma';
      var prefijo = esSuma ? '+' : '-';
      var clase = esSuma ? 'suma' : 'canje';
      var fecha = new Date(mov.fecha).toLocaleDateString('es-BO', {
        day: '2-digit', month: 'short', year: 'numeric'
      });

      html += '<div class="historial-item">' +
        '<div class="historial-info">' +
        '<strong>' + (mov.descripcion || (esSuma ? 'Puntos ganados' : 'Canje')) + '</strong>' +
        '<span>' + (mov.nombre_negocio || '') + ' - ' + fecha + '</span>' +
        '</div>' +
        '<div class="historial-puntos ' + clase + '">' + prefijo + mov.puntos + ' pts</div>' +
        '</div>';
    });

    container.innerHTML = html;

  } catch (error) {
    container.innerHTML = '<div class="vacio-text">Error al cargar el historial.</div>';
    console.error(error);
  }
}

// Cambiar seccion en el panel de cliente
function mostrarSeccionCliente(seccion, enlace) {
  document.querySelectorAll('.panel-section').forEach(function(s) {
    s.classList.remove('active');
  });

  document.querySelectorAll('.sidebar-link').forEach(function(l) {
    l.classList.remove('active');
  });

  var seccionEl = document.getElementById('seccion-' + seccion);
  if (seccionEl) seccionEl.classList.add('active');
  if (enlace) enlace.classList.add('active');

  var titulos = {
    miperfil: 'Mi Perfil',
    misrecompensas: 'Canjear Recompensas',
    historial: 'Historial de Puntos'
  };

  var tituloEl = document.getElementById('panelTitulo');
  if (tituloEl) tituloEl.textContent = titulos[seccion] || seccion;
}
