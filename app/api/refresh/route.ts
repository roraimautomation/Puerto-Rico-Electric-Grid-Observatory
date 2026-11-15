import {refreshInventory} from '../../../lib/server-inventory';
import {requestSession} from '../../../lib/supabase-server';
import {assertSameOrigin,isBearerRequest,accessError} from '../../../lib/access';
export async function POST(request:Request){try{if(!isBearerRequest(request))assertSameOrigin(request);const s=await requestSession(request,true);return Response.json(await refreshInventory(s.token),{headers:{'Cache-Control':'no-store'}});}catch(e){return accessError(e);}}
