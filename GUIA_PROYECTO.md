# FidelizaSucre - Guia Completa del Proyecto
# Plataforma de Fidelizacion Digital para Negocios de Sucre
# Materia: E-Commerce | Carrera: Ciencias de la Computacion

---

## INFORMACION DEL PROYECTO

- Nombre: FidelizaSucre
- Modelo de negocio: Freemium con Suscripcion mensual
- Stack: Node.js + Express + PostgreSQL + HTML/CSS/JS puro
- Despliegue: Render.com (SSL automatico incluido)
- Control de versiones: Git + GitHub

---

## ESTRUCTURA DE ARCHIVOS DEL PROYECTO

```
fidelizasucre/
├── .gitignore
├── .env.example
├── package.json
├── server.js
├── render.yaml
├── database/
│   └── schema.sql
├── config/
│   └── db.js
├── routes/
│   ├── auth.js
│   ├── clients.js
│   ├── businesses.js
│   └── points.js
├── middleware/
│   └── auth.js
└── public/
    ├── index.html
    ├── login.html
    ├── registro.html
    ├── panel-negocio.html
    ├── panel-cliente.html
    ├── css/
    │   ├── main.css
    │   ├── auth.css
    │   └── panel.css
    └── js/
        ├── main.js
        ├── auth.js
        └── panel.js
```

---

## FASE 1 - CONFIGURACION INICIAL (Entrega 12-05-26)

### Objetivo de esta fase:
- Crear repositorio en GitHub
- Configurar el proyecto Node.js
- Crear pagina inicial visible
- Desplegar en Render con SSL automatico

---

### PASO 1: Crear cuenta en GitHub (si no tienes)

Ve a https://github.com y crea una cuenta gratuita.

---

### PASO 2: Crear repositorio en GitHub

1. En GitHub, haz clic en el boton "New" (nuevo repositorio)
2. Nombre del repositorio: fidelizasucre
3. Descripcion: Plataforma de fidelizacion digital para negocios de Sucre
4. Selecciona "Public"
5. NO marques "Add a README file"
6. Haz clic en "Create repository"
7. Copia la URL que te da GitHub, sera algo como:
   https://github.com/TU_USUARIO/fidelizasucre.git

---

### PASO 3: Abrir Git Bash en VSCode

