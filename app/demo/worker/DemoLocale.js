'use client';
import {createContext,useContext} from 'react';
import {profileText} from '@/lib/acquisition/i18n.mjs';
export const DemoLocale=createContext('en');
export function useDemoText(){const language=useContext(DemoLocale);return text=>profileText(language,text);}
