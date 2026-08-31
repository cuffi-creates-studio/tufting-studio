import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'
import React,{useEffect,useState} from 'react'
import {Plus,Trash2,X,Boxes,Palette,Euro,Package} from 'lucide-react'
import {addMaterial,deleteMaterial,getMaterials} from '../lib/materialsStore'
import '../styles/materials-professional.css'

export default function Materials(){
 const {t,lang}=useI18n()
 const tx=labels(lang)
 const [items,setItems]=useState([]),[open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const [f,setF]=useState({yarn_type:'Acrylic',name:'',color_hex:'#FFC567',price_per_100g:'3.50',stock_g:'500'})
 async function load(){try{setError('');setItems(await getMaterials())}catch(e){console.error(e);setError(tx.loadError) }}
 useEffect(()=>{load()},[])
 async function add(){
  if(!f.name.trim())return setError(tx.nameRequired)
  setBusy(true);setError('')
  try{await addMaterial({...f,price_per_100g:Number(f.price_per_100g)||0,stock_g:Number(f.stock_g)||0});setOpen(false);setF({yarn_type:'Acrylic',name:'',color_hex:'#FFC567',price_per_100g:'3.50',stock_g:'500'});await load()}
  catch(e){console.error(e);setError(tx.saveError)}
  finally{setBusy(false)}
 }
 async function del(id){if(!confirm(tx.deleteConfirm))return;try{await deleteMaterial(id);await load()}catch(e){console.error(e);setError(tx.deleteError)}}
 return <div className="materials-clean-page materials-pro-page"><MobilePageHeader title={t('materials')}/>
  <div className="materials-pro-head"><div className="materials-pro-title"><span><Boxes/></span><div><h1>{tx.title}</h1><p>{tx.subtitle}</p></div></div><button className="materials-add" onClick={()=>setOpen(true)}><Plus/>{tx.add}</button></div>
  {error&&<div className="materials-error">{error}</div>}
  <div className="materials-table-card"><table><thead><tr><th>{tx.type}</th><th>{tx.name}</th><th>{tx.color}</th><th>{tx.price100}</th><th>{tx.stock}</th><th/></tr></thead><tbody>{items.map(m=><tr key={m.id}><td><span className="mat-type">{materialTypeLabel(m.yarn_type,tx)}</span></td><td><b>{m.name}</b></td><td><span className="mat-color"><i style={{background:m.color_hex}}/>{m.color_hex}</span></td><td>€{Number(m.price_per_100g||0).toFixed(2)}</td><td><b>{Number(m.stock_g||0)} g</b></td><td><button className="mat-delete" onClick={()=>del(m.id)}><Trash2/></button></td></tr>)}</tbody></table>{!items.length&&!error&&<div className="materials-empty"><Boxes/><b>{tx.empty}</b><span>{tx.emptyHint}</span></div>}</div>
  {open&&<div className="materials-modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setOpen(false)}><div className="materials-modal"><div className="materials-modal-head"><div><h2>{tx.add}</h2><p>{tx.modalSubtitle}</p></div><button onClick={()=>setOpen(false)}><X/></button></div><div className="materials-form">
   <label><span><Boxes/>{tx.type}</span><select value={f.yarn_type} onChange={e=>setF({...f,yarn_type:e.target.value})}><option value="Acrylic">{tx.acrylic}</option><option value="Wool">{tx.wool}</option></select></label>
   <label><span><Package/>{tx.name}</span><input value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder={tx.namePlaceholder}/></label>
   <label><span><Palette/>{tx.color}</span><div className="materials-color-row"><input type="color" value={f.color_hex} onChange={e=>setF({...f,color_hex:e.target.value})}/><input value={f.color_hex} onChange={e=>setF({...f,color_hex:e.target.value})}/></div></label>
   <label><span><Euro/>{tx.price100}</span><input type="number" step="0.01" min="0" value={f.price_per_100g} onChange={e=>setF({...f,price_per_100g:e.target.value})}/></label>
   <label className="full"><span><Package/>{tx.stockG}</span><input type="number" min="0" value={f.stock_g} onChange={e=>setF({...f,stock_g:e.target.value})}/></label>
   <div className="materials-form-actions"><button className="secondary" onClick={()=>setOpen(false)}>{tx.close}</button><button className="primary" disabled={busy} onClick={add}>{busy?tx.saving:tx.save}</button></div>
  </div></div></div>}
 </div>
}


function materialTypeLabel(type,tx){
 if(type==='Acrylic')return tx.acrylic
 if(type==='Wool')return tx.wool
 return type||'—'
}

function labels(lang){
 if(lang==='de')return{
  title:'Materialien',subtitle:'Verwalte echte Garnpreise, Farben und Lagerbestand.',add:'Material hinzufügen',
  type:'Typ',name:'Name',color:'Farbe',price100:'Preis / 100g',stock:'Bestand',stockG:'Bestand (g)',
  acrylic:'Acryl',wool:'Wolle',empty:'Noch keine Materialien.',emptyHint:'Füge dein erstes Material hinzu; es wird in Firebase gespeichert.',
  modalSubtitle:'Die Daten werden direkt in deinem Konto gespeichert.',namePlaceholder:'z. B. Pastellrosa',
  close:'Schließen',save:'Material speichern',saving:'Wird gespeichert…',nameRequired:'Bitte den Materialnamen eingeben.',
  loadError:'Materialien konnten nicht geladen werden. Prüfe Anmeldung oder Verbindung.',
  saveError:'Material konnte nicht gespeichert werden. Prüfe die Verbindung und versuche es erneut.',
  deleteError:'Material konnte nicht gelöscht werden.',deleteConfirm:'Dieses Material löschen?'
 }
 if(lang==='en')return{
  title:'Materials',subtitle:'Keep your real yarn prices, colors and stock.',add:'Add material',
  type:'Type',name:'Name',color:'Color',price100:'Price / 100g',stock:'Stock',stockG:'Stock (g)',
  acrylic:'Acrylic',wool:'Wool',empty:'No materials yet.',emptyHint:'Add your first material; it will be saved in Firebase.',
  modalSubtitle:'The data is saved directly to your account.',namePlaceholder:'e.g. Pastel pink',
  close:'Close',save:'Save material',saving:'Saving…',nameRequired:'Enter the material name.',
  loadError:'Materials could not be loaded. Check your login or connection.',
  saveError:'Material could not be saved. Check the connection and try again.',
  deleteError:'Material could not be deleted.',deleteConfirm:'Delete this material?'
 }
 return{
  title:'Materialet',subtitle:'Ruaj çmimet reale, ngjyrat dhe stokun e leshit.',add:'Shto material',
  type:'Lloji',name:'Emri',color:'Ngjyra',price100:'Çmimi / 100g',stock:'Stoku',stockG:'Stoku (g)',
  acrylic:'Akrilik',wool:'Lesh',empty:'Ende nuk ka materiale.',emptyHint:'Shto materialin e parë dhe ruhet në Firebase.',
  modalSubtitle:'Të dhënat ruhen direkt në llogarinë tënde.',namePlaceholder:'p.sh. Rozë pastel',
  close:'Mbyll',save:'Ruaj materialin',saving:'Po ruhet…',nameRequired:'Shkruaj emrin e materialit.',
  loadError:'Nuk u ngarkuan materialet. Kontrollo hyrjen ose lidhjen.',
  saveError:'Materiali nuk u ruajt. Kontrollo lidhjen dhe provo përsëri.',
  deleteError:'Materiali nuk u fshi.',deleteConfirm:'Ta fshij këtë material?'
 }
}
