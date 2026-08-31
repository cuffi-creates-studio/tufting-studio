import React,{useEffect,useMemo,useRef,useState} from 'react'
import {Boxes,Download,Plus,Search,X,Trash2,Save,Tag,Palette,Hash,Database,ShieldCheck,Package,FileText} from 'lucide-react'
import {useI18n} from '../i18n/I18n'
import {createInventoryItem,deleteInventoryItem,getInventory,updateInventoryItem,getBusinessReports,createBusinessReport,deleteBusinessReport} from '../lib/businessStore'
import {makeBusinessPdf,reportLinesFromRows} from '../lib/businessPdf'
import '../styles/business-pc.css'
import '../styles/inventory-retro-v3.css'

const BALLS=[50,100,500]
const YARN_PALETTE=[
 {hex:'#F7F3E8',name:'E bardhë'}, {hex:'#E8DDC8',name:'Ivory'}, {hex:'#D7C6A5',name:'Bezhë'}, {hex:'#B58B5E',name:'Camel'},
 {hex:'#8B5E34',name:'Kafe'}, {hex:'#5C3A24',name:'Kafe e errët'}, {hex:'#2B2522',name:'E zezë'}, {hex:'#747474',name:'Gri'},
 {hex:'#B7B7B7',name:'Gri e hapur'}, {hex:'#F5C2D7',name:'Rozë pastel'}, {hex:'#FB7DA8',name:'Rozë'}, {hex:'#E94B86',name:'Fuchsia'},
 {hex:'#C73D6F',name:'Mjedër'}, {hex:'#FD5A46',name:'Korall'}, {hex:'#E34234',name:'E kuqe'}, {hex:'#9E263A',name:'Bordo'},
 {hex:'#F29F57',name:'Pjeshkë'}, {hex:'#FFC567',name:'Mustard'}, {hex:'#E5B545',name:'Okër'}, {hex:'#F4D77B',name:'E verdhë pastel'},
 {hex:'#B9D77A',name:'Jeshile lime'}, {hex:'#6FB06F',name:'Jeshile e hapur'}, {hex:'#00995E',name:'Jeshile'}, {hex:'#176B50',name:'Jeshile pylli'},
 {hex:'#A7D8D5',name:'Mint'}, {hex:'#4BB6B1',name:'Turquoise'}, {hex:'#058CD7',name:'Blu'}, {hex:'#2867B2',name:'Blu klasik'},
 {hex:'#183A8A',name:'Blu e errët'}, {hex:'#A9B8E8',name:'Lavandë'}, {hex:'#7D63C8',name:'Vjollcë e hapur'}, {hex:'#552CB7',name:'Vjollcë'},
 {hex:'#3F216F',name:'Vjollcë e errët'}, {hex:'#C28AB7',name:'Mauve'}, {hex:'#C96A3D',name:'Terracotta'}, {hex:'#A85F32',name:'Rust'}
]

