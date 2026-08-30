import React,{useEffect,useMemo,useRef,useState} from 'react'
import {Folder,CheckCircle2,RotateCw,Euro,Plus,Images,Projector,Calculator as CalcIcon,ChevronRight,CalendarDays,Clock,TrendingUp,LogOut,X,Bell,Play,Square,History} from 'lucide-react'
import {getProjects} from '../lib/projectsStore'
import {getCalculations} from '../lib/calculationsStore'
import {signOut} from 'firebase/auth'
import {auth} from '../lib/firebase'
import {useNavigate} from 'react-router-dom'
import {useI18n} from '../i18n/I18n'
import {getRunningWorkSession,getWorkSessions,secondsForToday,startWorkSession,stopWorkSession} from '../lib/workHoursStore'
import '../styles/dashboard-retro-work.css'

export default function Dashboard(){
 const {t,lang}=useI18n(),nav=useNavigate()
 const [projects,setProjects]=useState([]),[calculations,setCalculations]=useState([]),[page,setPage]=useState(0),[desktopPage,setDesktopPage]=useState(0),[appointments,setAppointments]=useState(loadAppointments()),[notificationsOpen,setNotificationsOpen]=useState(false)
 const [profile,setProfile]=useState(readProfile()),[now,setNow]=useState(new Date())
 const [workRunning,setWorkRunning]=useState(getRunningWorkSession()),[workSessions,setWorkSessions]=useState([]),[workBusy,setWorkBusy]=useState(false)
 const chart=useRef(null),touchX=useRef(null)

 useEffect(()=>{
   const load=async()=>{
     try{const [p,c]=await Promise.all([getProjects(),getCalculations()]);setProjects(p);setCalculations(c)}catch(e){console.error(e);setProjects([]);setCalculations([])}
   }
   load()
   window.addEventListener('tufting-data-updated',load)
   window.addEventListener('focus',load)
   return()=>{window.removeEventListener('tufting-data-updated',load);window.removeEventListener('focus',load)}
 },[])

 useEffect(()=>{
   const refresh=()=>setProfile(readProfile())
   refresh()
   window.addEventListener('tufting-profile-updated',refresh)
   window.addEventListener('storage',refresh)
   window.addEventListener('focus',refresh)
   window.addEventListener('pageshow',refresh)
   document.addEventListener('visibilitychange',refresh)
   return()=>{
     window.removeEventListener('tufting-profile-updated',refresh)
     window.removeEventListener('storage',refresh)
     window.removeEventListener('focus',refresh)
     window.removeEventListener('pageshow',refresh)
     document.removeEventListener('visibilitychange',refresh)
   }
 },[])

 useEffect(()=>{const id=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(id)},[])
 useEffect(()=>{
   const load=async()=>{try{setWorkSessions(await getWorkSessions())}catch(e){console.error(e)}setWorkRunning(getRunningWorkSession())}
   load()
   window.addEventListener('tufting-work-hours-updated',load)
   return()=>window.removeEventListener('tufting-work-hours-updated',load)
 },[])

 const completed=projects.filter(p=>p.status==='Completed').length,progress=projects.length-completed
 const projectCost=projects.reduce((s,p)=>s+(Number(p.material_cost)||0),0)
 const calculationCost=calculations.reduce((s,c)=>s+(Number(c.cost)||0),0)
 const cost=projectCost+calculationCost
 const stats=useMemo(()=>weekly(projects,calculations),[projects,calculations])
 const workSeconds=workRunning?Math.max(0,Math.floor((now-new Date(workRunning.started_at))/1000)):0
 const workToday=secondsForToday(workSessions,now)+runningSecondsForPeriod(workRunning,now,'day')
 useEffect(()=>{if(page===1)drawChart(chart.current,stats)},[page,stats])

 function swipeEnd(x){if(touchX.current==null)return;const dx=x-touchX.current;touchX.current=null;if(Math.abs(dx)>45)setPage(p=>Math.max(0,Math.min(2,p+(dx<0?1:-1))))}
 function addAppointment(){const a=createAppointment();if(a){const n=[...appointments,a];setAppointments(n);saveAppointments(n)}}
 function deleteAppointment(id){const n=appointments.filter(x=>x.id!==id);setAppointments(n);saveAppointments(n)}
 async function toggleWork(){
   if(workBusy)return
   setWorkBusy(true)
   try{
     if(workRunning)await stopWorkSession()
     else startWorkSession()
     setWorkRunning(getRunningWorkSession())
     try{setWorkSessions(await getWorkSessions())}catch(e){console.error(e)}
   }catch(e){console.error(e);alert(lang==='sq'?'Nuk u ruajt sesioni. Provo përsëri.':lang==='de'?'Sitzung konnte nicht gespeichert werden.':'Could not save work session.')}finally{setWorkBusy(false)}
 }

 return <>
  <DesktopDashboard
   t={t} lang={lang} nav={nav} projects={projects} completed={completed} progress={progress} cost={cost}
   stats={stats} appointments={appointments} desktopPage={desktopPage} setDesktopPage={setDesktopPage}
   addAppointment={addAppointment} deleteAppointment={deleteAppointment} profile={profile} now={now}
   workRunning={workRunning} workSeconds={workSeconds} workToday={workToday} toggleWork={toggleWork} workBusy={workBusy}
  />

  <div className="mobile-dashboard-exact">
   <div className="m-header-profile">
    <div className={`m-avatar ${profile.photo?'has-photo':''}`} key={profile.photo || 'no-photo'}>
      {profile.photo?<img src={profile.photo} alt={profile.name} key={profile.photo}/>:<span>{profile.name.slice(0,2).toUpperCase()}</span>}
    </div>
    <div><small>{t('hello')},</small><b>{profile.name}</b></div>
    <div className="m-header-actions">
      <button className="m-bell-btn" onClick={()=>setNotificationsOpen(v=>!v)} aria-label="Notifications"><Bell/><i className={appointments.length?'has':''}></i></button>
      <button className="m-exit-btn" onClick={async()=>{try{await signOut(auth)}catch{}localStorage.removeItem('tufting_auth');nav('/login')}} aria-label="Logout"><LogOut/></button>
    </div>
   </div>
   {notificationsOpen&&<div className="m-notifications-panel">
     <div className="m-notify-head"><b>{t('notifications')}</b><button onClick={()=>setNotificationsOpen(false)}><X/></button></div>
     {appointments.length?appointments.slice(0,5).map(a=><div className="m-notify-row" key={a.id}><Bell/><div><b>{a.title}</b><small>{a.date} · {a.time}</small></div></div>):<div className="m-notify-empty">{t('noAppointments')}</div>}
   </div>}
   <div className="m-stat-row">
    <div className="m-stat-card blue"><b>{projects.length}</b><span>{t('projects')}</span><Folder/></div>
    <div className="m-stat-card green"><b>{completed}</b><span>{t('completed')}</span><CheckCircle2/></div>
    <div className="m-stat-card orange"><b>{progress}</b><span>{t('inProgress')}</span><RotateCw/></div>
    <div className="m-stat-card purple"><b>€{cost.toFixed(0)}</b><span>{t('materialCost')}</span><Euro/></div>
   </div>

   <section className="m-carousel-card" onTouchStart={e=>touchX.current=e.touches[0].clientX} onTouchEnd={e=>swipeEnd(e.changedTouches[0].clientX)}>
    <div className="m-carousel-track" style={{transform:`translateX(-${page*100}%)`}}>
     <div className="m-slide"><div className="m-title-row"><b>{t('calendar')}</b><CalendarDays/></div><Calendar appointments={appointments} projects={projects}/></div>
     <div className="m-slide"><div className="m-title-row"><b>{t('statistics')}</b><TrendingUp/></div>{stats.hasData?<><div className="m-stat-summary" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'5px 8px',margin:'4px 0 6px',fontSize:9,color:'#555d68'}}><span><i className="dot project" style={{display:'inline-block',width:7,height:7,borderRadius:'50%',marginRight:5,background:'#5d3fe4'}}/>{t('projectsThisWeek')}: <b>{stats.projectTotal}</b></span><span><i className="dot calc" style={{display:'inline-block',width:7,height:7,borderRadius:'50%',marginRight:5,background:'#0b9d83'}}/>{t('calculationsThisWeek')}: <b>{stats.calcTotal}</b></span><span>{t('weeklyCost')}: <b>€{stats.weekCost.toFixed(2)}</b></span></div><canvas ref={chart} width="700" height="230"/><div className="m-days">{stats.labels.map(d=><span key={d}>{d}</span>)}</div></>:<div className="m-empty-state"><TrendingUp/><b>{t('noStats')}</b></div>}</div>
     <div className="m-slide"><div className="m-title-row"><b>{t('appointments')}</b><button className="m-add-app" onClick={addAppointment}>+ {t('addAppointment')}</button></div><Appointments items={appointments} onDelete={deleteAppointment} t={t}/></div>
    </div>
    <div className="m-carousel-dots">{[0,1,2].map(i=><button className={page===i?'active':''} onClick={()=>setPage(i)} key={i}/>)}</div>
   </section>

   <section className="m-quick"><h3>{t('quickActions')}</h3><div className="m-quick-grid">
    <button onClick={()=>nav('/design')} className="pink"><span><Plus/></span><b>{t('newProject')}</b></button>
    <button onClick={()=>nav('/gallery')} className="teal"><span><Images/></span><b>{t('gallery')}</b></button>
    <button onClick={()=>nav('/projector')} className="orange"><span><Projector/></span><b>{t('projector')}</b></button>
    <button onClick={()=>nav('/calculator')} className="purple"><span><CalcIcon/></span><b>{t('calculator')}</b></button>
   </div></section>

   {projects.length>0&&<section className="m-recent"><h3>{t('recentProjects')}</h3>{projects.slice(0,3).map(p=><button className="m-project-row" key={p.id} onClick={()=>nav('/projects')} style={{overflow:'hidden',alignItems:'center'}}><div className="m-project-img" style={{width:64,height:64,minWidth:64,borderRadius:12,overflow:'hidden',flex:'0 0 64px'}}>{p.image_data?<img src={p.image_data} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>:<span>🧶</span>}</div><div style={{minWidth:0,flex:1,textAlign:'left'}}><b style={{display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</b><small className={p.status==='Completed'?'done':'progress'}>{p.status==='Completed'?t('completed'):t('inProgress')}</small></div><ChevronRight style={{flex:'0 0 auto'}}/></button>)}</section>}
  </div>
 </>
}

function DesktopDashboard({t,lang,nav,projects,completed,progress,cost,stats,appointments,desktopPage,setDesktopPage,addAppointment,deleteAppointment,profile,now,workRunning,workSeconds,workToday,toggleWork,workBusy}){
 const locale=lang==='sq'?'sq-AL':lang==='de'?'de-DE':'en-GB'
 const time=now.toLocaleTimeString(locale,{hour:'2-digit',minute:'2-digit'})
 const date=now.toLocaleDateString(locale,{weekday:'long',day:'numeric',month:'long',year:'numeric'})
 const recent=projects.slice(0,5)
 const greeting=dashboardGreeting(lang,now)
 return <div className="desktop-dashboard-final">
   <div className="dd-head">
     <div className="dd-welcome-copy"><small>{greeting.title}</small><h1>{greeting.welcome}</h1><p>{greeting.subtitle}</p></div>
     <button className="dd-new" onClick={()=>nav('/design')}><Plus/>{t('newProject')}</button>
   </div>

   <div className="dd-metrics">
     <button className="dd-metric lavender" onClick={()=>nav('/projects')}><div><span>{t('projects')}</span><b>{projects.length}</b><small>{t('thisWeek')}</small></div><i><Folder/></i></button>
     <button className="dd-metric mint" onClick={()=>nav('/projects')}><div><span>{t('completed')}</span><b>{completed}</b><small>{t('thisWeek')}</small></div><i><CheckCircle2/></i></button>
     <button className="dd-metric peach" onClick={()=>nav('/projects')}><div><span>{t('inProgress')}</span><b>{progress}</b><small>{t('thisWeek')}</small></div><i><RotateCw/></i></button>
     <button className="dd-metric blush" onClick={()=>nav('/calculator')}><div><span>{t('materialCost')}</span><b>€{cost.toFixed(2)}</b><small>{t('thisWeek')}</small></div><i><Euro/></i></button>
   </div>

   <div className="dd-main-grid">
     <section className="dd-time-card retro-work-clock-card">
       <div className="retro-clock-top"><small>{date.split(',')[0]}</small><span>{date}</span></div>
       <div className="retro-analog-clock" aria-label={time}>
         {Array.from({length:12},(_,i)=><i key={i} className="retro-clock-mark" style={{transform:`rotate(${i*30}deg) translateY(-68px)`}}/>)}
         <b className="retro-hour-hand" style={{transform:`translateX(-50%) rotate(${((now.getHours()%12)+now.getMinutes()/60)*30}deg)`}}/>
         <b className="retro-minute-hand" style={{transform:`translateX(-50%) rotate(${(now.getMinutes()+now.getSeconds()/60)*6}deg)`}}/>
         <b className="retro-second-hand" style={{transform:`translateX(-50%) rotate(${now.getSeconds()*6}deg)`}}/>
         <em></em>
       </div>
       <div className="retro-digital-time">{time}<small>:{String(now.getSeconds()).padStart(2,'0')}</small></div>
       <div className="retro-work-summary"><span>{workLabel(lang,'today')}</span><b>{formatDuration(workToday)}</b></div>
       <div className="retro-work-actions">
         <button className={workRunning?'stop':'start'} onClick={toggleWork} disabled={workBusy}>{workRunning?<><Square/> {workLabel(lang,'stop')}</>:<><Play/> {workLabel(lang,'start')}</>}</button>
         <button className="history" onClick={()=>nav('/work-hours')}><History/> {workLabel(lang,'history')}</button>
       </div>
       <div className="retro-work-live"><span>{workLabel(lang,'session')}</span><b>{formatDuration(workSeconds)}</b></div>
     </section>

     <section className="dd-carousel-card">
       <div className="dd-tabs">
         <button className={desktopPage===0?'active':''} onClick={()=>setDesktopPage(0)}><CalendarDays/>{t('calendar')}</button>
         <button className={desktopPage===1?'active':''} onClick={()=>setDesktopPage(1)}><TrendingUp/>{t('statistics')}</button>
         <button className={desktopPage===2?'active':''} onClick={()=>setDesktopPage(2)}><CalendarDays/>{t('appointments')}</button>
       </div>
       <div className="dd-carousel-body">
         {desktopPage===0&&<div className="dd-panel"><Calendar appointments={appointments} projects={projects}/></div>}
         {desktopPage===1&&<div className="dd-panel"><DesktopStats stats={stats} t={t}/></div>}
         {desktopPage===2&&<div className="dd-panel dd-appointments"><div className="dd-appt-head"><b>{t('appointments')}</b><button onClick={addAppointment}>+ {t('addAppointment')}</button></div><Appointments items={appointments} onDelete={deleteAppointment} t={t}/></div>}
       </div>
       <div className="dd-dots">{[0,1,2].map(i=><button key={i} className={desktopPage===i?'active':''} onClick={()=>setDesktopPage(i)} aria-label={`slide ${i+1}`}/>)}</div>
     </section>

     <section className="dd-recent-card">
       <div className="dd-section-head"><div><small>{t('projects')}</small><h2>{t('recentProjects')}</h2></div><button onClick={()=>nav('/projects')}>{t('projects')} <ChevronRight/></button></div>
       <div className="dd-recent-list">
         {recent.length?recent.map(p=><button className="dd-recent-row" key={p.id} onClick={()=>nav('/projects')}><div className="dd-recent-img">{p.image_data?<img src={p.image_data} alt={p.name}/>:<span>🧶</span>}</div><div><b>{p.name}</b><small className={p.status==='Completed'?'done':'progress'}>{p.status==='Completed'?t('completed'):t('inProgress')}</small></div><ChevronRight/></button>):<div className="dd-empty"><Folder/><b>{t('noProjects')}</b></div>}
       </div>
     </section>
   </div>

   <section className="dd-quick"><h2>{t('quickActions')}</h2><div>
     <button className="q-pink" onClick={()=>nav('/design')}><Plus/><span><b>{t('newProject')}</b><small>{quickActionText(lang,'design')}</small></span></button>
     <button className="q-teal" onClick={()=>nav('/gallery')}><Images/><span><b>{t('gallery')}</b><small>{quickActionText(lang,'gallery')}</small></span></button>
     <button className="q-orange" onClick={()=>nav('/projector')}><Projector/><span><b>{t('projector')}</b><small>{quickActionText(lang,'projector')}</small></span></button>
     <button className="q-purple" onClick={()=>nav('/calculator')}><CalcIcon/><span><b>{t('calculator')}</b><small>{quickActionText(lang,'calculator')}</small></span></button>
   </div></section>
 </div>
}


function dashboardGreeting(lang,now){
 const h=now.getHours()
 const period=h<12?'morning':h<18?'afternoon':'evening'
 const copy={
  sq:{morning:'Mirëmëngjes',afternoon:'Mirëdita',evening:'Mirëmbrëma',welcome:'Mirë se erdhe në studio!',subtitle:'Gati për një ditë kreative në studio.'},
  de:{morning:'Guten Morgen',afternoon:'Guten Tag',evening:'Guten Abend',welcome:'Willkommen im Studio!',subtitle:'Bereit für einen kreativen Tag im Studio.'},
  en:{morning:'Good morning',afternoon:'Good afternoon',evening:'Good evening',welcome:'Welcome to the studio!',subtitle:'Ready for a creative day in the studio.'}
 }
 const c=copy[lang]||copy.en
 return {title:c[period],welcome:c.welcome,subtitle:c.subtitle}
}

function quickActionText(lang,key){
 const copy={
  sq:{design:'Krijo dhe konverto një dizajn të ri.',gallery:'Shiko projektet dhe fotot e ruajtura.',projector:'Hap dizajnin për projektim dhe pozicionim.',calculator:'Llogarit leshin, gramët dhe koston reale.'},
  de:{design:'Neues Design erstellen und konvertieren.',gallery:'Gespeicherte Projekte und Bilder ansehen.',projector:'Design zum Projizieren und Positionieren öffnen.',calculator:'Garn, Gramm und reale Kosten berechnen.'},
  en:{design:'Create and convert a new design.',gallery:'View saved projects and photos.',projector:'Open a design for projection and positioning.',calculator:'Calculate yarn, grams and real cost.'}
 }
 return (copy[lang]||copy.en)[key]
}

function DesktopStats({stats,t}){
 const max=Math.max(1,...stats.projectCounts,...stats.calcCounts)
 return <div className="dd-stats">
   <div className="dd-stat-summary"><span><i className="project"></i>{t('projectsThisWeek')}: <b>{stats.projectTotal}</b></span><span><i className="calc"></i>{t('calculationsThisWeek')}: <b>{stats.calcTotal}</b></span><span>{t('weeklyCost')}: <b>€{stats.weekCost.toFixed(2)}</b></span></div>
   {stats.hasData?<div className="dd-bars">{stats.labels.map((d,i)=><div className="dd-bar-col" key={d}><div className="dd-bar-track"><span className="projects" style={{height:`${Math.max(4,stats.projectCounts[i]/max*100)}%`}}/><span className="calcs" style={{height:`${Math.max(4,stats.calcCounts[i]/max*100)}%`}}/></div><small>{d}</small></div>)}</div>:<div className="dd-empty"><TrendingUp/><b>{t('noStats')}</b></div>}
 </div>
}

function Calendar({appointments,projects}){
 const d=new Date(),y=d.getFullYear(),m=d.getMonth(),first=new Date(y,m,1),last=new Date(y,m+1,0),offset=(first.getDay()+6)%7,cells=[]
 for(let i=0;i<offset;i++)cells.push(null);for(let i=1;i<=last.getDate();i++)cells.push(i);while(cells.length%7)cells.push(null)
 return <div className="mini-calendar"><div className="cal-week">{['M','T','W','T','F','S','S'].map((x,i)=><b key={i}>{x}</b>)}</div><div className="cal-grid">{cells.map((n,i)=><div key={i} className={`cal-day ${n===d.getDate()?'today':''}`}>{n||''}</div>)}</div></div>
}
function Appointments({items,onDelete,t}){return <div className="appt-list">{items.length?items.map(a=><div className="appt-row" key={a.id}><div><b>{a.title}</b><span><Clock/> {a.date} · {a.time}</span></div><button onClick={()=>onDelete(a.id)}>×</button></div>):<div className="m-empty-state"><CalendarDays/><b>{t('noAppointments')}</b></div>}</div>}
function readProfile(){return{name:localStorage.getItem('tufting_profile_name')||localStorage.getItem('tufting_name')||'Studio Owner',photo:localStorage.getItem('tufting_profile_photo')||''}}
function loadAppointments(){try{return JSON.parse(localStorage.getItem('tufting_appointments')||'[]')}catch{return[]}}
function saveAppointments(a){localStorage.setItem('tufting_appointments',JSON.stringify(a))}
function createAppointment(){const title=prompt('Appointment');if(!title)return null;const date=prompt('YYYY-MM-DD',new Date().toISOString().slice(0,10));if(!date)return null;const time=prompt('HH:MM','10:00')||'';return{id:Date.now(),title,date,time}}
function weekly(projects,calculations){
 const labels=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],projectCounts=[0,0,0,0,0,0,0],calcCounts=[0,0,0,0,0,0,0]
 const now=new Date(),di=(now.getDay()+6)%7,mon=new Date(now);mon.setHours(0,0,0,0);mon.setDate(now.getDate()-di)
 const next=new Date(mon);next.setDate(mon.getDate()+7)
 const ix=d=>(d.getDay()+6)%7
 projects.forEach(p=>{const d=new Date(p.created_at||p.updated_at||p.date);if(!Number.isNaN(d.getTime())&&d>=mon&&d<next)projectCounts[ix(d)]++})
 calculations.forEach(c=>{const d=new Date(c.created_at);if(!Number.isNaN(d.getTime())&&d>=mon&&d<next)calcCounts[ix(d)]++})
 const weekCost=projects.filter(p=>{const d=new Date(p.created_at);return !Number.isNaN(d.getTime())&&d>=mon&&d<next}).reduce((s,p)=>s+(Number(p.material_cost)||0),0)+calculations.filter(c=>{const d=new Date(c.created_at);return !Number.isNaN(d.getTime())&&d>=mon&&d<next}).reduce((s,c)=>s+(Number(c.cost)||0),0)
 return{labels,projectCounts,calcCounts,projectTotal:projectCounts.reduce((a,b)=>a+b,0),calcTotal:calcCounts.reduce((a,b)=>a+b,0),weekCost,hasData:projectCounts.some(Boolean)||calcCounts.some(Boolean)}
}
function drawChart(canvas,stats){
 if(!canvas)return
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h)
 const max=Math.max(1,...stats.projectCounts,...stats.calcCounts),L=30,R=w-18,T=20,B=h-28
 c.strokeStyle='#e7ded1';c.setLineDash([4,4]);for(let i=0;i<5;i++){let y=T+(B-T)*i/4;c.beginPath();c.moveTo(L,y);c.lineTo(R,y);c.stroke()}c.setLineDash([])
 ;[['#5d3fe4',stats.projectCounts],['#0b9d83',stats.calcCounts]].forEach(([color,a])=>{c.strokeStyle=color;c.lineWidth=5;c.beginPath();a.forEach((v,i)=>{let x=L+(R-L)*i/6,y=B-(v/max)*(B-T);i?c.lineTo(x,y):c.moveTo(x,y)});c.stroke()})
}

function formatDuration(sec){
 sec=Math.max(0,Math.floor(Number(sec)||0));const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60
 return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}
function workLabel(lang,key){
 const all={
  sq:{today:'Punuar sot',start:'Start',stop:'Stop',history:'Historiku',session:'Sesioni aktual'},
  de:{today:'Heute gearbeitet',start:'Start',stop:'Stop',history:'Verlauf',session:'Aktuelle Sitzung'},
  en:{today:'Worked today',start:'Start',stop:'Stop',history:'History',session:'Current session'}
 }
 return (all[lang]||all.en)[key]
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
