/* Atmosphere navigation and lightweight interaction */
(()=>{'use strict';
const links=[...document.querySelectorAll('.quick-nav a')];
function active(hash){for(const link of links){const selected=link.getAttribute('href')===hash;link.classList.toggle('active',selected);if(selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')}}
for(const link of links){link.addEventListener('click',()=>active(link.getAttribute('href')))}
active('#forecastSection');
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible)active('#'+visible.target.id)},{rootMargin:'-20% 0px -55% 0px',threshold:[0,.15,.5]});for(const link of links){const section=document.querySelector(link.getAttribute('href'));if(section)observer.observe(section)}}
})();