import React,{useEffect,useMemo,useRef,useState} from 'react'
import {Boxes,Download,Plus,Search,X,Trash2,Save,Tag,Palette,Hash,Database,ShieldCheck} from 'lucide-react'
import {useI18n} from '../i18n/I18n'
import {createInventoryItem,deleteInventoryItem,getInventory,updateInventoryItem,getBusinessReports,createBusinessReport,deleteBusinessReport} from '../lib/businessStore'
import {makeBusinessPdf,reportLinesFromRows} from '../lib/businessPdf'
import '../styles/business-pc.css'

const BALLS=[50,100,500]
const YARN_COLORS=[
 '#FFFFFF','#F8F3E8','#F2E8D5','#E8D4B8','#D7BE9B','#C6A77E','#B08A63','#8F684A','#6D4A36','#4B3328','#2A211D','#111111',
 '#D9D9D9','#B9B9B9','#929292','#686868','#3F3F3F',
 '#FFF1B8','#FFE08A','#FFC567','#E9B949','#D89A27','#B87716','#8D5C12',
 '#FFD1B8','#FFAE82','#F58A5C','#FD5A46','#E74335','#C52E2E','#98252B','#6F1E27',
 '#FFE0E9','#F8B6CB','#FB7DA8','#F15D91','#D83D78','#B92E67','#8D285A','#681D48',
 '#F2D9EC','#D7B2DF','#B68DCE','#9A6BC4','#7A55C7','#552CB7','#44208E','#32176A',
 '#E5E7FF','#C7CBF6','#A6ACEA','#7E8ED9','#5878C7','#3864B5','#244A8F','#18356B',
 '#D9F0FF','#B8E1FA','#8FCEF0','#69BCE8','#32A5DB','#058CD7','#0D6FB8','#0A558E',
 '#DDF7F3','#B5E8DF','#82D2C5','#4CBFB0','#33B7A6','#1B9B8D','#14786E','#105B54',
 '#E0F3E8','#BCE2CA','#91CFA9','#75C69A','#4EB47D','#30A46C','#00995E','#08764D','#075A3C','#2F6D4A',
 '#ECF4D9','#D3E7A9','#B6D777','#A8D86E','#85BD4F','#669E39','#4C7A2D',
 '#F7E9B9','#F0D36B','#D9B44A','#C9A227','#A6821D',
 '#F3DDD2','#D6B3A2','#BC8F7A','#9C6B5A','#7D5144','#5B3A29'
]
export default function Inventory(){
 const {lang}=useI18n(),tx=labels(lang),dialog=useRef(null)
 const [rows,setRows]=useState([]),[reports,setReports]=useState([]),[q,setQ]=useState(''),[editing,setEditing]=useState(null),[saving,setSaving]=useState(false),[form,setForm]=useState(empty())
 async function load(){const[a,b]=await Promise.all([getInventory().catch(()=>[]),getBusinessReports('inventory').catch(()=>[])]);setRows(a);setReports(b)}
 useEffect(()=>{load()},[])
 const shown=useMemo(()=>rows.filter(r=>[r.name,r.hex,r.brand,r.yarn_type].join(' ').toLowerCase().includes(q.toLowerCase())),[rows,q])
 const colorStats=useMemo(()=>{const m=new Map();rows.forEach(r=>{const c=hex(r.hex),g=num(r.stock_g);const prev=m.get(c)||{hex:c,name:r.name||c,grams:0};prev.grams+=g;if(!prev.name&&r.name)prev.name=r.name;m.set(c,prev)});return [...m.values()].sort((a,b)=>b.grams-a.grams)},[rows])
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
   <header className="business-head"><div className="business-title-icon"><Boxes/></div><div className="business-heading"><h1>{tx.title}</h1><p>{tx.subtitle}</p></div><div className="business-actions"><button className="biz-btn retro-yellow" onClick={csv}><Download/>{tx.export}</button><button className="biz-btn retro-purple" onClick={pdf}>PDF</button><label className="biz-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={tx.search}/></label><button className="biz-btn primary" onClick={()=>open()}><Plus/>{tx.add}</button></div></header>
   <div className="biz-layout-split">
    <div className="business-table-wrap"><table className="business-table inventory-table"><thead><tr><th>{tx.yarnType}</th><th>{tx.color}</th><th>{tx.hex}</th><th>{tx.brand}</th><th>{tx.ballG}</th><th>{tx.stock}</th><th>{tx.price}</th><th>{tx.alert}</th><th/></tr></thead><tbody>{shown.map(r=>{const low=num(r.stock_g)<=num(r.min_stock_g);return <tr key={r.id}><td><b>{labelYarn(r.yarn_type,tx)}</b></td><td><div className="color-name-cell"><span className="inventory-color-swatch" style={{background:hex(r.hex)}}/><span>{r.name||'—'}</span></div></td><td><code>{r.hex||'—'}</code></td><td>{r.brand||'—'}</td><td>{r.ball_g||0} g</td><td><b>{r.stock_g||0} g</b></td><td><b>€{money(r.price_per_ball)}</b></td><td>{low?<span className="biz-stock-alert">{tx.low}</span>:<span className="biz-stock-ok">OK</span>}</td><td><button className="biz-kebab" onClick={()=>open(r)}>•••</button></td></tr>})}</tbody></table>{!shown.length&&<div className="biz-empty">{tx.empty}</div>}</div>
    <aside className="biz-summary colorful-summary"><h3>{tx.summary}</h3><div className="biz-donut inventory-color-donut" style={{background:inventoryGradient(colorStats,totalG)}}><div className="biz-donut-center"><b>{tx.total}</b><strong>{totalG.toLocaleString()} g</strong></div></div><div className="biz-legend">{colorStats.slice(0,10).map(c=><div className="biz-legend-row" key={c.hex}><i className="biz-legend-dot" style={{background:c.hex}}/><span>{c.name}</span><b>{c.grams.toLocaleString()} g</b></div>)}</div>{!colorStats.length&&<div className="inventory-no-colors">{tx.noColors}</div>}<div className="biz-summary-total"><span>{tx.totalValue}</span><strong>€{money(totalValue)}</strong></div></aside>
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
    <section className="retro-field-card coral color-card"><div className="retro-field-title"><Palette/>{tx.colorCard}</div><div className="yarn-color-catalog">{YARN_COLORS.map(c=><button type="button" key={c} className={hex(form.hex)===c?'selected':''} style={{background:c}} title={c} aria-label={c} onClick={()=>setForm(v=>({...v,hex:c}))}/>)}</div><div className="color-preview-wrap"><span className="inventory-color-preview" style={{background:hex(form.hex)}}/><input type="color" value={hex(form.hex)} onChange={e=>setForm(v=>({...v,hex:e.target.value.toUpperCase()}))}/></div></section>
    <section className="retro-field-card green"><div className="retro-field-title"><Database/>{tx.stock}</div><input type="number" min="0" value={form.stock_g} onChange={e=>setForm(v=>({...v,stock_g:e.target.value}))}/></section>
    <section className="retro-field-card blue"><div className="retro-field-title"><Hash/>{tx.hex}</div><input value={form.hex} onChange={e=>setForm(v=>({...v,hex:e.target.value}))}/></section>
    <section className="retro-field-card pink"><div className="retro-field-title">€ {tx.price}</div><input type="number" min="0" step="0.01" value={form.price_per_ball} onChange={e=>setForm(v=>({...v,price_per_ball:e.target.value}))}/></section>
    <section className="retro-field-card blue"><div className="retro-field-title"><ShieldCheck/>{tx.min}</div><input type="number" min="0" value={form.min_stock_g} onChange={e=>setForm(v=>({...v,min_stock_g:e.target.value}))}/></section>
    <div className="biz-form-actions retro-actions">{editing&&<button type="button" className="biz-btn danger" onClick={()=>remove(editing.id)}><Trash2/>{tx.delete}</button>}<button type="button" className="biz-btn" onClick={close}>{tx.cancel}</button><button className="biz-btn retro-save" disabled={saving}><Save/>{saving?tx.saving:tx.save}</button></div>
   </form>
  </dialog>
 </div>
}

