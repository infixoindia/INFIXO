'use client';
import {useState} from 'react';
import Header from './DemoHeader';
import {copy} from '@/lib/acquisition/i18n.mjs';
import DemoContact from './DemoContact';

import {useJoinLanguage,LanguageSwitcher} from '@/lib/acquisition/locale';
import {DemoLocale} from './DemoLocale';
import {demoWorker} from './data.mjs';
import WorkerIdentityCard from './generated/WorkerIdentityCard';
import NavigationTabs from './generated/NavigationTabs';
import WorkDetails from './generated/WorkDetails';
import WorkPhotos from './generated/WorkPhotos';
import WorkVideos from './generated/WorkVideos';
import WorkerDetails from './generated/WorkerDetails';
import s from './demo.module.css';
import join from '../../join/join.module.css';
export default function DemoProfile({section=''}){
 const {language,changeLanguage}=useJoinLanguage(),[contact,setContact]=useState(false);
 const t=copy('en');
 const worker=demoWorker(language),base='/demo/worker',home=`${base}?lang=${language}`;
 // No database fetch and no phone number: original contact/WhatsApp actions cannot activate.
 return <main className={`${s.page} ${section==='work-photos'||section==='work-videos'?s.galleryPage:''}`} lang="en"><header className={s.header}><a href={`/join?lang=${language}#apply`}>{t.demoBack}</a><LanguageSwitcher label="Language" language={language} onChange={changeLanguage} className={join.language}/></header><div className={s.notice}>{t.demoNotice}</div><DemoLocale.Provider value="en">{section===''&&<Header/>}<div className={section===''?s.homeContent:s.content}>
 {section===''?<><WorkerIdentityCard worker={{...worker,experience:"Your",serviceArea:["Your"]}}/><NavigationTabs onDemoContact={()=>setContact(true)} worker={worker} basePath={base} queryString={`?lang=${language}`}/></>:section==='work-details'?<WorkDetails worker={worker} backHref={home}/>:section==='work-photos'?<WorkPhotos worker={worker} backHref={home}/>:section==='work-videos'?<WorkVideos worker={worker} backHref={home}/>:<WorkerDetails worker={worker} backHref={home}/>}
 </div></DemoLocale.Provider><DemoContact open={contact} onClose={()=>setContact(false)} t={t}/></main>;
}
