'use client';
import {useEffect,useState,useRef,useId} from 'react';
import {validLanguage,LANGUAGE_NAMES,LANGUAGES,copy} from './i18n.mjs';
export function useJoinLanguage(){
 const [language,setLanguage]=useState('hinglish');
 useEffect(()=>{let stored;try{stored=localStorage.getItem('infixo-language');}catch{}const url=new URLSearchParams(window.location.search).get('lang');setLanguage(validLanguage(url||stored));},[]);
 useEffect(()=>{document.documentElement.lang=language==='hi'?'hi':'en';},[language]);
 function changeLanguage(value){const next=validLanguage(value);setLanguage(next);try{const url=new URL(window.location.href);url.searchParams.set('lang',next);window.history.replaceState(null,'',url);}catch{}try{localStorage.setItem('infixo-language',next);}catch{}}
 return {language,changeLanguage,t:copy(language)};
}
export function LanguageSwitcher({language,onChange,className,label}){
 const [open,setOpen]=useState(false),root=useRef(null),trigger=useRef(null),options=useRef([]),id=useId();
 useEffect(()=>{if(!open)return;options.current[LANGUAGES.indexOf(language)]?.focus();const outside=e=>{if(!root.current?.contains(e.target))setOpen(false);};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[open]);
 function close(){setOpen(false);trigger.current?.focus();}
 function key(e,index){if(e.key==='Escape'){e.preventDefault();close();}else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?2:(index+(e.key==='ArrowDown'?1:2))%3;options.current[next]?.focus();}else if(e.key==='Tab')setOpen(false);}
 return <div ref={root} className={className} data-language-switcher onKeyDown={e=>{if(e.key==='Escape')close();}}><button ref={trigger} type="button" aria-label={label || copy(language).language} aria-haspopup="menu" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(v=>!v)} onKeyDown={e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setOpen(true);}}}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6.5h14M5 17.5h14"/></svg><span>{LANGUAGE_NAMES[language]}</span><svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg></button>{open&&<div id={id} role="menu" aria-label={label || copy(language).language}>{LANGUAGES.map((k,i)=><button key={k} ref={el=>options.current[i]=el} type="button" role="menuitemradio" aria-checked={language===k} tabIndex={-1} onKeyDown={e=>key(e,i)} onClick={()=>{onChange(k);close();}}>{LANGUAGE_NAMES[k]}{language===k&&<span aria-hidden="true">✓</span>}</button>)}</div>}</div>;
}
