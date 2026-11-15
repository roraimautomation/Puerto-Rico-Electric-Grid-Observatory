import {redirect} from 'next/navigation';
import Dashboard from './dashboard';
import {pageSession} from '../lib/supabase-server';
import {readInventory} from '../lib/server-inventory';
export const dynamic='force-dynamic';
export default async function Page(){
 let session;try{session=await pageSession();}catch{redirect('/acceso');}
 const inventory=await readInventory(session.token);
 return <Dashboard initialData={inventory} email={session.user.email} role={session.member.role}/>;
}
