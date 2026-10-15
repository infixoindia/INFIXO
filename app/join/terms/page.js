'use client';
import {useJoinLanguage} from '@/lib/acquisition/locale';
import {terms} from '@/lib/acquisition/terms.mjs';
import PolicyHeader from '../PolicyHeader';
import s from '../join.module.css';
const details={en:['Last Updated: 3 August 2026','By accessing or using Infixo, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.'],hinglish:['Aakhri update: 3 August 2026','INFIXO use karne par aap maante hain ki aapne yeh terms padhi, samjhi aur sweekar ki hain.'],hi:['आखिरी अपडेट: 3 अगस्त 2026','INFIXO इस्तेमाल करके आप स्वीकार करते हैं कि आपने ये शर्तें पढ़ी, समझी और मंज़ूर की हैं।']};
export default function Terms(){const {language,changeLanguage,t}=useJoinLanguage();return <main className={`${s.page} ${s.privacy}`} lang={language==='hi'?'hi':'en'}><PolicyHeader language={language} changeLanguage={changeLanguage} t={t}/><h1>{t.terms}</h1><p>{details[language][0]}</p>{terms[language].map(([title,paragraphs])=><section key={title}><h2>{title}</h2>{paragraphs.map((p,i)=><p key={i}>{p}</p>)}</section>)}<p>{details[language][1]}</p></main>;}
