export const capacityRanges=['0–100','100–250','250–500','500–750','750–1,000','1,000–1,250','1,250–1,500','1,500–1,750','1,750–2,000','>2,000'] as const;
export const sectorRows=[
 {sector:'Residencial',values:[201576,0,0,0,0,0,0,0,0,0]},
 {sector:'Comercial',values:[4724,149,79,26,23,3,2,2,2,7]},
 {sector:'Industrial',values:[12,9,6,5,7,1,5,2,1,13]},
 {sector:'Gubernamental y agrícola',values:[168,4,2,0,0,1,0,0,0,3]}
] as const;
export const quarters=[
 {period:'Q1 2025',activated:14072,pending:2949,exportedMWh:192100,renewableMWh:305717},
 {period:'Q2 2025',activated:10514,pending:1443,exportedMWh:235777,renewableMWh:364114},
 {period:'Q3 2025',activated:12452,pending:3231,exportedMWh:247267,renewableMWh:365330},
 {period:'Q4 2025',activated:13687,pending:1937,exportedMWh:229304,renewableMWh:318539},
 {period:'Q1 2026',activated:9830,pending:1450,exportedMWh:254515,renewableMWh:369765}
] as const;
export const source={name:'LUMA — Informe de Progreso de Interconexión de Sistemas de Generación Distribuida',period:'enero–marzo 2026',issued:'2026-05-15',docket:'NEPR-MI-2019-0016',pages:{inventory:8,activations:11,backlog:12,energy:17,renewables:24},status:'Copia inicial validada manualmente; revisión trimestral semiautomática aún no activada'};
export const kpis={capacityMW:1561,projects:206832,residential:201576,activations:9830,exportedMWh:254515,expeditedDays:16,expeditedPending:1450,largeScaleMWh:115250};
export const sum=(values:readonly number[])=>values.reduce((a,b)=>a+b,0);
export function checkInventory(){const totals=sectorRows.map(x=>sum(x.values));return {totals,grandTotal:sum(totals),valid:sum(totals)===kpis.projects&&totals[0]===kpis.residential};}
