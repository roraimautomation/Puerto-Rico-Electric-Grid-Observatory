import {redirect} from 'next/navigation';
import {pageSession} from '../../lib/supabase-server';
import AdminPanel from '../../components/admin-panel';
export const dynamic='force-dynamic';
export default async function Page(){let s;try{s=await pageSession();}catch{redirect('/acceso');}if(s.member.role!=='admin')redirect('/');return <AdminPanel/>;}
