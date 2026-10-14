'use client';
import {useEffect,useRef} from 'react';
import s from './demo.module.css';
export default function DemoContact({open,onClose,t}){
 const dialog=useRef(null),ok=useRef(null),returnFocus=useRef(null);
 useEffect(()=>{if(!open)return;returnFocus.current=document.activeElement;dialog.current?.showModal();ok.current?.focus();const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{dialog.current?.close();document.body.style.overflow=old;returnFocus.current?.focus?.();};},[open]);
 return <dialog ref={dialog} className={s.demoDialog} aria-labelledby="demo-contact-title" aria-describedby="demo-contact-body" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div className={s.dialogInner}><h2 id="demo-contact-title">{t.demoModalTitle}</h2><p id="demo-contact-body">{t.demoModalBody}</p><button ref={ok} type="button" onClick={onClose}>{t.demoOk}</button></div></dialog>;
}
