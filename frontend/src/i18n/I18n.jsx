import React,{createContext,useContext,useMemo,useState} from 'react'

const translations={
 en:{
  dashboard:'Dashboard',projects:'Projects',gallery:'Gallery',design:'Design Studio',projector:'Projector',calculator:'Calculator',materials:'Materials',settings:'Settings',
  hello:'Hello',studioOwner:'Studio Owner',thisWeek:'This Week',quickActions:'Quick Actions',recentProjects:'Recent Projects',
  newProject:'New Project',completed:'Completed',inProgress:'In Progress',back:'Back',calendar:'Calendar',statistics:'Statistics',appointments:'Appointments',
  noStats:'No statistics yet',noAppointments:'No appointments yet',addAppointment:'Add appointment',language:'Language',notifications:'Notifications',
  appointmentNotifications:'Appointment notifications',save:'Save',saved:'Saved',profile:'Profile',studioLogo:'Studio logo',logout:'Logout',
  uploadPhoto:'Upload Your Photo',fromGallery:'From Gallery',takePhoto:'Take Photo',preview:'Preview',style:'Style',colorPalette:'Color Palette',
  continueTools:'Continue to Tools',projectorTools:'Projector Tools',mirror:'Mirror',yarnCalculator:'Yarn Calculator',saveProject:'Save Project',
  noProjects:'No projects yet',projectLibrary:'Your project library.',home:'Home',new:'New',menu:'Menu'
 },
 de:{
  dashboard:'Dashboard',projects:'Projekte',gallery:'Galerie',design:'Design Studio',projector:'Projektor',calculator:'Rechner',materials:'Materialien',settings:'Einstellungen',
  hello:'Hallo',studioOwner:'Studioinhaber',thisWeek:'Diese Woche',quickActions:'Schnellaktionen',recentProjects:'Letzte Projekte',
  newProject:'Neues Projekt',completed:'Fertig',inProgress:'In Arbeit',back:'Zurück',calendar:'Kalender',statistics:'Statistiken',appointments:'Termine',
  noStats:'Noch keine Statistiken',noAppointments:'Noch keine Termine',addAppointment:'Termin hinzufügen',language:'Sprache',notifications:'Benachrichtigungen',
  appointmentNotifications:'Termin-Benachrichtigungen',save:'Speichern',saved:'Gespeichert',profile:'Profil',studioLogo:'Studio-Logo',logout:'Abmelden',
  uploadPhoto:'Foto hochladen',fromGallery:'Aus Galerie',takePhoto:'Foto aufnehmen',preview:'Vorschau',style:'Stil',colorPalette:'Farbpalette',
  continueTools:'Weiter zu Tools',projectorTools:'Projektor-Tools',mirror:'Spiegeln',yarnCalculator:'Garn-Rechner',saveProject:'Projekt speichern',
  noProjects:'Noch keine Projekte',projectLibrary:'Deine Projektbibliothek.',home:'Home',new:'Neu',menu:'Menü'
 },
 sq:{
  dashboard:'Paneli',projects:'Projektet',gallery:'Galeria',design:'Studio Dizajni',projector:'Projektori',calculator:'Llogaritësi',materials:'Materialet',settings:'Cilësimet',
  hello:'Përshëndetje',studioOwner:'Pronari i Studios',thisWeek:'Këtë javë',quickActions:'Veprime të shpejta',recentProjects:'Projektet e fundit',
  newProject:'Projekt i ri',completed:'Përfunduar',inProgress:'Në punë',back:'Mbrapa',calendar:'Kalendari',statistics:'Statistikat',appointments:'Terminet',
  noStats:'Ende nuk ka statistika',noAppointments:'Ende nuk ka termine',addAppointment:'Shto termin',language:'Gjuha',notifications:'Njoftimet',
  appointmentNotifications:'Njoftimet për termine',save:'Ruaj',saved:'U ruajt',profile:'Profili',studioLogo:'Logo e studios',logout:'Dil',
  uploadPhoto:'Ngarko fotografinë',fromGallery:'Nga Galeria',takePhoto:'Bëj Foto',preview:'Paraqitja',style:'Stili',colorPalette:'Paleta e ngjyrave',
  continueTools:'Vazhdo te veglat',projectorTools:'Veglat e projektorit',mirror:'Pasqyrë',yarnCalculator:'Llogaritësi i fillit',saveProject:'Ruaj projektin',
  noProjects:'Ende nuk ka projekte',projectLibrary:'Biblioteka e projekteve.',home:'Kreu',new:'I ri',menu:'Menu'
 }
}
const C=createContext(null)
export function I18nProvider({children}){
 const [lang,setLangState]=useState(localStorage.getItem('tufting_lang')||'en')
 const setLang=l=>{localStorage.setItem('tufting_lang',l);setLangState(l)}
 const value=useMemo(()=>({lang,setLang,t:(k)=>translations[lang]?.[k]||translations.en[k]||k}),[lang])
 return <C.Provider value={value}>{children}</C.Provider>
}
export const useI18n=()=>useContext(C)
