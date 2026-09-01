import React,{createContext,useContext,useMemo,useState} from 'react'

const translations={
 en:{
  dashboard:'Dashboard',projects:'Projects',gallery:'Gallery',design:'Design Studio',projector:'Projector',calculator:'Calculator',materials:'Materials',settings:'Settings',guide:'Visual Guide',notebook:'My Notes',
  hello:'Hello',studioOwner:'Studio Owner',thisWeek:'This Week',quickActions:'Quick Actions',recentProjects:'Recent Projects',
  newProject:'New Project',status:'Status',completed:'Completed',inProgress:'In Progress',back:'Back',calendar:'Calendar',statistics:'Statistics',appointments:'Appointments',
  noStats:'No statistics yet',noAppointments:'No appointments yet',addAppointment:'Add appointment',language:'Language',notifications:'Notifications',
  appointmentNotifications:'Appointment notifications',save:'Save',saved:'Saved',saving:'Saving...',profile:'Profile',studioLogo:'Studio logo',logout:'Logout',
  uploadPhoto:'Upload Your Photo',fromGallery:'From Gallery',takePhoto:'Take Photo',preview:'Preview',style:'Style',colorPalette:'Color Palette',
  continueTools:'Continue to Tools',projectorTools:'Projector Tools',mirror:'Mirror',yarnCalculator:'Yarn Calculator',saveProject:'Save Project',
  noProjects:'No projects yet',projectLibrary:'Your project library.',home:'Home',new:'New',menu:'Menu',
  allSavedProjects:'All your saved tufting projects.',name:'Name',widthCm:'Width cm',heightCm:'Height cm',notes:'Notes',
  createProject:'Create Project',delete:'Delete',deleteProjectConfirm:'Delete project?',materialCost:'Material Cost',projectNameRequired:'Please enter a project name.',
  saveFailed:'Could not save. Please try again.',photo:'Photo',photoFormats:'JPG or PNG · clear photo works best',photoFormatsMobile:'JPG or PNG · clear photo works best',
  tipsBestResults:'Tips for best results',tipClear:'Use a clear, well-lit photo',tipCentered:'Keep the subject centered',tipResolution:'Higher resolution gives cleaner outlines',
  original:'Original',sketch:'Sketch',cartoon:'Cartoon',popArt:'Pop Art',colors:'colors',color:'Color',noImage:'No image',
  noProjectorImage:'Open a photo from Design Studio first.',acrylic:'Acrylic',wool:'Wool',estimatedYarn:'Estimated Yarn',coverageArea:'Coverage Area',costEstimate:'Cost Estimate',
  projectName:'Project name',yarnCostCalculator:'Yarn & Cost Calculator',calculatorDesc:'Calculate grams and material cost before you start tufting.',
  yarnType:'Yarn type',density:'Density',light:'Light',standard:'Standard',dense:'Dense',price100g:'Price / 100g',waste:'Waste',calculate:'Calculate',
  area:'Area',baseYarn:'Base Yarn',totalYarn:'Total Yarn',planningEstimate:'This is a planning estimate. Real yarn usage depends on pile height, strand count and your tufting density.',
  displayName:'Display name',chooseDashboardPhoto:'Choose Dashboard profile photo',removePhoto:'Remove photo',
  profilePhotoNote:'This photo is the round avatar next to “Hello” on the mobile Dashboard.',upload:'Upload',
  calculationSaved:'Calculation saved',savedCalculations:'Saved calculations',numberOfColors:'Colors',projectsThisWeek:'Projects',calculationsThisWeek:'Calculations',weeklyCost:'Weekly cost'
 },
 de:{
  dashboard:'Dashboard',projects:'Projekte',gallery:'Galerie',design:'Design Studio',projector:'Projektor',calculator:'Rechner',materials:'Materialien',settings:'Einstellungen',guide:'Visuelle Anleitung',notebook:'Meine Notizen',
  hello:'Hallo',studioOwner:'Studioinhaber',thisWeek:'Diese Woche',quickActions:'Schnellaktionen',recentProjects:'Letzte Projekte',
  newProject:'Neues Projekt',status:'Status',completed:'Fertig',inProgress:'In Arbeit',back:'Zurück',calendar:'Kalender',statistics:'Statistiken',appointments:'Termine',
  noStats:'Noch keine Statistiken',noAppointments:'Noch keine Termine',addAppointment:'Termin hinzufügen',language:'Sprache',notifications:'Benachrichtigungen',
  appointmentNotifications:'Termin-Benachrichtigungen',save:'Speichern',saved:'Gespeichert',saving:'Speichern...',profile:'Profil',studioLogo:'Studio-Logo',logout:'Abmelden',
  uploadPhoto:'Foto hochladen',fromGallery:'Aus Galerie',takePhoto:'Foto aufnehmen',preview:'Vorschau',style:'Stil',colorPalette:'Farbpalette',
  continueTools:'Weiter zu Tools',projectorTools:'Projektor-Tools',mirror:'Spiegeln',yarnCalculator:'Garn-Rechner',saveProject:'Projekt speichern',
  noProjects:'Noch keine Projekte',projectLibrary:'Deine Projektbibliothek.',home:'Home',new:'Neu',menu:'Menü',
  allSavedProjects:'Alle gespeicherten Tufting-Projekte.',name:'Name',widthCm:'Breite cm',heightCm:'Höhe cm',notes:'Notizen',
  createProject:'Projekt erstellen',delete:'Löschen',deleteProjectConfirm:'Projekt löschen?',materialCost:'Materialkosten',projectNameRequired:'Bitte einen Projektnamen eingeben.',
  saveFailed:'Speichern fehlgeschlagen. Bitte erneut versuchen.',photo:'Foto',photoFormats:'JPG oder PNG · ein klares Foto funktioniert am besten',photoFormatsMobile:'JPG oder PNG · ein klares Foto funktioniert am besten',
  tipsBestResults:'Tipps für beste Ergebnisse',tipClear:'Ein klares, gut beleuchtetes Foto verwenden',tipCentered:'Motiv mittig platzieren',tipResolution:'Höhere Auflösung ergibt sauberere Konturen',
  original:'Original',sketch:'Skizze',cartoon:'Cartoon',popArt:'Pop Art',colors:'Farben',color:'Farbe',noImage:'Kein Bild',
  noProjectorImage:'Öffne zuerst ein Foto im Design Studio.',acrylic:'Acryl',wool:'Wolle',estimatedYarn:'Geschätztes Garn',coverageArea:'Fläche',costEstimate:'Kostenschätzung',
  projectName:'Projektname',yarnCostCalculator:'Garn- & Kostenrechner',calculatorDesc:'Berechne Garnmenge und Materialkosten vor dem Tuften.',
  yarnType:'Garntyp',density:'Dichte',light:'Leicht',standard:'Standard',dense:'Dicht',price100g:'Preis / 100g',waste:'Verschnitt',calculate:'Berechnen',
  area:'Fläche',baseYarn:'Basisgarn',totalYarn:'Gesamtgarn',planningEstimate:'Dies ist eine Planungsschätzung. Der echte Garnverbrauch hängt von Florhöhe, Fadenzahl und Tufting-Dichte ab.',
  displayName:'Anzeigename',chooseDashboardPhoto:'Dashboard-Profilfoto auswählen',removePhoto:'Foto entfernen',
  profilePhotoNote:'Dieses Foto erscheint als runder Avatar neben „Hallo“ im mobilen Dashboard.',upload:'Hochladen',
  calculationSaved:'Berechnung gespeichert',savedCalculations:'Gespeicherte Berechnungen',numberOfColors:'Farben',projectsThisWeek:'Projekte',calculationsThisWeek:'Berechnungen',weeklyCost:'Wochenkosten'
 },
 sq:{
  dashboard:'Paneli',projects:'Projektet',gallery:'Galeria',design:'Studio Dizajni',projector:'Projektori',calculator:'Llogaritësi',materials:'Materialet',settings:'Cilësimet',guide:'Udhëzuesi',notebook:'Shënimet e mia',
  hello:'Përshëndetje',studioOwner:'Pronari i Studios',thisWeek:'Këtë javë',quickActions:'Veprime të shpejta',recentProjects:'Projektet e fundit',
  newProject:'Projekt i ri',status:'Statusi',completed:'Përfunduar',inProgress:'Në punë',back:'Mbrapa',calendar:'Kalendari',statistics:'Statistikat',appointments:'Terminet',
  noStats:'Ende nuk ka statistika',noAppointments:'Ende nuk ka termine',addAppointment:'Shto termin',language:'Gjuha',notifications:'Njoftimet',
  appointmentNotifications:'Njoftimet për termine',save:'Ruaj',saved:'U ruajt',saving:'Duke ruajtur...',profile:'Profili',studioLogo:'Logo e studios',logout:'Dil',
  uploadPhoto:'Ngarko fotografinë',fromGallery:'Nga Galeria',takePhoto:'Bëj Foto',preview:'Paraqitja',style:'Stili',colorPalette:'Paleta e ngjyrave',
  continueTools:'Vazhdo te veglat',projectorTools:'Veglat e projektorit',mirror:'Pasqyrë',yarnCalculator:'Llogaritësi i leshit',saveProject:'Ruaj projektin',
  noProjects:'Ende nuk ka projekte',projectLibrary:'Biblioteka e projekteve.',home:'Kreu',new:'I ri',menu:'Menu',
  allSavedProjects:'Të gjitha projektet e ruajtura të tufting.',name:'Emri',widthCm:'Gjerësia cm',heightCm:'Lartësia cm',notes:'Shënime',
  createProject:'Krijo projektin',delete:'Fshi',deleteProjectConfirm:'Ta fshij projektin?',materialCost:'Kosto materiali',projectNameRequired:'Shkruaj emrin e projektit.',
  saveFailed:'Nuk u ruajt. Provo përsëri.',photo:'Foto',photoFormats:'JPG ose PNG · foto e qartë jep rezultat më të mirë',photoFormatsMobile:'JPG ose PNG · foto e qartë jep rezultat më të mirë',
  tipsBestResults:'Këshilla për rezultat më të mirë',tipClear:'Përdor foto të qartë dhe me dritë',tipCentered:'Mbaje subjektin në qendër',tipResolution:'Rezolucioni i lartë jep konture më të pastra',
  original:'Origjinali',sketch:'Skicë',cartoon:'Kartun',popArt:'Pop Art',colors:'ngjyra',color:'Ngjyra',noImage:'Nuk ka foto',
  noProjectorImage:'Hap fillimisht një foto nga Studio Dizajni.',acrylic:'Akrilik',wool:'Lesh',estimatedYarn:'Leshi i parashikuar',coverageArea:'Sipërfaqja',costEstimate:'Kosto e parashikuar',
  projectName:'Emri i projektit',yarnCostCalculator:'Llogaritësi i leshit & kostos',calculatorDesc:'Llogarit sasinë e leshit dhe koston e materialit para se të fillosh tufting.',
  yarnType:'Lloji i leshit',density:'Dendësia',light:'E lehtë',standard:'Standarde',dense:'E dendur',price100g:'Çmimi / 100g',waste:'Humbje',calculate:'Llogarit',
  area:'Sipërfaqja',baseYarn:'Leshi bazë',totalYarn:'Leshi total',planningEstimate:'Ky është një vlerësim planifikimi. Përdorimi real i leshit varet nga lartësia e fijes, numri i fijeve dhe dendësia e tufting.',
  displayName:'Emri i shfaqur',chooseDashboardPhoto:'Zgjidh foton e profilit në Dashboard',removePhoto:'Hiq foton',
  profilePhotoNote:'Kjo foto shfaqet si avatar i rrumbullakët pranë “Përshëndetje” në Dashboard.',upload:'Ngarko',
  calculationSaved:'Llogaritja u ruajt',savedCalculations:'Llogaritjet e ruajtura',numberOfColors:'Ngjyra',projectsThisWeek:'Projekte',calculationsThisWeek:'Llogaritje',weeklyCost:'Kosto javore'
 }
}

const C=createContext(null)
export function I18nProvider({children}){
 const [lang,setLangState]=useState(localStorage.getItem('tufting_lang')||'en')
 const setLang=l=>{localStorage.setItem('tufting_lang',l);setLangState(l)}
 const value=useMemo(()=>({lang,setLang,t:k=>translations[lang]?.[k]||translations.en[k]||k}),[lang])
 return <C.Provider value={value}>{children}</C.Provider>
}
export const useI18n=()=>useContext(C)
