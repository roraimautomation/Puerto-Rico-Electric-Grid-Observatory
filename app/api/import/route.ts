import {importInventory} from '../../../lib/server-inventory';
import {requestSession} from '../../../lib/supabase-server';
import {AccessError,assertSameOrigin,isBearerRequest,accessError} from '../../../lib/access';
export async function POST(request:Request){try{if(!isBearerRequest(request))assertSameOrigin(request);const s=await requestSession(request,true);if(Number(request.headers.get('Content-Length'))>35000000)throw new AccessError(413,'Archivo demasiado grande.');const url=new URL(request.url);return Response.json(await importInventory(await request.arrayBuffer(),url.searchParams.get('period')||'',url.searchParams.get('source')||'',s.token),{headers:{'Cache-Control':'no-store'}});}catch(e){return accessError(e);}}
