'use client';
import {useId,useState} from 'react';

export default function LegendTooltip({name,color,description,mw,plants}:{name:string;color:string;description:string;mw:string;plants:number}){
 const id=useId();const [open,setOpen]=useState(false);const [position,setPosition]=useState({left:0,top:0});
 function show(button:HTMLButtonElement){const rect=button.getBoundingClientRect();setPosition({left:Math.max(12,Math.min(rect.left,window.innerWidth-272)),top:Math.max(12,Math.min(rect.bottom+8,window.innerHeight-220))});setOpen(true);}
 return <span className="legend-help" onMouseLeave={()=>setOpen(false)}><button type="button" className="legend-info" aria-label={`Información de ${name}`} aria-expanded={open} aria-describedby={open?id:undefined} onMouseEnter={e=>show(e.currentTarget)} onFocus={e=>show(e.currentTarget)} onBlur={()=>setOpen(false)} onClick={e=>show(e.currentTarget)} onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);e.stopPropagation();}}}>ⓘ</button>{open&&<span id={id} role="tooltip" className="legend-tooltip" style={position}><strong><i style={{background:color}}/>{name}</strong><span>{description}</span><b>{mw} MW <em>· {plants} {plants===1?'planta':'plantas'}</em></b><small>En el inventario completo. Una planta puede tener varias tecnologías.</small></span>}</span>;
}