En VSCode:
- Ve al menu "Terminal" > "New Terminal"
- O presiona Ctrl + `  (la tecla de la tilde invertida)
- En la parte inferior aparece la terminal
- Haz clic en la flecha junto al "+" y selecciona "Git Bash"

---

### PASO 4: Crear la carpeta del proyecto y configurar Git

Escribe estos comandos uno por uno en Git Bash. Presiona Enter despues de cada uno:

```bash
cd ~/Documents
mkdir fidelizasucre
cd fidelizasucre
git init
git branch -M main
```

---

### PASO 5: Configurar tu identidad en Git (solo la primera vez)

```bash
git config --global user.name "Tu Nombre Aqui"
git config --global user.email "tu@email.com"
```

---

### PASO 6: Crear los archivos del proyecto

Ahora en VSCode, abre la carpeta:
- Archivo > Abrir Carpeta > selecciona la carpeta fidelizasucre

Crea cada archivo con su contenido exacto segun las secciones siguientes de esta guia.

---

### PASO 7: Instalar Node.js (si no lo tienes)

Descarga Node.js LTS desde https://nodejs.org
Verifica la instalacion con:

```bash
node --version
npm --version
```

Ambos deben mostrar numeros de version.

---

### PASO 8: Instalar dependencias del proyecto

En Git Bash, dentro de la carpeta fidelizasucre:

```bash
npm install
```

Esto instalara todas las dependencias del archivo package.json.

---

### PASO 9: Crear archivo .env local para desarrollo

```bash
cp .env.example .env
```

Luego abre el archivo .env y llena los valores para pruebas locales:

```
PORT=3000
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/fidelizasucre
JWT_SECRET=mi_clave_secreta_muy_larga_para_desarrollo_local_2024
NODE_ENV=development
```

Para pruebas locales puedes usar SQLite primero, pero en produccion (Render) usaremos PostgreSQL.

---

### PASO 10: Subir el proyecto a GitHub

```bash
git add .
git commit -m "Primer commit: estructura inicial del proyecto FidelizaSucre"
git remote add origin https://github.com/TU_USUARIO/fidelizasucre.git
git push -u origin main
```

Si te pide usuario y contrasena de GitHub, escribe tus datos.
Si GitHub pide token en lugar de contrasena:
1. Ve a GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Genera un nuevo token con permisos "repo"
3. Usa ese token como contrasena

---

### PASO 11: Crear cuenta en Render y desplegar

1. Ve a https://render.com
2. Haz clic en "Get Started for Free"
3. Registrate con tu cuenta de GitHub (mas facil)
4. Una vez dentro, haz clic en "New +" > "Web Service"
5. Conecta tu repositorio de GitHub fidelizasucre
6. Configura el servicio:
   - Name: fidelizasucre
   - Region: Oregon (US West) o la mas cercana
   - Branch: main
   - Runtime: Node
   - Build Command: npm install
   - Start Command: node server.js
   - Plan: Free
7. Agrega las variables de entorno (Environment Variables):
   - JWT_SECRET = una_clave_muy_larga_y_segura_aqui_2024
   - NODE_ENV = production
8. Haz clic en "Create Web Service"

Render automaticamente:
- Clona tu repositorio
- Instala las dependencias
- Inicia el servidor
- Asigna un dominio tipo: fidelizasucre.onrender.com
- Activa SSL/HTTPS automaticamente (esto cubre el punto 3 de tu entrega)

---

### PASO 12: Agregar la base de datos PostgreSQL en Render

1. En Render, haz clic en "New +" > "PostgreSQL"
2. Nombre: fidelizasucre-db
3. Plan: Free
4. Haz clic en "Create Database"
5. Copia la "Internal Database URL"
6. Ve a tu Web Service > Environment > agrega la variable:
   - DATABASE_URL = la_url_que_copiaste

---

### PASO 13: Inicializar la base de datos

Una vez desplegado, en la consola de Render (Shell tab de tu Web Service), ejecuta:

```bash
node database/init.js
```

Esto creara todas las tablas necesarias.

---

## FASE 2 - GOOGLE ANALYTICS + REDES SOCIALES (22-05-26)

### Agregar Google Analytics

1. Ve a https://analytics.google.com
2. Crea una propiedad nueva con el nombre FidelizaSucre
3. Obtendras un codigo de medicion tipo: G-XXXXXXXXXX
4. En todos tus archivos HTML, dentro del tag <head>, agrega:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Reemplaza G-XXXXXXXXXX con tu codigo real.

### Agregar Facebook Pixel (sin pago)

1. Ve a https://business.facebook.com
2. Crea una cuenta de Facebook Business gratuita
3. Ve a "Administrador de eventos" > "Conectar fuente de datos" > "Web"
4. Copia el codigo del pixel y pegalo en todos tus HTML dentro de <head>:

```html
<!-- Facebook Pixel -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'TU_PIXEL_ID');
  fbq('track', 'PageView');
</script>
<noscript>
  <img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=TU_PIXEL_ID&ev=PageView&noscript=1"/>
</noscript>
```

### Conectar Instagram

Instagram se administra desde la misma cuenta de Facebook Business.
No requiere codigo adicional, solo conectar la cuenta desde el administrador.

---

## FASE 3 - SEO (22-05-26)

### En cada pagina HTML, agrega dentro de <head>:

```html
<!-- SEO basico -->
<meta name="description" content="FidelizaSucre: plataforma digital de puntos y recompensas para negocios de Sucre, Bolivia. Acumula puntos en tus tiendas favoritas.">
<meta name="keywords" content="fidelizacion, puntos, recompensas, Sucre, Bolivia, negocios, descuentos, programa de lealtad">
<meta name="author" content="FidelizaSucre">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://fidelizasucre.onrender.com/">

<!-- Open Graph para redes sociales -->
<meta property="og:title" content="FidelizaSucre - Acumula puntos en Sucre">
<meta property="og:description" content="La plataforma de fidelizacion digital para los mejores negocios de Sucre.">
<meta property="og:image" content="https://fidelizasucre.onrender.com/img/og-image.jpg">
<meta property="og:url" content="https://fidelizasucre.onrender.com">
<meta property="og:type" content="website">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="FidelizaSucre">
<meta name="twitter:description" content="Acumula puntos en tus negocios favoritos de Sucre.">
```

### Crear archivo sitemap.xml en la carpeta public/:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://fidelizasucre.onrender.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://fidelizasucre.onrender.com/login.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://fidelizasucre.onrender.com/registro.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### Crear archivo robots.txt en la carpeta public/:

```
User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://fidelizasucre.onrender.com/sitemap.xml
```

---

## FASE 4 - PLUGINS SOCIALES (29-05-26)

### Chat de WhatsApp flotante

Ya esta incluido en el codigo de index.html. El boton flotante de WhatsApp
aparece en la esquina inferior derecha. Solo cambia el numero de telefono.

### Tawk.to (chat en linea gratuito)

1. Ve a https://tawk.to
2. Crea una cuenta gratuita
3. Crea una nueva propiedad con nombre FidelizaSucre
4. Copia el codigo que te dan y pegalo antes de </body> en todos tus HTML:

```html
<!--Start of Tawk.to Script-->
<script type="text/javascript">
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/TU_ID_AQUI/default';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();
</script>
<!--End of Tawk.to Script-->
```

### Facebook Messenger (plugin de chat)

Agrega antes de </body>:

```html
<!-- Facebook Messenger Plugin -->
<div id="fb-root"></div>
<script>
  window.fbAsyncInit = function() {
    FB.init({
      xfbml: true,
      version: 'v17.0'
    });
  };
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = 'https://connect.facebook.net/es_LA/sdk/xfbml.customerchat.js';
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
</script>
<div class="fb-customerchat"
  attribution="biz_inbox"
  page_id="TU_PAGE_ID_DE_FACEBOOK">
