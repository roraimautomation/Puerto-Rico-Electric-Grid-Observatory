export function validScenario(value:unknown):boolean {
 if(!value||typeof value!=='object')return false;
 const v=value as Record<string,any>;
 return typeof v.name==='string'&&v.name.length<=200&&typeof v.period==='string'&&/^\d{4}-\d{2}$/.test(v.period)&&Array.isArray(v.units)&&v.units.length<=1000&&v.units.every((u:any)=>u&&typeof u.key==='string'&&typeof u.plant==='string'&&typeof u.unit==='string'&&Number.isFinite(u.mw))&&v.mix&&typeof v.mix==='object'&&v.assumptions&&typeof v.assumptions==='object'&&v.result&&Number.isFinite(v.result.energy)&&Number.isFinite(v.result.capex)&&(v.result.costPerMWh===null||Number.isFinite(v.result.costPerMWh));
}
