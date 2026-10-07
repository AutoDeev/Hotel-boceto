const Hotel = (() => {
  const key = 'auria-hotel-demo-v2';
  const today = new Date();
  const offset = n => { const d = new Date(today); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const initial = {
    settings: { name: 'AURIA', email: 'reservas@auriahotel.com', phone: '+591 2 244 8200', address: 'Calle Jaén 722, La Paz, Bolivia', currency: 'BOB', checkin: '15:00', checkout: '11:00' },
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
      {id:'e3',name:'Ana Beltrán',position:'Reservas',email:'ana@auriahotel.com',status:'Activo',lastAccess:offset(-1)},
      {id:'e4',name:'Gabriel Molina',position:'Conserjería',email:'gabriel@auriahotel.com',status:'Activo',lastAccess:offset(-2)},
      {id:'e5',name:'Paula Ríos',position:'Housekeeping',email:'paula@auriahotel.com',status:'Inactivo',lastAccess:offset(-12)}
    ],
    reservations: [
      {id:'AUR-2401',clientId:'c1',roomId:'r2',checkin:offset(-2),checkout:offset(2),guests:2,total:2080,status:'Confirmada',created:offset(-20)},
      {id:'AUR-2402',clientId:'c2',roomId:'r5',checkin:offset(-1),checkout:offset(3),guests:2,total:4720,status:'Confirmada',created:offset(-12)},
      {id:'AUR-2403',clientId:'c3',roomId:'r3',checkin:offset(1),checkout:offset(4),guests:2,total:2370,status:'Pendiente',created:offset(-3)},
      {id:'AUR-2404',clientId:'c4',roomId:'r8',checkin:offset(4),checkout:offset(7),guests:3,total:5550,status:'Confirmada',created:offset(-6)},
      {id:'AUR-2405',clientId:'c5',roomId:'r6',checkin:offset(2),checkout:offset(5),guests:2,total:3540,status:'Pendiente',created:offset(-1)},
      {id:'AUR-2406',clientId:'c6',roomId:'r1',checkin:offset(-15),checkout:offset(-12),guests:1,total:1560,status:'Completada',created:offset(-25)},
      {id:'AUR-2407',clientId:'c7',roomId:'r9',checkin:offset(-9),checkout:offset(-6),guests:2,total:2370,status:'Completada',created:offset(-15)},
      {id:'AUR-2408',clientId:'c8',roomId:'r10',checkin:offset(6),checkout:offset(9),guests:2,total:1560,status:'Cancelada',created:offset(-5)},
      {id:'AUR-2409',clientId:'c9',roomId:'r8',checkin:offset(12),checkout:offset(16),guests:2,total:7400,status:'Confirmada',created:offset(-2)},
      {id:'AUR-2410',clientId:'c10',roomId:'r1',checkin:offset(0),checkout:offset(2),guests:2,total:1040,status:'Pendiente',created:offset(-1)}
    ]
  };
  let data;
  try { data = JSON.parse(localStorage.getItem(key)); } catch { data = null; }
  if (!data || !data.roomTypes || !data.reservations) { data = structuredClone(initial); localStorage.setItem(key, JSON.stringify(data)); }
  const save = () => localStorage.setItem(key, JSON.stringify(data));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = amount => new Intl.NumberFormat('es-BO',{style:'currency',currency:data.settings.currency || 'BOB',maximumFractionDigits:0}).format(amount || 0);
  const date = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString('es-BO',{day:'2-digit',month:'short',year:'numeric'}) : '—';
  const nights = (a,b) => Math.round((new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`))/86400000);
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
  const showModal = html => { const host=document.getElementById('modal-root'); host.innerHTML=`<div class="modal-backdrop" data-close-modal><div class="modal-panel" role="dialog" aria-modal="true">${html}</div></div>`; host.querySelector('.modal-backdrop').addEventListener('click', e=>{if(e.target.hasAttribute('data-close-modal')) closeModal();}); host.querySelectorAll('[data-close-modal]').forEach(el=>{if(!el.classList.contains('modal-backdrop'))el.addEventListener('click',closeModal)}); document.body.classList.add('modal-open'); };
  const closeModal = () => { document.getElementById('modal-root').innerHTML=''; document.body.classList.remove('modal-open'); };
  document.addEventListener('keydown',e=>{if(e.key==='Escape' && document.getElementById('modal-root')?.innerHTML) closeModal();});
  applySettings();
  return {data, initial, save, esc, money, date, nights, type, room, client, uid, toast, showModal, closeModal, offset, applySettings};
})();
