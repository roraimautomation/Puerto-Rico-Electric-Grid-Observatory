import {type Unit} from './inventory';
export type Scenario={revamp:number;retire:number};
// Illustrative planning assumptions, editable by the user; not certified equipment lifetimes.
export const initialScenarios:Record<string,Scenario>={oil:{revamp:20,retire:40},gas:{revamp:20,retire:40},coal:{revamp:20,retire:40},solar:{revamp:15,retire:30},wind:{revamp:15,retire:25},hydro:{revamp:40,retire:80},biogas:{revamp:15,retire:30},battery:{revamp:10,retire:15}};
export function unitAge(unit:Unit,asOf:string){if(!unit.year)return null;const [year,month]=asOf.split('-').map(Number);const age=year-unit.year+((month||1)-(unit.month||month||1))/12;return age<0?null:age;}
export type Evaluation='unknown'|'retire'|'revamp'|'monitor';
export function evaluation(unit:Unit,asOf:string,scenario:Scenario):Evaluation{const age=unitAge(unit,asOf);if(age===null)return 'unknown';return age>=scenario.retire?'retire':age>=scenario.revamp?'revamp':'monitor';}
