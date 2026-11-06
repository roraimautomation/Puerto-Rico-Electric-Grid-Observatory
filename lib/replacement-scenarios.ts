export const PR100_SOURCE='https://www.energy.gov/sites/default/files/2024-08/CFE%20PR%20Grid%20Resilience%20and%20Transitions%20to%20100%20Renewable%20Energy.pdf';
export const pr100References=[
 {id:'economic',name:'PR100 · Adopción económica',min:2500,max:3300,description:'Adopción distribuida según ahorro y valor del respaldo.'},
 {id:'equity',name:'PR100 · Acceso equitativo',min:2800,max:3600,description:'Amplía la adopción a hogares de muy bajos ingresos y zonas remotas.'},
 {id:'maximum',name:'PR100 · Máximo en techos',min:5200,max:6100,description:'Expande solar y almacenamiento a todos los techos aptos modelados.'},
];
export type Mix={id:string;name:string;solar:number;wind:number;rooftop:number;shift:number;hours:number};
export const replacementMixes:Mix[]=[
 {id:'utility',name:'Solar centralizada + baterías',solar:100,wind:0,rooftop:0,shift:50,hours:8},
 {id:'distributed',name:'Solar distribuida · enfoque PR100',solar:100,wind:0,rooftop:100,shift:50,hours:8},
 {id:'diverse',name:'Solar + eólica + baterías',solar:70,wind:30,rooftop:40,shift:40,hours:8},
 {id:'bridge',name:'Transición con gas natural',solar:60,wind:10,rooftop:30,shift:40,hours:6},
];
export type Assumptions={oilCF:number;solarCF:number;roofCF:number;windCF:number;gasCF:number;efficiency:number;curtailment:number;retire:number;rate:number;life:number;batteryLife:number;solarCost:number;roofCost:number;windCost:number;gasCost:number;batteryCost:number;om:number;gasVariable:number;oilVariable:number;annualGWh:number|null};
// Illustrative sandbox values only: not EIA/PR100 estimates, bids or Puerto Rico tariffs.
export const defaultAssumptions:Assumptions={oilCF:55,solarCF:22,roofCF:19,windCF:35,gasCF:70,efficiency:88,curtailment:10,retire:100,rate:6,life:25,batteryLife:12,solarCost:1600,roofCost:3000,windCost:2200,gasCost:1400,batteryCost:350,om:2,gasVariable:80,oilVariable:180,annualGWh:null};
export function capitalRecovery(rate:number,years:number){if(!Number.isFinite(rate)||rate<0||!Number.isFinite(years)||years<=0)throw Error('Financiación inválida');const r=rate/100;return r===0?1/years:r/(1-Math.pow(1+r,-years));}
export function calculateReplacement(oilMW:number,a:Assumptions,m:Mix){
 if(!Number.isFinite(oilMW)||oilMW<0)throw Error('Capacidad inválida');
 for(const key of ['oilCF','solarCF','roofCF','windCF','gasCF','efficiency'] as const)if(!Number.isFinite(a[key])||a[key]<=0||a[key]>100)throw Error('Factores y eficiencia deben estar entre 0 y 100, sin incluir 0');
 for(const key of ['retire','curtailment'] as const)if(!Number.isFinite(a[key])||a[key]<0||a[key]>(key==='curtailment'?99:100))throw Error('Porcentaje inválido');
 for(const key of ['solarCost','roofCost','windCost','gasCost','batteryCost','om','gasVariable','oilVariable'] as const)if(!Number.isFinite(a[key])||a[key]<0)throw Error('Costo inválido');
 if(a.annualGWh!==null&&(!Number.isFinite(a.annualGWh)||a.annualGWh<0))throw Error('Energía inválida');
 if([m.solar,m.wind,m.rooftop,m.shift].some(v=>!Number.isFinite(v)||v<0||v>100)||m.solar+m.wind>100||!Number.isFinite(m.hours)||m.hours<1)throw Error('Mezcla inválida');
 const removedMW=oilMW*a.retire/100;
 const energy=(a.annualGWh===null?oilMW*8760*a.oilCF/100:a.annualGWh*1000)*a.retire/100;
 const solarDelivered=energy*m.solar/100,windDelivered=energy*m.wind/100,gasDelivered=Math.max(0,energy-solarDelivered-windDelivered);
 const renewableDelivered=solarDelivered+windDelivered;
 const storageDelivered=renewableDelivered*m.shift/100;
 const lossMultiplier=(1-m.shift/100+m.shift/100/(a.efficiency/100))/(1-a.curtailment/100);
 const solarGross=solarDelivered*lossMultiplier,windGross=windDelivered*lossMultiplier;
 const roofMW=solarGross*m.rooftop/100/(8760*a.roofCF/100),solarMW=solarGross*(1-m.rooftop/100)/(8760*a.solarCF/100),windMW=windGross/(8760*a.windCF/100),gasMW=gasDelivered/(8760*a.gasCF/100);
 // One average daily discharge cycle; energy is usable AC output, not nameplate DC energy.
 const batteryMWh=storageDelivered/365,batteryMW=batteryMWh/m.hours;
 const generationCapex=(roofMW*a.roofCost+solarMW*a.solarCost+windMW*a.windCost+gasMW*a.gasCost)*1000;
 const batteryCapex=batteryMWh*a.batteryCost*1000;
 const capex=generationCapex+batteryCapex;
 const annualCapital=generationCapex*capitalRecovery(a.rate,a.life)+batteryCapex*capitalRecovery(a.rate,a.batteryLife);
 const annualOM=capex*a.om/100,annualFuel=gasDelivered*a.gasVariable;
 const annualCost=annualCapital+annualOM+annualFuel,oilAvoided=energy*a.oilVariable;
 return {removedMW,energy,solarDelivered,windDelivered,gasDelivered,solarGross,windGross,roofMW,solarMW,windMW,gasMW,batteryMWh,batteryMW,storageDelivered,capex,annualCapital,annualOM,annualFuel,annualCost,oilAvoided,annualDifference:oilAvoided-annualCost,costPerMWh:energy?annualCost/energy:null,renewablePercent:energy?renewableDelivered/energy*100:0};
}
