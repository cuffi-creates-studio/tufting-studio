import {
  addDoc, collection, deleteDoc, doc, getDocs, query, setDoc, updateDoc, where
} from 'firebase/firestore'
import {onAuthStateChanged} from 'firebase/auth'
import {auth,db} from './firebase'

const AUTO_ENERGY_PENDING='tufting_auto_energy_pending'
const AUTO_ENERGY_DELETED='tufting_auto_energy_deleted'

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
  if(typeof window!=='undefined')window.dispatchEvent(new Event('tufting-data-updated'))
}

async function list(name){
  const u=await user()
  const q=query(collection(db,name),where('user_id','==',u.uid))
  const snap=await getDocs(q)
  return snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(b.created_at||b.date||'').localeCompare(String(a.created_at||a.date||'')))
}

async function create(name,data){
  const u=await user()
  const clean={...data,user_id:u.uid,created_at:new Date().toISOString(),updated_at:new Date().toISOString()}
  const ref=await addDoc(collection(db,name),clean)
  changed()
  return {id:ref.id,...clean}
}

async function update(name,id,data){
  await user()
  const clean={...data,updated_at:new Date().toISOString()}
  await updateDoc(doc(db,name,id),clean)
  changed()
  return {id,...clean}
}

async function remove(name,id){
  await user()
  await deleteDoc(doc(db,name,id))
  changed()
}

function readLocal(key){try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return[]}}
function writeLocal(key,value){try{localStorage.setItem(key,JSON.stringify(value.slice(0,300)))}catch{}}
function autoEnergyId(sessionId){return `energy_${String(sessionId||'').replace(/[^a-zA-Z0-9_-]/g,'_')}`}
function localDateISO(value){const d=value?new Date(value):new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}

async function syncAutoEnergyRow(row){
  const u=await user()
  const clean={...row,user_id:u.uid,updated_at:new Date().toISOString()}
  delete clean.pending
  await setDoc(doc(db,'expenses',row.id),clean,{merge:true})
  writeLocal(AUTO_ENERGY_PENDING,readLocal(AUTO_ENERGY_PENDING).filter(x=>x.id!==row.id))
  changed()
  return {...clean,id:row.id}
}

async function syncPendingAutoEnergy(){
  const deleted=new Set(readLocal(AUTO_ENERGY_DELETED))
  for(const row of readLocal(AUTO_ENERGY_PENDING).filter(x=>!deleted.has(x.id))){
    try{await syncAutoEnergyRow(row)}catch{break}
  }
}

async function syncDeletedAutoEnergy(){
  const ids=readLocal(AUTO_ENERGY_DELETED)
  if(!ids.length)return
  await user()
  const remain=[]
  for(const id of ids){
    try{await deleteDoc(doc(db,'expenses',id))}
    catch{remain.push(id)}
  }
  writeLocal(AUTO_ENERGY_DELETED,remain)
}

export const getOrders=()=>list('orders')
export const createOrder=data=>create('orders',data)
export const updateOrder=(id,data)=>update('orders',id,data)
export const deleteOrder=id=>remove('orders',id)

export const getInventory=()=>list('inventory')
export const createInventoryItem=data=>create('inventory',data)
export const updateInventoryItem=(id,data)=>update('inventory',id,data)
export const deleteInventoryItem=id=>remove('inventory',id)

export async function getExpenses(){
  const pending=readLocal(AUTO_ENERGY_PENDING)
  const deleted=new Set(readLocal(AUTO_ENERGY_DELETED))
  try{
    await syncPendingAutoEnergy()
    await syncDeletedAutoEnergy()
    const cloud=await list('expenses')
    const remaining=readLocal(AUTO_ENERGY_PENDING).filter(x=>!deleted.has(x.id))
    const map=new Map()
    ;[...cloud,...remaining].forEach(x=>{if(!deleted.has(x.id))map.set(x.id,x)})
    return [...map.values()].sort((a,b)=>String(b.created_at||b.date||'').localeCompare(String(a.created_at||a.date||'')))
  }catch(e){
    console.warn('Expenses cloud unavailable; showing queued energy rows:',e)
    return pending.filter(x=>!deleted.has(x.id))
  }
}
export const createExpense=data=>create('expenses',data)
export const updateExpense=(id,data)=>update('expenses',id,data)
export const deleteExpense=id=>remove('expenses',id)

