const Auth=(()=>{
  const key='auria-demo-session';
  const current=()=>{try{const s=JSON.parse(sessionStorage.getItem(key)||'null');if(!s)return null;const id=s.id||(s.role==='admin'?'e1':'e2');const e=Hotel.data.employees.find(e=>e.id===id);if(!e||e.status!=='Activo'||!e.username)return null;return {id:e.id,name:e.name,role:e.role,username:e.username};}catch{return null;}};
  const login=(username,password)=>{Hotel.refresh();let name=username.trim().toLowerCase();if(name==='empleado'&&password==='empleado123'){name='recepcion1';password='recepcion123';}const e=Hotel.data.employees.find(e=>e.username===name&&e.password===password&&e.status==='Activo');if(!e)return false;sessionStorage.setItem(key,JSON.stringify({id:e.id}));return true;};
  const logout=()=>{sessionStorage.removeItem(key);location.href='login.html';};
  const requireLogin=()=>{if(!current()){location.replace('login.html');return false;}return true;};
  return {current,login,logout,requireLogin,isAdmin:()=>current()?.role==='admin'};
})();
if(document.body.classList.contains('login-page')){
  if(Auth.current())location.replace('dashboard.html');
  const form=document.getElementById('login-form');
  form.addEventListener('submit',e=>{e.preventDefault();if(Auth.login(form.elements.username.value,form.elements.password.value))location.href='dashboard.html';else{document.getElementById('login-error').textContent='Revisa el usuario y la contraseña. La cuenta debe estar activa.';Hotel.toast('No se pudo iniciar sesión.','error');}});
  document.querySelectorAll('[data-demo-user]').forEach(button=>button.addEventListener('click',()=>{form.elements.username.value=button.dataset.demoUser;form.elements.password.value=button.dataset.demoUser==='admin'?'admin123':'recepcion123';document.getElementById('login-error').textContent='';form.querySelector('[type=submit]').focus();}));
  document.getElementById('toggle-password').addEventListener('click',()=>{const field=form.elements.password,show=field.type==='password';field.type=show?'text':'password';document.getElementById('toggle-password').textContent=show?'Ocultar':'Mostrar';});
}
