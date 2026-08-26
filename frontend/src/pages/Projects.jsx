import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'
import React,{useEffect,useState} from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { createProject, deleteProject, getProjects } from '../api/client'

export default function Projects(){
 const {t}=useI18n()
  const [items,setItems]=useState([])
  const [open,setOpen]=useState(false)
  const [form,setForm]=useState({name:'',width_cm:80,height_cm:60,notes:''})

  async function load(){setItems(await getProjects())}
  useEffect(()=>{load().catch(()=>{})},[])

  async function create(){
    await createProject({...form,width_cm:+form.width_cm,height_cm:+form.height_cm})
    setOpen(false);setForm({name:'',width_cm:80,height_cm:60,notes:''});load()
  }
  async function remove(id){if(confirm('Delete project?')){await deleteProject(id);load()}}

  return <><MobilePageHeader title={t('projects')}/>
    <div className="page-title"><div><h1>Projects</h1><p>All your saved tufting projects.</p></div><button className="btn pink" onClick={()=>setOpen(true)}><Plus size={18}/>New Project</button></div>
    <div className="project-grid">
      {items.map((p,i)=><article className="card project-card" key={p.id}>
        <div className="project-cover">{['🐶','🌸','👤','🐱','🎨'][i%5]}</div>
        <div className="project-content"><h3>{p.name}</h3><div className="project-meta"><span>{p.width_cm} × {p.height_cm} cm</span><span>{p.status}</span></div><p>Material cost: €{(p.material_cost||0).toFixed(2)}</p><button className="text-button danger-text" onClick={()=>remove(p.id)}><Trash2 size={16}/>Delete</button></div>
      </article>)}
    </div>

    {open && <div className="modal"><div className="modal-card">
      <button className="modal-x" onClick={()=>setOpen(false)}>×</button>
      <h2>New Project</h2>
      <label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
      <div className="two-fields"><label>Width cm<input type="number" value={form.width_cm} onChange={e=>setForm({...form,width_cm:e.target.value})}/></label><label>Height cm<input type="number" value={form.height_cm} onChange={e=>setForm({...form,height_cm:e.target.value})}/></label></div>
      <label>Notes<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
      <button className="btn teal" onClick={create}>Create Project</button>
    </div></div>}
  </>
}
