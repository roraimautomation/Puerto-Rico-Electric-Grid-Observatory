'use client';
import {useEffect,useRef,type ReactNode} from 'react';

export default function PlantDialog({children,onClose}:{children:ReactNode;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{
  const dialog=ref.current;
  const opener=document.activeElement instanceof HTMLElement?document.activeElement:null;
  dialog?.showModal();
  return()=>{
   dialog?.close();
   const target=opener?.isConnected&&opener!==document.body?opener:document.getElementById('reset-view');
   // The reset button can be disabled for the full inventory; the active view is a reliable fallback.
   const fallback=document.querySelector<HTMLButtonElement>('nav[aria-label="Vista"] button[aria-pressed="true"]');
   if(target instanceof HTMLButtonElement&&target.disabled)fallback?.focus();else target?.focus();
  };
 },[]);
 return <dialog ref={ref} className="modal plant-dialog" aria-labelledby="plant-title" onKeyDown={e=>{
  if(e.key!=='Tab')return;
  const controls=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled)')).filter(el=>el.getClientRects().length>0);
  const first=controls[0],last=controls[controls.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
 }} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{
  if(e.target!==e.currentTarget)return;
  const bounds=e.currentTarget.getBoundingClientRect();
  if(e.clientX<bounds.left||e.clientX>bounds.right||e.clientY<bounds.top||e.clientY>bounds.bottom)onClose();
 }}>{children}</dialog>;
}
