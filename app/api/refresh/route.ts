import {refreshInventory} from '../../../lib/server-inventory';
// Protected by owner-private Sites access, including the platform service-access boundary.
export async function POST(){try{return Response.json(await refreshInventory());}catch(e){return Response.json({error:e instanceof Error?e.message:'Error de actualización'},{status:502});}}
