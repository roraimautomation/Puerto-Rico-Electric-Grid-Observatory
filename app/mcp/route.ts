import {readInventory,refreshInventory} from '../../lib/server-inventory';
export async function POST(request:Request){const b=await request.json() as any;let result:any;
 if(b.method==='server/discover')result={supportedVersions:['2026-07-28'],capabilities:{tools:{}}};
 else if(b.method==='initialize')result={protocolVersion:'2025-03-26',capabilities:{tools:{}},serverInfo:{name:'sur18-inventory',version:'1.0.0'}};
 else if(b.method==='tools/list')result={tools:[{name:'refresh_inventory',description:'Descargar el último EIA-860M de Puerto Rico y guardar el inventario validado.',inputSchema:{type:'object',properties:{},additionalProperties:false}},{name:'read_inventory_status',description:'Leer el período, revisión y totales persistidos.',inputSchema:{type:'object',properties:{},additionalProperties:false}}]};
 else if(b.method==='tools/call'){try{let data;if(b.params.name==='refresh_inventory')data=await refreshInventory();else if(b.params.name==='read_inventory_status'){const d=await readInventory();data={period:d.period,checkedAt:d.checkedAt,plants:d.assets.length,generators:d.generatorCount};}else throw Error('Herramienta desconocida');result={content:[{type:'text',text:JSON.stringify(data)}]};}catch(e){result={isError:true,content:[{type:'text',text:String(e)}]};}}
 else if(b.method?.startsWith('notifications/'))return new Response(null,{status:202});
 else return Response.json({jsonrpc:'2.0',id:b.id,error:{code:-32601,message:'Method not found'}});
 return Response.json({jsonrpc:'2.0',id:b.id,result});}
