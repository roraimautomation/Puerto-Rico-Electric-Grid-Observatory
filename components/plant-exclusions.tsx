'use client';
import {useState} from 'react';
import type {Asset} from '../lib/inventory';
export default function PlantExclusions({assets,excluded,onToggle,onReset}:{assets:Asset[];excluded:string[];onToggle:(id:string)=>void;onReset:()=>void}){
 const [query,setQuery]=useState('');
 return <details className="exclusions"><summary>Mostrar u ocultar plantas <b>{assets.filter(a=>!excluded.includes(a.id)).length}/{assets.length}</b></summary><div className="exclusions-body"><p>Desmarca cualquier planta para redistribuir el espacio. No se elimina del inventario original.</p><input aria-label="Buscar planta para mostrar u ocultar" placeholder="Nombre o sigla…" value={query} onChange={e=>setQuery(e.target.value)}/><div className="exclusion-list">{assets.filter(a=>`${a.name} ${a.alias}`.toLowerCase().includes(query.toLowerCase())).map(a=><label key={a.id}><input type="checkbox" checked={!excluded.includes(a.id)} onChange={()=>onToggle(a.id)}/><b>{a.alias}</b><span>{a.name}</span></label>)}</div><button onClick={onReset}>Restaurar todas las plantas</button></div></details>;
}
