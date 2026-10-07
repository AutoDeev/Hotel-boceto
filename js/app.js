const Hotel = (() => {
  const key = 'auria-hotel-demo-v2';
  const today = new Date();
  const offset = n => { const d = new Date(today); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const initial = {
    settings: { name: 'AURIA', email: 'hola@auriahotel.com', phone: '+591 2 244 8200', address: 'Calle Jaén 722, La Paz, Bolivia', currency: 'BOB', checkin: '15:00', checkout: '11:00' },
    roomTypes: [
      { id:'presidencial', name:'Suite Presidencial', price:1850, capacity:4, bed:'King + sofá', size:92, image:'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=85', description:'Un refugio excepcional con sala privada, vistas a la ciudad y detalles hechos para una estancia memorable.' },
      { id:'deluxe', name:'Suite Deluxe', price:1180, capacity:3, bed:'King', size:58, image:'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=85', description:'Amplitud serena, textiles nobles y una atmósfera cálida para descansar a tu ritmo.' },
      { id:'premium', name:'Habitación Premium', price:790, capacity:2, bed:'Queen', size:38, image:'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=85', description:'Diseño contemporáneo, luz natural y todas las comodidades para una pausa perfecta.' },
      { id:'standard', name:'Habitación Estándar', price:520, capacity:2, bed:'Queen', size:28, image:'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=85', description:'Una habitación acogedora y cuidada, con todo lo esencial para sentirte como en casa.' }
    ],
    rooms: [
      {id:'r1',number:'101',type:'standard',status:'Disponible',cleaned:offset(-1)},
      {id:'r2',number:'102',type:'standard',status:'Ocupada',cleaned:offset(-2)},
      {id:'r3',number:'201',type:'premium',status:'Disponible',cleaned:offset(0)},
      {id:'r4',number:'202',type:'premium',status:'Limpieza',cleaned:offset(-1)},
      {id:'r5',number:'301',type:'deluxe',status:'Ocupada',cleaned:offset(-2)},
      {id:'r6',number:'302',type:'deluxe',status:'Disponible',cleaned:offset(0)},
      {id:'r7',number:'401',type:'presidencial',status:'Mantenimiento',cleaned:offset(-4)},
      {id:'r8',number:'402',type:'presidencial',status:'Disponible',cleaned:offset(0)},
      {id:'r9',number:'203',type:'premium',status:'Disponible',cleaned:offset(-1)},
      {id:'r10',number:'103',type:'standard',status:'Disponible',cleaned:offset(0)}
    ],
    clients: [
      {id:'c1',name:'Mariana Torres',email:'mariana.torres@email.com',phone:'+591 701 48216',country:'Bolivia'},
      {id:'c2',name:'Santiago Rojas',email:'s.rojas@email.com',phone:'+56 9 5512 4701',country:'Chile'},
      {id:'c3',name:'Valentina Cruz',email:'valentina.cruz@email.com',phone:'+54 11 3422 9810',country:'Argentina'},
      {id:'c4',name:'Andrés Navarro',email:'andres.navarro@email.com',phone:'+57 310 522 8182',country:'Colombia'},
      {id:'c5',name:'Lucía Fernández',email:'lucia.fernandez@email.com',phone:'+51 987 221 964',country:'Perú'},
      {id:'c6',name:'Daniel Kim',email:'daniel.kim@email.com',phone:'+1 415 555 0149',country:'Estados Unidos'},
      {id:'c7',name:'Camila Vargas',email:'camila.vargas@email.com',phone:'+591 765 11290',country:'Bolivia'},
      {id:'c8',name:'Mateo Silva',email:'mateo.silva@email.com',phone:'+55 11 99102 8812',country:'Brasil'},
      {id:'c9',name:'Isabella Moretti',email:'isabella.moretti@email.com',phone:'+39 347 129 8042',country:'Italia'},
      {id:'c10',name:'Diego Paredes',email:'diego.paredes@email.com',phone:'+593 98 411 0203',country:'Ecuador'}
    ],
    employees: [
      {id:'e1',name:'Elena Salazar',position:'Gerente general',email:'elena@auriahotel.com',status:'Activo',lastAccess:offset(0)},
      {id:'e2',name:'Nicolás Vega',position:'Recepción',email:'nicolas@auriahotel.com',status:'Activo',lastAccess:offset(0)},
      {id:'e3',name:'Ana Beltrán',position:'Atención al huésped',email:'ana@auriahotel.com',status:'Activo',lastAccess:offset(-1)},
      {id:'e4',name:'Gabriel Molina',position:'Conserjería',email:'gabriel@auriahotel.com',status:'Activo',lastAccess:offset(-2)},
      {id:'e5',name:'Paula Ríos',position:'Housekeeping',email:'paula@auriahotel.com',status:'Inactivo',lastAccess:offset(-12)}
    ],
    inquiries: [
      {id:'msg1',name:'Mariana Torres',email:'mariana.torres@email.com',subject:'Restaurante y experiencias',message:'Hola, quisiera saber si tienen opciones vegetarianas para el almuerzo. Muchas gracias.',date:offset(0),status:'Nuevo'},
      {id:'msg2',name:'Santiago Rojas',email:'s.rojas@email.com',subject:'Información general',message:'Me gustaría conocer los detalles del servicio de traslado desde el aeropuerto.',date:offset(-1),status:'Nuevo'},
      {id:'msg3',name:'Camila Vargas',email:'camila.vargas@email.com',subject:'Eventos y celebraciones',message:'Estamos buscando un espacio para una pequeña celebración familiar. ¿Podrían compartir información?',date:offset(-2),status:'Leído'}
    ]
  };
  let data;
  try { data = JSON.parse(localStorage.getItem(key)); } catch { data = null; }
  if (!data || !data.roomTypes || !data.clients) { data = structuredClone(initial); localStorage.setItem(key, JSON.stringify(data)); }
  if (!data.inquiries) data.inquiries = structuredClone(initial.inquiries);
  if (data.settings.email === 'reservas@auriahotel.com') data.settings.email = 'hola@auriahotel.com';
  data.clients.forEach((client,index) => { if(client.visits === undefined) client.visits = 1 + index % 5; if(!client.lastVisit) client.lastVisit = offset(-2-index*3); });
  data.employees.forEach(employee => { if(employee.position === 'Reservas') employee.position = 'Atención al huésped'; });
  localStorage.setItem(key, JSON.stringify(data));
  const save = () => localStorage.setItem(key, JSON.stringify(data));
  const refresh = () => {
    const latest=JSON.parse(localStorage.getItem(key) || 'null');
    if(latest) { Object.keys(data).forEach(k=>delete data[k]); Object.assign(data,latest); }
    return data;
  };
  const transaction = action => {
    const next=JSON.parse(localStorage.getItem(key) || JSON.stringify(data));
    const result=action(next);
    next.updatedAt=new Date().toISOString();
    localStorage.setItem(key,JSON.stringify(next));
    Object.keys(data).forEach(k=>delete data[k]);Object.assign(data,next);
    return result;
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = amount => new Intl.NumberFormat('es-BO',{style:'currency',currency:data.settings.currency || 'BOB',minimumFractionDigits:2,maximumFractionDigits:2}).format(amount || 0);
  const date = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString('es-BO',{day:'2-digit',month:'short',year:'numeric'}) : '—';
  const type = id => data.roomTypes.find(item => item.id === id);
  const room = id => data.rooms.find(item => item.id === id);
  const client = id => data.clients.find(item => item.id === id);
  const uid = prefix => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2,5)}`;
  const applySettings = () => {
    document.querySelectorAll('.brand > span:last-child').forEach(el => { if (el.firstChild) el.firstChild.textContent = data.settings.name; });
    document.querySelectorAll('a[href^="mailto:"]').forEach(el => { el.textContent = data.settings.email; el.href = `mailto:${data.settings.email}`; });
    document.querySelectorAll('a[href^="tel:"]').forEach(el => { el.textContent = data.settings.phone; el.href = `tel:${data.settings.phone.replace(/[^+\d]/g,'')}`; });
    const address = document.querySelector('.contact-details strong'); if (address) address.textContent = data.settings.address;
    const footerAddress = document.querySelector('.footer-top a[href="#contacto"]'); if (footerAddress) footerAddress.textContent = data.settings.address;
  };
  const toast = (message, kind='success') => { const host = document.getElementById('toasts') || (() => {const el=document.createElement('div'); el.id='toasts'; el.className='toast-host'; document.body.append(el); return el;})(); const item=document.createElement('div'); item.className=`toast ${kind}`; item.setAttribute('role','status'); item.textContent=message; host.append(item); setTimeout(()=>item.remove(),4200); };
  let previousFocus = null;
  const closeModal = () => {
    document.getElementById('modal-root').innerHTML = '';
    document.body.classList.remove('modal-open');
    if (previousFocus?.isConnected) previousFocus.focus({preventScroll:true});
    previousFocus = null;
  };
  const showModal = html => {
    const host = document.getElementById('modal-root');
    if (!host.innerHTML) previousFocus = document.activeElement;
    host.innerHTML = `<div class="modal-backdrop" data-close-modal><div class="modal-panel" role="dialog" aria-modal="true" tabindex="-1">${html}</div></div>`;
    const panel = host.querySelector('.modal-panel');
    panel.setAttribute('aria-label', panel.querySelector('h2')?.textContent || 'Detalles del hotel');
    host.querySelector('.modal-backdrop').addEventListener('click',e=>{if(e.target.hasAttribute('data-close-modal'))closeModal();});
    host.querySelectorAll('button[data-close-modal]').forEach(button=>button.addEventListener('click',closeModal));
    document.body.classList.add('modal-open');
    (panel.querySelector('.modal-close') || panel).focus({preventScroll:true});
  };
  document.addEventListener('keydown', e => {
    const panel=document.querySelector('.modal-panel');if(!panel)return;
    if(e.key==='Escape'){closeModal();return;}
    if(e.key==='Tab'){
      const focusable=[...panel.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]')].filter(el=>!el.disabled);
      const first=focusable[0],last=focusable[focusable.length-1];
      if(!first){e.preventDefault();panel.focus();}
      else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  applySettings();
  return {data, initial, save, refresh, transaction, key, esc, money, date, type, room, client, uid, toast, showModal, closeModal, offset, applySettings};
})();
