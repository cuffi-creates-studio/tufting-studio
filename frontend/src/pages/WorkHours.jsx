import React,{useEffect,useMemo,useState} from 'react'
import {CalendarDays,Clock3,History,Play,Square,Trash2,Wrench,Zap} from 'lucide-react'
import {useI18n} from '../i18n/I18n'
import {
 deleteWorkSession,getRunningDeviceSeconds,getRunningWorkSession,getWorkSessions,
 secondsForToday,secondsForWeek,startWorkSession,stopWorkSession,toggleWorkDevice
} from '../lib/workHoursStore'
import {createEnergyExpenseForWorkSession,deleteEnergyExpenseForWorkSession} from '../lib/businessStore'
import '../styles/work-hours-retro.css'

const RATE_KEY='tufting_energy_rate_eur_kwh'
const GUN_W_KEY='tufting_gun_watts'
const SHEARER_W_KEY='tufting_shearer_watts'

export default function WorkHours(){
 const {lang}=useI18n()
 const tx=labels(lang)
 const [now,setNow]=useState(new Date())
 const [running,setRunning]=useState(getRunningWorkSession())
 const [sessions,setSessions]=useState([])
 const [busy,setBusy]=useState(false)
 const [historyOpen,setHistoryOpen]=useState(false)
 const [rate,setRate]=useState(()=>readNumber(RATE_KEY,0.35))
 const [gunW,setGunW]=useState(()=>readNumber(GUN_W_KEY,100))
 const [shearerW,setShearerW]=useState(()=>readNumber(SHEARER_W_KEY,0))

 async function load(){
   try{setSessions(await getWorkSessions())}catch(e){console.error(e);setSessions([])}
   setRunning(getRunningWorkSession())
 }
 useEffect(()=>{load();const id=setInterval(()=>setNow(new Date()),1000);const refresh=()=>load();window.addEventListener('tufting-work-hours-updated',refresh);return()=>{clearInterval(id);window.removeEventListener('tufting-work-hours-updated',refresh)}},[])
 useEffect(()=>writeNumber(RATE_KEY,rate),[rate])
 useEffect(()=>writeNumber(GUN_W_KEY,gunW),[gunW])
 useEffect(()=>writeNumber(SHEARER_W_KEY,shearerW),[shearerW])

 const liveSeconds=running?Math.max(0,Math.floor((now-new Date(running.started_at))/1000)):0
 const gunSeconds=getRunningDeviceSeconds(running,'gun',now)
 const shearerSeconds=getRunningDeviceSeconds(running,'shearer',now)
 const today=secondsForToday(sessions,now)+runningSecondsForPeriod(running,now,'day')
 const week=secondsForWeek(sessions,now)+runningSecondsForPeriod(running,now,'week')
 const month=useMemo(()=>sessions.reduce((sum,s)=>{const d=new Date(s.started_at);return d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth()?sum+(Number(s.duration_seconds)||0):sum},0)+runningSecondsForPeriod(running,now,'month'),[sessions,now,running])
 const liveEnergy=energyTotals(gunSeconds,shearerSeconds,gunW,shearerW,rate)

 async function removeSession(id){
   if(!id||!confirm(tx.confirmDelete))return
   try{
     await Promise.allSettled([deleteEnergyExpenseForWorkSession(id),deleteWorkSession(id)])
     await load()
   }catch(e){console.error(e);alert(tx.deleteError)}
 }

 async function toggle(){
   if(busy)return
   setBusy(true)
   try{
     if(running){
       const finished=await stopWorkSession()
       if(finished){
         await createEnergyExpenseForWorkSession(finished,{
           gun_w:gunW,
           shearer_w:shearerW,
           rate_eur_kwh:rate,
           gun_label:tx.gun,
           shearer_label:tx.shearer,
           auto_label:tx.automatic,
           note_label:tx.energyNote,
         })
       }
     }else startWorkSession()
     await load()
   }catch(e){console.error(e);alert(tx.saveError)}finally{setBusy(false)}
 }

 function toggleDevice(device){
   if(!running)return
   toggleWorkDevice(device)
   setRunning(getRunningWorkSession())
 }

 return <div className="work-hours-page">
   <div className="wh-head">
     <div><h1>{tx.title}</h1><p>{tx.subtitle}</p></div>
     <div className={`wh-status ${running?'active':''}`}><i></i>{running?tx.running:tx.stopped}</div>
   </div>

   <section className="wh-hero">
     <div className="wh-hero-clock"><Clock3/><span>{tx.current}</span><b>{formatDuration(liveSeconds)}</b><small>{running?formatTime(new Date(running.started_at),lang):tx.notStarted}</small></div>
     <button className={`wh-main-action ${running?'stop':'start'}`} onClick={toggle} disabled={busy}>{running?<><Square/> {tx.stop}</>:<><Play/> {tx.start}</>}</button>
   </section>

   <section className="wh-device-panel">
     <div className="wh-device-head">
       <div><h2>{tx.devices}</h2><p>{tx.devicesSub}</p></div>
       <label className="wh-rate"><span>€/kWh</span><input type="number" min="0" step="0.001" value={rate} onChange={e=>setRate(safeNumber(e.target.value))}/></label>
     </div>
     <div className="wh-device-grid">
       <DeviceCard icon={<Zap/>} name={tx.gun} seconds={gunSeconds} watts={gunW} setWatts={setGunW} active={running?.active_device==='gun'} disabled={!running} onToggle={()=>toggleDevice('gun')} tx={tx}/>
       <DeviceCard icon={<Wrench/>} name={tx.shearer} seconds={shearerSeconds} watts={shearerW} setWatts={setShearerW} active={running?.active_device==='shearer'} disabled={!running} onToggle={()=>toggleDevice('shearer')} tx={tx}/>
     </div>
     <div className="wh-energy-live">
       <span>{tx.currentEnergy}</span>
       <b>{liveEnergy.kwh.toFixed(4)} kWh</b>
       <strong>€{liveEnergy.cost.toFixed(4)}</strong>
       {shearerW<=0&&<small>{tx.shearerHint}</small>}
     </div>
   </section>

   <div className="wh-stats">
     <article className="yellow"><CalendarDays/><span>{tx.today}</span><b>{formatDuration(today)}</b></article>
     <article className="pink"><History/><span>{tx.week}</span><b>{formatDuration(week)}</b></article>
     <article className="blue"><Clock3/><span>{tx.month}</span><b>{formatDuration(month)}</b></article>
   </div>

   <section className={`wh-history-card ${historyOpen?'open':''}`}>
     <div className="wh-section-title"><History/><div><h2>{tx.history}</h2><p>{tx.historySub}</p></div></div>
     <button type="button" className="wh-history-toggle" onClick={()=>setHistoryOpen(v=>!v)} aria-expanded={historyOpen}>
       <span className="wh-history-toggle-icon"><History/></span>
       <span>{historyOpen?tx.hideHistory:tx.showHistory}</span>
       <b aria-hidden="true">›</b>
     </button>
     <div className="wh-history-content">
       {sessions.length?<div className="wh-table-wrap"><table><thead><tr><th>{tx.date}</th><th>{tx.startAt}</th><th>{tx.endAt}</th><th>{tx.duration}</th><th>{tx.gun}</th><th>{tx.shearer}</th><th>{tx.energyCost}</th><th>{tx.actions}</th></tr></thead><tbody>{sessions.slice(0,60).map(s=>{const e=energyTotals(Number(s.gun_seconds)||0,Number(s.shearer_seconds)||0,gunW,shearerW,rate);return <tr key={s.id}><td>{formatDate(new Date(s.started_at),lang)}</td><td>{formatTime(new Date(s.started_at),lang)}</td><td>{formatTime(new Date(s.ended_at),lang)}</td><td><b>{formatDuration(Number(s.duration_seconds)||0)}</b></td><td>{formatDuration(Number(s.gun_seconds)||0)}</td><td>{formatDuration(Number(s.shearer_seconds)||0)}</td><td>€{e.cost.toFixed(4)}</td><td><button type="button" className="wh-delete-session" onClick={()=>removeSession(s.id)} title={tx.delete}><Trash2/><span>{tx.delete}</span></button></td></tr>})}</tbody></table></div>:<div className="wh-empty">{tx.empty}</div>}
     </div>
   </section>
 </div>
}

