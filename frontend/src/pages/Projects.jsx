import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'
import React,{useEffect,useState} from 'react'
import {Plus,Trash2} from 'lucide-react'
import {createProject,deleteProject,getProjects} from '../lib/projectsStore'

export default function Projects(){
 const {t}=useI18n()
 const [items,setItems]=useState([])
 const [open,setOpen]=useState(false)
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 const [form,setForm]=useState({name:'',width_cm:80,height_cm:60,notes:''})

 async function load(){
   try{setItems(await getProjects())}
   catch(e){console.error(e);setItems([])}
 }
 useEffect(()=>{load()},[])

 async function create(){
   if(!form.name.trim()){setError(t('projectNameRequired'));return}
   setBusy(true);setError('')
   try{
     await createProject({...form,width_cm:+form.width_cm,height_cm:+form.height_cm})
     setOpen(false)
     setForm({name:'',width_cm:80,height_cm:60,notes:''})
     await load()
   }catch(e){
     console.error(e)
     setError(t('saveFailed'))
   }finally{setBusy(false)}
 }

 async function remove(id){
   if(!confirm(t('deleteProjectConfirm')))return
   try{await deleteProject(id);await load()}
   catch(e){console.error(e)}
 }

 return <>
   <MobilePageHeader title={t('projects')}/>
   <div className="page-title">
     <div><h1>{t('projects')}</h1><p>{t('allSavedProjects')}</p></div>
     <button className="btn pink" onClick={()=>{setError('');setOpen(true)}}><Plus size={18}/>{t('newProject')}</button>
   </div>

   <div className="project-grid">
     {items.map(p=><article className="card project-card" key={p.id}>
       <div className="project-cover">
         {p.image_data
           ? <img src={p.image_data} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
           : '🧶'}
       </div>
       <div className="project-content">
         <h3>{p.name}</h3>
         <div className="project-meta">
           <span>{p.width_cm} × {p.height_cm} cm</span>
           <span>{translateStatus(p.status,t)}</span>
         </div>
         <p>{t('materialCost')}: €{Number(p.material_cost||0).toFixed(2)}</p>
         <button className="text-button danger-text" onClick={()=>remove(p.id)}>
           <Trash2 size={16}/>{t('delete')}
         </button>
       </div>
     </article>)}
   </div>

   {!items.length&&!open&&<div className="gallery-empty"><div>🧶</div><h3>{t('noProjects')}</h3><p>{t('projectLibrary')}</p></div>}

   {open&&<div className="modal"><div className="modal-card">
     <button className="modal-x" onClick={()=>setOpen(false)}>×</button>
     <h2>{t('newProject')}</h2>
     <label>{t('name')}<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
     <div className="two-fields">
       <label>{t('widthCm')}<input type="number" value={form.width_cm} onChange={e=>setForm({...form,width_cm:e.target.value})}/></label>
       <label>{t('heightCm')}<input type="number" value={form.height_cm} onChange={e=>setForm({...form,height_cm:e.target.value})}/></label>
     </div>
     <label>{t('notes')}<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
     {error&&<p style={{color:'#b42318',fontWeight:700}}>{error}</p>}
     <button className="btn teal" disabled={busy} onClick={create}>{busy?t('saving'):t('createProject')}</button>
   </div></div>}
 </>
}

function translateStatus(status,t){
 if(status==='Completed')return t('completed')
 if(status==='In Progress')return t('inProgress')
 return status||t('inProgress')
}
