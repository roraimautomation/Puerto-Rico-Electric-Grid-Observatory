import {AccessError,accessError} from '../../../../lib/access';
import {requestSession,supabase} from '../../../../lib/supabase-server';
export async function GET(request:Request){try{const s=await requestSession(request,true);if(s.member.role!=='admin')throw new AccessError(403,'Acceso reservado a administración.');return Response.json(await supabase('/rest/v1/audit_events?select=id,event_at,actor_id,resource,operation,record_id&order=event_at.desc&limit=50',s.token),{headers:{'Cache-Control':'no-store'}});}catch(e){return accessError(e);}}
