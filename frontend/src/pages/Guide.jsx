import React,{useRef,useState} from 'react'
import {
  ArrowLeft,ArrowRight,BookOpen,Boxes,Calculator,CheckCircle2,ChevronLeft,ChevronRight,
  ClipboardList,Clock3,FolderKanban,Home,Images,MousePointer2,PackageCheck,Projector,
  Save,Settings,Sparkles,WalletCards,WandSparkles
} from 'lucide-react'
import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'

const PAGES=[
 {id:'dashboard',Icon:Home,color:'#7650d7',title:{sq:'Paneli',de:'Dashboard',en:'Dashboard'},copy:{
  sq:['Pamja kryesore e studios: shiko punën e javës, statistikat, terminet dhe projektet e fundit.',['Prek një kartë për të hapur pjesën përkatëse.','Përdor Veprimet e shpejta për një punë të re.','Kalendari dhe statistikat përditësohen nga puna jote.']],
  de:['Die Übersicht für Woche, Statistiken, Termine und letzte Projekte.',['Tippe auf eine Karte, um den Bereich zu öffnen.','Nutze Schnellaktionen für eine neue Aufgabe.','Kalender und Statistiken werden automatisch aktualisiert.']],
  en:['Your studio overview for the week, statistics, appointments and recent projects.',['Tap a card to open its section.','Use Quick Actions to start new work.','Calendar and statistics update from your activity.']] }},
 {id:'projects',Icon:FolderKanban,color:'#0ca892',title:{sq:'Projektet',de:'Projekte',en:'Projects'},copy:{
  sq:['Këtu ruhen punimet e tua me emër, përmasa, foto, kosto dhe status.',['Shtyp “Projekt i ri” dhe plotëso të dhënat.','Ndrysho statusin në “Në punë” ose “Përfunduar”.','Fshi vetëm projektin që nuk të duhet më.']],
  de:['Hier speicherst du Arbeiten mit Name, Maßen, Foto, Kosten und Status.',['Erstelle ein neues Projekt und fülle die Angaben aus.','Setze den Status auf In Arbeit oder Fertig.','Lösche nur Projekte, die du nicht mehr brauchst.']],
  en:['Store each piece with its name, size, image, cost and status.',['Create a new project and enter its details.','Set the status to In Progress or Completed.','Delete only projects you no longer need.']] }},
 {id:'gallery',Icon:Images,color:'#ff4f82',title:{sq:'Galeria',de:'Galerie',en:'Gallery'},copy:{
  sq:['Galeria mbledh fotografitë e projekteve të ruajtura për t’i gjetur shpejt.',['Ruaj më parë një projekt me fotografi.','Hap Galerinë për pamjen vizuale.','Prek fotografinë për të parë punimin.']],
  de:['Die Galerie sammelt gespeicherte Projektbilder für schnellen Zugriff.',['Speichere zuerst ein Projekt mit Bild.','Öffne die Galerie für die Bildübersicht.','Tippe auf ein Bild, um das Werk anzusehen.']],
  en:['The gallery collects saved project photos for quick visual access.',['Save a project with a photo first.','Open Gallery for the visual overview.','Tap a photo to view the piece.']] }},
 {id:'design',Icon:WandSparkles,color:'#ff7a20',title:{sq:'Studio Dizajni',de:'Design Studio',en:'Design Studio'},copy:{
  sq:['Ktheje një fotografi në skicë, kartun ose model me paletë të thjeshtuar.',['Ngarko një foto të qartë dhe të ndriçuar.','Zgjidh stilin dhe numrin e ngjyrave.','Vazhdo te veglat ose ruaje si projekt.']],
  de:['Verwandle ein Foto in Skizze, Cartoon oder vereinfachte Farbvorlage.',['Lade ein klares, helles Foto hoch.','Wähle Stil und Anzahl der Farben.','Gehe zu den Werkzeugen oder speichere das Projekt.']],
  en:['Turn a photo into a sketch, cartoon or simplified color pattern.',['Upload a clear, well-lit photo.','Choose a style and number of colors.','Continue to tools or save it as a project.']] }},
 {id:'projector',Icon:Projector,color:'#5530bc',title:{sq:'Projektori',de:'Projektor',en:'Projector'},copy:{
  sq:['Përshtate modelin mbi kanavacë me lëvizje, zmadhim, rrotullim dhe pasqyrë.',['Hap foton nga Studio Dizajni ose ngarkoje.','Lëvize dhe zmadhoje derisa të përshtatet.','Aktivizo rrjetën ose pasqyrën kur të duhet.']],
  de:['Passe die Vorlage mit Bewegung, Zoom, Drehung und Spiegelung an.',['Öffne ein Bild aus dem Design Studio oder lade es hoch.','Verschiebe und skaliere es passend.','Aktiviere Raster oder Spiegelung bei Bedarf.']],
  en:['Fit the pattern using move, zoom, rotate and mirror controls.',['Open an image from Design Studio or upload one.','Move and scale it until it fits.','Enable the grid or mirror when needed.']] }},
 {id:'calculator',Icon:Calculator,color:'#e8932f',title:{sq:'Llogaritësi',de:'Rechner',en:'Calculator'},copy:{
  sq:['Llogarit sasinë e leshit dhe koston para se të fillosh një tapet.',['Shkruaj gjerësinë dhe lartësinë në centimetra.','Zgjidh llojin, dendësinë, çmimin dhe humbjen.','Shtyp Llogarit dhe ruaj rezultatin.']],
  de:['Berechne Garnmenge und Kosten, bevor du einen Teppich beginnst.',['Gib Breite und Höhe in Zentimetern ein.','Wähle Material, Dichte, Preis und Verschnitt.','Berechne und speichere das Ergebnis.']],
  en:['Estimate yarn and material cost before starting a rug.',['Enter width and height in centimetres.','Choose yarn, density, price and waste.','Calculate and save the result.']] }},
 {id:'materials',Icon:Boxes,color:'#159987',title:{sq:'Materialet',de:'Materialien',en:'Materials'},copy:{
  sq:['Regjistro llojet e leshit, ngjyrat, sasinë dhe çmimin e materialeve.',['Shto materialin me emër dhe ngjyrë.','Shkruaj sasinë që ke në dispozicion.','Përditësoje kur blen ose përdor material.']],
  de:['Verwalte Garnarten, Farben, Mengen und Materialpreise.',['Füge Material mit Name und Farbe hinzu.','Trage den verfügbaren Bestand ein.','Aktualisiere ihn nach Einkauf oder Verbrauch.']],
  en:['Track yarn types, colors, quantities and material prices.',['Add a material with its name and color.','Enter the quantity you have available.','Update it after buying or using stock.']] }},
 {id:'work-hours',Icon:Clock3,color:'#2f7df7',title:{sq:'Orët e punës',de:'Arbeitszeit',en:'Work Hours'},copy:{
  sq:['Mbaj shënim kohën e punës dhe vlerën e orëve për çdo ditë.',['Nis matësin kur fillon punën.','Ndaloje ose shto një hyrje manualisht.','Shiko totalin ditor, javor dhe koston.']],
  de:['Erfasse Arbeitszeit und Stundenwert für jeden Tag.',['Starte den Timer bei Arbeitsbeginn.','Stoppe ihn oder trage Zeit manuell ein.','Sieh Tages-, Wochenzeit und Kosten.']],
  en:['Track work time and hourly value for each day.',['Start the timer when work begins.','Stop it or add a manual entry.','Review daily, weekly and cost totals.']] }},
 {id:'orders',Icon:ClipboardList,color:'#d56580',title:{sq:'Porositë',de:'Bestellungen',en:'Orders'},copy:{
  sq:['Organizo porositë e klientëve, afatet, vlerën dhe fazën e punës.',['Krijo porosinë me klientin dhe afatin.','Vendos çmimin dhe statusin aktual.','Përditësoje derisa të dorëzohet.']],
  de:['Organisiere Kundenaufträge, Termine, Werte und Arbeitsphasen.',['Erstelle einen Auftrag mit Kunde und Termin.','Setze Preis und aktuellen Status.','Aktualisiere ihn bis zur Auslieferung.']],
  en:['Organize customer orders, deadlines, value and work stage.',['Create an order with customer and due date.','Set its price and current status.','Update it through delivery.']] }},
 {id:'inventory',Icon:PackageCheck,color:'#7c61be',title:{sq:'Inventari',de:'Inventar',en:'Inventory'},copy:{
  sq:['Kontrollo çfarë ke në stok dhe cilat materiale po mbarojnë.',['Shto artikullin dhe njësinë matëse.','Regjistro sasinë dhe pragun minimal.','Kontrollo sinjalin para se të bësh blerje.']],
  de:['Kontrolliere Lagerbestand und knapp werdende Materialien.',['Füge Artikel und Maßeinheit hinzu.','Trage Bestand und Mindestmenge ein.','Prüfe Warnungen vor dem Einkauf.']],
  en:['Monitor stock and see which supplies are running low.',['Add an item and its unit.','Enter quantity and minimum threshold.','Check warnings before shopping.']] }},
 {id:'expenses',Icon:WalletCards,color:'#d88932',title:{sq:'Shpenzimet',de:'Ausgaben',en:'Expenses'},copy:{
  sq:['Regjistro çdo shpenzim të studios për të kuptuar koston reale të punës.',['Shto shumën, kategorinë dhe datën.','Shkruaj një përshkrim të qartë.','Kontrollo totalet dhe ndarjen sipas kategorisë.']],
  de:['Erfasse Studioausgaben, um die realen Arbeitskosten zu kennen.',['Füge Betrag, Kategorie und Datum hinzu.','Schreibe eine klare Beschreibung.','Prüfe Summen nach Kategorie.']],
  en:['Record studio expenses to understand the real cost of your work.',['Add amount, category and date.','Write a clear description.','Review totals and category breakdown.']] }},
 {id:'settings',Icon:Settings,color:'#68717e',title:{sq:'Cilësimet',de:'Einstellungen',en:'Settings'},copy:{
  sq:['Përshtat profilin, fotografinë, logon, gjuhën dhe njoftimet.',['Ndrysho emrin ose fotografinë e profilit.','Ngarko logon e studios dhe zgjidh gjuhën.','Shtyp Ruaj që ndryshimet të mbeten.']],
  de:['Passe Profil, Foto, Logo, Sprache und Benachrichtigungen an.',['Ändere Profilname oder Foto.','Lade dein Logo hoch und wähle die Sprache.','Speichere, damit Änderungen erhalten bleiben.']],
  en:['Customize your profile, photo, logo, language and notifications.',['Change the profile name or photo.','Upload the studio logo and choose a language.','Press Save to keep your changes.']] }}
]

