import {collection,deleteDoc,doc,getDocs,query,setDoc,where} from 'firebase/firestore'
import {onAuthStateChanged} from 'firebase/auth'
import {auth,db} from './firebase'

const RUNNING_KEY='tufting_work_running'
const LOCAL_KEY='tufting_work_sessions_local'
const DELETE_KEY='tufting_work_sessions_deleted'

async function user(){
  if(auth.currentUser)return auth.currentUser
  return new Promise((resolve,reject)=>{
    const stop=onAuthStateChanged(auth,u=>{stop();u?resolve(u):reject(new Error('auth/not-signed-in'))},reject)
  })
}
function changed(){if(typeof window!=='undefined')window.dispatchEvent(new Event('tufting-work-hours-updated'))}
function readLocal(){try{return JSON.parse(localStorage.getItem(LOCAL_KEY)||'[]')}catch{return[]}}
function writeLocal(rows){localStorage.setItem(LOCAL_KEY,JSON.stringify(rows.slice(0,500)))}
function readDeleted(){try{return JSON.parse(localStorage.getItem(DELETE_KEY)||'[]')}catch{return[]}}
function writeDeleted(ids){localStorage.setItem(DELETE_KEY,JSON.stringify([...new Set(ids)].slice(0,500)))}
function makeId(){return `wh_${Date.now()}_${Math.random().toString(36).slice(2,8)}`}

export function getRunningWorkSession(){
  if(typeof localStorage==='undefined')return null
  try{const value=JSON.parse(localStorage.getItem(RUNNING_KEY)||'null');return value?.started_at?value:null}catch{return null}
}

export function startWorkSession(){
  const current=getRunningWorkSession();if(current)return current
  const running={started_at:new Date().toISOString()}
  localStorage.setItem(RUNNING_KEY,JSON.stringify(running));changed();return running
}

export async function stopWorkSession(){
  const running=getRunningWorkSession();if(!running)return null
  const endedAt=new Date(),startedAt=new Date(running.started_at)
  const clean={id:makeId(),started_at:startedAt.toISOString(),ended_at:endedAt.toISOString(),duration_seconds:Math.max(0,Math.round((endedAt-startedAt)/1000)),created_at:endedAt.toISOString(),pending:true}
  const local=[clean,...readLocal().filter(x=>x.id!==clean.id)]
  writeLocal(local)
  localStorage.removeItem(RUNNING_KEY)
  changed()
  try{await syncOne(clean)}catch(e){console.warn('Work-hours cloud sync pending:',e)}
  return clean
}

async function syncOne(row){
  const u=await user()
  const payload={user_id:u.uid,started_at:row.started_at,ended_at:row.ended_at,duration_seconds:Number(row.duration_seconds)||0,created_at:row.created_at||new Date().toISOString()}
  await setDoc(doc(db,'work_hours',row.id),payload,{merge:true})
  writeLocal(readLocal().map(x=>x.id===row.id?{...x,pending:false}:x))
}


async function syncPendingDeletes(){
  const ids=readDeleted()
  if(!ids.length)return
  const u=await user()
  const remaining=[]
  for(const id of ids){
    try{await deleteDoc(doc(db,'work_hours',id))}
    catch{remaining.push(id)}
  }
  writeDeleted(remaining)
}

export async function deleteWorkSession(id){
  if(!id)return
  writeLocal(readLocal().filter(x=>x.id!==id))
  writeDeleted([...readDeleted(),id])
  changed()
  try{
    await user()
    await deleteDoc(doc(db,'work_hours',id))
    writeDeleted(readDeleted().filter(x=>x!==id))
  }catch(e){
    console.warn('Work-hours delete pending:',e)
  }
  changed()
}

async function syncPending(){
  const pending=readLocal().filter(x=>x.pending)
  for(const row of pending){try{await syncOne(row)}catch{break}}
}

export async function getWorkSessions(){
  const local=readLocal()
  try{
    await syncPending()
    await syncPendingDeletes()
    const u=await user()
    const q=query(collection(db,'work_hours'),where('user_id','==',u.uid))
    const snap=await getDocs(q)
    const deleted=new Set(readDeleted())
    const cloud=snap.docs.map(d=>({id:d.id,...d.data(),pending:false})).filter(r=>!deleted.has(r.id))
    const map=new Map()
    ;[...local.filter(r=>!deleted.has(r.id)),...cloud].forEach(r=>map.set(r.id,r))
    const merged=[...map.values()].sort((a,b)=>String(b.started_at||'').localeCompare(String(a.started_at||'')))
    writeLocal(merged)
    return merged
  }catch(e){
    console.warn('Using local work-hours history:',e)
    return local.sort((a,b)=>String(b.started_at||'').localeCompare(String(a.started_at||'')))
  }
}

export function secondsForToday(sessions,now=new Date()){
  const y=now.getFullYear(),m=now.getMonth(),d=now.getDate()
  return sessions.reduce((sum,s)=>{const start=new Date(s.started_at);return start.getFullYear()===y&&start.getMonth()===m&&start.getDate()===d?sum+(Number(s.duration_seconds)||0):sum},0)
}
export function secondsForWeek(sessions,now=new Date()){
  const start=new Date(now),day=(start.getDay()+6)%7;start.setHours(0,0,0,0);start.setDate(start.getDate()-day)
  const end=new Date(start);end.setDate(end.getDate()+7)
  return sessions.reduce((sum,s)=>{const t=new Date(s.started_at);return t>=start&&t<end?sum+(Number(s.duration_seconds)||0):sum},0)
}
