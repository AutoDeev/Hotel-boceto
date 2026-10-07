const Auth = (() => {
  const users = {admin:{password:'admin123',role:'admin',name:'Administrador'},empleado:{password:'empleado123',role:'empleado',name:'Empleado'}};
  const sessionKey='auria-demo-session';
  const current=()=>{try{return JSON.parse(sessionStorage.getItem(sessionKey))}catch{return null}};
  const login=(username,password)=>{const account=users[username.trim().toLowerCase()];if(!account || account.password!==password)return false;sessionStorage.setItem(sessionKey,JSON.stringify({username:username.trim().toLowerCase(),role:account.role,name:account.name}));return true};
  const logout=()=>{sessionStorage.removeItem(sessionKey);location.href='login.html'};
  const requireLogin=()=>{if(!current()){location.replace('login.html');return false}return true};
  const isAdmin=()=>current()?.role==='admin';
  return {current,login,logout,requireLogin,isAdmin};
})();

if(document.body.classList.contains('login-page')){
  if(Auth.current()) location.replace('dashboard.html');
  const form=document.getElementById('login-form');
  form.addEventListener('submit',e=>{e.preventDefault();const username=form.username.value;const password=form.password.value;if(Auth.login(username,password)){location.href='dashboard.html'}else{document.getElementById('login-error').textContent='Usuario o contraseña incorrectos.';Hotel.toast('Credenciales incorrectas.','error')}});
  document.querySelectorAll('[data-demo-user]').forEach(btn=>btn.addEventListener('click',()=>{const account=btn.dataset.demoUser;form.username.value=account;form.password.value=account==='admin'?'admin123':'empleado123';form.querySelector('button[type="submit"]').focus()}));
  document.getElementById('toggle-password').addEventListener('click',()=>{const input=form.password;input.type=input.type==='password'?'text':'password'});
}
