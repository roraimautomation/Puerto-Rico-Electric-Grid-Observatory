import {notFound} from 'next/navigation';
import seed from '../../data/seed.json';
import type {Inventory} from '../../lib/inventory';
import Dashboard from '../dashboard';
import AuthForm from '../../components/auth-form';
import AdminPanel from '../../components/admin-panel';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{view?:string}>}){
 if(!import.meta.env.DEV)notFound();
 const {view}=await searchParams;
 return <><div className="preview-banner"><b>MUESTRA · Sin conexión a cuentas reales</b><span><a href="/muestra">Acceso</a><a href="/muestra?view=reader">Consulta</a><a href="/muestra?view=admin">Administración</a></span></div>{view==='reader'?<Dashboard initialData={seed as unknown as Inventory} email="usuario@ejemplo.com" role="reader" demo/>:view==='admin'?<AdminPanel demo/>:<AuthForm demo/>}</>;
}
