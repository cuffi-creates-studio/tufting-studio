import React,{useEffect,useMemo,useRef,useState} from 'react'
import {Boxes,Download,Plus,Search,X} from 'lucide-react'
import {useI18n} from '../i18n/I18n'
import {createInventoryItem,deleteInventoryItem,getInventory,updateInventoryItem} from '../lib/businessStore'
import '../styles/business-pc.css'

export default function Inventory(){
 const {lang}=useI18n(),tx=labels(lang),dialog=useRef(null)
 const [rows,setRows]=useState([]),[q,setQ]=useState(''),[editing,setEditing]=useState(null),[saving,setSaving]=useState(false)
 async function load(){setRows(await getInventory().catch(()=>[]))}
 useEffect(()=>{load()},[])
 const shown=useMemo(()=>rows.filter(r=>[r.name,r.hex,r.brand,r.type].join(' ').toLowerCase().includes(q.toLowerCase())),[rows,q])
 const totalG=rows.reduce((s,r)=>s+(Number(r.stock_g)||0),0)
 const totalValue=rows.reduce((s,r)=>s+((Number(r.stock_g)||0)/(Number(r.ball_g)||100))*(Number(r.price_per_ball)||0),0)
 function open(row=null){setEditing(row);dialog.current?.showModal()}
 async function submit(e){e.preventDefault();setSaving(true);const f=new FormData(e.currentTarget);const data={type:String(f.get('type')||'Yarn'),name:String(f.get('name')||'').trim(),hex:String(f.get('hex')||'#FFC567').trim(),brand:String(f.get('brand')||'').trim(),stock_g:Number(f.get('stock_g'))||0,ball_g:Number(f.get('ball_g'))||100,price_per_ball:Number(f.get('price_per_ball'))||0,min_stock_g:Number(f.get('min_stock_g'))||0};if(editing)await updateInventoryItem(editing.id,data);else await createInventoryItem(data);await load();setSaving(false);dialog.current?.close();setEditing(null)}
 async function remove(id){if(!confirm(tx.confirmDelete))return;await deleteInventoryItem(id);await load()}
 function exportCsv(){const head=['Name','Type','HEX','Brand','Stock g','Ball g','Price/ball','Min stock g'];const body=rows.map(r=>[r.name,r.type,r.hex,r.brand,r.stock_g,r.ball_g,r.price_per_ball,r.min_stock_g]);const csv=[head,...body].map(a=>a.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='tufting-inventory.csv';a.click();URL.revokeObjectURL(a.href)}

 return <div className="business-page inventory"><section className="business-shell-card">
  <header className="business-head"><div className="business-number">2</div><div className="business-title-icon"><Boxes/></div><div className="business-heading"><h1>{tx.title}</h1><p>{tx.subtitle}</p></div><div className="business-actions"><button className="biz-btn" onClick={exportCsv}><Download/>{tx.export}</button><label className="biz-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={tx.search}/></label><button className="biz-btn primary" onClick={()=>open()}><Plus/>{tx.add}</button></div></header>
  <div className="biz-layout-split">
   <div className="business-table-wrap">{shown.length?<table className="business-table"><thead><tr><th>{tx.yarn}</th><th>{tx.color}</th><th>{tx.hex}</th><th>{tx.stock}</th><th>{tx.price}</th><th>{tx.alert}</th><th/></tr></thead><tbody>{shown.map(r=>{const low=(Number(r.stock_g)||0)<=(Number(r.min_stock_g)||0);return <tr key={r.id}><td>{r.type||'Yarn'}</td><td><span className="biz-color-swatch" style={{background:r.hex||'#ddd'}}/>{r.name||'—'}</td><td>{r.hex||'—'}</td><td><b>{Number(r.stock_g)||0} g</b></td><td>€{money(r.price_per_ball)}</td><td>{low?<span className="biz-stock-alert">{tx.low}</span>:<span className="biz-stock-ok">OK</span>}</td><td><button className="biz-kebab" onClick={()=>open(r)}>•••</button></td></tr>})}</tbody></table>:<div className="biz-empty">{tx.empty}</div>}</div>
   <aside className="biz-summary"><h3>{tx.summary}</h3><div className="biz-donut"><div className="biz-donut-center"><b>{tx.total}</b><strong>{totalG.toLocaleString()} g</strong></div></div><div className="biz-legend">{rows.slice(0,7).map((r,i)=><div className="biz-legend-row" key={r.id}><i className="biz-legend-dot" style={{background:r.hex||'#ccc'}}/><span>{r.name}</span><b>{Number(r.stock_g)||0} g</b></div>)}</div><div className="biz-summary-total"><span>{tx.totalValue}</span><strong>€{money(totalValue)}</strong></div></aside>
  </div>
 </section>
 <dialog className="biz-dialog" ref={dialog} onClose={()=>setEditing(null)}><div className="biz-dialog-head"><h2>{editing?tx.edit:tx.add}</h2><button className="biz-dialog-close" onClick={()=>dialog.current?.close()}><X/></button></div><form className="biz-form" onSubmit={submit} key={editing?.id||'new'}>
  <label>{tx.type}<select name="type" defaultValue={editing?.type||'Yarn'}><option>Yarn</option><option>Backing Cloth</option><option>Glue</option><option>Felt</option><option>Other</option></select></label>
  <label>{tx.name}<input name="name" required defaultValue={editing?.name||''}/></label>
  <label>{tx.hex}<input name="hex" defaultValue={editing?.hex||'#FFC567'} pattern="#[0-9A-Fa-f]{6}"/></label>
  <label>{tx.brand}<input name="brand" defaultValue={editing?.brand||''}/></label>
  <label>{tx.stock}<input name="stock_g" type="number" min="0" defaultValue={editing?.stock_g||0}/></label>
  <label>{tx.ballG}<input name="ball_g" type="number" min="1" defaultValue={editing?.ball_g||100}/></label>
  <label>{tx.price}<input name="price_per_ball" type="number" min="0" step="0.01" defaultValue={editing?.price_per_ball||''}/></label>
  <label>{tx.min}<input name="min_stock_g" type="number" min="0" defaultValue={editing?.min_stock_g||0}/></label>
  <div className="biz-form-actions">{editing&&<button type="button" className="biz-btn danger" onClick={()=>remove(editing.id)}>{tx.delete}</button>}<button type="button" className="biz-btn" onClick={()=>dialog.current?.close()}>{tx.cancel}</button><button className="biz-btn primary" disabled={saving}>{saving?tx.saving:tx.save}</button></div>
 </form></dialog>
 </div>
}
function money(v){return(Number(v)||0).toFixed(2)}
function labels(lang){
 if(lang==='de')return{title:'Inventar',subtitle:'Material- und Garnbestand für deine Projekte verwalten.',export:'Export',search:'Material suchen...',add:'Material hinzufügen',yarn:'Material',color:'Farbe',hex:'HEX-Code',stock:'Bestand (g)',price:'Preis/Ball',alert:'Bestand',low:'Niedrig',summary:'Bestandsübersicht',total:'Gesamt',totalValue:'Inventarwert',type:'Typ',name:'Name / Farbe',brand:'Marke',ballG:'Gramm pro Ball',min:'Mindestbestand (g)',save:'Material speichern',saving:'Speichern…',cancel:'Abbrechen',edit:'Material bearbeiten',delete:'Löschen',empty:'Noch keine Materialien.',confirmDelete:'Dieses Material löschen?'}
 if(lang==='en')return{title:'Inventory',subtitle:'Manage yarn and material stock for your projects.',export:'Export',search:'Search material...',add:'Add material',yarn:'Material',color:'Color',hex:'HEX code',stock:'Stock (g)',price:'Price/ball',alert:'Stock',low:'Low stock',summary:'Stock summary',total:'Total',totalValue:'Inventory value',type:'Type',name:'Name / Color',brand:'Brand',ballG:'Grams per ball',min:'Minimum stock (g)',save:'Save material',saving:'Saving…',cancel:'Cancel',edit:'Edit material',delete:'Delete',empty:'No inventory items yet.',confirmDelete:'Delete this material?'}
 return{title:'Inventari',subtitle:'Menaxho stokun e materialeve dhe leshit për projektet e tua.',export:'Eksporto',search:'Kërko material...',add:'Shto material',yarn:'Materiali',color:'Ngjyra',hex:'Kodi HEX',stock:'Stoku (g)',price:'Çmimi/top',alert:'Alarm stok',low:'Stok i ulët',summary:'Përmbledhje stoku',total:'Totali',totalValue:'Vlera totale e inventarit',type:'Lloji',name:'Emri / Ngjyra',brand:'Marka',ballG:'Gramatura e topit',min:'Minimumi i stokut (g)',save:'Ruaj materialin',saving:'Po ruhet…',cancel:'Mbyll',edit:'Redakto materialin',delete:'Fshi',empty:'Ende nuk ka materiale.',confirmDelete:'Ta fshij këtë material?'}
}