function DeviceCard({icon,name,seconds,watts,setWatts,active,disabled,onToggle,tx}){
 return <article className={`wh-device-card ${active?'active':''}`}>
   <div className="wh-device-icon">{icon}</div>
   <div className="wh-device-main"><span>{name}</span><b>{formatDuration(seconds)}</b></div>
   <label className="wh-watts"><span>W</span><input type="number" min="0" step="1" value={watts} onChange={e=>setWatts(safeNumber(e.target.value))}/></label>
   <button type="button" className={active?'stop':'start'} disabled={disabled} onClick={onToggle}>{active?<><Square/>{tx.deviceStop}</>:<><Play/>{tx.deviceStart}</>}</button>
 </article>
}

function energyTotals(gunSeconds,shearerSeconds,gunW,shearerW,rate){
 const kwh=(Math.max(0,Number(gunW)||0)*Math.max(0,Number(gunSeconds)||0)+Math.max(0,Number(shearerW)||0)*Math.max(0,Number(shearerSeconds)||0))/3600000
 return{kwh,cost:kwh*Math.max(0,Number(rate)||0)}
}
function readNumber(key,fallback){try{const v=Number(localStorage.getItem(key));return Number.isFinite(v)&&v>=0?v:fallback}catch{return fallback}}
function writeNumber(key,value){try{localStorage.setItem(key,String(Math.max(0,Number(value)||0)))}catch{}}
function safeNumber(v){const n=Number(v);return Number.isFinite(n)&&n>=0?n:0}
function formatDuration(sec){sec=Math.max(0,Math.floor(Number(sec)||0));const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}
function locale(lang){return lang==='sq'?'sq-AL':lang==='de'?'de-DE':'en-GB'}
function formatDate(d,lang){return d.toLocaleDateString(locale(lang),{day:'2-digit',month:'2-digit',year:'numeric'})}
function formatTime(d,lang){return d.toLocaleTimeString(locale(lang),{hour:'2-digit',minute:'2-digit'})}
function labels(lang){
 if(lang==='sq')return{title:'Orët e punës',subtitle:'Regjistro kohën reale që punon në projektet e tufting.',running:'Duke punuar',stopped:'I ndalur',current:'Sesioni aktual',notStarted:'Nuk ka sesion aktiv',start:'Start',stop:'Stop',today:'Sot',week:'Këtë javë',month:'Këtë muaj',history:'Historiku i punës',historySub:'Çdo Stop ruhet automatikisht.',date:'Data',startAt:'Fillimi',endAt:'Mbarimi',duration:'Kohëzgjatja',empty:'Ende nuk ka orë pune të ruajtura.',showHistory:'Shiko historikun',hideHistory:'Mbyll historikun',saveError:'Nuk u ruajt sesioni. Kontrollo lidhjen dhe provo përsëri.',actions:'Veprime',delete:'Fshi',confirmDelete:'Ta fshij këtë sesion pune dhe shpenzimin e energjisë?',deleteError:'Sesioni nuk u fshi. Provo përsëri.',devices:'Pajisjet gjatë punës',devicesSub:'Mat vetëm kohën kur pajisja është realisht në përdorim.',gun:'Pistoleta',shearer:'Makina qethëse',deviceStart:'Nis',deviceStop:'Ndalo',currentEnergy:'Energjia e këtij sesioni',energyCost:'Kosto energjie',shearerHint:'Vendos fuqinë W të qethëses nga etiketa/adapteri që llogaritja të jetë e saktë.',automatic:'Automatik',energyNote:'Gjeneruar automatikisht nga Orët e punës.'}
 if(lang==='de')return{title:'Arbeitszeit',subtitle:'Erfasse deine echte Arbeitszeit für Tufting-Projekte.',running:'Läuft',stopped:'Gestoppt',current:'Aktuelle Sitzung',notStarted:'Keine aktive Sitzung',start:'Start',stop:'Stop',today:'Heute',week:'Diese Woche',month:'Dieser Monat',history:'Arbeitsverlauf',historySub:'Jeder Stop wird automatisch gespeichert.',date:'Datum',startAt:'Start',endAt:'Ende',duration:'Dauer',empty:'Noch keine Arbeitszeit gespeichert.',showHistory:'Verlauf anzeigen',hideHistory:'Verlauf schließen',saveError:'Sitzung konnte nicht gespeichert werden. Bitte erneut versuchen.',actions:'Aktionen',delete:'Löschen',confirmDelete:'Diese Arbeitssitzung und die Energiekosten löschen?',deleteError:'Sitzung konnte nicht gelöscht werden.',devices:'Geräte während der Arbeit',devicesSub:'Nur die echte Nutzungszeit des Geräts wird gemessen.',gun:'Tufting-Pistole',shearer:'Schermaschine',deviceStart:'Start',deviceStop:'Stop',currentEnergy:'Energie dieser Sitzung',energyCost:'Energiekosten',shearerHint:'Trage die Wattzahl der Schermaschine vom Typenschild/Netzteil ein.',automatic:'Automatisch',energyNote:'Automatisch aus der Arbeitszeit erstellt.'}
 return{title:'Work Hours',subtitle:'Track the real time you spend on tufting projects.',running:'Running',stopped:'Stopped',current:'Current session',notStarted:'No active session',start:'Start',stop:'Stop',today:'Today',week:'This week',month:'This month',history:'Work history',historySub:'Every Stop is saved automatically.',date:'Date',startAt:'Start',endAt:'End',duration:'Duration',empty:'No saved work sessions yet.',showHistory:'View history',hideHistory:'Hide history',saveError:'Could not save the session. Check the connection and try again.',actions:'Actions',delete:'Delete',confirmDelete:'Delete this work session and its energy expense?',deleteError:'Could not delete the session.',devices:'Devices during work',devicesSub:'Measure only the time the device is actually being used.',gun:'Tufting gun',shearer:'Shearing machine',deviceStart:'Start',deviceStop:'Stop',currentEnergy:'Energy for this session',energyCost:'Energy cost',shearerHint:'Enter the shearing machine wattage from its label/adapter for an accurate calculation.',automatic:'Automatic',energyNote:'Generated automatically from Work Hours.'}
}
function runningSecondsForPeriod(running,now,period){if(!running?.started_at)return 0;const start=new Date(running.started_at);let boundary=new Date(now);if(period==='day'){boundary.setHours(0,0,0,0)}else if(period==='week'){const d=(boundary.getDay()+6)%7;boundary.setHours(0,0,0,0);boundary.setDate(boundary.getDate()-d)}else if(period==='month'){boundary=new Date(now.getFullYear(),now.getMonth(),1)}const effective=start>boundary?start:boundary;return Math.max(0,Math.floor((now-effective)/1000))}
