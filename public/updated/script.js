const toggle=document.querySelector('.menu-toggle');const mobile=document.querySelector('#mobile-nav');
if(toggle&&mobile){toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');mobile.hidden=!open});mobile.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{mobile.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation')}))}
function openHashDetail(){const id=decodeURIComponent(location.hash.slice(1));if(!id.startsWith('workflow-'))return;const target=document.getElementById(id);if(target?.tagName==='DETAILS')target.open=true}
window.addEventListener('hashchange',openHashDetail);openHashDetail();
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const targets=[...document.querySelectorAll('[data-reveal]')];
if('IntersectionObserver' in window&&!reduceMotion.matches&&targets.length){
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}},{rootMargin:'0px 0px -7% 0px',threshold:0.08});
  targets.forEach(el=>observer.observe(el));
  document.body.classList.add('motion-ready');
}

