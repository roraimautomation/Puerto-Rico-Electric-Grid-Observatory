import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateReplacement,capitalRecovery,defaultAssumptions,replacementMixes} from '../lib/replacement-scenarios.ts';
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-6,`${actual} != ${expected}`);
test('annual energy is conserved and storage is not counted as new generation',()=>{
 for(const m of replacementMixes){const r=calculateReplacement(100,defaultAssumptions,m);near(r.energy,481800);near(r.solarDelivered+r.windDelivered+r.gasDelivered,r.energy);near(r.batteryMWh*365,r.storageDelivered);near(r.batteryMW*m.hours,r.batteryMWh);near(r.annualCapital+r.annualOM+r.annualFuel,r.annualCost);}
});
test('losses and curtailment increase renewable build without adding delivered energy',()=>{
 const m={...replacementMixes[0],shift:50};const a={...defaultAssumptions,efficiency:80,curtailment:20};const r=calculateReplacement(100,a,m);near(r.solarGross,r.energy*(.5+.5/.8)/.8);near(r.solarMW*8760*a.solarCF/100,r.solarGross);
 const simple=calculateReplacement(100,{...a,efficiency:100,curtailment:0},m);near(simple.solarGross,simple.energy);assert.ok(r.capex>simple.capex);
});
test('distributed share splits solar energy using separate capacity factors',()=>{
 const a={...defaultAssumptions,efficiency:100,curtailment:0};const r=calculateReplacement(100,a,{...replacementMixes[0],rooftop:40,shift:0});near(r.roofMW*8760*a.roofCF/100,r.energy*.4);near(r.solarMW*8760*a.solarCF/100,r.energy*.6);near(r.batteryMW,0);
});
test('gas-only case has no renewable or battery capacity',()=>{
 const r=calculateReplacement(100,defaultAssumptions,{...replacementMixes[0],solar:0,wind:0});near(r.gasDelivered,r.energy);near(r.roofMW+r.solarMW+r.windMW+r.batteryMWh,0);near(r.annualFuel,r.energy*defaultAssumptions.gasVariable);
});
test('retirement fraction and known generation scale the whole replacement',()=>{
 const a={...defaultAssumptions,annualGWh:100,retire:25};const r=calculateReplacement(200,a,replacementMixes[0]);near(r.energy,25000);near(r.removedMW,50);const full=calculateReplacement(200,{...a,retire:100},replacementMixes[0]);near(r.capex,full.capex/4);
});
test('zero capacity or zero replacement has finite, empty results',()=>{
 for(const r of [calculateReplacement(0,defaultAssumptions,replacementMixes[0]),calculateReplacement(100,{...defaultAssumptions,retire:0},replacementMixes[0])]){near(r.capex,0);near(r.energy,0);assert.equal(r.costPerMWh,null);for(const value of Object.values(r))if(typeof value==='number')assert.ok(Number.isFinite(value));}
});
test('capital recovery handles zero rates and separate equipment lifetimes',()=>{
 near(capitalRecovery(0,25),.04);const a={...defaultAssumptions,rate:0};const r=calculateReplacement(100,a,replacementMixes[0]);const batteryCapex=r.batteryMWh*a.batteryCost*1000;near(r.annualCapital,(r.capex-batteryCapex)/a.life+batteryCapex/a.batteryLife);
});
test('invalid inputs cannot silently produce plausible results',()=>{
 const m=replacementMixes[0];for(const a of [{...defaultAssumptions,efficiency:0},{...defaultAssumptions,curtailment:100},{...defaultAssumptions,solarCF:NaN},{...defaultAssumptions,solarCost:-1},{...defaultAssumptions,life:0}])assert.throws(()=>calculateReplacement(100,a,m));assert.throws(()=>calculateReplacement(100,defaultAssumptions,{...m,solar:90,wind:20}));
});
