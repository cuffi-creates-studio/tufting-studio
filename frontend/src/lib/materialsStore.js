import {addDoc,collection,deleteDoc,doc,getDocs,query,where} from 'firebase/firestore'
import {onAuthStateChanged} from 'firebase/auth'
import {auth,db} from './firebase'

async function user(){
  if(auth.currentUser)return auth.currentUser
  return new Promise((resolve,reject)=>{
    const stop=onAuthStateChanged(auth,u=>{stop();u?resolve(u):reject(new Error('auth/not-signed-in'))},reject)
  })
}
function changed(){if(typeof window!=='undefined')window.dispatchEvent(new Event('tufting-data-updated'))}

export async function getMaterials(){
  const u=await user()
  const q=query(collection(db,'materials'),where('user_id','==',u.uid))
  const snap=await getDocs(q)
  return snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||'')))
}
export async function addMaterial(data){
  const u=await user()
  const clean={
    user_id:u.uid,
    yarn_type:String(data.yarn_type||'Acrylic'),
    name:String(data.name||'').trim(),
    color_hex:String(data.color_hex||'#FFC567'),
    price_per_100g:Number(data.price_per_100g)||0,
    stock_g:Number(data.stock_g)||0,
    created_at:new Date().toISOString(),
    updated_at:new Date().toISOString()
  }
  const ref=await addDoc(collection(db,'materials'),clean)
  changed();return{id:ref.id,...clean}
}
export async function deleteMaterial(id){await user();await deleteDoc(doc(db,'materials',id));changed()}
