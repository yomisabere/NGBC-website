document.addEventListener('DOMContentLoaded', function () {
  const burger = document.querySelector('.burger');
  const links = document.querySelector('nav.links');

  if (burger && links) {
    burger.setAttribute('aria-expanded', 'false');
    burger.addEventListener('click', function () {
      const open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
  }

  document.addEventListener('click', function (e) {
    const link = e.target.closest('nav.links > a:not(.has-dropdown > a), .dropdown a');
    if (link && links) {
      links.classList.remove('open');
      burger && burger.setAttribute('aria-expanded', 'false');
    }
  });

  const dropdownParent = document.querySelector('.has-dropdown > a');
  if (dropdownParent) {
    dropdownParent.addEventListener('click', function (e) {
      if (window.innerWidth <= 980) {
        e.preventDefault();
        this.parentElement.classList.toggle('open');
      }
    });
  }

  const header = document.querySelector('header');
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.links a[href]').forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
});
