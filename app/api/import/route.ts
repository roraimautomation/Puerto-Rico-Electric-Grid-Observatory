import {importInventory} from '../../../lib/server-inventory';
// Owner-private Sites service access is required by the hosting dispatch.
export async function POST(request:Request){try{const url=new URL(request.url);return Response.json(await importInventory(await request.arrayBuffer(),url.searchParams.get('period')||'',url.searchParams.get('source')||''));}catch(e){return Response.json({error:e instanceof Error?e.message:'Importación fallida'},{status:400});}}
