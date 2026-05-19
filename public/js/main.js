// FidelizaSucre - main.js

// Efecto de scroll en la navegacion
(function() {
  var nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
})();

// Menu movil
function toggleMenu() {
  var mobileMenu = document.getElementById('navMobile');
  if (!mobileMenu) return;
  mobileMenu.classList.toggle('active');
}

// Cerrar el menu movil al hacer clic fuera
document.addEventListener('click', function(e) {
  var mobileMenu = document.getElementById('navMobile');
  var menuBtn = document.querySelector('.nav-menu-btn');
  if (!mobileMenu || !menuBtn) return;
  if (!menuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
    mobileMenu.classList.remove('active');
  }
});

// Animacion de elementos al hacer scroll
(function() {
  var elementos = document.querySelectorAll('.step, .plan-card, .demo-client');
  if (elementos.length === 0) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elementos.forEach(function(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
})();

// Scroll suave para los links del menu
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
  anchor.addEventListener('click', function(e) {
    var target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      var offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  });
});

// Manejo del parametro tipo en el URL para registro
(function() {
  var params = new URLSearchParams(window.location.search);
  var tipo = params.get('tipo');
  if (tipo) {
    sessionStorage.setItem('tipoRegistro', tipo);
  }
})();
