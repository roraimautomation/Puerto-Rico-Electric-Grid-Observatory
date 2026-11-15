import {readInventory} from '../../../lib/server-inventory';
import {requestSession} from '../../../lib/supabase-server';
import {accessError} from '../../../lib/access';
export async function GET(request:Request){try{const s=await requestSession(request);return Response.json(await readInventory(s.token),{headers:{'Cache-Control':'no-store'}});}catch(e){return accessError(e);}}