export default function Inventory(){
 const {lang}=useI18n(),tx=labels(lang),dialog=useRef(null)
 const [rows,setRows]=useState([]),[reports,setReports]=useState([]),[q,setQ]=useState(''),[editing,setEditing]=useState(null),[saving,setSaving]=useState(false),[form,setForm]=useState(empty())
 async function load(){const[a,b]=await Promise.all([getInventory().catch(()=>[]),getBusinessReports('inventory').catch(()=>[])]);setRows(a);setReports(b)}
 useEffect(()=>{load()},[])
 const shown=useMemo(()=>rows.filter(r=>[r.name,r.hex,r.brand,r.yarn_type].join(' ').toLowerCase().includes(q.toLowerCase())),[rows,q])
 const totalG=rows.reduce((s,r)=>s+num(r.stock_g),0)
 const totalValue=rows.reduce((s,r)=>s+(num(r.stock_g)/(num(r.ball_g)||100))*num(r.price_per_ball),0)
 const donut=useMemo(()=>makeDonut(rows,totalG),[rows,totalG])

 function open(row=null){setEditing(row);setForm(row?normalize(row):empty());dialog.current?.showModal()}
 function close(){dialog.current?.close();setEditing(null);setForm(empty())}
 async function submit(e){
  e.preventDefault()
  if(!form.name.trim())return
  setSaving(true)
  try{
   const data={type:'Yarn',yarn_type:form.yarn_type,name:form.name.trim(),hex:hex(form.hex),brand:form.brand.trim(),stock_g:num(form.stock_g),ball_g:num(form.ball_g)||100,price_per_ball:num(form.price_per_ball),min_stock_g:num(form.min_stock_g)}
   if(editing)await updateInventoryItem(editing.id,data);else await createInventoryItem(data)
   await load();close()
  }finally{setSaving(false)}
 }
 async function remove(id){if(!confirm(tx.confirmDelete))return;await deleteInventoryItem(id);await load();close()}
 function csv(){const rowsOut=[['Yarn type','Color','HEX','Brand','Ball g','Stock g','Price/ball','Min stock g'],...rows.map(r=>[r.yarn_type,r.name,r.hex,r.brand,r.ball_g,r.stock_g,r.price_per_ball,r.min_stock_g])];const blob=new Blob([rowsOut.map(a=>a.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='tufting-inventory.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
 async function pdf(){const title=tx.pdfTitle;const lines=[`#${tx.summary}`,`${tx.total}: ${totalG.toLocaleString()} g`,`${tx.totalValue}: €${money(totalValue)}`,'',...reportLinesFromRows([tx.yarnType,tx.color,tx.hex,tx.brand,tx.ballG,tx.stock,tx.price],rows.map(r=>[labelYarn(r.yarn_type,tx),r.name,r.hex,r.brand,`${r.ball_g||0} g`,`${r.stock_g||0} g`,`€${money(r.price_per_ball)}`]))];const file=makeBusinessPdf({title,subtitle:tx.subtitle,lines,filename:'tufting-inventory.pdf'});await createBusinessReport({module:'inventory',title,file_name:file,lines});await load()}
 async function openReport(r){makeBusinessPdf({title:r.title||tx.pdfTitle,subtitle:tx.subtitle,lines:r.lines||[],filename:r.file_name||'inventory.pdf'})}

 return <div className="business-page inventory retro-business-page inventory-v3">
  <section className="business-shell-card inventory-shell-v3">
   <header className="business-head inventory-head-v3">
    <div className="business-number">2</div>
    <div className="inventory-title-badge"><Boxes/></div>
    <div className="business-heading"><h1>{tx.title}</h1><p>{tx.subtitle}</p></div>
    <div className="business-actions">
     <button className="biz-btn retro-yellow" onClick={csv}><Download/>{tx.export}</button>
     <button className="biz-btn retro-purple" onClick={pdf}><FileText/>PDF</button>
     <label className="biz-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={tx.search}/></label>
     <button className="biz-btn primary" onClick={()=>open()}><Plus/>{tx.add}</button>
    </div>
   </header>

   <div className="biz-layout-split inventory-layout-v3">
    <div className="business-table-wrap inventory-table-wrap-v3">
     <table className="business-table inventory-table inventory-table-v3">
      <thead><tr><th>{tx.yarnType}</th><th>{tx.color}</th><th>{tx.hex}</th><th>{tx.brand}</th><th>{tx.ballG}</th><th>{tx.stock}</th><th>{tx.price}</th><th>{tx.alert}</th><th/></tr></thead>
      <tbody>{shown.map(r=>{const low=num(r.min_stock_g)>0&&num(r.stock_g)<=num(r.min_stock_g);return <tr key={r.id}>
       <td><b>{labelYarn(r.yarn_type,tx)}</b></td>
       <td><div className="yarn-cell-v3"><YarnBall hex={r.hex} size="md"/><span><b>{r.name||'—'}</b></span></div></td>
       <td><code>{r.hex||'—'}</code></td><td>{r.brand||'—'}</td><td><b>{r.ball_g||0} g</b></td><td><b>{num(r.stock_g).toLocaleString()} g</b></td><td><b>€{money(r.price_per_ball)}</b></td>
       <td>{low?<span className="biz-stock-alert">{tx.low}</span>:<span className="biz-stock-ok">OK</span>}</td><td><button className="biz-kebab" onClick={()=>open(r)}>•••</button></td>
      </tr>})}</tbody>
     </table>
     {!shown.length&&<div className="inventory-empty-v3"><Package/><b>{tx.empty}</b><span>{tx.emptyHint}</span></div>}
    </div>

    <aside className="biz-summary colorful-summary inventory-summary-v3">
     <h3>{tx.summary}</h3>
     {rows.length>0 ? <>
      <div className="inventory-real-donut has-data" style={{background:donut}}>
       <div className="inventory-real-donut-center"><small>{tx.total}</small><strong>{totalG.toLocaleString()} g</strong></div>
      </div>
      <div className="biz-legend inventory-legend-v3">{rows.slice(0,8).map(r=><div className="biz-legend-row" key={r.id}><YarnBall hex={r.hex} size="xs"/><span>{r.name}</span><b>{num(r.stock_g).toLocaleString()} g</b></div>)}</div>
      <div className="biz-summary-total inventory-total-v3"><span>{tx.totalValue}</span><strong>€{money(totalValue)}</strong></div>
     </> : <div className="inventory-summary-empty"><Package/><strong>{tx.noMaterials}</strong><span>{tx.emptyHint}</span></div>}
    </aside>
   </div>
  </section>

  <SavedReports title={tx.saved} reports={reports} openReport={openReport} onDelete={async id=>{await deleteBusinessReport(id);await load()}}/>

  <dialog className="biz-dialog retro-dialog inventory-dialog inventory-dialog-v3" ref={dialog} onClose={()=>setEditing(null)}>
   <div className="biz-dialog-head retro-dialog-head inventory-dialog-head-v3"><div className="inventory-dialog-logo"><Boxes/></div><div><h2>{editing?tx.edit:tx.add}</h2><p>{tx.dialogSubtitle}</p></div><button className="biz-dialog-close" onClick={close}><X/></button></div>
   <form className="biz-form retro-form inventory-form-v3" onSubmit={submit}>
    <section className="retro-field-card pink"><div className="retro-field-title"><Boxes/>{tx.yarnType}</div><div className="choice-row"><button type="button" className={form.yarn_type==='Acrylic'?'active acrylic':''} onClick={()=>setForm(v=>({...v,yarn_type:'Acrylic'}))}>Akryl</button><button type="button" className={form.yarn_type==='Wool'?'active wool':''} onClick={()=>setForm(v=>({...v,yarn_type:'Wool'}))}>Lesh</button></div><small>{tx.yarnHelp}</small></section>
    <section className="retro-field-card green"><div className="retro-field-title"><Tag/>{tx.brand}</div><input value={form.brand} onChange={e=>setForm(v=>({...v,brand:e.target.value}))} placeholder={tx.brandPlaceholder}/><small>{tx.brandHelp}</small></section>
    <section className="retro-field-card purple"><div className="retro-field-title"><Palette/>{tx.color}</div><input required value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))} placeholder={tx.colorPlaceholder}/><small>{tx.colorHelp}</small></section>
    <section className="retro-field-card orange"><div className="retro-field-title"><Database/>{tx.ballG}</div><div className="choice-row">{BALLS.map(n=><button type="button" key={n} className={Number(form.ball_g)===n?'active gram':''} onClick={()=>setForm(v=>({...v,ball_g:n}))}>{n} g</button>)}</div><small>{tx.ballHelp}</small></section>

    <section className="retro-field-card coral color-card inventory-palette-card"><div className="retro-field-title"><Palette/>{tx.colorCard}</div>
     <div className="inventory-palette-layout"><YarnBall hex={form.hex} size="xl"/><div className="inventory-retro-palette">{YARN_PALETTE.map(c=><button type="button" key={c.hex} title={`${c.name} · ${c.hex}`} aria-label={`${c.name} ${c.hex}`} className={hex(form.hex)===c.hex?'selected':''} style={{'--swatch':c.hex}} onClick={()=>setForm(v=>({...v,hex:c.hex,name:v.name||c.name}))}><i/><span>{c.name}</span><small>{c.hex}</small></button>)}</div></div>
     <small>{tx.paletteHelp}</small>
    </section>

    <section className="retro-field-card green"><div className="retro-field-title"><Database/>{tx.stock}</div><input type="number" min="0" value={form.stock_g} onChange={e=>setForm(v=>({...v,stock_g:e.target.value}))} placeholder="p.sh. 1200"/><small>{tx.stockHelp}</small></section>
    <section className="retro-field-card blue"><div className="retro-field-title"><Hash/>{tx.hex}</div><input value={form.hex} onChange={e=>setForm(v=>({...v,hex:e.target.value.toUpperCase()}))} placeholder="#FB7DA8"/><small>{tx.hexHelp}</small></section>
    <section className="retro-field-card pink"><div className="retro-field-title">€ {tx.price}</div><input type="number" min="0" step="0.01" value={form.price_per_ball} onChange={e=>setForm(v=>({...v,price_per_ball:e.target.value}))} placeholder="p.sh. 3.50"/><small>{tx.priceHelp}</small></section>
    <section className="retro-field-card blue"><div className="retro-field-title"><ShieldCheck/>{tx.min}</div><input type="number" min="0" value={form.min_stock_g} onChange={e=>setForm(v=>({...v,min_stock_g:e.target.value}))} placeholder="p.sh. 300"/><small>{tx.minHelp}</small></section>

    <div className="biz-form-actions retro-actions inventory-actions-v3">{editing&&<button type="button" className="biz-btn danger" onClick={()=>remove(editing.id)}><Trash2/>{tx.delete}</button>}<button type="button" className="biz-btn" onClick={close}>{tx.cancel}</button><button className="biz-btn retro-save" disabled={saving}><Save/>{saving?tx.saving:tx.save}</button></div>
   </form>
  </dialog>
 </div>
}

function YarnBall({hex:color,size='md'}){return <span className={`yarn-ball-v3 ${size}`} style={{'--yarn':hex(color)}} aria-hidden="true"><i/></span>}
function makeDonut(rows,total){if(!rows.length||!total)return 'conic-gradient(#efe8dc 0 100%)';let cursor=0;const stops=[];rows.slice(0,10).forEach(r=>{const share=num(r.stock_g)/total*100;const start=cursor;cursor+=share;stops.push(`${hex(r.hex)} ${start}% ${cursor}%`)});if(cursor<100)stops.push(`#efe8dc ${cursor}% 100%`);return `conic-gradient(${stops.join(',')})`}
function SavedReports({title,reports,openReport,onDelete}){return <section className="saved-docs"><h3>{title}</h3>{reports.length?<div className="saved-doc-grid">{reports.slice(0,8).map(r=><div className="saved-doc" key={r.id}><div><b>{r.title}</b><small>{new Date(r.created_at||Date.now()).toLocaleString()}</small></div><button onClick={()=>openReport(r)}>PDF</button><button className="danger-mini" onClick={()=>onDelete(r.id)}>×</button></div>)}</div>:<p>—</p>}</section>}
function empty(){return{yarn_type:'Acrylic',name:'',hex:'#FB7DA8',brand:'',stock_g:0,ball_g:100,price_per_ball:'',min_stock_g:0}}
function normalize(r){return{yarn_type:r.yarn_type||'Acrylic',name:r.name||'',hex:r.hex||'#FB7DA8',brand:r.brand||'',stock_g:r.stock_g||0,ball_g:r.ball_g||100,price_per_ball:r.price_per_ball||'',min_stock_g:r.min_stock_g||0}}
function num(v){return Number(v)||0}function money(v){return num(v).toFixed(2)}function hex(v){const s=String(v||'').trim();return /^#[0-9a-f]{6}$/i.test(s)?s.toUpperCase():'#FB7DA8'}
function labelYarn(v,t){return v==='Wool'?t.wool:t.acrylic}
function labels(lang){
 if(lang==='de')return{title:'Inventar',subtitle:'Verwalte Garnbestand, Farben, Marken und echte Preise.',export:'Export',search:'Material suchen...',add:'Material hinzufügen',yarnType:'Garnart',acrylic:'Acryl',wool:'Wolle',color:'Name / Farbe',hex:'HEX-Code',brand:'Marke',ballG:'Ballgewicht',stock:'Gesamtbestand (g)',price:'Preis / Ball',alert:'Bestand',low:'Niedrig',summary:'Bestandsübersicht',total:'Gesamt',totalValue:'Inventarwert',colorCard:'Garnfarbpalette',min:'Mindestbestand (g)',save:'Material speichern',saving:'Speichern…',cancel:'Schließen',edit:'Material bearbeiten',delete:'Löschen',empty:'Noch keine Materialien.',emptyHint:'Füge dein erstes Material hinzu, um den echten Bestand zu sehen.',noMaterials:'Keine Materialien',confirmDelete:'Dieses Material löschen?',dialogSubtitle:'Erfasse reales Garn und Bestand.',saved:'Gespeicherte PDFs',pdfTitle:'Tufting Studio – Inventar',yarnHelp:'Wähle Acryl oder Wolle.',brandPlaceholder:'z.B. Kartopu, Alize…',brandHelp:'Marke des Garns.',colorPlaceholder:'z.B. Retro Rosa',colorHelp:'Name der Farbe.',ballHelp:'Gewicht eines Balls.',paletteHelp:'Wähle eine Garnfarbe oder trage jeden gewünschten HEX-Code ein.',stockHelp:'Gesamte Gramm dieser Farbe im Lager.',hexHelp:'Exakter HEX-Code der Farbe.',priceHelp:'Preis eines Balls in der gewählten Grammatur.',minHelp:'Warnschwelle für niedrigen Bestand.'}
 if(lang==='en')return{title:'Inventory',subtitle:'Manage yarn stock, colors, brands and real prices.',export:'Export',search:'Search material...',add:'Add material',yarnType:'Yarn type',acrylic:'Acrylic',wool:'Wool',color:'Name / Color',hex:'HEX code',brand:'Brand',ballG:'Ball weight',stock:'Total stock (g)',price:'Price / ball',alert:'Stock',low:'Low stock',summary:'Stock summary',total:'Total',totalValue:'Inventory value',colorCard:'Yarn color palette',min:'Minimum stock (g)',save:'Save material',saving:'Saving…',cancel:'Close',edit:'Edit material',delete:'Delete',empty:'No inventory items yet.',emptyHint:'Add your first material to start real stock statistics.',noMaterials:'No materials',confirmDelete:'Delete this material?',dialogSubtitle:'Record real yarn and stock data.',saved:'Saved PDFs',pdfTitle:'Tufting Studio – Inventory',yarnHelp:'Choose Acrylic or Wool.',brandPlaceholder:'e.g. Kartopu, Alize…',brandHelp:'Yarn brand.',colorPlaceholder:'e.g. Retro Pink',colorHelp:'Name of the color.',ballHelp:'Weight of one yarn ball.',paletteHelp:'Choose a preset yarn color or enter any HEX code you actually use.',stockHelp:'Total grams available for this color.',hexHelp:'Exact HEX color code.',priceHelp:'Price of one ball at the selected weight.',minHelp:'Low-stock warning threshold.'}
 return{title:'Inventari',subtitle:'Menaxho leshin, ngjyrat, markat dhe çmimet reale.',export:'Eksporto',search:'Kërko material...',add:'Shto material',yarnType:'Lloji i leshit',acrylic:'Akryl',wool:'Lesh',color:'Emri / Ngjyra',hex:'Kodi HEX',brand:'Marka',ballG:'Gramatura e topit',stock:'Stoku total (g)',price:'Çmimi / top',alert:'Alarm stok',low:'Stok i ulët',summary:'Përmbledhje stoku',total:'Totali',totalValue:'Vlera totale e inventarit',colorCard:'Paleta e ngjyrave',min:'Minimumi i stokut (g)',save:'Ruaj materialin',saving:'Po ruhet…',cancel:'Mbyll',edit:'Redakto materialin',delete:'Fshi',empty:'Ende nuk ka materiale.',emptyHint:'Shto materialin e parë që statistikat të dalin nga stoku real.',noMaterials:'Nuk ka materiale',confirmDelete:'Ta fshij këtë material?',dialogSubtitle:'Shto një material të ri me të dhëna reale.',saved:'PDF / Faturat e ruajtura',pdfTitle:'Tufting Studio – Inventari',yarnHelp:'Zgjidh Akryl ose Lesh.',brandPlaceholder:'p.sh. Kartopu, Alize…',brandHelp:'Shkruaj markën e leshit.',colorPlaceholder:'p.sh. Rozë Retro',colorHelp:'Shkruaj emrin e ngjyrës.',ballHelp:'Pesha e një topi leshi.',paletteHelp:'Zgjidh një ngjyrë të gatshme ose shkruaj çdo kod HEX që përdor realisht.',stockHelp:'Sa gram ke gjithsej nga kjo ngjyrë.',hexHelp:'Kodi i saktë HEX i ngjyrës.',priceHelp:'Çmimi i një topi sipas gramaturës së zgjedhur.',minHelp:'Kur stoku bie në këtë nivel, del alarm.'}
}