function SavedReports({title,reports,openReport,onDelete}){return <section className="saved-docs"><h3>{title}</h3>{reports.length?<div className="saved-doc-grid">{reports.slice(0,8).map(r=><div className="saved-doc" key={r.id}><div><b>{r.title}</b><small>{new Date(r.created_at||Date.now()).toLocaleString()}</small></div><button onClick={()=>openReport(r)}>PDF</button><button className="danger-mini" onClick={()=>onDelete(r.id)}>×</button></div>)}</div>:<p>—</p>}</section>}
function empty(){return{yarn_type:'Acrylic',name:'',hex:'#FB7DA8',brand:'',stock_g:0,ball_g:100,price_per_ball:'',min_stock_g:0}}
function normalize(r){return{yarn_type:r.yarn_type||'Acrylic',name:r.name||'',hex:r.hex||'#FB7DA8',brand:r.brand||'',stock_g:r.stock_g||0,ball_g:r.ball_g||100,price_per_ball:r.price_per_ball||'',min_stock_g:r.min_stock_g||0}}
function num(v){return Number(v)||0}function money(v){return num(v).toFixed(2)}function hex(v){const s=String(v||'').trim();return /^#[0-9a-f]{6}$/i.test(s)?s.toUpperCase():'#FB7DA8'}
function inventoryGradient(stats,total){if(!total||!stats.length)return'conic-gradient(#eee7dc 0 100%)';let at=0;const parts=[];for(const c of stats){const next=at+(c.grams/total)*100;parts.push(`${c.hex} ${at}% ${next}%`);at=next}return`conic-gradient(${parts.join(',')})`}
function labelYarn(v,t){return v==='Wool'?t.wool:t.acrylic}
function labels(lang){
 if(lang==='de')return{title:'Inventar',subtitle:'Verwalte Garnbestand, Farben und Preise.',export:'Export',search:'Material suchen...',add:'Material hinzufügen',yarnType:'Garnart',acrylic:'Acryl',wool:'Wolle',color:'Farbe',hex:'HEX-Code',brand:'Marke',ballG:'Ballgewicht',stock:'Gesamtbestand (g)',price:'Preis / Ball',alert:'Bestand',low:'Niedrig',summary:'Bestandsübersicht',noColors:'Noch keine Farben im Bestand.',total:'Gesamt',totalValue:'Inventarwert',colorCard:'Farbkarte',min:'Mindestbestand (g)',save:'Material speichern',saving:'Speichern…',cancel:'Schließen',edit:'Material bearbeiten',delete:'Löschen',empty:'Noch keine Materialien.',confirmDelete:'Dieses Material löschen?',dialogSubtitle:'Garn und Bestand sauber erfassen.',saved:'Gespeicherte PDFs',pdfTitle:'Tufting Studio – Inventar'}
 if(lang==='en')return{title:'Inventory',subtitle:'Manage yarn stock, colors and real prices.',export:'Export',search:'Search material...',add:'Add material',yarnType:'Yarn type',acrylic:'Acrylic',wool:'Wool',color:'Color',hex:'HEX code',brand:'Brand',ballG:'Ball weight',stock:'Total stock (g)',price:'Price / ball',alert:'Stock',low:'Low stock',summary:'Stock summary',noColors:'No stock colors yet.',total:'Total',totalValue:'Inventory value',colorCard:'Color card',min:'Minimum stock (g)',save:'Save material',saving:'Saving…',cancel:'Close',edit:'Edit material',delete:'Delete',empty:'No inventory items yet.',confirmDelete:'Delete this material?',dialogSubtitle:'Record yarn and stock clearly.',saved:'Saved PDFs',pdfTitle:'Tufting Studio – Inventory'}
 return{title:'Inventari',subtitle:'Menaxho leshin, ngjyrat, markat dhe çmimet reale.',export:'Eksporto',search:'Kërko material...',add:'Shto material',yarnType:'Lloji i leshit',acrylic:'Akryl',wool:'Lesh',color:'Emri / Ngjyra',hex:'Kodi HEX',brand:'Marka',ballG:'Gramatura e topit',stock:'Stoku total (g)',price:'Çmimi / top',alert:'Alarm stok',low:'Stok i ulët',summary:'Përmbledhje stoku',noColors:'Ende nuk ka ngjyra në stok.',total:'Totali',totalValue:'Vlera totale e inventarit',colorCard:'Karta e ngjyrës',min:'Minimumi i stokut (g)',save:'Ruaj materialin',saving:'Po ruhet…',cancel:'Mbyll',edit:'Redakto materialin',delete:'Fshi',empty:'Ende nuk ka materiale.',confirmDelete:'Ta fshij këtë material?',dialogSubtitle:'Shto një material të ri me të dhëna reale.',saved:'PDF / Faturat e ruajtura',pdfTitle:'Tufting Studio – Inventari'}
}