</div>
```

---

## FASE 5 - PAYPAL (02-06-26)

### Integrar PayPal en la pagina de suscripcion

1. Crea una cuenta en https://developer.paypal.com
2. Ve a "My Apps & Credentials"
3. Crea una app en modo Sandbox para pruebas
4. Obtiene el Client ID
5. En la pagina de precios/suscripcion agrega:

```html
<script src="https://www.paypal.com/sdk/js?client-id=TU_CLIENT_ID&currency=USD"></script>
<div id="paypal-button-container"></div>
<script>
  paypal.Buttons({
    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: '9.99',
            currency_code: 'USD'
          },
          description: 'Suscripcion mensual FidelizaSucre Premium'
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        alert('Pago completado por ' + details.payer.name.given_name);
        window.location.href = '/panel-negocio.html';
      });
    },
    onError: function(err) {
      console.error('Error en el pago:', err);
      alert('Hubo un error al procesar el pago. Intenta de nuevo.');
    }
  }).render('#paypal-button-container');
</script>
```

---

## COMANDOS GIT PARA CADA ENTREGA

Despues de cada cambio que hagas, sube tu codigo con estos comandos:

```bash
git add .
git commit -m "Descripcion de lo que cambiaste"
git push origin main
```

Render detecta el push automaticamente y redespliega tu sitio en 2-3 minutos.

Ejemplos de mensajes de commit por fase:

```bash
git commit -m "Fase 1: Estructura inicial y pagina principal desplegada en Render"
git commit -m "Fase 2: Integracion de Google Analytics y Facebook Pixel"
git commit -m "Fase 3: Tecnicas SEO, sitemap.xml y robots.txt"
git commit -m "Fase 4: Vista inicial completa con tematica de fidelizacion"
git commit -m "Fase 5: Plugins sociales WhatsApp, Tawk.to y Messenger"
git commit -m "Fase 6: Primera version de documentacion del proyecto"
git commit -m "Fase 7: Integracion de PayPal para suscripciones"
git commit -m "Fase 8: Links a canal YouTube y TikTok"
git commit -m "Fase 9: Chat en linea con Tawk.to completamente configurado"
git commit -m "Fase 10: Boton de WhatsApp flotante con mensaje predefinido"
git commit -m "Fase 11: Contenido final completo de todas las paginas"
```

---

## VERIFICAR QUE TODO FUNCIONA

Despues de desplegar en Render, verifica:

1. Que el sitio carga en https://fidelizasucre.onrender.com (o tu dominio)
2. Que el candado SSL aparece en el navegador (https verde)
3. Que la pagina de registro funciona
4. Que la pagina de login funciona
5. Que el panel de negocio carga
6. Que el panel de cliente carga

---

## CUANDO TU DOCENTE TE DE EL DOMINIO

Para conectar tu dominio al sitio en Render:

1. En Render, ve a tu Web Service
2. Haz clic en "Settings" > "Custom Domains"
3. Agrega tu dominio (ej: fidelizasucre.com)
4. Render te dara un registro CNAME o A para configurar
5. Ve al panel donde tu docente registro el dominio
6. Agrega el registro DNS que Render te indico
7. Espera 5-30 minutos para que propague
8. Render activa el SSL para tu dominio automaticamente

---

## NOTAS IMPORTANTES

- El plan gratuito de Render hace que el servidor "duerma" despues de 15 minutos sin visitas.
  La primera visita puede tardar 30-60 segundos en cargar. Esto es normal para el plan free.
  
- Guarda SIEMPRE tus variables de entorno en Render, nunca en el codigo.

- El archivo .env NUNCA debe subirse a GitHub. Esta en .gitignore por eso.

- Cada vez que hagas cambios, recuerda:
  git add .
  git commit -m "mensaje"
  git push origin main
