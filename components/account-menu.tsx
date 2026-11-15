'use client';
export default function AccountMenu({email,role,demo=false}:{email:string;role:string;demo?:boolean}){
 return <div className="account-menu"><div><b>{role==='admin'?'Administradora':'Consulta'}</b><span>{email}</span></div>{role==='admin'&&<a href={demo?'/muestra?view=admin':'/admin'}>Administración</a>}<a href="/privacidad">Privacidad</a><button onClick={async()=>{if(demo){location.href='/muestra';return;}const r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});if(r.ok)location.href='/acceso';}}>Cerrar sesión</button></div>;
}
