import {env} from 'cloudflare:workers';
import * as XLSX from 'xlsx';
import seed from '../data/seed.json';
import {normalize,total,inventoryKey,type Inventory} from './inventory';
export async function readInventory():Promise<Inventory>{
 const row=await env.DB!.prepare('SELECT payload FROM snapshots WHERE id = ?').bind('current').first<{payload:string}>();
 const baseline=seed as unknown as Inventory;const current:Inventory=row?JSON.parse(row.payload):baseline;
 // Enrich the original September snapshot only when its inventory exactly matches the official baseline.
 if(current.period===baseline.period&&current.assets.some(a=>!a.units)&&inventoryKey(current.assets.map(a=>({...a,units:[]})))===inventoryKey(baseline.assets.map(a=>({...a,units:[]})))){
 current.assets=current.assets.map(a=>({...a,units:baseline.assets.find(s=>s.id===a.id)?.units}));
 }return current;
}
export async function importInventory(buffer:ArrayBuffer,period:string,sourceUrl:string){
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(period))throw Error('Período inválido');
 if(!/^https:\/\/www\.eia\.gov\/electricity\/data\/eia860m\/xls\/[a-z]+_generator\d{4}\.xlsx$/.test(sourceUrl))throw Error('Fuente no permitida');
 if(buffer.byteLength>35000000)throw Error('Archivo excede el tamaño esperado');
 const signature=new Uint8Array(buffer,0,Math.min(2,buffer.byteLength));if(signature[0]!==80||signature[1]!==75)throw Error('La fuente no devolvió un archivo Excel válido');
 const previous=await readInventory();if(period<previous.period)throw Error('Se rechaza un período anterior al inventario actual');
 const workbook=XLSX.read(buffer,{type:'array',sheets:['Operating_PR'],dense:true});const sheet=workbook.Sheets.Operating_PR;if(!sheet)throw Error('Falta la hoja Operating_PR');const rows=XLSX.utils.sheet_to_json<Record<string,any>>(sheet,{range:2,defval:''});const assets=normalize(rows);if(assets.length<30||assets.length>300)throw Error('Inventario fuera del rango esperado; se conserva la versión anterior');
 const now=new Date().toISOString();const changed=inventoryKey(previous.assets)!==inventoryKey(assets);
 const next:Inventory=changed?{period,sourceUrl,checkedAt:now,importedAt:now,assets,generatorCount:assets.reduce((s,a)=>s+a.generators,0),history:[...(previous.history||[]),{at:now,period,plants:assets.length,mw:assets.reduce((s,a)=>s+total(a),0)}].slice(-52)}:{...previous,checkedAt:now};
 await env.DB!.prepare('INSERT INTO snapshots (id,payload) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload').bind('current',JSON.stringify(next)).run();return {changed,sourcePeriod:period,period:next.period,checkedAt:next.checkedAt,plants:assets.length,generators:next.generatorCount,mw:assets.reduce((s,a)=>s+total(a),0)};
}
export async function refreshInventory(){
 const previous=await readInventory();
 const response=await fetch('https://www.eia.gov/electricity/data/eia860m/',{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('EIA no está disponible');
 const html=await response.text();const matches=[...html.matchAll(/href=["']([^"']*xls\/([a-z]+)_generator(\d{4})\.xlsx)["']/gi)];
 const months=['january','february','march','april','may','june','july','august','september','october','november','december'];
 const candidates=matches.map(m=>({url:new URL(m[1],response.url).href,period:`${m[3]}-${String(months.indexOf(m[2].toLowerCase())+1).padStart(2,'0')}`})).filter(m=>!m.period.endsWith('-00')).sort((a,b)=>b.period.localeCompare(a.period));
 const latest=candidates[0];if(!latest)throw Error('No se encontró el archivo mensual oficial');if(new URL(latest.url).hostname!=='www.eia.gov')throw Error('Origen no permitido');
 // Also compare corrected editions published at the same URL.
 const file=await fetch(latest.url,{signal:AbortSignal.timeout(60000),headers:{'User-Agent':'Mozilla/5.0','Accept':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}});if(!file.ok)throw Error('No se pudo descargar el inventario');return importInventory(await file.arrayBuffer(),latest.period,latest.url);
}
