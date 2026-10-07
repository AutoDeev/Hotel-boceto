(() => {
  const H = Hotel;
  const $ = selector => document.querySelector(selector);
  const icons = {
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    user: '<circle cx="12" cy="8" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
    size: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="m8 16 8-8M8 12v4h4M12 8h4v4"/>',
    bed: '<path d="M3 18V7m18 11V7M3 14h18M5 14V9h14v5M3 18h18M6 18v3m12-3v3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };
  const icon = (name, filled = false) => `<svg viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
  let favorites;
  try { favorites = JSON.parse(localStorage.getItem('auria-favorites') || '[]'); } catch { favorites = []; }
  if (!Array.isArray(favorites)) favorites = [];
  let roomFilter = 'all';
  $('#year').textContent = new Date().getFullYear();
  $('[data-checkin-time]').textContent = H.data.settings.checkin;
  $('[data-checkout-time]').textContent = H.data.settings.checkout;
  const menu = $('#main-nav'), menuToggle = $('#menu-toggle');
  function closeMenu() { menu.classList.remove('open'); menuToggle.setAttribute('aria-expanded','false'); menuToggle.setAttribute('aria-label','Abrir menú'); }
  menuToggle.addEventListener('click', () => { const open = menu.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', String(open)); menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú'); });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  const onScroll = () => { $('#site-header').classList.toggle('scrolled', scrollY > 15); $('#back-top').hidden = scrollY < 750; };
  addEventListener('scroll', onScroll, {passive:true}); onScroll();
  $('#back-top').addEventListener('click', () => window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}));

  function renderRooms() {
    const rooms = H.data.roomTypes.filter(r => roomFilter === 'all' || (roomFilter === 'suite' && ['presidencial','deluxe'].includes(r.id)) || (roomFilter === 'room' && ['premium','standard'].includes(r.id)) || (roomFilter === 'favorites' && favorites.includes(r.id)));
    $('#favorite-count').textContent = favorites.length;
    $('#room-grid').innerHTML = rooms.length ? rooms.map(r => {
      const selected = favorites.includes(r.id);
      return `<article class="room-card"><div class="room-photo"><button data-room-detail="${r.id}" aria-label="Conocer ${H.esc(r.name)}"><img src="${r.image}" alt="${H.esc(r.name)}" loading="lazy"></button><button class="favorite-button" data-favorite="${r.id}" aria-pressed="${selected}" aria-label="${selected ? 'Quitar de favoritas' : 'Añadir a favoritas'}: ${H.esc(r.name)}">${icon('heart',selected)}</button></div><span class="room-card-label">${r.id === 'presidencial' ? 'UN POCO MÁS EXTRAORDINARIO' : r.id === 'deluxe' ? 'ESPACIO PARA DISFRUTAR' : r.id === 'premium' ? 'TU PAUSA PERFECTA' : 'LO ESENCIAL, BIEN HECHO'}</span><h3>${H.esc(r.name)}</h3><div class="room-meta"><span>${icon('user')}${r.capacity} personas</span><span>${icon('size')}${r.size} m²</span><span>${icon('bed')}${H.esc(r.bed)}</span></div><div class="room-actions"><span>Diseñada para descansar</span><button data-room-detail="${r.id}">Conocer habitación <b>↗</b></button></div></article>`;
    }).join('') : '<div class="room-empty"><strong>Tu colección empieza aquí.</strong>Guarda las habitaciones que te gusten tocando el corazón.<br><button class="text-link" data-show-all>Explorar habitaciones ↗</button></div>';
    document.querySelectorAll('[data-room-filter]').forEach(button => { const active = button.dataset.roomFilter === roomFilter; button.classList.toggle('active',active); button.setAttribute('aria-pressed',String(active)); });
  }
  function roomDetail(id) {
    const room = H.type(id);
    H.showModal(`<img class="room-detail-image" src="${room.image}" alt="${H.esc(room.name)}"><div class="modal-body"><button class="modal-close" data-close-modal aria-label="Cerrar">×</button><div class="eyebrow"><span></span> TU RINCÓN DE CALMA</div><h2>${H.esc(room.name)}</h2><p>${H.esc(room.description)}</p><div class="room-detail-meta"><span>${icon('user')} Hasta ${room.capacity} personas</span><span>${icon('bed')} ${H.esc(room.bed)}</span><span>${icon('size')} ${room.size} m²</span></div><ul class="detail-amenities"><li>Ropa de cama de algodón</li><li>Wi-Fi de alta velocidad</li><li>Cafetera y selección de té</li><li>Amenities de baño</li><li>Escritorio y luz de lectura</li><li>Atención personalizada</li></ul><div class="modal-actions"><button class="btn btn-accent" id="room-contact">Quiero saber más <span>↗</span></button></div></div>`);
    $('#room-contact').addEventListener('click', () => { H.closeModal(); $('#contact-form [name="subject"]').value='Habitaciones'; $('#contact-form [name="message"]').value=`Hola, me gustaría conocer más sobre la ${room.name}.`; $('#contacto').scrollIntoView({behavior:'smooth'}); });
  }
  document.querySelectorAll('[data-room-filter]').forEach(button => button.addEventListener('click', () => { roomFilter = button.dataset.roomFilter; renderRooms(); }));
  $('#room-grid').addEventListener('click', e => {
    const heart = e.target.closest('[data-favorite]'), detail = e.target.closest('[data-room-detail]');
    if (heart) { const id=heart.dataset.favorite; favorites = favorites.includes(id) ? favorites.filter(x => x!==id) : [...favorites,id]; localStorage.setItem('auria-favorites',JSON.stringify(favorites)); renderRooms(); H.toast(favorites.includes(id) ? 'Guardada en tus favoritas.' : 'Habitación quitada de favoritas.'); }
    else if (detail) roomDetail(detail.dataset.roomDetail);
    else if (e.target.closest('[data-show-all]')) { roomFilter='all'; renderRooms(); }
  });
  renderRooms();

  const experiences = {
    gastro: {label:'SABORES DE AQUÍ',title:'Una buena mesa.<br>Una mejor conversación.',description:'Ingredientes de nuestra tierra, café de altura y una cocina que invita a quedarse un rato más. El sabor de La Paz, con nuestro toque.',hours:'Todos los días · 7:00 a 22:00',image:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=85',alt:'Restaurante con una mesa preparada para una cena especial',details:'Desayunos con pan artesanal, almuerzos de temporada y cenas para compartir. Ofrecemos opciones vegetarianas y podemos adaptar los platos a tus necesidades alimentarias. Nuestro restaurante también recibe a quienes no se alojan en el hotel.'},
    spa: {label:'TIEMPO PARA TI',title:'Baja el ritmo.<br>Vuelve a ti.',description:'Un masaje, aromas suaves y el silencio que a veces hace falta. Nuestro espacio de bienestar te invita a soltar el día.',hours:'Todos los días · 9:00 a 20:00',image:'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=85',alt:'Espacio de spa cálido y tranquilo',details:'Disfruta de masajes relajantes, tratamientos faciales y rituales de bienestar. El equipo de recepción te ayuda a conocer cada tratamiento, su duración y las recomendaciones para aprovechar tu visita.'},
    pool: {label:'UN BUEN RESPIRO',title:'Nada de prisa.<br>Todo de calma.',description:'Agua tranquila, un buen libro y un momento que es solo tuyo. Hay días en los que el mejor plan es no tener ninguno.',hours:'Todos los días · 7:00 a 21:00',image:'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=85',alt:'Piscina exterior rodeada de jardines',details:'Nuestra zona de piscina dispone de tumbonas y servicio de toallas. También puedes disfrutar del gimnasio, abierto de 6:00 a 22:00. Los menores deben estar acompañados por una persona adulta.'},
    city: {label:'LA PAZ, DE CERCA',title:'Sal a descubrir.<br>Vuelve a sentirte en casa.',description:'Calles con historia, mercados llenos de vida y una ciudad que siempre tiene algo que contar. Déjate guiar por quienes la conocen.',hours:'Conserjería · Atención las 24 horas',image:'https://images.unsplash.com/photo-1464822759023-7fed622f2c3b?w=1200&q=85',alt:'Paisaje de montaña para inspirar una escapada',details:'Nuestro equipo comparte rutas a pie por el centro histórico, recomendaciones gastronómicas y consejos para descubrir los miradores de la ciudad. También te orientamos sobre traslados y experiencias en los alrededores.'}
  };
  let currentExperience = 'gastro';
  function renderExperience(id, focus=false) {
    currentExperience=id;
    const item=experiences[id];
    document.querySelectorAll('[data-experience]').forEach(button => { const selected=button.dataset.experience===id; button.setAttribute('aria-selected',String(selected)); button.tabIndex=selected?0:-1; if(selected&&focus)button.focus(); });
    const panel=$('#experience-panel'); panel.setAttribute('aria-labelledby',`tab-${id}`);
    panel.innerHTML=`<img class="experience-photo" src="${item.image}" alt="${item.alt}" loading="lazy"><div class="experience-content"><div class="eyebrow">${item.label}</div><h3>${item.title}</h3><p>${item.description}</p><div class="experience-meta">${icon('clock')}${item.hours}</div><button class="text-link" id="experience-detail">Conoce la experiencia <span>↗</span></button></div>`;
    $('#experience-detail').addEventListener('click', () => H.showModal(`<img class="experience-dialog-image" src="${item.image}" alt="${item.alt}"><div class="modal-body"><button class="modal-close" data-close-modal aria-label="Cerrar">×</button><div class="eyebrow"><span></span>${item.label}</div><h2>${item.title}</h2><p>${item.details}</p><p><strong>${item.hours}</strong></p><div class="modal-actions"><button class="btn btn-accent" data-close-modal>Seguir explorando ↗</button></div></div>`));
  }
  document.querySelectorAll('[data-experience]').forEach(button => { button.addEventListener('click',()=>renderExperience(button.dataset.experience)); button.addEventListener('keydown', e => { const keys=Object.keys(experiences); let index=keys.indexOf(currentExperience); if(e.key==='ArrowRight')index=(index+1)%keys.length;else if(e.key==='ArrowLeft')index=(index+keys.length-1)%keys.length;else if(e.key==='Home')index=0;else if(e.key==='End')index=keys.length-1;else return;e.preventDefault();renderExperience(keys[index],true); }); });
  document.querySelectorAll('[data-experience-jump]').forEach(button=>button.addEventListener('click',()=>{renderExperience(button.dataset.experienceJump);$('#experiencias').scrollIntoView({behavior:'smooth'});}));
  renderExperience(currentExperience);

  const gallery = [
    {name:'Despertar aquí',category:'spaces',image:H.type('presidencial').image},
    {name:'Un lugar para encontrarse',category:'spaces',image:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&q=85'},
    {name:'El placer de compartir',category:'moments',image:experiences.gastro.image},
    {name:'Tu momento de calma',category:'moments',image:experiences.spa.image},
    {name:'Días sin prisa',category:'spaces',image:experiences.pool.image}
  ];
  let galleryFilter='all', galleryIndex=0, galleryOpen=false;
  const visibleGallery=()=>gallery.map((item,index)=>({...item,index})).filter(item=>galleryFilter==='all'||item.category===galleryFilter);
  function renderGallery(){const grid=$('#gallery-grid');grid.classList.toggle('filtered',galleryFilter!=='all');grid.innerHTML=visibleGallery().map(item=>`<button class="gallery-item" data-gallery="${item.index}" aria-label="Ampliar: ${item.name}"><img src="${item.image}" alt="${item.name}" loading="lazy"><span>${item.name}<b>↗</b></span></button>`).join('');document.querySelectorAll('[data-gallery-filter]').forEach(button=>{const active=button.dataset.galleryFilter===galleryFilter;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});}
  function openGallery(index){galleryIndex=index;galleryOpen=true;const item=gallery[index],list=visibleGallery();H.showModal(`<button class="modal-close" data-close-modal aria-label="Cerrar galería">×</button><div class="lightbox-stage"><button class="lightbox-arrow prev" id="gallery-prev" aria-label="Imagen anterior">←</button><img class="lightbox-image" src="${item.image}" alt="${item.name}"><button class="lightbox-arrow next" id="gallery-next" aria-label="Siguiente imagen">→</button></div><div class="lightbox-caption"><span>${item.name}</span><span>${list.findIndex(x=>x.index===index)+1} / ${list.length}</span></div>`);$('.modal-panel').classList.add('lightbox-panel');$('#gallery-prev').onclick=()=>moveGallery(-1);$('#gallery-next').onclick=()=>moveGallery(1);}
  function moveGallery(direction){const list=visibleGallery(),i=list.findIndex(item=>item.index===galleryIndex);openGallery(list[(i+direction+list.length)%list.length].index);}
  document.querySelectorAll('[data-gallery-filter]').forEach(button=>button.addEventListener('click',()=>{galleryFilter=button.dataset.galleryFilter;renderGallery();}));
  $('#gallery-grid').addEventListener('click',e=>{const button=e.target.closest('[data-gallery]');if(button)openGallery(Number(button.dataset.gallery));});
  document.addEventListener('keydown',e=>{if(galleryOpen&&$('.lightbox-panel')){if(e.key==='ArrowRight'){e.preventDefault();moveGallery(1);}if(e.key==='ArrowLeft'){e.preventDefault();moveGallery(-1);}}});
  renderGallery();

  const quotes=[['Una experiencia impecable de principio a fin. La atención fue cálida y cada espacio invita a bajar el ritmo y disfrutar.','Mariana Torres','Santa Cruz, Bolivia'],['El equilibrio perfecto entre diseño y comodidad. Volvería a La Paz solo por disfrutar otra estancia aquí.','Santiago Rojas','Santiago, Chile'],['Despertar con esa luz, desayunar sin prisa y sentirse cuidado en cada detalle. Un lugar verdaderamente especial.','Isabella Moretti','Milán, Italia']];
  let quoteIndex=0;
  function renderQuote(){const [text,name,place]=quotes[quoteIndex];$('#testimonial-card').innerHTML=`<span class="quote-mark" aria-hidden="true">“</span><blockquote>${text}</blockquote><div class="testimonial-person"><span class="testimonial-avatar">${name.split(' ').map(n=>n[0]).join('')}</span><div><strong>${name}</strong><small>${place}</small></div></div>`;$('#testimonial-dots').innerHTML=quotes.map((_,i)=>`<button aria-label="Ver testimonio ${i+1}" aria-pressed="${quoteIndex===i}" class="${quoteIndex===i?'active':''}" data-quote="${i}"></button>`).join('');}
  $('#testimonial-prev').onclick=()=>{quoteIndex=(quoteIndex+quotes.length-1)%quotes.length;renderQuote();};$('#testimonial-next').onclick=()=>{quoteIndex=(quoteIndex+1)%quotes.length;renderQuote();};$('#testimonial-dots').addEventListener('click',e=>{const b=e.target.closest('[data-quote]');if(b){quoteIndex=Number(b.dataset.quote);renderQuote();}});renderQuote();
  document.querySelectorAll('.faq-list details').forEach(detail=>detail.addEventListener('toggle',()=>{if(detail.open)document.querySelectorAll('.faq-list details').forEach(other=>{if(other!==detail)other.open=false;});}));
  $('#copy-address').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(H.data.settings.address);H.toast('Dirección copiada.');}catch{H.showModal(`<div class="modal-body"><button class="modal-close" data-close-modal aria-label="Cerrar">×</button><h2>Nos encuentras aquí</h2><p>${H.esc(H.data.settings.address)}</p><p>Puedes seleccionar y copiar esta dirección.</p></div>`);}});
  $('#contact-form').addEventListener('submit',e=>{e.preventDefault();const form=e.currentTarget,f=new FormData(form);const name=String(f.get('name')).trim(),message=String(f.get('message')).trim();if(name.length<2||message.length<10){H.toast('Completa tu nombre y un mensaje de al menos 10 caracteres.','error');return;}H.data.inquiries.unshift({id:H.uid('msg'),name,email:String(f.get('email')).trim(),subject:f.get('subject'),message,date:H.offset(0),status:'Nuevo'});H.save();$('#contact-feedback').textContent='¡Gracias por escribirnos! Tu mensaje quedó guardado en esta demo y puedes verlo en el panel de mensajes.';H.toast('Mensaje guardado correctamente.');form.reset();});
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.12});document.querySelectorAll('.section-heading,.intro-grid,.story-copy,.testimonial-layout,.faq-layout').forEach(el=>{el.classList.add('reveal','will-reveal');observer.observe(el);});const navObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll('.main-nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${entry.target.id}`));}}),{rootMargin:'-25% 0px -50% 0px'});document.querySelectorAll('section[id]').forEach(section=>navObserver.observe(section));}
})();
