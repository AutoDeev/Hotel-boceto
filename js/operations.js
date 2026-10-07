/* Operations are validated and committed together so a sale cannot leave stock or cash half updated. */
const Operations = (() => {
  const H=Hotel;
  const round=n=>Math.round((Number(n)+Number.EPSILON)*100)/100;
  const local=(value=new Date())=>{const d=new Date(value);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;};
  const day=value=>local(value).slice(0,10);
  const addHours=(value,hours)=>local(new Date(value).getTime()+hours*3600000);
  const activeStatuses=['Pendiente','Confirmada','Hospedado'];
  const number=(value,label,min=0)=>{const n=Number(value);if(!Number.isFinite(n)||n<min)throw Error(`${label}: introduce un importe válido${min>0?' mayor que cero':''}.`);return round(n);};
  const text=(value,label,min=1)=>{const s=String(value||'').trim();if(s.length<min)throw Error(`Completa ${label}.`);return s;};
  const staff=(state,id)=>state.employees.find(e=>e.id===id);
  const authorize=(state,actor,admin=false)=>{const person=staff(state,actor?.id);if(!person||person.status!=='Activo'||!person.username)throw Error('Tu sesión no está activa. Vuelve a iniciar sesión.');if(admin&&person.role!=='admin')throw Error('Acceso restringido: esta acción es exclusiva del administrador.');return person;};
  const log=(state,actor,message)=>{state.activity.unshift({id:H.uid('act'),userId:actor.id,message,date:new Date().toISOString()});state.activity=state.activity.slice(0,120);};
  function migrate(){
    if(H.data.pmsVersion===1)return;
    // Preserve the previous demo before adding operational fields.
    if(!localStorage.getItem('auria-before-operations'))localStorage.setItem('auria-before-operations',JSON.stringify(H.data));
    H.transaction(state=>{
      const now=local(),yesterday=addHours(now,-24);
      const users=[['e1','admin','admin123','admin'],['e2','recepcion1','recepcion123','receptionist'],['e3','recepcion2','recepcion123','receptionist'],['e4','recepcion3','recepcion123','receptionist']];
      users.forEach(([id,username,password,role])=>{let e=state.employees.find(x=>x.id===id);if(!e){e={id,name:role==='admin'?'Elena Salazar':`Recepción ${username.slice(-1)}`,status:'Activo',email:`${username}@auriahotel.com`};state.employees.push(e);}Object.assign(e,{username,password,role,position:role==='admin'?'Administración':'Recepción'});});
      state.rooms.forEach(r=>{r.baseStatus=r.status==='Mantenimiento'?'Mantenimiento':'Disponible';r.price=Number(r.price??state.roomTypes.find(t=>t.id===r.type)?.price??250);});
      const legacy=Array.isArray(state.reservations)?state.reservations:[];
      state.bookings=legacy.filter(r=>state.rooms.some(x=>x.id===r.roomId)&&state.clients.some(x=>x.id===r.clientId)).map(r=>({id:r.id,roomId:r.roomId,guestId:r.clientId,start:`${r.checkin}T15:00`,end:`${r.checkout}T11:00`,guests:r.guests||1,price:r.total||0,status:r.status==='Completada'?'Finalizada':r.status,notes:'Registro conservado de la demostración anterior.',createdBy:'e2',createdAt:r.created||now}));
      if(!state.bookings.length){
        const defs=[['r2','c1',-4,20,'Hospedado'],['r5','c2',-2,36,'Hospedado'],['r3','c3',2,26,'Confirmada'],['r6','c5',24,72,'Confirmada'],['r8','c4',48,96,'Pendiente'],['r1','c6',-72,-48,'Finalizada'],['r9','c7',72,120,'Confirmada'],['r10','c8',96,120,'Cancelada']];
        defs.forEach(([roomId,guestId,start,end,status],i)=>{const r=state.rooms.find(x=>x.id===roomId);if(r)state.bookings.push({id:`AUR-${3101+i}`,roomId,guestId,start:addHours(now,start),end:addHours(now,end),guests:2,price:r.price*Math.max(1,Math.ceil((end-start)/24)),status,notes:i===0?'Salida estimada. Equipaje en recepción.':'',createdBy:'e2',createdAt:addHours(now,-24)});});
      }else{
        state.bookings.forEach(b=>{if(b.status==='Confirmada'&&b.start<=now&&b.end>now)b.status='Hospedado';});
      }
      state.products=[
        {id:'p1',name:'Agua mineral 600 ml',category:'Bebidas',price:8,stock:38,minStock:10,active:true},
        {id:'p2',name:'Gaseosa personal',category:'Bebidas',price:12,stock:22,minStock:8,active:true},
        {id:'p3',name:'Jugo natural',category:'Bebidas',price:15,stock:6,minStock:8,active:true},
        {id:'p4',name:'Sándwich de pollo',category:'Comida',price:25,stock:12,minStock:5,active:true},
        {id:'p5',name:'Desayuno completo',category:'Comida',price:35,stock:18,minStock:6,active:true},
        {id:'p6',name:'Toalla adicional',category:'Amenities',price:20,stock:4,minStock:5,active:true},
        {id:'p7',name:'Kit de higiene',category:'Amenities',price:18,stock:15,minStock:5,active:true},
        {id:'p8',name:'Snack artesanal',category:'Comida',price:10,stock:0,minStock:6,active:false}
      ];
      state.shifts=[
        {id:'CAJ-001',userId:'e2',openedAt:addHours(now,-4),initial:200,status:'Abierta'},
        {id:'CAJ-002',userId:'e3',openedAt:addHours(now,-2),initial:150,status:'Abierta'},
        {id:'CAJ-003',userId:'e4',openedAt:addHours(yesterday,-8),closedAt:yesterday,initial:200,status:'Cerrada',declared:387,notes:'Faltante de Bs 5 registrado al contar el efectivo.'}
      ];
      const occupied=state.bookings.find(b=>b.status==='Hospedado');
      state.sales=[
        {id:'V-1001',shiftId:'CAJ-001',userId:'e2',date:addHours(now,-.02),method:'Efectivo',lines:[{type:'product',productId:'p1',description:'Agua mineral 600 ml',quantity:2,unitPrice:8}],total:16},
        {id:'V-1002',shiftId:'CAJ-001',userId:'e2',date:addHours(now,-.2),method:'Tarjeta',lines:[{type:'product',productId:'p5',description:'Desayuno completo',quantity:2,unitPrice:35}],total:70},
        {id:'V-1003',shiftId:'CAJ-002',userId:'e3',date:addHours(now,-.05),method:'Efectivo',lines:[{type:'other',description:'Servicio de lavandería',quantity:1,unitPrice:45}],total:45},
        {id:'V-0998',shiftId:'CAJ-003',userId:'e4',date:addHours(yesterday,-3),method:'Efectivo',lines:[{type:'other',description:'Servicio de habitación',quantity:1,unitPrice:180},{type:'product',productId:'p2',description:'Gaseosa personal',quantity:1,unitPrice:12}],total:192}
      ];
      if(occupied)state.sales.unshift({id:'V-1004',shiftId:'CAJ-001',userId:'e2',date:addHours(now,-.03),method:'Transferencia',lines:[{type:'room',bookingId:occupied.id,description:`Habitación ${state.rooms.find(r=>r.id===occupied.roomId).number} · ${occupied.id}`,quantity:1,unitPrice:occupied.price}],total:occupied.price});
      state.cashMovements=[{id:'mov1',shiftId:'CAJ-001',userId:'e2',type:'Egreso',amount:25,concept:'Compra de artículos de limpieza',date:addHours(now,-.1)}];
      state.stockMovements=[];state.activity=[{id:'a1',userId:'e2',message:'Recepción inició su turno y abrió caja.',date:addHours(now,-4)},{id:'a2',userId:'e3',message:'Recepción inició un segundo turno.',date:addHours(now,-2)}];
      state.pmsVersion=1;
    });
  }
  migrate();
  const rate=(state,room)=>Number(room.price??state.roomTypes.find(t=>t.id===room.type)?.price??0);
  const overlap=(a,b)=>a.start<b.end&&a.end>b.start;
  function available(state,roomId,start,end,excludeId=''){
    const room=state.rooms.find(r=>r.id===roomId);return !!room&&room.baseStatus!=='Mantenimiento'&&!state.bookings.some(b=>b.id!==excludeId&&b.roomId===roomId&&activeStatuses.includes(b.status)&&overlap({start,end},b));
  }
  function roomState(state,room,at=local()){
    if(room.baseStatus==='Mantenimiento')return {status:'Mantenimiento',booking:null};
    const occupied=state.bookings.find(b=>b.roomId===room.id&&b.status==='Hospedado');
    if(occupied)return {status:'Ocupada',booking:occupied};
    const next=state.bookings.filter(b=>b.roomId===room.id&&['Pendiente','Confirmada'].includes(b.status)&&b.end>at).sort((a,b)=>a.start.localeCompare(b.start))[0];
    return {status:next&&next.start.slice(0,10)<=at.slice(0,10)?'Reservada':'Disponible',booking:next||null};
  }
  const balance=(state,id)=>{const b=state.bookings.find(x=>x.id===id);return round((b?.price||0)-state.sales.flatMap(s=>s.lines).filter(l=>l.bookingId===id).reduce((sum,l)=>sum+l.quantity*l.unitPrice,0));};
  function shiftSummary(state,shift){
    const sales=state.sales.filter(s=>s.shiftId===shift.id),movements=state.cashMovements.filter(m=>m.shiftId===shift.id),total=round(sales.reduce((n,s)=>n+s.total,0));
    const cash=round(sales.filter(s=>s.method==='Efectivo').reduce((n,s)=>n+s.total,0)),card=round(sales.filter(s=>s.method==='Tarjeta').reduce((n,s)=>n+s.total,0)),transfer=round(sales.filter(s=>s.method==='Transferencia').reduce((n,s)=>n+s.total,0));
    const incoming=round(movements.filter(m=>m.type==='Ingreso').reduce((n,m)=>n+m.amount,0)),outgoing=round(movements.filter(m=>m.type==='Egreso').reduce((n,m)=>n+m.amount,0));
    const expected=round(shift.initial+cash+incoming-outgoing),difference=shift.status==='Cerrada'?round(shift.declared-expected):null;
    return {sales,movements,total,cash,card,transfer,incoming,outgoing,expected,difference};
  }
  function saveGuest(actor,input,id){return H.transaction(state=>{authorize(state,actor);const name=text(input.name,'el nombre del huésped',3);const document=text(input.document,'el documento',3);if(state.clients.some(c=>c.id!==id&&c.document===document))throw Error('Ya existe un huésped con ese documento.');const values={name,document,email:String(input.email||'').trim(),phone:text(input.phone,'el teléfono',6),country:input.country||'Bolivia'};let guest=state.clients.find(c=>c.id===id);if(guest)Object.assign(guest,values);else{guest={id:H.uid('c'),...values,visits:0};state.clients.push(guest);}log(state,actor,`Registró los datos de ${name}.`);return guest.id;});}
  function saveBooking(actor,input,id){return H.transaction(state=>{
    authorize(state,actor);const old=state.bookings.find(b=>b.id===id);if(id&&!old)throw Error('No se encontró la reserva.');if(old&&['Finalizada','Cancelada'].includes(old.status))throw Error('Esta reserva ya está cerrada.');
    const start=text(input.start,'la fecha de entrada'),end=text(input.end,'la fecha de salida');if(!Number.isFinite(new Date(start).getTime())||!Number.isFinite(new Date(end).getTime())||end<=start)throw Error('La salida debe ser posterior a la entrada.');
    if(end<=local()&&!old)throw Error('La salida de una nueva estancia debe ser futura.');
    const room=state.rooms.find(r=>r.id===input.roomId);if(!room)throw Error('Selecciona una habitación.');if(!available(state,room.id,start,end,id))throw Error('La habitación no está disponible en esas fechas.');
    const guests=Number(input.guests);if(!Number.isInteger(guests)||guests<1||guests>(state.roomTypes.find(t=>t.id===room.type)?.capacity||2))throw Error('La cantidad de huéspedes supera la capacidad de la habitación.');
    const price=number(input.price,'Precio',.01),status=input.status||'Confirmada';if(!activeStatuses.includes(status))throw Error('Estado no válido.');
    if(status==='Hospedado'&&(start>local()||end<=local()))throw Error('El ingreso debe estar dentro de las fechas de la estancia.');
    if(old?.status==='Hospedado'&&status!=='Hospedado')throw Error('Utiliza Registrar salida para finalizar una estancia.');
    if(status==='Hospedado'&&state.bookings.some(b=>b.id!==id&&b.roomId===room.id&&b.status==='Hospedado'))throw Error('La habitación todavía tiene un huésped alojado.');
    if(old&&price<old.price-balance(state,old.id))throw Error('El precio no puede ser menor a los cobros ya registrados.');
    let guestId=input.guestId;
    if(input.newGuest){const g=input.newGuest,name=text(g.name,'el nombre del huésped',3),document=text(g.document,'el documento',3),phone=text(g.phone,'el teléfono',6);const existing=state.clients.find(c=>c.document===document);if(existing)guestId=existing.id;else{guestId=H.uid('c');state.clients.push({id:guestId,name,document,phone,email:g.email||'',country:g.country||'Bolivia',visits:0});}}
    if(!state.clients.some(c=>c.id===guestId))throw Error('Selecciona o registra un huésped.');
    const values={roomId:room.id,guestId,start,end,guests,price,status,notes:String(input.notes||'').trim()};
    const booking=old||{id:H.uid('AUR-').toUpperCase(),createdBy:actor.id,createdAt:new Date().toISOString()};Object.assign(booking,values);if(!old)state.bookings.unshift(booking);log(state,actor,`${old?'Actualizó':'Creó'} la reserva de habitación ${room.number}.`);return booking.id;
  });}
  function bookingAction(actor,id,action){return H.transaction(state=>{authorize(state,actor);const b=state.bookings.find(x=>x.id===id);if(!b)throw Error('Reserva no encontrada.');if(action==='cancel'){if(!['Pendiente','Confirmada'].includes(b.status))throw Error('Solo se pueden cancelar reservas pendientes o confirmadas.');if(balance(state,id)<b.price)throw Error('Esta reserva tiene cobros. Requiere resolverlos antes de cancelar.');b.status='Cancelada';}else if(action==='checkin'){if(!['Pendiente','Confirmada'].includes(b.status)||b.end<=local()||b.start>local())throw Error('El ingreso solo está habilitado dentro de las fechas de la reserva.');if(state.rooms.find(r=>r.id===b.roomId)?.baseStatus==='Mantenimiento')throw Error('La habitación está en mantenimiento.');if(state.bookings.some(x=>x.id!==id&&x.roomId===b.roomId&&x.status==='Hospedado'))throw Error('La habitación todavía tiene un huésped alojado.');b.status='Hospedado';}else if(action==='checkout'){if(b.status!=='Hospedado')throw Error('El huésped no tiene un ingreso registrado.');if(balance(state,id)>0)throw Error('Registra el cobro pendiente antes de finalizar la estancia.');b.status='Finalizada';b.actualCheckout=local();const guest=state.clients.find(c=>c.id===b.guestId);guest.visits=(guest.visits||0)+1;guest.lastVisit=day(new Date());}else throw Error('Acción no válida.');log(state,actor,`${action==='cancel'?'Canceló':action==='checkin'?'Registró el ingreso de':'Finalizó'} ${b.id}.`);});}
  function saveRoom(actor,input,id){return H.transaction(state=>{authorize(state,actor,true);const room=state.rooms.find(r=>r.id===id),numberValue=text(input.number,'el número');if(state.rooms.some(r=>r.id!==id&&r.number===numberValue))throw Error('Ese número de habitación ya existe.');if(!state.roomTypes.some(t=>t.id===input.type))throw Error('Selecciona un tipo válido.');if(!['Disponible','Mantenimiento'].includes(input.baseStatus))throw Error('Estado no válido.');if(input.baseStatus==='Mantenimiento'&&state.bookings.some(b=>b.roomId===id&&activeStatuses.includes(b.status)&&(b.status==='Hospedado'||b.end>local())))throw Error('La habitación tiene estancias activas o futuras. Reasígnalas antes de marcar mantenimiento.');const values={number:numberValue,type:input.type,price:number(input.price,'Tarifa',.01),baseStatus:input.baseStatus};if(room)Object.assign(room,values);else state.rooms.push({id:H.uid('r'),...values});log(state,actor,`Actualizó la habitación ${numberValue}.`);});}
  function removeRoom(actor,id){return H.transaction(state=>{authorize(state,actor,true);if(state.bookings.some(b=>b.roomId===id))throw Error('La habitación tiene historial de estancias; puedes ponerla en mantenimiento.');state.rooms=state.rooms.filter(r=>r.id!==id);log(state,actor,'Eliminó una habitación sin historial.');});}
  function saveProduct(actor,input,id){return H.transaction(state=>{authorize(state,actor,true);const existing=state.products.find(p=>p.id===id),name=text(input.name,'el nombre del producto',2);const values={name,category:text(input.category,'la categoría'),price:number(input.price,'Precio',.01),minStock:number(input.minStock,'Stock mínimo'),active:!!input.active};if(!Number.isInteger(values.minStock))throw Error('El stock mínimo debe ser entero.');if(existing)Object.assign(existing,values);else{const stock=number(input.stock,'Stock');if(!Number.isInteger(stock))throw Error('El stock debe ser entero.');state.products.push({id:H.uid('p'),...values,stock});}log(state,actor,`Actualizó el producto ${name}.`);});}
  function stockMove(actor,input){return H.transaction(state=>{authorize(state,actor,true);const p=state.products.find(p=>p.id===input.productId);if(!p)throw Error('Producto no encontrado.');const quantity=number(input.quantity,'Cantidad',1);if(!Number.isInteger(quantity))throw Error('La cantidad debe ser entera.');if(!['Entrada','Salida'].includes(input.type))throw Error('Movimiento no válido.');if(input.type==='Salida'&&quantity>p.stock)throw Error('No hay stock suficiente.');const concept=text(input.concept,'el motivo',3);p.stock+=input.type==='Entrada'?quantity:-quantity;state.stockMovements.unshift({id:H.uid('stk'),productId:p.id,type:input.type,quantity,concept,userId:actor.id,date:new Date().toISOString()});log(state,actor,`${input.type} de ${quantity} unidades de ${p.name}.`);});}
  function openShift(actor,initial){return H.transaction(state=>{authorize(state,actor);if(state.shifts.some(s=>s.userId===actor.id&&s.status==='Abierta'))throw Error('Ya tienes una caja abierta.');const shift={id:H.uid('CAJ-').toUpperCase(),userId:actor.id,openedAt:new Date().toISOString(),initial:number(initial,'Monto inicial'),status:'Abierta'};state.shifts.unshift(shift);log(state,actor,'Abrió su caja.');return shift.id;});}
  function recordSale(actor,input){return H.transaction(state=>{
    authorize(state,actor);const shift=state.shifts.find(s=>s.userId===actor.id&&s.status==='Abierta');if(!shift)throw Error('Abre tu caja antes de registrar una venta.');if(!['Efectivo','Tarjeta','Transferencia'].includes(input.method))throw Error('Selecciona el método de pago.');if(!Array.isArray(input.lines)||!input.lines.length)throw Error('Agrega al menos un concepto a la venta.');
    const productTotals={},bookingTotals={};
    const lines=input.lines.map(line=>{const quantity=Number(line.quantity||1);if(!Number.isInteger(quantity)||quantity<1)throw Error('Las cantidades deben ser enteras y positivas.');if(line.type==='product'){const p=state.products.find(p=>p.id===line.productId);if(!p||!p.active)throw Error('Uno de los productos no está disponible.');productTotals[p.id]=(productTotals[p.id]||0)+quantity;return {type:'product',productId:p.id,description:p.name,quantity,unitPrice:p.price};}if(line.type==='room'){const b=state.bookings.find(b=>b.id===line.bookingId);if(!b||!activeStatuses.includes(b.status))throw Error('La estancia ya no está activa.');const amount=number(line.unitPrice,'Cobro de habitación',.01);bookingTotals[b.id]=(bookingTotals[b.id]||0)+amount*quantity;return {type:'room',bookingId:b.id,description:`Habitación ${state.rooms.find(r=>r.id===b.roomId)?.number} · ${b.id}`,quantity,unitPrice:amount};}if(line.type==='other')return {type:'other',description:text(line.description,'el concepto',3),quantity,unitPrice:number(line.unitPrice,'Importe',.01)};throw Error('Concepto no válido.');});
    Object.entries(productTotals).forEach(([id,quantity])=>{const p=state.products.find(p=>p.id===id);if(quantity>p.stock)throw Error(`Stock insuficiente: ${p.name} (${p.stock} disponibles).`);});
    Object.entries(bookingTotals).forEach(([id,total])=>{if(round(total)>balance(state,id))throw Error('El cobro supera el saldo pendiente de la habitación.');});
    const sale={id:H.uid('V-').toUpperCase(),shiftId:shift.id,userId:actor.id,date:new Date().toISOString(),method:input.method,lines,total:round(lines.reduce((sum,l)=>sum+l.quantity*l.unitPrice,0))};
    Object.entries(productTotals).forEach(([id,quantity])=>{state.products.find(p=>p.id===id).stock-=quantity;state.stockMovements.unshift({id:H.uid('stk'),productId:id,type:'Salida',quantity,concept:`Venta ${sale.id}`,userId:actor.id,date:sale.date});});state.sales.unshift(sale);log(state,actor,`Registró una venta de ${H.money(sale.total)}.`);return sale.id;
  });}
  function cashMove(actor,input){return H.transaction(state=>{authorize(state,actor);const shift=state.shifts.find(s=>s.id===input.shiftId);if(!shift||shift.status!=='Abierta'||shift.userId!==actor.id)throw Error('Solo puedes registrar movimientos en tu caja abierta.');if(!['Ingreso','Egreso'].includes(input.type))throw Error('Movimiento no válido.');const amount=number(input.amount,'Importe',.01);if(input.type==='Egreso'&&amount>shiftSummary(state,shift).expected)throw Error('El egreso supera el efectivo esperado en caja.');state.cashMovements.unshift({id:H.uid('mov'),shiftId:shift.id,userId:actor.id,type:input.type,amount,concept:text(input.concept,'el motivo',3),date:new Date().toISOString()});log(state,actor,`Registró un ${input.type.toLowerCase()} de caja.`);});}
  function closeShift(actor,id,declared,notes){return H.transaction(state=>{const person=authorize(state,actor),shift=state.shifts.find(s=>s.id===id);if(!shift||shift.status!=='Abierta')throw Error('La caja ya está cerrada.');if(shift.userId!==actor.id&&person.role!=='admin')throw Error('Solo puedes cerrar tu propia caja.');const amount=number(declared,'Efectivo contado'),summary=shiftSummary(state,shift);if(round(amount-summary.expected)!==0&&!String(notes||'').trim())throw Error('Explica la diferencia en las observaciones del cierre.');Object.assign(shift,{status:'Cerrada',declared:amount,closedAt:new Date().toISOString(),closedBy:actor.id,notes:String(notes||'').trim()});log(state,actor,`Cerró la caja ${shift.id}.`);return id;});}
  function saveSettings(actor,input){return H.transaction(state=>{authorize(state,actor,true);state.settings={...state.settings,name:text(input.name,'el nombre del hotel'),email:text(input.email,'el correo'),phone:text(input.phone,'el teléfono'),address:text(input.address,'la dirección'),checkin:input.checkin,checkout:input.checkout};log(state,actor,'Actualizó la configuración del hotel.');});}
  function saveEmployee(actor,input,id){return H.transaction(state=>{authorize(state,actor,true);const e=state.employees.find(x=>x.id===id),username=text(input.username,'el usuario',3).toLowerCase();if(state.employees.some(x=>x.id!==id&&x.username===username))throw Error('El usuario ya existe.');if(id===actor.id&&(input.status!=='Activo'||input.role!=='admin'))throw Error('No puedes desactivar ni quitar el acceso de tu propia cuenta.');if(input.status==='Inactivo'&&state.shifts.some(s=>s.userId===id&&s.status==='Abierta'))throw Error('Cierra la caja de esta persona antes de desactivarla.');const values={name:text(input.name,'el nombre',3),email:text(input.email,'el correo'),username,role:input.role==='admin'?'admin':'receptionist',position:input.role==='admin'?'Administración':'Recepción',status:input.status==='Inactivo'?'Inactivo':'Activo'};if(input.password)values.password=text(input.password,'una contraseña de al menos 6 caracteres',6);if(e)Object.assign(e,values);else{if(!values.password)throw Error('Define una contraseña de demostración.');state.employees.push({id:H.uid('e'),...values});}log(state,actor,`Actualizó el acceso de ${values.name}.`);});}
  return {round,local,day,addHours,rate,activeStatuses,available,roomState,balance,shiftSummary,saveGuest,saveBooking,bookingAction,saveRoom,removeRoom,saveProduct,stockMove,openShift,recordSale,cashMove,closeShift,saveSettings,saveEmployee};
})();