const UI={
 sq:{title:'Si funksionon programi',subtitle:'Një udhëzues vizual, faqe pas faqeje',contents:'Faqet e programit',previous:'Mbrapa',next:'Tjetra',page:'Fleta',tip:'Çfarë të bësh'},
 de:{title:'So funktioniert das Programm',subtitle:'Eine visuelle Anleitung, Seite für Seite',contents:'Programmbereiche',previous:'Zurück',next:'Weiter',page:'Seite',tip:'So gehst du vor'},
 en:{title:'How the program works',subtitle:'A visual guide, page by page',contents:'Program pages',previous:'Previous',next:'Next',page:'Page',tip:'What to do'}
}

export default function Guide(){
 const {lang}=useI18n(),u=UI[lang]||UI.en
 const [index,setIndex]=useState(0),[direction,setDirection]=useState('next')
 const touchX=useRef(null),page=PAGES[index],text=page.copy[lang]||page.copy.en
 const go=next=>{const safe=Math.max(0,Math.min(PAGES.length-1,next));if(safe===index)return;setDirection(safe>index?'next':'previous');setIndex(safe)}

 return <div className="knowledge-page guide-page mobile-standard-page">
  <MobilePageHeader title={u.title}/>
  <header className="knowledge-title"><div><span className="knowledge-kicker"><BookOpen/>{u.contents}</span><h1>{u.title}</h1><p>{u.subtitle}</p></div><div className="guide-count"><b>{String(index+1).padStart(2,'0')}</b><span>/ {PAGES.length}</span></div></header>
  <div className="guide-layout">
   <aside className="guide-chapters" aria-label={u.contents}><strong>{u.contents}</strong><div>{PAGES.map((p,i)=><button key={p.id} className={i===index?'active':''} onClick={()=>go(i)} style={{'--chapter-color':p.color}}><span><p.Icon/></span><em>{String(i+1).padStart(2,'0')}</em><b>{p.title[lang]||p.title.en}</b></button>)}</div></aside>
   <section className="guide-book" tabIndex="0" onKeyDown={e=>{if(e.key==='ArrowLeft')go(index-1);if(e.key==='ArrowRight')go(index+1)}} onTouchStart={e=>{touchX.current=e.touches[0].clientX}} onTouchEnd={e=>{if(touchX.current===null)return;const delta=e.changedTouches[0].clientX-touchX.current;if(Math.abs(delta)>45)go(index+(delta<0?1:-1));touchX.current=null}}>
    <article className={`guide-sheet turn-${direction}`} key={page.id} style={{'--guide-color':page.color}}>
     <div className="guide-sheet-number"><span>{u.page}</span><b>{index+1}</b></div>
     <div className="guide-visual"><GuideSketch page={page} lang={lang}/></div>
     <div className="guide-explanation"><span className="guide-icon"><page.Icon/></span><h2>{page.title[lang]||page.title.en}</h2><p>{text[0]}</p><h3><MousePointer2/>{u.tip}</h3><ol>{text[1].map((step,i)=><li key={step}><span>{i+1}</span>{step}</li>)}</ol><div className="guide-done"><CheckCircle2/>{lang==='sq'?'Ndryshimet ruhen nga butoni Ruaj ose automatikisht, sipas faqes.':lang==='de'?'Änderungen werden je nach Bereich gespeichert oder automatisch gesichert.':'Changes save with the Save button or automatically, depending on the page.'}</div></div>
    </article>
    <footer className="guide-controls"><button disabled={index===0} onClick={()=>go(index-1)}><ChevronLeft/>{u.previous}</button><div className="guide-dots">{PAGES.map((p,i)=><button key={p.id} aria-label={`${u.page} ${i+1}`} className={i===index?'active':''} onClick={()=>go(i)}/>)}</div><button disabled={index===PAGES.length-1} onClick={()=>go(index+1)}>{u.next}<ChevronRight/></button></footer>
   </section>
  </div>
 </div>
}

