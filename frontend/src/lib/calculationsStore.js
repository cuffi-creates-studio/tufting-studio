import {addDoc,collection,getDocs,query,where} from 'firebase/firestore'
import {auth,db} from './firebase'
import {onAuthStateChanged} from 'firebase/auth'

function user(){
  const u=auth.currentUser
  if(!u)throw new Error('auth/not-signed-in')
  return u
}
function changed(){
  if(typeof window!=='undefined')window.dispatchEvent(new Event('tufting-data-updated'))
}
export async function saveCalculation(data){
  const u=await user()
  const clean={
    user_id:u.uid,
    width_cm:Number(data.width_cm)||0,
    height_cm:Number(data.height_cm)||0,
    yarn_type:data.yarn_type||'Acrylic',
    density:Number(data.density)||0,
    price_per_100g:Number(data.price_per_100g)||0,
    waste_percent:Number(data.waste_percent)||0,
    area_m2:Number(data.area_m2)||0,
    base_g:Number(data.base_g)||0,
    total_g:Number(data.total_g)||0,
    cost:Number(data.cost)||0,
    created_at:new Date().toISOString()
  }
  const ref=await addDoc(collection(db,'calculations'),clean)
  if(typeof localStorage!=='undefined')localStorage.setItem('tufting_last_calculation',JSON.stringify(clean))
  changed()
  return {id:ref.id,...clean}
}
export async function getCalculations(){
  const u=await user()
  const q=query(collection(db,'calculations'),where('user_id','==',u.uid))
  const snap=await getDocs(q)
  return snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||'')))
}
