import React,{useEffect,useMemo,useRef,useState} from 'react'
import {Boxes,Download,Plus,Search,X,Trash2,Save,Tag,Palette,Hash,Database,ShieldCheck} from 'lucide-react'
import {useI18n} from '../i18n/I18n'
import {createInventoryItem,deleteInventoryItem,getInventory,updateInventoryItem,getBusinessReports,createBusinessReport,deleteBusinessReport} from '../lib/businessStore'
import {makeBusinessPdf,reportLinesFromRows} from '../lib/businessPdf'
import '../styles/business-pc.css'
import yarnTexture from '../assets/yarn-skein-texture.png'

const BALLS=[50,100,500]
export default function Inventory(){
 const {lang}=useI18n(),tx=labels(lang),dialog=useRef(null)
 const [rows,setRows]=useState([]),[reports,setReports]=useState([]),[q,setQ]=useState(''),[editing,setEditing]=useState(null),[saving,setSaving]=useState(false),[form,setForm]=useState(empty())
 async function load(){const[a,b]=await Promise.all([getInventory().catch(()=>[]),getBusinessReports('inventory').catch(()=>[])]);setRows(a);setReports(b)}
 useEffect(()=>{load()},[])
 const shown=useMemo(()=>rows.filter(r=>[r.name,r.hex,r.brand,r.yarn_type].join(' ').toLowerCase().includes(q.toLowerCase())),[rows,q])
 const totalG=rows.reduce((s,r)=>s+(Number(r.stock_g)||0),0)
 const totalValue=rows.reduce((s,r)=>s+((Number(r.stock_g)||0)/(Number(r.ball_g)||100))*(Number(r.price_per_ball)||0),0)
 function open(row=null){setEditing(row);setForm(row?normalize(row):empty());dialog.current?.showModal()}
 function close(){dialog.current?.close();setEditing(null);setForm(empty())}
 async function submit(e){e.preventDefault();if(!form.name.trim())return;setSaving(true);const data={type:'Yarn',yarn_type:form.yarn_type,name:form.name.trim(),hex:hex(form.hex),brand:form.brand.trim(),stock_g:num(form.stock_g),ball_g:num(form.ball_g)||100,price_per_ball:num(form.price_per_ball),min_stock_g:num(form.min_stock_g)};if(editing)await updateInventoryItem(editing.id,data);else await createInventoryItem(data);await load();setSaving(false);close()}
 async function remove(id){if(!confirm(tx.confirmDelete))return;await deleteInventoryItem(id);await load();close()}
 function csv(){const rowsOut=[['Yarn type','Color','HEX','Brand','Ball g','Stock g','Price/ball','Min stock g'],...rows.map(r=>[r.yarn_type,r.name,r.hex,r.brand,r.ball_g,r.stock_g,r.price_per_ball,r.min_stock_g])];const blob=new Blob([rowsOut.map(a=>a.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='tufting-inventory.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
 async function pdf(){const title=tx.pdfTitle;const lines=[`#${tx.summary}`,`${tx.total}: ${totalG.toLocaleString()} g`,`${tx.totalValue}: €${money(totalValue)}`,'',...reportLinesFromRows([tx.yarnType,tx.color,tx.hex,tx.brand,tx.ballG,tx.stock,tx.price],rows.map(r=>[labelYarn(r.yarn_type,tx),r.name,r.hex,r.brand,`${r.ball_g||0} g`,`${r.stock_g||0} g`,`€${money(r.price_per_ball)}`]))];const file=makeBusinessPdf({title,subtitle:tx.subtitle,lines,filename:'tufting-inventory.pdf'});await createBusinessReport({module:'inventory',title,file_name:file,lines});await load()}
 async function openReport(r){makeBusinessPdf({title:r.title||tx.pdfTitle,subtitle:tx.subtitle,lines:r.lines||[],filename:r.file_name||'inventory.pdf'})}

 return <div className="business-page inventory retro-business-page">
  <section className="business-shell-card">
   <header className="business-head"><div className="business-number">2</div><div className="business-title-icon"><Boxes/></div><div className="business-heading"><h1>{tx.title}</h1><p>{tx.subtitle}</p></div><div className="business-actions"><button className="biz-btn retro-yellow" onClick={csv}><Download/>{tx.export}</button><button className="biz-btn retro-purple" onClick={pdf}>PDF</button><label className="biz-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={tx.search}/></label><button className="biz-btn primary" onClick={()=>open()}><Plus/>{tx.add}</button></div></header>
   <div className="biz-layout-split">
    <div className="business-table-wrap"><table className="business-table inventory-table"><thead><tr><th>{tx.yarnType}</th><th>{tx.color}</th><th>{tx.hex}</th><th>{tx.brand}</th><th>{tx.ballG}</th><th>{tx.stock}</th><th>{tx.price}</th><th>{tx.alert}</th><th/></tr></thead><tbody>{shown.map(r=>{const low=num(r.stock_g)<=num(r.min_stock_g);return <tr key={r.id}><td><b>{labelYarn(r.yarn_type,tx)}</b></td><td><div className="yarn-cell"><YarnSkein color={r.hex} size="sm"/><span>{r.name||'—'}</span></div></td><td><code>{r.hex||'—'}</code></td><td>{r.brand||'—'}</td><td>{r.ball_g||0} g</td><td><b>{r.stock_g||0} g</b></td><td><b>€{money(r.price_per_ball)}</b></td><td>{low?<span className="biz-stock-alert">{tx.low}</span>:<span className="biz-stock-ok">OK</span>}</td><td><button className="biz-kebab" onClick={()=>open(r)}>•••</button></td></tr>})}</tbody></table>{!shown.length&&<div className="biz-empty">{tx.empty}</div>}</div>
    <aside className="biz-summary colorful-summary inventory-summary"><h3>{tx.summary}</h3>{rows.length?<><div className="biz-donut" style={{background:inventoryGradient(rows)}}><div className="biz-donut-center"><b>{rows.length} {tx.items}</b><strong>{totalG.toLocaleString()} g</strong></div></div><div className="biz-legend">{rows.slice(0,8).map(r=><div className="biz-legend-row" key={r.id}><YarnSkein color={r.hex} size="xs"/><span>{r.name}</span><b>{r.stock_g||0} g</b></div>)}</div></>:<div className="inventory-empty-summary"><YarnSkein color="#E9E0D2" size="lg"/><strong>0 g</strong><span>{tx.noStock}</span></div>}<div className="biz-summary-total"><span>{tx.totalValue}</span><strong>€{money(totalValue)}</strong></div></aside>
   </div>
  </section>
  <SavedReports title={tx.saved} reports={reports} openReport={openReport} onDelete={async id=>{await deleteBusinessReport(id);await load()}}/>

  <dialog className="biz-dialog retro-dialog inventory-dialog" ref={dialog} onClose={()=>setEditing(null)}>
   <div className="biz-dialog-head retro-dialog-head"><div className="business-title-icon"><Boxes/></div><div><h2>{editing?tx.edit:tx.add}</h2><p>{tx.dialogSubtitle}</p></div><button className="biz-dialog-close" onClick={close}><X/></button></div>
   <form className="biz-form retro-form" onSubmit={submit}>
    <section className="retro-field-card pink"><div className="retro-field-title"><Boxes/>{tx.yarnType}</div><div className="choice-row"><button type="button" className={form.yarn_type==='Acrylic'?'active acrylic':''} onClick={()=>setForm(v=>({...v,yarn_type:'Acrylic'}))}>Akryl</button><button type="button" className={form.yarn_type==='Wool'?'active wool':''} onClick={()=>setForm(v=>({...v,yarn_type:'Wool'}))}>Lesh</button></div></section>
    <section className="retro-field-card green"><div className="retro-field-title"><Tag/>{tx.brand}</div><input value={form.brand} onChange={e=>setForm(v=>({...v,brand:e.target.value}))} placeholder="p.sh. Kartopu, Alize..."/></section>
    <section className="retro-field-card purple"><div className="retro-field-title"><Palette/>{tx.color}</div><input required value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))} placeholder="p.sh. Rozë pastel"/></section>
    <section className="retro-field-card orange"><div className="retro-field-title"><Database/>{tx.ballG}</div><div className="choice-row">{BALLS.map(n=><button type="button" key={n} className={Number(form.ball_g)===n?'active gram':''} onClick={()=>setForm(v=>({...v,ball_g:n}))}>{n} g</button>)}</div></section>
    <section className="retro-field-card coral color-card"><div className="retro-field-title"><Palette/>{tx.colorCard}</div><div className="color-preview-wrap"><YarnSkein color={form.hex} size="lg"/><input type="color" value={hex(form.hex)} onChange={e=>setForm(v=>({...v,hex:e.target.value.toUpperCase()}))}/></div></section>
    <section className="retro-field-card green"><div className="retro-field-title"><Database/>{tx.stock}</div><input type="number" min="0" value={form.stock_g} onChange={e=>setForm(v=>({...v,stock_g:e.target.value}))}/></section>
    <section className="retro-field-card blue"><div className="retro-field-title"><Hash/>{tx.hex}</div><input value={form.hex} onChange={e=>setForm(v=>({...v,hex:e.target.value}))}/></section>
    <section className="retro-field-card pink"><div className="retro-field-title">€ {tx.price}</div><input type="number" min="0" step="0.01" value={form.price_per_ball} onChange={e=>setForm(v=>({...v,price_per_ball:e.target.value}))}/></section>
    <section className="retro-field-card blue"><div className="retro-field-title"><ShieldCheck/>{tx.min}</div><input type="number" min="0" value={form.min_stock_g} onChange={e=>setForm(v=>({...v,min_stock_g:e.target.value}))}/></section>
    <div className="biz-form-actions retro-actions">{editing&&<button type="button" className="biz-btn danger" onClick={()=>remove(editing.id)}><Trash2/>{tx.delete}</button>}<button type="button" className="biz-btn" onClick={close}>{tx.cancel}</button><button className="biz-btn retro-save" disabled={saving}><Save/>{saving?tx.saving:tx.save}</button></div>
   </form>
  </dialog>
 </div>
}

function YarnSkein({color='#FB7DA8',size='sm'}){
 const c=hex(color)
 return <span className={`real-yarn-skein ${size}`} style={{'--yarn-color':c}} aria-hidden="true"><span className="real-yarn-color"/><img src={yarnTexture} alt="" draggable="false"/><span className="real-yarn-label"><b>TS</b><i>YARN</i></span></span>
}
function inventoryGradient(rows){
 if(!rows.length)return'conic-gradient(#eee 0 100%)'
 const total=rows.reduce((s,r)=>s+num(r.stock_g),0)||1
 let at=0
 return `conic-gradient(${rows.map(r=>{const next=at+num(r.stock_g)/total*100;const part=`${hex(r.hex)} ${at}% ${next}%`;at=next;return part}).join(',')})`
}
function SavedReports({title,reports,openReport,onDelete}){return <section className="saved-docs"><h3>{title}</h3>{reports.length?<div className="saved-doc-grid">{reports.slice(0,8).map(r=><div className="saved-doc" key={r.id}><div><b>{r.title}</b><small>{new Date(r.created_at||Date.now()).toLocaleString()}</small></div><button onClick={()=>openReport(r)}>PDF</button><button className="danger-mini" onClick={()=>onDelete(r.id)}>×</button></div>)}</div>:<p>—</p>}</section>}
function empty(){return{yarn_type:'Acrylic',name:'',hex:'#FB7DA8',brand:'',stock_g:0,ball_g:100,price_per_ball:'',min_stock_g:0}}
function normalize(r){return{yarn_type:r.yarn_type||'Acrylic',name:r.name||'',hex:r.hex||'#FB7DA8',brand:r.brand||'',stock_g:r.stock_g||0,ball_g:r.ball_g||100,price_per_ball:r.price_per_ball||'',min_stock_g:r.min_stock_g||0}}
function num(v){return Number(v)||0}function money(v){return num(v).toFixed(2)}function hex(v){const s=String(v||'').trim();return /^#[0-9a-f]{6}$/i.test(s)?s.toUpperCase():'#FB7DA8'}
function labelYarn(v,t){return v==='Wool'?t.wool:t.acrylic}
function labels(lang){
 if(lang==='de')return{title:'Inventar',subtitle:'Verwalte Garnbestand, Farben und Preise.',export:'Export',search:'Material suchen...',add:'Material hinzufügen',yarnType:'Garnart',acrylic:'Acryl',wool:'Wolle',color:'Farbe',hex:'HEX-Code',brand:'Marke',ballG:'Ballgewicht',stock:'Gesamtbestand (g)',price:'Preis / Ball',alert:'Bestand',low:'Niedrig',summary:'Bestandsübersicht',total:'Gesamt',items:'Materialien',noStock:'Noch kein realer Bestand.',totalValue:'Inventarwert',colorCard:'Farbkarte',min:'Mindestbestand (g)',save:'Material speichern',saving:'Speichern…',cancel:'Schließen',edit:'Material bearbeiten',delete:'Löschen',empty:'Noch keine Materialien.',confirmDelete:'Dieses Material löschen?',dialogSubtitle:'Garn und Bestand sauber erfassen.',saved:'Gespeicherte PDFs',pdfTitle:'Tufting Studio – Inventar'}
 if(lang==='en')return{title:'Inventory',subtitle:'Manage yarn stock, colors and real prices.',export:'Export',search:'Search material...',add:'Add material',yarnType:'Yarn type',acrylic:'Acrylic',wool:'Wool',color:'Color',hex:'HEX code',brand:'Brand',ballG:'Ball weight',stock:'Total stock (g)',price:'Price / ball',alert:'Stock',low:'Low stock',summary:'Stock summary',total:'Total',items:'materials',noStock:'No real stock yet.',totalValue:'Inventory value',colorCard:'Color card',min:'Minimum stock (g)',save:'Save material',saving:'Saving…',cancel:'Close',edit:'Edit material',delete:'Delete',empty:'No inventory items yet.',confirmDelete:'Delete this material?',dialogSubtitle:'Record yarn and stock clearly.',saved:'Saved PDFs',pdfTitle:'Tufting Studio – Inventory'}
 return{title:'Inventari',subtitle:'Menaxho leshin, ngjyrat, markat dhe çmimet reale.',export:'Eksporto',search:'Kërko material...',add:'Shto material',yarnType:'Lloji i leshit',acrylic:'Akryl',wool:'Lesh',color:'Emri / Ngjyra',hex:'Kodi HEX',brand:'Marka',ballG:'Gramatura e topit',stock:'Stoku total (g)',price:'Çmimi / top',alert:'Alarm stok',low:'Stok i ulët',summary:'Përmbledhje stoku',total:'Totali',items:'lloje leshi',noStock:'Nuk ka ende stok real.',totalValue:'Vlera totale e inventarit',colorCard:'Karta e ngjyrës',min:'Minimumi i stokut (g)',save:'Ruaj materialin',saving:'Po ruhet…',cancel:'Mbyll',edit:'Redakto materialin',delete:'Fshi',empty:'Ende nuk ka materiale.',confirmDelete:'Ta fshij këtë material?',dialogSubtitle:'Shto një material të ri me të dhëna reale.',saved:'PDF / Faturat e ruajtura',pdfTitle:'Tufting Studio – Inventari'}
}
