import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where
} from 'firebase/firestore'
import {auth,db} from './firebase'
import {onAuthStateChanged} from 'firebase/auth'

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

export async function getProjects(){
  const u=await user()
  const q=query(collection(db,'projects'),where('user_id','==',u.uid))
  const snap=await getDocs(q)
  return snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||'')))
}

export async function createProject(data){
  const u=await user()
  const clean={
    user_id:u.uid,
    name:String(data.name||'Untitled Project').trim()||'Untitled Project',
    width_cm:Number(data.width_cm)||0,
    height_cm:Number(data.height_cm)||0,
    notes:String(data.notes||''),
    status:data.status||'In Progress',
    material_cost:Number(data.material_cost)||0,
    yarn_type:data.yarn_type||'Acrylic',
    yarn_g:Number(data.yarn_g)||0,
    coverage_area:Number(data.coverage_area)||0,
    style:data.style||'',
    palette:Array.isArray(data.palette)?data.palette:[],
    image_data:data.image_data||'',
    created_at:new Date().toISOString()
  }
  const ref=await addDoc(collection(db,'projects'),clean)
  changed()
  return {id:ref.id,...clean}
}

export async function deleteProject(id){
  await user(); await deleteDoc(doc(db,'projects',id)); changed()
}
