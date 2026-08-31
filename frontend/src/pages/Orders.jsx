import React,{useEffect,useMemo,useRef,useState} from 'react'
import {ClipboardList,Filter,Plus,Search,X} from 'lucide-react'
import {useI18n} from '../i18n/I18n'
import {getProjects} from '../lib/projectsStore'
import {createOrder,deleteOrder,getOrders,updateOrder} from '../lib/businessStore'
import '../styles/business-pc.css'

const COLORS=['#00995E','#552CB7','#FD5A46','#058CD7','#FB7DA8','#FFC567']

export default function Orders(){
 const {lang}=useI18n()
 const tx=labels(lang)
 const dialog=useRef(null)
 const [rows,setRows]=useState([])
 const [projects,setProjects]=useState([])
 const [q,setQ]=useState('')
 const [filter,setFilter]=useState('all')
 const [editing,setEditing]=useState(null)
 const [saving,setSaving]=useState(false)

 async function load(){
  const [a,b]=await Promise.all([getOrders().catch(()=>[]),getProjects().catch(()=>[])])
  setRows(a);setProjects(b)
 }
 useEffect(()=>{load()},[])

 const shown=useMemo(()=>rows.filter(r=>{
  const hit=[r.client_name,r.project_name,r.status].join(' ').toLowerCase().includes(q.toLowerCase())
  const ok=filter==='all'||r.status===filter
  return hit&&ok
 }),[rows,q,filter])

 function open(row=null){setEditing(row);dialog.current?.showModal()}
 async function submit(e){
  e.preventDefault();setSaving(true)
  const f=new FormData(e.currentTarget)
  const project=projects.find(p=>p.id===f.get('project_id'))
  const price=Number(f.get('price'))||0,deposit=Number(f.get('deposit'))||0
  const data={
   client_name:String(f.get('client_name')||'').trim(),
   project_id:String(f.get('project_id')||''),
   project_name:String(f.get('project_name')||project?.name||'').trim(),
   width_cm:Number(f.get('width_cm'))||0,
   height_cm:Number(f.get('height_cm'))||0,
   price,deposit,balance:Math.max(0,price-deposit),
   status:String(f.get('status')||'In Progress'),
   deadline:String(f.get('deadline')||''),
   notes:String(f.get('notes')||''),
   image_data:editing?.image_data||project?.image_data||'',
   material_cost:Number(editing?.material_cost)||Number(project?.material_cost)||0,
   labor_cost:Number(editing?.labor_cost)||0,
   other_cost:Number(editing?.other_cost)||0
  }
  if(editing)await updateOrder(editing.id,data);else await createOrder(data)
  await load();setSaving(false);dialog.current?.close();setEditing(null)
 }
 async function remove(id){if(!confirm(tx.confirmDelete))return;await deleteOrder(id);await load()}

 return <div className="business-page orders">
  <section className="business-shell-card">
   <header className="business-head">
    <div className="business-number">1</div>
    <div className="business-title-icon"><ClipboardList/></div>
    <div className="business-heading"><h1>{tx.title}</h1><p>{tx.subtitle}</p></div>
    <div className="business-actions">
      <label className="biz-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={tx.search}/></label>
      <button className="biz-btn" type="button"><Filter/>{tx.filter}</button>
      <button className="biz-btn primary" type="button" onClick={()=>open()}><Plus/>{tx.add}</button>
    </div>
   </header>
   <div className="biz-filter-row">
    {[
      ['all',tx.all],['In Progress',tx.inProgress],['Waiting',tx.waiting],['Waiting Material',tx.waitMaterial],['Completed',tx.completed]
    ].map(([k,l])=><button key={k} className={`biz-chip ${filter===k?'active':''}`} onClick={()=>setFilter(k)}>{l}</button>)}
   </div>
   <div className="business-table-wrap">
    {shown.length?<table className="business-table"><thead><tr><th>{tx.client}</th><th>{tx.project}</th><th>{tx.size}</th><th>{tx.price}</th><th>{tx.deposit}</th><th>{tx.balance}</th><th>{tx.status}</th><th>{tx.deadline}</th><th/></tr></thead><tbody>
      {shown.map((r,i)=><tr key={r.id}>
        <td><div className="biz-person"><span className="biz-avatar" style={{background:COLORS[i%COLORS.length]}}>{initials(r.client_name)}</span>{r.client_name||'—'}</div></td>
        <td>{r.project_name||'—'}</td>
        <td>{r.width_cm||0} × {r.height_cm||0} cm</td>
        <td className="biz-money">€{money(r.price)}</td>
        <td>€{money(r.deposit)}</td>
        <td>€{money(r.balance)}</td>
        <td><span className={`biz-status ${statusClass(r.status)}`}>{statusLabel(r.status,tx)}</span></td>
        <td>{formatDate(r.deadline)}</td>
        <td><button className="biz-kebab" onClick={()=>open(r)}>•••</button></td>
      </tr>)}
    </tbody></table>:<div className="biz-empty">{tx.empty}</div>}
   </div>
  </section>

  <dialog className="biz-dialog" ref={dialog} onClose={()=>setEditing(null)}>
   <div className="biz-dialog-head"><h2>{editing?tx.edit:tx.add}</h2><button className="biz-dialog-close" onClick={()=>dialog.current?.close()}><X/></button></div>
   <form className="biz-form" onSubmit={submit} key={editing?.id||'new'}>
    <label>{tx.client}<input name="client_name" required defaultValue={editing?.client_name||''}/></label>
    <label>{tx.project}<select name="project_id" defaultValue={editing?.project_id||''} onChange={e=>{const p=projects.find(x=>x.id===e.target.value);if(p){const form=e.currentTarget.form;form.elements.project_name.value=p.name||'';form.elements.width_cm.value=p.width_cm||0;form.elements.height_cm.value=p.height_cm||0}}}><option value="">—</option>{projects.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
    <label className="full">{tx.projectName}<input name="project_name" defaultValue={editing?.project_name||''}/></label>
    <label>{tx.width}<input name="width_cm" type="number" min="0" defaultValue={editing?.width_cm||''}/></label>
    <label>{tx.height}<input name="height_cm" type="number" min="0" defaultValue={editing?.height_cm||''}/></label>
    <label>{tx.price}<input name="price" type="number" min="0" step="0.01" defaultValue={editing?.price||''}/></label>
    <label>{tx.deposit}<input name="deposit" type="number" min="0" step="0.01" defaultValue={editing?.deposit||''}/></label>
    <label>{tx.status}<select name="status" defaultValue={editing?.status||'In Progress'}><option>In Progress</option><option>Waiting</option><option>Waiting Material</option><option>Completed</option></select></label>
    <label>{tx.deadline}<input name="deadline" type="date" defaultValue={editing?.deadline||''}/></label>
    <label className="full">{tx.notes}<textarea name="notes" defaultValue={editing?.notes||''}/></label>
    <div className="biz-form-actions">{editing&&<button type="button" className="biz-btn danger" onClick={()=>remove(editing.id)}>{tx.delete}</button>}<button type="button" className="biz-btn" onClick={()=>dialog.current?.close()}>{tx.cancel}</button><button className="biz-btn primary" disabled={saving}>{saving?tx.saving:tx.save}</button></div>
   </form>
  </dialog>
 </div>
}

function initials(v=''){return v.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'—'}
function money(v){return (Number(v)||0).toFixed(2)}
function formatDate(v){if(!v)return'—';const [y,m,d]=String(v).split('-');return y&&m&&d?`${d}.${m}.${y}`:v}
function statusClass(v){return v==='Completed'?'done':v==='Waiting Material'?'material':v==='Waiting'?'wait':'progress'}
function statusLabel(v,t){return v==='Completed'?t.completed:v==='Waiting Material'?t.waitMaterial:v==='Waiting'?t.waiting:t.inProgress}
function labels(lang){
 if(lang==='de')return{title:'Bestellungen',subtitle:'Kundenaufträge verwalten und Status verfolgen.',search:'Bestellungen suchen...',filter:'Filter',add:'Bestellung hinzufügen',all:'Alle',inProgress:'In Arbeit',waiting:'Wartet',waitMaterial:'Wartet auf Material',completed:'Fertig',client:'Kunde',project:'Projekt',projectName:'Projektname',size:'Größe',width:'Breite (cm)',height:'Höhe (cm)',price:'Preis',deposit:'Anzahlung',balance:'Rest',status:'Status',deadline:'Termin',notes:'Notizen',save:'Speichern',saving:'Speichern…',cancel:'Abbrechen',edit:'Bestellung bearbeiten',delete:'Löschen',empty:'Noch keine Bestellungen.',confirmDelete:'Diese Bestellung löschen?'}
 if(lang==='en')return{title:'Orders',subtitle:'Manage customer orders and track their status.',search:'Search orders...',filter:'Filter',add:'Add order',all:'All',inProgress:'In Progress',waiting:'Waiting',waitMaterial:'Waiting Material',completed:'Completed',client:'Client',project:'Project',projectName:'Project name',size:'Size',width:'Width (cm)',height:'Height (cm)',price:'Price',deposit:'Deposit',balance:'Balance',status:'Status',deadline:'Deadline',notes:'Notes',save:'Save',saving:'Saving…',cancel:'Cancel',edit:'Edit order',delete:'Delete',empty:'No orders yet.',confirmDelete:'Delete this order?'}
 return{title:'Porositë',subtitle:'Menaxho porositë e klientëve dhe ndiq statusin e tyre.',search:'Kërko në porosi...',filter:'Filtro',add:'Shto porosi',all:'Të gjitha',inProgress:'Në punë',waiting:'Në pritje',waitMaterial:'Prit material',completed:'Përfunduar',client:'Klienti',project:'Projekti',projectName:'Emri i projektit',size:'Përmasat',width:'Gjerësia (cm)',height:'Lartësia (cm)',price:'Çmimi',deposit:'Kapari',balance:'Mbetja',status:'Statusi',deadline:'Afati',notes:'Shënime',save:'Ruaj porosinë',saving:'Po ruhet…',cancel:'Mbyll',edit:'Redakto porosinë',delete:'Fshi',empty:'Ende nuk ka porosi.',confirmDelete:'Ta fshij këtë porosi?'}
}
