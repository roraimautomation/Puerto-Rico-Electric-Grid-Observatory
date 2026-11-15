import {env} from 'cloudflare:workers';
import {cookies} from 'next/headers';
import {AccessError,assertApproved,bearerOrCookie,type Member} from './access';

export const SESSION_COOKIE='__Host-sur18_access';
export function config() {
  const url=env.SUPABASE_URL, key=env.SUPABASE_PUBLISHABLE_KEY;
  if(!url || !key) throw new AccessError(503,'Acceso en preparación. Falta conectar Supabase.');
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)) throw new AccessError(503,'Configuración de acceso inválida.');
  if(key.startsWith('sb_secret_')) throw new AccessError(503,'Se requiere una clave publicable, no privilegiada.');
  if(key.includes('.')) {try {if(JSON.parse(atob(key.split('.')[1])).role!=='anon')throw Error();}catch{throw new AccessError(503,'Clave publicable inválida.');}}
  return {url,key};
}
export async function supabase<T>(path:string, token?:string, init:RequestInit={}):Promise<T> {
  const {url,key}=config();
  const headers=new Headers(init.headers);headers.set('apikey',key);
  if(token)headers.set('Authorization',`Bearer ${token}`);
  headers.set('Content-Type','application/json');
  const response=await fetch(`${url}${path}`,{...init,headers,cache:'no-store',signal:AbortSignal.timeout(30000)});
  if(!response.ok) throw new AccessError(response.status===401?401:response.status===403?403:response.status===429?429:400,
    response.status===429?'Demasiados intentos. Espera antes de volver a intentarlo.':'No se pudo completar la solicitud. Verifica tus datos y permisos.');
  // PostgREST writes may succeed with 201/204 and an empty response body.
  const body=await response.text();
  return body?JSON.parse(body) as T:undefined as T;
}
export type Session={token:string;user:{id:string;email:string};member:Member;aal:string};
export async function getSession(token?:string,write=false):Promise<Session> {
  if(!token)throw new AccessError(401,'Inicia sesión para continuar.');
  const user=await supabase<{id:string;email:string;email_confirmed_at?:string}>('/auth/v1/user',token);
  if(!user.email_confirmed_at)throw new AccessError(403,'Confirma tu correo antes de entrar.');
  const rows=await supabase<Member[]>(`/rest/v1/members?user_id=eq.${encodeURIComponent(user.id)}&select=user_id,email,role,status`,token);
  // Decode only AFTER Auth validates the signed token. Database policies check AAL independently.
  const encoded=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
  const aal=JSON.parse(atob(encoded)).aal||'aal1';
  const member=rows[0];assertApproved(member,write,aal);
  return {token,user,member,aal};
}
export async function requestSession(request:Request,write=false) {return getSession(bearerOrCookie(request),write);}
export async function pageSession() {return getSession((await cookies()).get(SESSION_COOKIE)?.value);}
export function sessionHeaders(token:string,expires=3600) {
  if(!/^[A-Za-z0-9_.-]+$/.test(token))throw new AccessError(400,'Sesión inválida.');
  return {'Set-Cookie':`${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${Math.min(expires,3600)}`,'Cache-Control':'no-store'};
}
export const clearSessionHeaders={'Set-Cookie':`${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,'Cache-Control':'no-store'};
