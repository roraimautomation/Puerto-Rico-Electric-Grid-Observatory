import test from 'node:test';
import assert from 'node:assert/strict';
import {sectorRows,capacityRanges,kpis,quarters,checkInventory,sum} from '../lib/distributed-generation.ts';

test('inventory sums to official LUMA totals',()=>{
 const result=checkInventory();
 assert.equal(result.valid,true);
 assert.equal(result.grandTotal,206832);
 assert.deepEqual(result.totals,[201576,5017,61,178]);
});
test('all sectors have exactly ten capacity bins and nonnegative integers',()=>{
 assert.equal(capacityRanges.length,10);
 for(const sector of sectorRows){
   assert.equal(sector.values.length,10);
   for(const count of sector.values) assert.ok(Number.isSafeInteger(count)&&count>=0);
 }
});
test('heatmap filtering preserves sector and range totals',()=>{
 const select=(sector='all',range='all')=>sectorRows.reduce((a,row,i)=>a+((sector==='all'||i===sector)?row.values.reduce((s,n,j)=>s+((range==='all'||j===range)?n:0),0):0),0);
 assert.equal(select(),206832);
 assert.equal(select(0),201576);
 assert.equal(select(1),5017);
 assert.equal(select(1,0),4724);
 assert.equal(select(2,9),13);
 assert.equal(select(3,0),168);
 assert.equal(select('all',0),206480);
 assert.equal(select(0,9),0);
 assert.equal(select('all',9),20);
});
test('percentage denominator changes with sector filter',()=>{
 const selected=4724;
 assert.ok(Math.abs(100*selected/5017-94.159856)<0.001);
 assert.ok(Math.abs(100*selected/kpis.projects-2.284)<0.01);
});
test('quarterly series are ordered, valid and latest matches KPI',()=>{
 assert.equal(quarters.length,5);
 assert.deepEqual(quarters.map(q=>q.period),['Q1 2025','Q2 2025','Q3 2025','Q4 2025','Q1 2026']);
 assert.equal(quarters.at(-1).activated,kpis.activations);
 assert.equal(quarters.at(-1).exportedMWh,kpis.exportedMWh);
 assert.ok(quarters.every(q=>q.activated>=0&&q.pending>=0&&q.exportedMWh>=0));
});
test('renewable breakdown is arithmetic, without mixing MW and MWh',()=>{
 assert.equal(kpis.exportedMWh+kpis.largeScaleMWh,369765);
 assert.equal(sum(sectorRows.map(s=>sum(s.values))),kpis.projects);
});
