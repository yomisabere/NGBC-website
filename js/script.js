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

/* NGBC site-wide interaction polish */
(function(){
  const header=document.querySelector('.site-header');
  const update=()=>{if(header) header.classList.toggle('scrolled',window.scrollY>12)};
  update(); window.addEventListener('scroll',update,{passive:true});
  if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const els=document.querySelectorAll('main section,main .card');
    els.forEach(el=>el.classList.add('reveal-on-scroll'));
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}})
    },{threshold:.08});
    els.forEach(el=>io.observe(el));
  }
})();

/* Navigation state + accessible back-to-top */
(function(){
  const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  document.querySelectorAll('.nav a').forEach(a=>{
    const href=(a.getAttribute('href')||'').split('#')[0].split('/').pop().toLowerCase();
    if(href && href===current){
      a.classList.add('active');
      a.setAttribute('aria-current','page');
    }
  });

  const top=document.createElement('button');
  top.type='button';
  top.className='back-to-top';
  top.setAttribute('aria-label','Back to top');
  top.textContent='↑';
  document.body.appendChild(top);
  const sync=()=>top.classList.toggle('show',window.scrollY>500);
  sync(); window.addEventListener('scroll',sync,{passive:true});
  top.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
})();
