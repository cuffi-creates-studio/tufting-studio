import React,{useEffect,useMemo,useState} from 'react'
import {Clock3,History,Play,Square,CalendarDays} from 'lucide-react'
import {useI18n} from '../i18n/I18n'
import {getRunningWorkSession,getWorkSessions,secondsForToday,secondsForWeek,startWorkSession,stopWorkSession} from '../lib/workHoursStore'
import '../styles/work-hours-retro.css'

export default function WorkHours(){
 const {lang}=useI18n()
 const tx=labels(lang)
 const [now,setNow]=useState(new Date())
 const [running,setRunning]=useState(getRunningWorkSession())
 const [sessions,setSessions]=useState([])
 const [busy,setBusy]=useState(false)
 const [historyOpen,setHistoryOpen]=useState(false)

 async function load(){
   try{setSessions(await getWorkSessions())}catch(e){console.error(e);setSessions([])}
   setRunning(getRunningWorkSession())
 }
 useEffect(()=>{load();const id=setInterval(()=>setNow(new Date()),1000);const refresh=()=>load();window.addEventListener('tufting-work-hours-updated',refresh);return()=>{clearInterval(id);window.removeEventListener('tufting-work-hours-updated',refresh)}},[])

 const liveSeconds=running?Math.max(0,Math.floor((now-new Date(running.started_at))/1000)):0
 const today=secondsForToday(sessions,now)+runningSecondsForPeriod(running,now,'day')
 const week=secondsForWeek(sessions,now)+runningSecondsForPeriod(running,now,'week')
 const month=useMemo(()=>sessions.reduce((sum,s)=>{const d=new Date(s.started_at);return d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth()?sum+(Number(s.duration_seconds)||0):sum},0)+runningSecondsForPeriod(running,now,'month'),[sessions,now,running])

 async function toggle(){
   if(busy)return
   setBusy(true)
   try{
     if(running) await stopWorkSession()
     else startWorkSession()
     await load()
   }catch(e){console.error(e);alert(tx.saveError)}finally{setBusy(false)}
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
       {sessions.length?<div className="wh-table-wrap"><table><thead><tr><th>{tx.date}</th><th>{tx.startAt}</th><th>{tx.endAt}</th><th>{tx.duration}</th></tr></thead><tbody>{sessions.slice(0,60).map(s=><tr key={s.id}><td>{formatDate(new Date(s.started_at),lang)}</td><td>{formatTime(new Date(s.started_at),lang)}</td><td>{formatTime(new Date(s.ended_at),lang)}</td><td><b>{formatDuration(Number(s.duration_seconds)||0)}</b></td></tr>)}</tbody></table></div>:<div className="wh-empty">{tx.empty}</div>}
     </div>
   </section>
 </div>
}

function formatDuration(sec){
 sec=Math.max(0,Math.floor(Number(sec)||0));const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60
 return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}
function locale(lang){return lang==='sq'?'sq-AL':lang==='de'?'de-DE':'en-GB'}
function formatDate(d,lang){return d.toLocaleDateString(locale(lang),{day:'2-digit',month:'2-digit',year:'numeric'})}
function formatTime(d,lang){return d.toLocaleTimeString(locale(lang),{hour:'2-digit',minute:'2-digit'})}
function labels(lang){
 if(lang==='sq')return{title:'Orët e punës',subtitle:'Regjistro kohën reale që punon në projektet e tufting.',running:'Duke punuar',stopped:'I ndalur',current:'Sesioni aktual',notStarted:'Nuk ka sesion aktiv',start:'Start',stop:'Stop',today:'Sot',week:'Këtë javë',month:'Këtë muaj',history:'Historiku i punës',historySub:'Çdo Stop ruhet automatikisht.',date:'Data',startAt:'Fillimi',endAt:'Mbarimi',duration:'Kohëzgjatja',empty:'Ende nuk ka orë pune të ruajtura.',showHistory:'Shiko historikun',hideHistory:'Mbyll historikun',saveError:'Nuk u ruajt sesioni. Kontrollo lidhjen dhe provo përsëri.'}
 if(lang==='de')return{title:'Arbeitszeit',subtitle:'Erfasse deine echte Arbeitszeit für Tufting-Projekte.',running:'Läuft',stopped:'Gestoppt',current:'Aktuelle Sitzung',notStarted:'Keine aktive Sitzung',start:'Start',stop:'Stop',today:'Heute',week:'Diese Woche',month:'Dieser Monat',history:'Arbeitsverlauf',historySub:'Jeder Stop wird automatisch gespeichert.',date:'Datum',startAt:'Start',endAt:'Ende',duration:'Dauer',empty:'Noch keine Arbeitszeit gespeichert.',showHistory:'Verlauf anzeigen',hideHistory:'Verlauf schließen',saveError:'Sitzung konnte nicht gespeichert werden. Bitte erneut versuchen.'}
 return{title:'Work Hours',subtitle:'Track the real time you spend on tufting projects.',running:'Running',stopped:'Stopped',current:'Current session',notStarted:'No active session',start:'Start',stop:'Stop',today:'Today',week:'This week',month:'This month',history:'Work history',historySub:'Every Stop is saved automatically.',date:'Date',startAt:'Start',endAt:'End',duration:'Duration',empty:'No saved work sessions yet.',showHistory:'View history',hideHistory:'Hide history',saveError:'Could not save the session. Check the connection and try again.'}
}

function runningSecondsForPeriod(running,now,period){
 if(!running?.started_at)return 0
 const start=new Date(running.started_at)
 let boundary=new Date(now)
 if(period==='day'){boundary.setHours(0,0,0,0)}
 else if(period==='week'){const d=(boundary.getDay()+6)%7;boundary.setHours(0,0,0,0);boundary.setDate(boundary.getDate()-d)}
 else if(period==='month'){boundary=new Date(now.getFullYear(),now.getMonth(),1)}
 const effective=start>boundary?start:boundary
 return Math.max(0,Math.floor((now-effective)/1000))
}
