import {redirect} from 'next/navigation';
import {pageSession} from '../../lib/supabase-server';
import DistributedGeneration from '../../components/distributed-generation';
export const dynamic='force-dynamic';
export default async function Page(){try{await pageSession();}catch{redirect('/acceso');}return <DistributedGeneration/>;}
