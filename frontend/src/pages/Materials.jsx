import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'
import React,{useEffect,useState} from 'react'
import {Plus,Trash2,X,Boxes,Palette,Euro,Package} from 'lucide-react'
import {addMaterial,deleteMaterial,getMaterials} from '../lib/materialsStore'
import '../styles/materials-professional.css'

export default function Materials(){
 const {t}=useI18n()
 const [items,setItems]=useState([]),[open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const [f,setF]=useState({yarn_type:'Acrylic',name:'',color_hex:'#FFC567',price_per_100g:'3.50',stock_g:'500'})
 async function load(){try{setError('');setItems(await getMaterials())}catch(e){console.error(e);setError('Nuk u ngarkuan materialet. Kontrollo hyrjen/lidhjen.') }}
 useEffect(()=>{load()},[])
 async function add(){
  if(!f.name.trim())return setError('Shkruaj emrin e materialit.')
  setBusy(true);setError('')
  try{await addMaterial({...f,price_per_100g:Number(f.price_per_100g)||0,stock_g:Number(f.stock_g)||0});setOpen(false);setF({yarn_type:'Acrylic',name:'',color_hex:'#FFC567',price_per_100g:'3.50',stock_g:'500'});await load()}
  catch(e){console.error(e);setError('Materiali nuk u ruajt. Kontrollo lidhjen dhe provo përsëri.')}
  finally{setBusy(false)}
 }
 async function del(id){if(!confirm('Ta fshij këtë material?'))return;try{await deleteMaterial(id);await load()}catch(e){console.error(e);setError('Materiali nuk u fshi.')}}
 return <div className="materials-clean-page materials-pro-page"><MobilePageHeader title={t('materials')}/>
  <div className="materials-pro-head"><div className="materials-pro-title"><span><Boxes/></span><div><h1>Materialet</h1><p>Ruaj çmimet reale, ngjyrat dhe stokun e leshit.</p></div></div><button className="materials-add" onClick={()=>setOpen(true)}><Plus/>Shto material</button></div>
  {error&&<div className="materials-error">{error}</div>}
  <div className="materials-table-card"><table><thead><tr><th>Lloji</th><th>Emri</th><th>Ngjyra</th><th>Çmimi / 100g</th><th>Stoku</th><th/></tr></thead><tbody>{items.map(m=><tr key={m.id}><td><span className="mat-type">{m.yarn_type}</span></td><td><b>{m.name}</b></td><td><span className="mat-color"><i style={{background:m.color_hex}}/>{m.color_hex}</span></td><td>€{Number(m.price_per_100g||0).toFixed(2)}</td><td><b>{Number(m.stock_g||0)} g</b></td><td><button className="mat-delete" onClick={()=>del(m.id)}><Trash2/></button></td></tr>)}</tbody></table>{!items.length&&!error&&<div className="materials-empty"><Boxes/><b>Ende nuk ka materiale.</b><span>Shto materialin e parë dhe ruhet në Firebase.</span></div>}</div>
  {open&&<div className="materials-modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setOpen(false)}><div className="materials-modal"><div className="materials-modal-head"><div><h2>Shto material</h2><p>Të dhënat ruhen direkt në llogarinë tënde.</p></div><button onClick={()=>setOpen(false)}><X/></button></div><div className="materials-form">
   <label><span><Boxes/>Lloji</span><select value={f.yarn_type} onChange={e=>setF({...f,yarn_type:e.target.value})}><option>Acrylic</option><option>Wool</option></select></label>
   <label><span><Package/>Emri</span><input value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="p.sh. Rozë pastel"/></label>
   <label><span><Palette/>Ngjyra</span><div className="materials-color-row"><input type="color" value={f.color_hex} onChange={e=>setF({...f,color_hex:e.target.value})}/><input value={f.color_hex} onChange={e=>setF({...f,color_hex:e.target.value})}/></div></label>
   <label><span><Euro/>Çmimi / 100g</span><input type="number" step="0.01" min="0" value={f.price_per_100g} onChange={e=>setF({...f,price_per_100g:e.target.value})}/></label>
   <label className="full"><span><Package/>Stoku (g)</span><input type="number" min="0" value={f.stock_g} onChange={e=>setF({...f,stock_g:e.target.value})}/></label>
   <div className="materials-form-actions"><button className="secondary" onClick={()=>setOpen(false)}>Mbyll</button><button className="primary" disabled={busy} onClick={add}>{busy?'Po ruhet…':'Ruaj materialin'}</button></div>
  </div></div></div>}
 </div>
}
