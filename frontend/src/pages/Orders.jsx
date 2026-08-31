import React,{useEffect,useMemo,useState} from 'react'
import {ClipboardList,Filter,Plus,Search,MoreHorizontal,Pencil,Trash2,Euro,CalendarDays,UserRound,ImagePlus,X} from 'lucide-react'
import {addOrder,deleteOrder,getOrders,updateOrder} from '../lib/businessStore'
import BusinessModal from '../components/BusinessModal'
import {useI18n} from '../i18n/I18n'
import '../styles/business-desktop.css'

const EMPTY={client:'',project:'',width_cm:'',height_cm:'',price:'',deposit:'',status:'In Progress',due_date:'',notes:'',material_cost:'',labor_cost:'',other_cost:'',image_data:''}

export default function Orders(){
 const {lang}=useI18n()
 const L=labels(lang)
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[query,setQuery]=useState(''),[status,setStatus]=useState('All')
 const [form,setForm]=useState(EMPTY),[editing,setEditing]=useState(null),[open,setOpen]=useState(false),[menu,setMenu]=useState(null),[selectedId,setSelectedId]=useState(null)

 async function load(){setLoading(true);try{const data=await getOrders();setRows(data);setSelectedId(v=>v||data[0]?.id||null)}finally{setLoading(false)}}
 useEffect(()=>{load()},[])

 const selected=rows.find(r=>r.id===selectedId)||filteredFirst(rows)
 const filtered=useMemo(()=>rows.filter(r=>{
  const q=query.trim().toLowerCase()
  const hit=!q||[r.client,r.project,r.status].some(v=>String(v||'').toLowerCase().includes(q))
  return hit&&(status==='All'||r.status===status)
 }),[rows,query,status])

 function startAdd(){setEditing(null);setForm(EMPTY);setOpen(true)}
 function startEdit(r){setEditing(r.id);setForm({...EMPTY,...r});setMenu(null);setOpen(true)}
 async function save(e){e.preventDefault(); if(!form.client.trim()||!form.project.trim())return
  if(editing)await updateOrder(editing,form);else await addOrder(form)
  setOpen(false);setEditing(null);setForm(EMPTY);await load()
 }
 async function remove(id){if(!confirm(L.confirmDelete))return;await deleteOrder(id);setMenu(null);await load()}
 async function pickImage(e){const f=e.target.files?.[0];if(!f)return; const data=await resizeImage(f);setForm(v=>({...v,image_data:data}))}

 return <div className="biz-page orders-page">
  <section className="biz-frame orders-frame">
   <span className="biz-number orders-number">1</span>
   <header className="biz-page-head">
    <div className="biz-title-wrap"><span className="biz-title-icon orders-icon"><ClipboardList/></span><div><h1>{L.orders}</h1><p>{L.ordersSub}</p></div></div>
    <div className="biz-head-actions">
      <div className="biz-search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={L.searchOrders}/></div>
      <button className="biz-soft-btn" type="button"><Filter/>{L.filter}</button>
      <button className="biz-primary orders-primary" type="button" onClick={startAdd}><Plus/>{L.addOrder}</button>
    </div>
   </header>

   <div className="biz-filter-row">
    {[['All',L.all],['In Progress',L.inProgress],['Waiting Material',L.waitMaterial],['Completed',L.completed],['Waiting',L.waiting]].map(([k,v])=><button key={k} className={status===k?'active':''} onClick={()=>setStatus(k)}>{v}</button>)}
   </div>

   <div className="orders-layout">
   <div className="biz-table-wrap">
    <table className="biz-table orders-table">
      <thead><tr><th>{L.client}</th><th>{L.project}</th><th>{L.size}</th><th>{L.price}</th><th>{L.deposit}</th><th>{L.remaining}</th><th>{L.status}</th><th>{L.deadline}</th><th></th></tr></thead>
      <tbody>
       {filtered.map(r=><tr key={r.id} className={selectedId===r.id?'selected-row':''} onClick={()=>setSelectedId(r.id)}>
        <td><div className="person-cell"><span className="person-dot">{initials(r.client)}</span><strong>{r.client}</strong></div></td>
        <td>{r.project}</td><td>{r.width_cm||0} × {r.height_cm||0} cm</td><td>{eur(r.price)}</td><td>{eur(r.deposit)}</td><td>{eur(r.remaining)}</td>
        <td><Status value={r.status} L={L}/></td><td>{formatDate(r.due_date,lang)}</td>
        <td className="menu-cell"><button className="dots" onClick={()=>setMenu(menu===r.id?null:r.id)}><MoreHorizontal/></button>{menu===r.id&&<div className="row-menu"><button onClick={()=>startEdit(r)}><Pencil/> {L.edit}</button><button className="danger" onClick={()=>remove(r.id)}><Trash2/> {L.delete}</button></div>}</td>
       </tr>)}
      </tbody>
    </table>
    {!loading&&!filtered.length&&<div className="biz-empty">{L.noOrders}</div>}
    {loading&&<div className="biz-empty">{L.loading}</div>}
   </div>
  </section>

  <BusinessModal open={open} onClose={()=>setOpen(false)} title={editing?L.editOrder:L.addOrder} subtitle={L.orderFormSub} wide>
   <form className="biz-form two-col" onSubmit={save}>
    <label><span>{L.client}</span><input value={form.client} onChange={e=>setForm({...form,client:e.target.value})} required/></label>
    <label><span>{L.project}</span><input value={form.project} onChange={e=>setForm({...form,project:e.target.value})} required/></label>
    <label><span>{L.width}</span><div className="input-unit"><input inputMode="decimal" value={form.width_cm} onChange={e=>setForm({...form,width_cm:e.target.value})}/><b>cm</b></div></label>
    <label><span>{L.height}</span><div className="input-unit"><input inputMode="decimal" value={form.height_cm} onChange={e=>setForm({...form,height_cm:e.target.value})}/><b>cm</b></div></label>
    <label><span>{L.totalPrice}</span><div className="input-unit"><b>€</b><input inputMode="decimal" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></div></label>
    <label><span>{L.deposit}</span><div className="input-unit"><b>€</b><input inputMode="decimal" value={form.deposit} onChange={e=>setForm({...form,deposit:e.target.value})}/></div></label>
    <label><span>{L.deadline}</span><input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})}/></label>
    <label><span>{L.status}</span><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="In Progress">{L.inProgress}</option><option value="Waiting Material">{L.waitMaterial}</option><option value="Completed">{L.completed}</option><option value="Waiting">{L.waiting}</option></select></label>
    <label><span>{L.materialCost}</span><div className="input-unit"><b>€</b><input inputMode="decimal" value={form.material_cost} onChange={e=>setForm({...form,material_cost:e.target.value})}/></div></label>
    <label><span>{L.laborCost}</span><div className="input-unit"><b>€</b><input inputMode="decimal" value={form.labor_cost} onChange={e=>setForm({...form,labor_cost:e.target.value})}/></div></label>
    <label><span>{L.otherCost}</span><div className="input-unit"><b>€</b><input inputMode="decimal" value={form.other_cost} onChange={e=>setForm({...form,other_cost:e.target.value})}/></div></label>
    <label className="span-2"><span>{L.notes}</span><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
    <label className="span-2 biz-image-picker"><span>{L.projectImage}</span><div className="image-picker-row">{form.image_data?<img src={form.image_data} alt=""/>:<div className="image-ph"><ImagePlus/></div>}<span className="biz-upload-btn"><ImagePlus/>{L.chooseImage}<input type="file" accept="image/*" onChange={pickImage}/></span>{form.image_data&&<button type="button" className="biz-soft-btn" onClick={()=>setForm({...form,image_data:''})}><X/>{L.remove}</button>}</div></label>
    <div className="biz-form-actions span-2"><button type="button" className="biz-soft-btn" onClick={()=>setOpen(false)}>{L.cancel}</button><button className="biz-primary orders-primary" type="submit">{L.save}</button></div>
   </form>
  </BusinessModal>
 </div>
}


