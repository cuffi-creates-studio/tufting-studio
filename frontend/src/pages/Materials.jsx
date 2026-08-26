import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'
import React,{useEffect,useState} from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { addMaterial, deleteMaterial, getMaterials } from '../api/client'

export default function Materials(){
 const {t}=useI18n()
 const [items,setItems]=useState([])
 const [open,setOpen]=useState(false)
 const [f,setF]=useState({yarn_type:'Acrylic',name:'',color_hex:'#FF7A20',price_per_100g:3.5,stock_g:500})
 async function load(){setItems(await getMaterials())}
 useEffect(()=>{load().catch(()=>{})},[])
 async function add(){await addMaterial({...f,price_per_100g:+f.price_per_100g,stock_g:+f.stock_g});setOpen(false);load()}
 async function del(id){await deleteMaterial(id);load()}
 return <><MobilePageHeader title={t('materials')}/>
  <div className="page-title"><div><h1>Materials</h1><p>Keep your real yarn prices and stock.</p></div><button className="btn teal" onClick={()=>setOpen(true)}><Plus/>Add Material</button></div>
  <div className="card table-wrap"><table><thead><tr><th>Type</th><th>Name</th><th>Color</th><th>Price/100g</th><th>Stock</th><th/></tr></thead><tbody>{items.map(m=><tr key={m.id}><td>{m.yarn_type}</td><td>{m.name}</td><td><i className="color-dot" style={{background:m.color_hex}}/> {m.color_hex}</td><td>€{m.price_per_100g.toFixed(2)}</td><td>{m.stock_g} g</td><td><button className="text-button danger-text" onClick={()=>del(m.id)}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div>
  {open&&<div className="modal"><div className="modal-card"><button className="modal-x" onClick={()=>setOpen(false)}>×</button><h2>Add Material</h2>
   <label>Type<select value={f.yarn_type} onChange={e=>setF({...f,yarn_type:e.target.value})}><option>Acrylic</option><option>Wool</option></select></label>
   <label>Name<input value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></label>
   <label>Color<input type="color" value={f.color_hex} onChange={e=>setF({...f,color_hex:e.target.value})}/></label>
   <label>Price /100g<input type="number" step=".01" value={f.price_per_100g} onChange={e=>setF({...f,price_per_100g:e.target.value})}/></label>
   <label>Stock g<input type="number" value={f.stock_g} onChange={e=>setF({...f,stock_g:e.target.value})}/></label>
   <button className="btn teal" onClick={add}>Save</button>
  </div></div>}
 </>
}
