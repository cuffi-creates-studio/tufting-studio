import {
  addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where
} from 'firebase/firestore'
import {onAuthStateChanged} from 'firebase/auth'
import {auth,db} from './firebase'

async function currentUser(){
  if(auth.currentUser) return auth.currentUser
  return await new Promise((resolve,reject)=>{
    const stop=onAuthStateChanged(auth,u=>{
      stop()
      if(u) resolve(u)
      else reject(new Error('auth/not-signed-in'))
    },reject)
  })
}

function changed(){
  if(typeof window!=='undefined') window.dispatchEvent(new Event('tufting-data-updated'))
}

async function listByUser(name){
  const u=await currentUser()
  const q=query(collection(db,name),where('user_id','==',u.uid))
  const snap=await getDocs(q)
  return snap.docs.map(d=>({id:d.id,...d.data()}))
}

async function addByUser(name,data){
  const u=await currentUser()
  const clean={...data,user_id:u.uid,created_at:new Date().toISOString(),updated_at:new Date().toISOString()}
  const ref=await addDoc(collection(db,name),clean)
  changed()
  return {id:ref.id,...clean}
}

async function updateByUser(name,id,data){
  await currentUser()
  const patch={...data,updated_at:new Date().toISOString()}
  await updateDoc(doc(db,name,id),patch)
  changed()
  return {id,...patch}
}

async function deleteByUser(name,id){
  await currentUser()
  await deleteDoc(doc(db,name,id))
  changed()
}

export async function getOrders(){
  const rows=await listByUser('orders')
  return rows.sort((a,b)=>String(a.due_date||a.created_at||'').localeCompare(String(b.due_date||b.created_at||'')))
}
export async function addOrder(data){return addByUser('orders',normalizeOrder(data))}
export async function updateOrder(id,data){return updateByUser('orders',id,normalizeOrder(data))}
export async function deleteOrder(id){return deleteByUser('orders',id)}

export async function getInventory(){
  const rows=await listByUser('inventory')
  return rows.sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'sq'))
}
export async function addInventoryItem(data){return addByUser('inventory',normalizeInventory(data))}
export async function updateInventoryItem(id,data){return updateByUser('inventory',id,normalizeInventory(data))}
export async function deleteInventoryItem(id){return deleteByUser('inventory',id)}

export async function getExpenses(){
  const rows=await listByUser('expenses')
  return rows.sort((a,b)=>String(b.date||b.created_at||'').localeCompare(String(a.date||a.created_at||'')))
}
export async function addExpense(data){return addByUser('expenses',normalizeExpense(data))}
export async function updateExpense(id,data){return updateByUser('expenses',id,normalizeExpense(data))}
export async function deleteExpense(id){return deleteByUser('expenses',id)}

function normalizeOrder(data){
  const price=money(data.price)
  const deposit=money(data.deposit)
  return {
    client:String(data.client||'').trim(),
    project:String(data.project||'').trim(),
    width_cm:num(data.width_cm),
    height_cm:num(data.height_cm),
    price,
    deposit,
    remaining:Math.max(0,round2(price-deposit)),
    status:data.status||'In Progress',
    due_date:data.due_date||'',
    notes:String(data.notes||'').trim(),
    material_cost:money(data.material_cost),
    labor_cost:money(data.labor_cost),
    other_cost:money(data.other_cost),
    image_data:data.image_data||''
  }
}

function normalizeInventory(data){
  const stock_g=Math.max(0,num(data.stock_g))
  const min_stock_g=Math.max(0,num(data.min_stock_g))
  const price_per_ball=Math.max(0,money(data.price_per_ball))
  const ball_g=Math.max(1,num(data.ball_g)||100)
  return {
    type:data.type||'Yarn',
    name:String(data.name||'').trim(),
    color_name:String(data.color_name||'').trim(),
    color_code:normalizeHex(data.color_code||'#FFC567'),
    brand:String(data.brand||'').trim(),
    stock_g,
    min_stock_g,
    price_per_ball,
    ball_g,
    value:round2((stock_g/ball_g)*price_per_ball)
  }
}

function normalizeExpense(data){
  return {
    category:data.category||'Other',
    description:String(data.description||'').trim(),
    amount:money(data.amount),
    date:data.date||new Date().toISOString().slice(0,10),
    project:String(data.project||'').trim(),
    method:data.method||'Cash',
    invoice:String(data.invoice||'').trim(),
    notes:String(data.notes||'').trim()
  }
}
function num(v){const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:0}
function money(v){return round2(num(v))}
function round2(v){return Math.round((v+Number.EPSILON)*100)/100}
function normalizeHex(v){const x=String(v||'').trim().toUpperCase();return /^#[0-9A-F]{6}$/.test(x)?x:'#FFC567'}
