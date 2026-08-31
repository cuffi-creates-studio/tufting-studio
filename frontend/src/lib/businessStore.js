import {
  addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where
} from 'firebase/firestore'
import {onAuthStateChanged} from 'firebase/auth'
import {auth,db} from './firebase'

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

export const getOrders=()=>list('orders')
export const createOrder=data=>create('orders',data)
export const updateOrder=(id,data)=>update('orders',id,data)
export const deleteOrder=id=>remove('orders',id)

export const getInventory=()=>list('inventory')
export const createInventoryItem=data=>create('inventory',data)
export const updateInventoryItem=(id,data)=>update('inventory',id,data)
export const deleteInventoryItem=id=>remove('inventory',id)

export const getExpenses=()=>list('expenses')
export const createExpense=data=>create('expenses',data)
export const updateExpense=(id,data)=>update('expenses',id,data)
export const deleteExpense=id=>remove('expenses',id)

export const getBusinessReports=async module=>{
  const rows=await list('business_reports')
  return module?rows.filter(r=>r.module===module):rows
}
export const createBusinessReport=data=>create('business_reports',data)
export const deleteBusinessReport=id=>remove('business_reports',id)
