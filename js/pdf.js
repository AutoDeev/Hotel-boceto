/* Self-contained PDF writer: standard PDF fonts, WinAnsi Spanish text, automatic pagination. */
const CashPDF=(()=>{
  const esc=value=>String(value??'').normalize('NFC').replace(/[\u2010-\u2015]/g,'-').replace(/\u2022/g,'·').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/\u2026/g,'...').replace(/[^\x20-\x7e\xa0-\xff]/g,'?').replace(/([\\()])/g,'\\$1');
  const cash=n=>`Bs ${Number(n||0).toLocaleString('es-BO',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const date=v=>v?new Date(v).toLocaleString('es-BO',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'-';
  function build(state,id){
    const shift=state.shifts.find(s=>s.id===id);if(!shift||shift.status!=='Cerrada')throw Error('El PDF estará disponible cuando la caja esté cerrada.');
    const q=Operations.shiftSummary(state,shift),employee=state.employees.find(e=>e.id===shift.userId),pages=[];
    let content='',y=0;
    const c={ink:'0.15 0.18 0.27',muted:'0.40 0.44 0.53',purple:'0.39 0.31 0.69',line:'0.88 0.89 0.93',green:'0.14 0.43 0.33',red:'0.68 0.25 0.30'};
    const rect=(x,top,w,h,color)=>{content+=`${color} rg ${x} ${842-top-h} ${w} ${h} re f\n`;};
    const text=(value,x,top,size=10,bold=false,color=c.ink)=>{content+=`BT /${bold?'F2':'F1'} ${size} Tf ${color} rg 1 0 0 1 ${x} ${842-top-size} Tm (${esc(value)}) Tj ET\n`;};
    const line=(top)=>{content+=`${c.line} RG 0.6 w 44 ${842-top} m 551 ${842-top} l S\n`;};
    const wrap=(value,max=84)=>{const words=String(value||'').replace(/\s+/g,' ').trim().match(new RegExp(`.{1,${max}}(\\s|$)|.{1,${max}}`,'g'));return (words||['-']).map(w=>w.trim());};
    function begin(){content='';rect(44,35,29,29,c.purple);text('A',52,37,21,true,'1 1 1');text(String(state.settings.name).slice(0,45),83,35,14,true);text('HOTEL MANAGER / CONTROL DE CAJA',83,53,7,false,c.muted);text('REPORTE DE CIERRE',418,41,9,true,c.purple);line(80);y=99;}
    function finish(){line(787);text('AURIA Hotel Manager · Reporte de demostración',44,799,8,false,c.muted);text(`Página ${pages.length+1}`,504,799,8,false,c.muted);pages.push(content);}
    function ensure(height){if(y+height>766){finish();begin();text('Cierre de caja / continuación',44,y,12,true);text(shift.id,375,y,8,false,c.muted);y+=34;}}
    function paragraph(value,size=10,color=c.ink,max=88){const lines=wrap(value,max);lines.forEach(t=>{ensure(17);text(t,44,y,size,false,color);y+=17;});}
    function section(title){ensure(49);y+=16;text(title.toUpperCase(),44,y,10,true,c.purple);y+=24;}
    function row(label,value,bold=false,color=c.ink){ensure(29);text(label,44,y,10,bold,c.muted);text(value,421,y,10,bold,color);y+=26;line(y-7);}
    begin();text('Cierre de caja',44,y,27,true);y+=38;text(shift.id,44,y,10,false,c.muted);text(`Fecha de cierre: ${date(shift.closedAt)}`,314,y,9,false,c.muted);y+=29;
    paragraph(`Responsable: ${employee?.name||'Usuario'}`,11);paragraph(`Apertura: ${date(shift.openedAt)}     |     Cierre: ${date(shift.closedAt)}`,9,c.muted);y+=17;
    const metrics=[['TOTAL VENDIDO',cash(q.total)],['EFECTIVO ESPERADO',cash(q.expected)],['EFECTIVO DECLARADO',cash(shift.declared)]];
    metrics.forEach(([label,value],i)=>{const x=44+i*173;rect(x,y,161,62,'0.96 0.95 0.99');text(label,x+12,y+12,7,true,c.muted);text(value,x+12,y+29,17,true,c.purple);});y+=80;
    rect(44,y,507,31,q.difference?'0.99 0.94 0.94':'0.92 0.97 0.94');text(q.difference?'CIERRE CON DIFERENCIA':'CAJA CONCILIADA',56,y+9,9,true,q.difference?c.red:c.green);text(`Diferencia: ${cash(q.difference)}`,374,y+9,9,true,q.difference?c.red:c.green);y+=39;
    section('Conciliación de efectivo');row('Monto inicial',cash(shift.initial));row('Ventas cobradas en efectivo',cash(q.cash));row('Otros ingresos de efectivo',`+ ${cash(q.incoming)}`);row('Egresos de efectivo',`- ${cash(q.outgoing)}`);row('Efectivo esperado al cierre',cash(q.expected),true);row('Efectivo contado / declarado',cash(shift.declared),true);row('Diferencia (declarado - esperado)',cash(q.difference),true,q.difference?c.red:c.green);
    y+=6;paragraph(`Cobros por tarjeta: ${cash(q.card)}  |  Transferencias: ${cash(q.transfer)}`,9,c.muted);paragraph('Estos cobros integran las ventas, pero no el efectivo de caja.',9,c.muted);
    section(`Ventas realizadas (${q.sales.length})`);
    if(!q.sales.length)paragraph('No se registraron ventas en este turno.',10,c.muted);
    [...q.sales].sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(s=>{
      ensure(63);text(s.id,44,y,10,true);text(cash(s.total),447,y,10,true,c.purple);y+=17;paragraph(`${date(s.date)} · ${s.method}`,8,c.muted);
      s.lines.forEach(l=>{const details=`${l.quantity} x ${l.description}  /  ${cash(l.unitPrice)} c/u  =  ${cash(l.quantity*l.unitPrice)}`;paragraph(details,9,c.ink,91);});y+=4;line(y);y+=14;
    });
    section('Otros movimientos');if(!q.movements.length)paragraph('Sin movimientos adicionales.',10,c.muted);q.movements.forEach(m=>{ensure(45);text(`${m.type}: ${cash(m.amount)} · ${date(m.date)}`,44,y,10,true);y+=18;paragraph(m.concept,9,c.muted);y+=5;});
    section('Resumen final');paragraph(`El turno finalizó con ${cash(q.total)} en ventas y ${cash(shift.declared)} de efectivo declarado. ${q.difference===0?'El efectivo coincide con el monto esperado.':q.difference>0?`Se registró un sobrante de ${cash(q.difference)}.`:`Se registró un faltante de ${cash(Math.abs(q.difference))}.`}`);
    if(shift.notes){section('Observaciones del cierre');paragraph(shift.notes);}
    ensure(75);y+=25;line(y);text(`Cierre registrado por: ${state.employees.find(e=>e.id===shift.closedBy)?.name||employee?.name||'Usuario'}`,44,y+12,9,false,c.muted);finish();
    const objects=['<< /Type /Catalog /Pages 2 0 R >>','', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'];
    const pageIds=[];pages.forEach(stream=>{const pageId=objects.length+1,streamId=pageId+1;pageIds.push(pageId);objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${streamId} 0 R >>`);objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);});objects[1]=`<< /Type /Pages /Kids [${pageIds.map(id=>`${id} 0 R`).join(' ')}] /Count ${pages.length} >>`;
    let pdf='%PDF-1.4\n%\xE2\xE3\xCF\xD3\n',offsets=[0];objects.forEach((object,i)=>{offsets.push(pdf.length);pdf+=`${i+1} 0 obj\n${object}\nendobj\n`;});const xref=pdf.length;pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n${offsets.slice(1).map(offset=>`${String(offset).padStart(10,'0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return Uint8Array.from(pdf,ch=>ch.charCodeAt(0));
  }
  function download(id){Hotel.refresh();const actor=Auth.current(),s=Hotel.data.shifts.find(s=>s.id===id);if(!actor||!s||(actor.role!=='admin'&&s.userId!==actor.id))throw Error('No tienes permiso para consultar este reporte.');const bytes=build(Hotel.data,id),blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`cierre-${id}-${Operations.day(s.closedAt)}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
  return {build,download};
})();