function OrderProfitPanel({order,L,lang}){
 if(!order)return <aside className="order-profit-panel"><div className="biz-empty">{L.noOrders}</div></aside>
 const profit=(Number(order.price)||0)-(Number(order.material_cost)||0)-(Number(order.labor_cost)||0)-(Number(order.other_cost)||0)
 return <aside className="order-profit-panel">
  <div className="order-panel-label">{L.selectedOrder}</div>
  <div className="order-panel-title"><div><h3>{order.project}</h3><Status value={order.status} L={L}/></div></div>
  <div className="order-panel-image">{order.image_data?<img src={order.image_data} alt={order.project}/>:<div className="order-image-placeholder"><ImagePlus/><span>{L.projectImage}</span></div>}</div>
  <div className="order-meta"><div><span><UserRound/> {L.client}</span><b>{order.client}</b></div><div><span>{L.size}</span><b>{order.width_cm||0} × {order.height_cm||0} cm</b></div><div><span><CalendarDays/> {L.deadline}</span><b>{formatDate(order.due_date,lang)}</b></div></div>
  <div className="order-costs"><div><span>{L.salePrice}</span><b className="positive">{eur(order.price)}</b></div><div><span>{L.materialCost}</span><b className="negative">{eur(order.material_cost)}</b></div><div><span>{L.laborCost}</span><b className="negative">{eur(order.labor_cost)}</b></div><div><span>{L.otherCost}</span><b className="negative">{eur(order.other_cost)}</b></div></div>
  <div className={`real-profit ${profit>=0?'profit-ok':'profit-bad'}`}><span>{L.realProfit}</span><strong>{eur(profit)}</strong></div>
 </aside>
}
function filteredFirst(rows){return rows?.[0]||null}

