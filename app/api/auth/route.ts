import {AccessError,accessError,assertSameOrigin,bearerOrCookie} from '../../../lib/access';
import {supabase,getSession,sessionHeaders,clearSessionHeaders} from '../../../lib/supabase-server';
type AuthSession={access_token:string;expires_in:number};
export async function GET(request:Request){try{const s=await getSession(bearerOrCookie(request));return Response.json({email:s.user.email,role:s.member.role,aal:s.aal},{headers:{'Cache-Control':'no-store'}});}catch(e){return accessError(e);}}
export async function POST(request:Request){try{
 assertSameOrigin(request);
 const raw=await request.text();if(raw.length>8192)throw new AccessError(413,'Solicitud demasiado grande.');
 const b=JSON.parse(raw);const token=bearerOrCookie(request);
 if(b.action==='logout'){
   if(token)try{await supabase('/auth/v1/logout',token,{method:'POST'});}catch{/* Always clear this browser's cookie. */}
   return Response.json({ok:true},{headers:clearSessionHeaders});
 }
 if(b.action==='login'){
   if(typeof b.email!=='string'||typeof b.password!=='string')throw new AccessError(400,'Completa correo y contraseña.');
   const s=await supabase<AuthSession>('/auth/v1/token?grant_type=password',undefined,{method:'POST',body:JSON.stringify({email:b.email,password:b.password})});
   await getSession(s.access_token);
   return Response.json({ok:true},{headers:sessionHeaders(s.access_token,s.expires_in)});
 }
 if(b.action==='signup'){
   if(typeof b.email!=='string'||typeof b.password!=='string'||b.password.length<12)throw new AccessError(400,'Usa un correo válido y una contraseña de al menos 12 caracteres.');
   await supabase('/auth/v1/signup',undefined,{method:'POST',body:JSON.stringify({email:b.email,password:b.password})});
   return Response.json({message:'Si el correo es válido, recibirás un código. Después de confirmarlo, tu cuenta requiere aprobación.'},{headers:{'Cache-Control':'no-store'}});
 }
 if(b.action==='confirm'){
   if(typeof b.email!=='string'||!/^\d{6,10}$/.test(b.code))throw new AccessError(400,'Revisa el correo y el código.');
   await supabase('/auth/v1/verify',undefined,{method:'POST',body:JSON.stringify({email:b.email,token:b.code,type:'signup'})});
   return Response.json({message:'Correo confirmado. Tu acceso queda pendiente de aprobación.'},{headers:clearSessionHeaders});
 }
 if(b.action==='recover'){
   if(typeof b.email!=='string'||!b.email.includes('@'))throw new AccessError(400,'Escribe tu correo.');
   try{await supabase('/auth/v1/recover',undefined,{method:'POST',body:JSON.stringify({email:b.email})});}catch(e){if(e instanceof AccessError&&[429,503].includes(e.status))throw e;}
   return Response.json({message:'Si existe una cuenta, recibirás un código para restablecer tu contraseña.'},{headers:{'Cache-Control':'no-store'}});
 }
 if(b.action==='reset'){
   if(typeof b.email!=='string'||!/^\d{6,10}$/.test(b.code)||typeof b.password!=='string'||b.password.length<12)throw new AccessError(400,'Revisa el código y usa al menos 12 caracteres.');
   const s=await supabase<AuthSession>('/auth/v1/verify',undefined,{method:'POST',body:JSON.stringify({email:b.email,token:b.code,type:'recovery'})});
   await supabase('/auth/v1/user',s.access_token,{method:'PUT',body:JSON.stringify({password:b.password})});
   await supabase('/auth/v1/logout',s.access_token,{method:'POST'});
   return Response.json({message:'Contraseña actualizada. Inicia sesión de nuevo.'},{headers:clearSessionHeaders});
 }
 const session=await getSession(token);
 if(session.member.role!=='admin')throw new AccessError(403,'Acceso reservado a administración.');
 if(b.action==='mfa-factors'){
   const user=await supabase<{factors?:{id:string;status:string;factor_type:string}[]}>('/auth/v1/user',token);
   return Response.json({factors:(user.factors||[]).filter(f=>f.factor_type==='totp')},{headers:{'Cache-Control':'no-store'}});
 }
 if(b.action==='mfa-enroll'){
   const f=await supabase<{id:string;totp:{secret:string;uri:string}}>('/auth/v1/factors',token,{method:'POST',body:JSON.stringify({factor_type:'totp',friendly_name:'SUR18 Administración'})});
   return Response.json({id:f.id,secret:f.totp.secret},{headers:{'Cache-Control':'no-store'}});
 }
 if(b.action==='mfa-verify'){
   if(!/^[a-f0-9-]{36}$/.test(b.factorId)||!/^\d{6}$/.test(b.code))throw new AccessError(400,'Código de verificación inválido.');
   const challenge=await supabase<{id:string}>(`/auth/v1/factors/${b.factorId}/challenge`,token,{method:'POST',body:'{}'});
   const s=await supabase<AuthSession>(`/auth/v1/factors/${b.factorId}/verify`,token,{method:'POST',body:JSON.stringify({challenge_id:challenge.id,code:b.code})});
   return Response.json({ok:true},{headers:sessionHeaders(s.access_token,s.expires_in)});
 }
 throw new AccessError(400,'Operación desconocida.');
}catch(e){return accessError(e);}}
