export const groups = [
 {id:'oil',name:'Petróleo / otros',color:'#da5753'}, {id:'gas',name:'Gas natural',color:'#2e8b78'},
 {id:'coal',name:'Carbón',color:'#596373'}, {id:'solar',name:'Solar fotovoltaica',color:'#e7a13a'},
 {id:'wind',name:'Eólica',color:'#3e85bc'}, {id:'hydro',name:'Hidroeléctrica',color:'#39a6b2'},
 {id:'biogas',name:'Biogás',color:'#9164a9'}, {id:'battery',name:'Baterías',color:'#4b5768'}
];
export type Unit={id:string;group:string;technology:string;mw:number;year:number|null;month:number|null;retirementYear:number|null;retirementMonth:number|null};
export type Asset={id:string;name:string;alias:string;operator:string;county:string;lat:number;lon:number;generators:number;capacities:Record<string,number>;units?:Unit[]};
export type Inventory={period:string;sourceUrl:string;checkedAt:string|null;importedAt:string;assets:Asset[];generatorCount:number;history?:{at:string;period:string;plants:number;mw:number}[]};
const aliases:Record<string,string>={'Aguirre Plant':'AGU','Central San Juan Plant':'SJU','Palo Seco Plant':'PSE','Cambalache Plant':'CAM','Mayaguez Plant':'MYA','Costa Sur Plant':'COS','EcoElectrica':'ECO','AES Puerto Rico':'APR','Pattern Santa Isabel LLC':'SIS','Punta Lima Wind Farm':'PLW','Oriana Energy Hybrid':'OEH','San Fermin Solar Farm Hybrid':'SFS','Yauco':'YAU','Caonillas':'CAO','Dos Bocas':'DOS','Garzas':'GAR','Toro Negro':'TOR','Rio Blanco':'RIO','Patillas':'PAT','Jobos':'JOB','Daguao':'DAG','Vega Baja':'VEG','Yabucoa':'YAB','Vieques':'VIE','Culebra':'CUL','Lilly del Caribe PR01':'LDC','Janssen Ortho LLC':'JOL','AbbVie LTD':'ABB','Pfizer Guayama':'PFI','Horizon Energy (PR) Hybrid':'HEP','Baxter Healthcare Aibonito CHP Plant':'BHA','Hewlett Packard Puerto Rico':'HPP','Baxter Jayuya':'BAX','Fort Buchanan Distributed Generation':'FBD','AES ILUMINA':'AES','Humacao Solar Project, LLC':'HUM','Coto Laurel Solar Farm':'CLS','Eaton Corp - Arecibo - Puerto Rico Hybri':'ECA'};
const idAliases:Record<string,string>={'61808':'HSP','66051':'HAM','62410':'CDP','61102':'GPL','66096':'BCP','62841':'HIM','61639':'HDP','66134':'MMC','65392':'NCL','66056':'IPI','61065':'PVB','62850':'HAS','66090':'BMC','61122':'TBM','61273':'UPR','66092':'CMC','68916':'PCH','61112':'EYF','66058':'CSP','66091':'PRW','62852':'HSA','62851':'HMA','61113':'AFP','61114':'CFP'};
export function category(code:string){return ({NG:'gas',BIT:'coal',SUB:'coal',SUN:'solar',WND:'wind',WAT:'hydro',LFG:'biogas',MWH:'battery'} as Record<string,string>)[code]||'oil';}
export function normalize(rows:Record<string,any>[]):Asset[]{
 const byId=new Map<string,Asset>(); const used=new Set<string>();
 for(const r of rows){if(r['Plant State']!=='PR')continue; const id=String(r['Plant ID']);const mw=Number(r['Nameplate Capacity (MW)']);if(!id||!Number.isFinite(mw)||mw<0)throw Error('Capacidad inválida');
 let a=byId.get(id);if(!a){const name=String(r['Plant Name']);let alias=idAliases[id]||aliases[name]||name.replace(/[^a-z]/gi,'').slice(0,3).toUpperCase();if(used.has(alias))alias+=id.slice(-2);used.add(alias);a={id,name,alias,operator:String(r['Entity Name']||''),county:String(r.County||''),lat:Number(r.Latitude),lon:Number(r.Longitude),generators:0,capacities:{}};byId.set(id,a);}
 const c=category(String(r['Energy Source Code']));a.capacities[c]=Math.round(((a.capacities[c]||0)+mw)*1000)/1000;a.generators++;
 const yearValue=(value:unknown)=>{const n=Number(value);return Number.isInteger(n)&&n>=1800&&n<=2200?n:null;};
 const monthValue=(value:unknown)=>{const n=Number(value);return Number.isInteger(n)&&n>=1&&n<=12?n:null;};
 (a.units??=[]).push({id:String(r['Generator ID']),group:c,technology:String(r.Technology||''),mw,year:yearValue(r['Operating Year']),month:monthValue(r['Operating Month']),retirementYear:yearValue(r['Planned Retirement Year']),retirementMonth:monthValue(r['Planned Retirement Month'])});
 } return [...byId.values()].sort((a,b)=>total(b)-total(a));
}
export const total=(a:Asset,storage=true)=>Object.entries(a.capacities).reduce((s,[k,v])=>s+(storage||k!=='battery'?v:0),0);
// Compare inventory content independently of row order, review dates and release month.
export const inventoryKey=(assets:Asset[])=>JSON.stringify([...assets].sort((a,b)=>a.id.localeCompare(b.id)).map(a=>[a.id,a.name,a.operator,a.county,a.lat,a.lon,a.generators,Object.entries(a.capacities).sort(([a],[b])=>a.localeCompare(b)),[...(a.units||[])].sort((a,b)=>a.id.localeCompare(b.id)).map(u=>[u.id,u.group,u.technology,u.mw,u.year,u.month,u.retirementYear,u.retirementMonth])]));
