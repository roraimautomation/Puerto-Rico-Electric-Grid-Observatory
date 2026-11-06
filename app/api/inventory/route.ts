import {readInventory} from '../../../lib/server-inventory';
export async function GET(){try{return Response.json(await readInventory(),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Inventario temporalmente no disponible'},{status:503});}}
