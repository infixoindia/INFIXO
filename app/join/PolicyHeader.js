'use client';
import {LanguageSwitcher} from '@/lib/acquisition/locale';
import s from './join.module.css';
import back from '../components/WorkDetails/WorkDetails.module.css';
export default function PolicyHeader({language,changeLanguage,t}){return <header className={s.policyHeader}><a href={`/join?lang=${language}#apply`} aria-label={t.back} className={back.backLink}><svg className={back.backArrow} viewBox="0 0 24 24" fill="none"><path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></a><LanguageSwitcher language={language} onChange={changeLanguage} className={s.language}/></header>;}
