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

function user(){
  const u=auth.currentUser
  if(!u) throw new Error('auth/not-signed-in')
  return u
}

export async function getProjects(){
  const u=user()
  const q=query(collection(db,'projects'),where('user_id','==',u.uid))
  const snap=await getDocs(q)
  return snap.docs
    .map(d=>({id:d.id,...d.data()}))
    .sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||'')))
}

export async function createProject(data){
  const u=user()
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
  return {id:ref.id,...clean}
}

export async function deleteProject(id){
  user()
  await deleteDoc(doc(db,'projects',id))
}
