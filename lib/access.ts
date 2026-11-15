export type Role = 'reader' | 'admin' | 'updater';
export type Member = {user_id:string;email:string;role:Role;status:'pending'|'approved'|'suspended'};
export class AccessError extends Error {
  status:number;
  constructor(status:number, message:string){super(message);this.status=status;}
}
export function assertApproved(member:Member|null, write=false, aal='aal1') {
  if(!member || member.status!=='approved') throw new AccessError(403,'Tu acceso requiere aprobación de la administradora.');
  if(write && !['admin','updater'].includes(member.role)) throw new AccessError(403,'No tienes permiso para modificar el inventario.');
  if(write && member.role==='admin' && aal!=='aal2') throw new AccessError(403,'Verifica tu segundo factor para administrar el inventario.');
}
export function assertSameOrigin(request:Request) {
  const origin=request.headers.get('Origin');
  if(origin!==new URL(request.url).origin) throw new AccessError(403,'Origen no permitido.');
}
export function bearerOrCookie(request:Request):string|undefined {
  const auth=request.headers.get('Authorization');
  if(auth) return /^Bearer ([A-Za-z0-9_.-]+)$/.exec(auth)?.[1];
  return request.headers.get('Cookie')?.split(';').map(c=>c.trim()).find(c=>c.startsWith('__Host-sur18_access='))?.split('=')[1];
}
export function isBearerRequest(request:Request) {return /^Bearer [A-Za-z0-9_.-]+$/.test(request.headers.get('Authorization')||'');}
export function accessError(error:unknown) {
  return Response.json({error:error instanceof AccessError?error.message:'No se pudo completar la operación.'},
    {status:error instanceof AccessError?error.status:503,headers:{'Cache-Control':'no-store'}});
}