export async function createEnergyExpenseForWorkSession(session,settings={}){
  if(!session?.id)return null
  const gunSeconds=Math.max(0,Number(session.gun_seconds)||0)
  const shearerSeconds=Math.max(0,Number(session.shearer_seconds)||0)
  const gunW=Math.max(0,Number(settings.gun_w)||0)
  const shearerW=Math.max(0,Number(settings.shearer_w)||0)
  const rate=Math.max(0,Number(settings.rate_eur_kwh)||0)
  const gunKwh=(gunW*gunSeconds)/3600000
  const shearerKwh=(shearerW*shearerSeconds)/3600000
  const totalKwh=gunKwh+shearerKwh
  if(totalKwh<=0||rate<=0)return null

  const id=autoEnergyId(session.id)
  const gunLabel=settings.gun_label||'Tufting gun'
  const shearerLabel=settings.shearer_label||'Shearing machine'
  const parts=[]
  if(gunSeconds>0)parts.push(`${gunLabel}: ${formatDuration(gunSeconds)} (${gunW} W)`)
  if(shearerSeconds>0)parts.push(`${shearerLabel}: ${formatDuration(shearerSeconds)} (${shearerW} W)`)
  parts.push(`${totalKwh.toFixed(4)} kWh`)
  const createdAt=session.ended_at||new Date().toISOString()
  const row={
    id,
    category:'Energy',
    description:parts.join(' · '),
    amount:Number((totalKwh*rate).toFixed(4)),
    date:localDateISO(createdAt),
    project_id:'',
    project_name:'',
    payment_method:settings.auto_label||'Automatic',
    invoice_ref:'',
    notes:`${settings.note_label||'Generated automatically from Work Hours.'} €${rate.toFixed(3)}/kWh`,
    auto_energy:true,
    work_session_id:session.id,
    energy_kwh:Number(totalKwh.toFixed(6)),
    gun_seconds:gunSeconds,
    shearer_seconds:shearerSeconds,
    gun_w:gunW,
    shearer_w:shearerW,
    rate_eur_kwh:rate,
    created_at:createdAt,
    updated_at:new Date().toISOString(),
    pending:true
  }
  const pending=[row,...readLocal(AUTO_ENERGY_PENDING).filter(x=>x.id!==id)]
  writeLocal(AUTO_ENERGY_PENDING,pending)
  writeLocal(AUTO_ENERGY_DELETED,readLocal(AUTO_ENERGY_DELETED).filter(x=>x!==id))
  changed()
  try{return await syncAutoEnergyRow(row)}catch(e){console.warn('Automatic energy expense queued:',e);return row}
}

export async function deleteEnergyExpenseForWorkSession(sessionId){
  if(!sessionId)return
  const id=autoEnergyId(sessionId)
  writeLocal(AUTO_ENERGY_PENDING,readLocal(AUTO_ENERGY_PENDING).filter(x=>x.id!==id))
  writeLocal(AUTO_ENERGY_DELETED,[...new Set([...readLocal(AUTO_ENERGY_DELETED),id])])
  changed()
  try{
    await user()
    await deleteDoc(doc(db,'expenses',id))
    writeLocal(AUTO_ENERGY_DELETED,readLocal(AUTO_ENERGY_DELETED).filter(x=>x!==id))
  }catch(e){console.warn('Automatic energy expense delete queued:',e)}
  changed()
}

export const getBusinessReports=async module=>{
  const rows=await list('business_reports')
  return module?rows.filter(r=>r.module===module):rows
}
export const createBusinessReport=data=>create('business_reports',data)
export const deleteBusinessReport=id=>remove('business_reports',id)

function formatDuration(sec){
  sec=Math.max(0,Math.floor(Number(sec)||0))
  const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}