function GuideSketch({page,lang}){
 const title=page.title[lang]||page.title.en,Icon=page.Icon
 return <div className={`guide-sketch sketch-${page.id}`}>
  <div className="sketch-window-head"><span><i/><i/><i/></span><b>{title}</b><Sparkles/></div>
  <div className="sketch-window-body">
   {page.id==='dashboard'&&<><div className="sketch-metrics"><i/><i/><i/></div><div className="sketch-chart"><span/><span/><span/><span/><span/></div></>}
   {page.id==='projects'&&<div className="sketch-projects">{[1,2,3].map(n=><div key={n}><span><FolderKanban/></span><i/><i/></div>)}</div>}
   {page.id==='gallery'&&<div className="sketch-gallery">{[1,2,3,4].map(n=><span key={n}><Images/></span>)}</div>}
   {page.id==='design'&&<div className="sketch-flow"><span><Images/></span><ArrowRight/><span><WandSparkles/></span><ArrowRight/><span><Sparkles/></span></div>}
   {page.id==='projector'&&<div className="sketch-projector"><i className="grid"/><span><Projector/></span><div className="sketch-arrows"><ArrowLeft/><ArrowRight/></div></div>}
   {page.id==='calculator'&&<div className="sketch-calculator"><span>80 × 60 cm</span><ArrowRight/><b>860 g</b><Calculator/></div>}
   {page.id==='materials'&&<div className="sketch-materials">{['#ff6f82','#0ca892','#7650d7','#ffc64e'].map(c=><span key={c} style={{background:c}}><i/></span>)}</div>}
   {page.id==='work-hours'&&<div className="sketch-time"><Clock3/><strong>02:45</strong><span><i/><i/><i/></span></div>}
   {page.id==='orders'&&<div className="sketch-status"><span><ClipboardList/></span><i/><span><CheckCircle2/></span><i/><span><Save/></span></div>}
   {page.id==='inventory'&&<div className="sketch-shelves">{[1,2,3].map(n=><div key={n}><PackageCheck/><PackageCheck/><PackageCheck/></div>)}</div>}
   {page.id==='expenses'&&<div className="sketch-expenses"><WalletCards/><div><span/><span/><span/><span/></div><b>€</b></div>}
   {page.id==='settings'&&<div className="sketch-settings"><Settings/>{[1,2,3].map(n=><span key={n}><i/><b className={n!==2?'on':''}/></span>)}</div>}
  </div>
  <div className="sketch-label"><Icon/><span>{title}</span></div>
 </div>
}