function Status({value,L}){const map={"In Progress":['progress',L.inProgress],"Waiting Material":['material',L.waitMaterial],Completed:['done',L.completed],Waiting:['waiting',L.waiting]};const [c,t]=map[value]||['waiting',value];return <span className={`status-pill ${c}`}>{t}</span>}
function initials(s){return String(s||'?').split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()}
function eur(v){return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(Number(v)||0)}
function formatDate(v,lang){if(!v)return '—';const d=new Date(`${v}T12:00:00`);return new Intl.DateTimeFormat(lang==='sq'?'sq-AL':lang==='de'?'de-DE':'en-GB').format(d)}
async function resizeImage(file){return await new Promise((resolve,reject)=>{const r=new FileReader();r.onerror=reject;r.onload=()=>{const i=new Image();i.onload=()=>{const max=900,s=Math.min(1,max/Math.max(i.width,i.height));const c=document.createElement('canvas');c.width=Math.round(i.width*s);c.height=Math.round(i.height*s);c.getContext('2d').drawImage(i,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.84))};i.onerror=reject;i.src=r.result};r.readAsDataURL(file)})}

function labels(lang){
 const sq={orders:'Porositë',ordersSub:'Menaxho porositë e klientëve dhe ndiq statusin e tyre.',searchOrders:'Kërko në porosi...',filter:'Filtro',addOrder:'Shto porosi',all:'Të gjitha',client:'Klienti',project:'Projekti',size:'Përmasat',price:'Çmimi',deposit:'Kapari',remaining:'Mbetja',status:'Statusi',deadline:'Afati',inProgress:'Në punë',waitMaterial:'Prit material',completed:'Përfunduar',waiting:'Në pritje',edit:'Redakto',delete:'Fshi',noOrders:'Nuk ka porosi të regjistruara.',loading:'Duke ngarkuar...',editOrder:'Redakto porosinë',orderFormSub:'Të dhënat ruhen në Firestore.',width:'Gjerësia',height:'Lartësia',totalPrice:'Çmimi total',notes:'Shënime',projectImage:'Foto e projektit',chooseImage:'Zgjidh foto',remove:'Hiq',cancel:'Anulo',save:'Ruaj porosinë',confirmDelete:'Ta fshij këtë porosi?',selectedOrder:'Porosia e zgjedhur',salePrice:'Çmimi i shitjes',materialCost:'Kosto e materialeve',laborCost:'Kosto e punës',otherCost:'Shpenzime të tjera',realProfit:'Fitimi real'}
 const de={...sq,orders:'Bestellungen',ordersSub:'Kundenaufträge verwalten und Status verfolgen.',searchOrders:'Bestellungen suchen...',filter:'Filter',addOrder:'Bestellung hinzufügen',all:'Alle',client:'Kunde',project:'Projekt',size:'Maße',price:'Preis',deposit:'Anzahlung',remaining:'Rest',status:'Status',deadline:'Frist',inProgress:'In Arbeit',waitMaterial:'Wartet auf Material',completed:'Abgeschlossen',waiting:'Wartet',edit:'Bearbeiten',delete:'Löschen',noOrders:'Keine Bestellungen gespeichert.',loading:'Wird geladen...',editOrder:'Bestellung bearbeiten',orderFormSub:'Die Daten werden in Firestore gespeichert.',width:'Breite',height:'Höhe',totalPrice:'Gesamtpreis',notes:'Notizen',projectImage:'Projektbild',chooseImage:'Bild wählen',remove:'Entfernen',cancel:'Abbrechen',save:'Bestellung speichern',confirmDelete:'Diese Bestellung löschen?',selectedOrder:'Ausgewählte Bestellung',salePrice:'Verkaufspreis',materialCost:'Materialkosten',laborCost:'Arbeitskosten',otherCost:'Weitere Kosten',realProfit:'Realer Gewinn'}
 const en={...sq,orders:'Orders',ordersSub:'Manage client orders and track their status.',searchOrders:'Search orders...',filter:'Filter',addOrder:'Add order',all:'All',client:'Client',project:'Project',size:'Size',price:'Price',deposit:'Deposit',remaining:'Remaining',status:'Status',deadline:'Deadline',inProgress:'In progress',waitMaterial:'Waiting material',completed:'Completed',waiting:'Waiting',edit:'Edit',delete:'Delete',noOrders:'No orders saved.',loading:'Loading...',editOrder:'Edit order',orderFormSub:'Data is saved in Firestore.',width:'Width',height:'Height',totalPrice:'Total price',notes:'Notes',projectImage:'Project image',chooseImage:'Choose image',remove:'Remove',cancel:'Cancel',save:'Save order',confirmDelete:'Delete this order?',selectedOrder:'Selected order',salePrice:'Sale price',materialCost:'Material cost',laborCost:'Labor cost',otherCost:'Other costs',realProfit:'Real profit'}
 return lang==='de'?de:lang==='en'?en:sq
}
