import {addDoc,collection,getDocs,query,where} from 'firebase/firestore'
import {onAuthStateChanged} from 'firebase/auth'
import {auth,db} from './firebase'

const RUNNING_KEY='tufting_work_running'

async function user(){
  if(auth.currentUser)return auth.currentUser
  return await new Promise((resolve,reject)=>{
    const stop=onAuthStateChanged(auth,u=>{
      stop()
      if(u)resolve(u)
      else reject(new Error('auth/not-signed-in'))
    },reject)
  })
}

function changed(){
  if(typeof window!=='undefined')window.dispatchEvent(new Event('tufting-work-hours-updated'))
}

export function getRunningWorkSession(){
  if(typeof localStorage==='undefined')return null
  try{
    const raw=localStorage.getItem(RUNNING_KEY)
    if(!raw)return null
    const value=JSON.parse(raw)
    if(!value?.started_at)return null
    return value
  }catch{return null}
}

export function startWorkSession(){
  const current=getRunningWorkSession()
  if(current)return current
  const running={started_at:new Date().toISOString()}
  localStorage.setItem(RUNNING_KEY,JSON.stringify(running))
  changed()
  return running
}

export async function stopWorkSession(){
  const running=getRunningWorkSession()
  if(!running)return null

  const endedAt=new Date()
  const startedAt=new Date(running.started_at)
  const durationSeconds=Math.max(0,Math.round((endedAt-startedAt)/1000))
  const u=await user()
  const clean={
    user_id:u.uid,
    started_at:startedAt.toISOString(),
    ended_at:endedAt.toISOString(),
    duration_seconds:durationSeconds,
    created_at:endedAt.toISOString()
  }
  const ref=await addDoc(collection(db,'work_hours'),clean)
  localStorage.removeItem(RUNNING_KEY)
  changed()
  return {id:ref.id,...clean}
}

export async function getWorkSessions(){
  const u=await user()
  const q=query(collection(db,'work_hours'),where('user_id','==',u.uid))
  const snap=await getDocs(q)
  return snap.docs
    .map(d=>({id:d.id,...d.data()}))
    .sort((a,b)=>String(b.started_at||'').localeCompare(String(a.started_at||'')))
}

export function secondsForToday(sessions,now=new Date()){
  const y=now.getFullYear(),m=now.getMonth(),d=now.getDate()
  return sessions.reduce((sum,s)=>{
    const start=new Date(s.started_at)
    return start.getFullYear()===y&&start.getMonth()===m&&start.getDate()===d
      ? sum+(Number(s.duration_seconds)||0)
      : sum
  },0)
}

export function secondsForWeek(sessions,now=new Date()){
  const start=new Date(now)
  const day=(start.getDay()+6)%7
  start.setHours(0,0,0,0)
  start.setDate(start.getDate()-day)
  const end=new Date(start)
  end.setDate(end.getDate()+7)
  return sessions.reduce((sum,s)=>{
    const t=new Date(s.started_at)
    return t>=start&&t<end?sum+(Number(s.duration_seconds)||0):sum
  },0)
}
