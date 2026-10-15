import {copy} from '@/lib/acquisition/i18n.mjs';
export function demoWorker(language){const t=copy(language);return {
 id:'demo-only',slug:'demo-only',fullName:copy(language).demoName,profession:t.demoProfession,primarySkill:t.demoProfession,experience:t.demoExperience,serviceArea:[t.demoServiceArea],demoFullName:t.demoFullName,shiftLabel:t.demoShift,isVerified:false,workerId:'DEMO',phone:'',
 heroSlides:[{image:'/demo-media/identity-1.svg'},{image:'/demo-media/identity-2.svg'}],
 photos:[1,2,3,4,5,6].map(n=>`/demo-media/work-${n}.svg`),
 videos:[1,2].map(n=>({duration:'0:06',video:`/demo-media/work-${n}.mp4`,thumbnail:`/demo-media/work-${n}.svg`})),
 services:t.demoServices,whyChooseMe:t.demoReasons,workingHours:t.demoHours,workingShift:{day:true,night:false},gender:t.demoGender,age:t.demoAge,address:t.demoArea,languages:t.demoLanguages,about:t.demoAbout,verifications:{identityVerified:false,workVerified:false,addressVerified:false}
};}
