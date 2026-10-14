'use client';
import {useJoinLanguage,LanguageSwitcher} from '@/lib/acquisition/locale';
import PolicyHeader from '../PolicyHeader';
import s from '../join.module.css';
export default function Privacy(){const {language,changeLanguage,t}=useJoinLanguage();return <main className={`${s.page} ${s.privacy}`} lang={language==='hi'?'hi':'en'}><PolicyHeader language={language} changeLanguage={changeLanguage} t={t}/><h1>{t.privacyTitle}</h1>{[t.privacyIntro,t.privacyUse,t.privacyTracking,t.privacyRights,t.privacyRetention].map((v,i)=><p key={i}>{v}</p>)}</main>;}
