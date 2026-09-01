import React,{useEffect,useMemo,useRef,useState} from 'react'
import {ArrowLeft,Boxes,Download,Plus,Search,X,Trash2,Save,Tag,Palette,Hash,Database,ShieldCheck} from 'lucide-react'
import {useI18n} from '../i18n/I18n'
import {createInventoryItem,deleteInventoryItem,getInventory,updateInventoryItem,getBusinessReports,createBusinessReport,deleteBusinessReport} from '../lib/businessStore'
import {makeBusinessPdf,reportLinesFromRows} from '../lib/businessPdf'
import '../styles/business-pc.css'

const BALLS=[50,100,500]

const YARN_PALETTE=[
 {group:'neutral',hex:'#F8F6F0',sq:'E bardhë',en:'White',de:'Weiß'},
 {group:'neutral',hex:'#F3E9D2',sq:'Ivory',en:'Ivory',de:'Elfenbein'},
 {group:'neutral',hex:'#E8D9B7',sq:'Krem',en:'Cream',de:'Creme'},
 {group:'neutral',hex:'#D8C3A5',sq:'Rërë',en:'Sand',de:'Sand'},
 {group:'neutral',hex:'#CBB994',sq:'Bezhë',en:'Beige',de:'Beige'},
 {group:'neutral',hex:'#B98A55',sq:'Camel',en:'Camel',de:'Camel'},
 {group:'neutral',hex:'#9C846B',sq:'Taupe',en:'Taupe',de:'Taupe'},
 {group:'neutral',hex:'#6A4B3A',sq:'Kafe',en:'Brown',de:'Braun'},
 {group:'neutral',hex:'#4A332A',sq:'Kafe e errët',en:'Dark brown',de:'Dunkelbraun'},
 {group:'neutral',hex:'#B8B6B1',sq:'Gri e hapur',en:'Light grey',de:'Hellgrau'},
 {group:'neutral',hex:'#77777B',sq:'Gri',en:'Grey',de:'Grau'},
 {group:'neutral',hex:'#3E4045',sq:'Antracit',en:'Charcoal',de:'Anthrazit'},
 {group:'neutral',hex:'#171717',sq:'E zezë',en:'Black',de:'Schwarz'},

 {group:'warm',hex:'#F6D85D',sq:'E verdhë',en:'Yellow',de:'Gelb'},
 {group:'warm',hex:'#D7A629',sq:'Mustard',en:'Mustard',de:'Senf'},
 {group:'warm',hex:'#F2B36A',sq:'Kajsi',en:'Apricot',de:'Aprikose'},
 {group:'warm',hex:'#E88942',sq:'Portokalli',en:'Orange',de:'Orange'},
 {group:'warm',hex:'#C86D49',sq:'Terrakota',en:'Terracotta',de:'Terrakotta'},
 {group:'warm',hex:'#E77765',sq:'Koral',en:'Coral',de:'Koralle'},
 {group:'warm',hex:'#A84C37',sq:'Tullë',en:'Brick',de:'Ziegelrot'},

 {group:'pinkred',hex:'#F1C8C6',sq:'Rozë e zbehtë',en:'Blush',de:'Blush'},
 {group:'pinkred',hex:'#D9A0A8',sq:'Rozë pluhur',en:'Dusty rose',de:'Altrosa'},
 {group:'pinkred',hex:'#E47CA0',sq:'Rozë',en:'Pink',de:'Rosa'},
 {group:'pinkred',hex:'#C95478',sq:'Mjedër',en:'Raspberry',de:'Himbeere'},
 {group:'pinkred',hex:'#C7433D',sq:'E kuqe',en:'Red',de:'Rot'},
 {group:'pinkred',hex:'#8A3448',sq:'Verë',en:'Wine',de:'Weinrot'},
 {group:'pinkred',hex:'#612638',sq:'Bordo',en:'Burgundy',de:'Bordeaux'},

 {group:'green',hex:'#C8E0CF',sq:'Mint',en:'Mint',de:'Mint'},
 {group:'green',hex:'#A8B99B',sq:'Sage',en:'Sage',de:'Salbei'},
 {group:'green',hex:'#BBC98F',sq:'Pistachio',en:'Pistachio',de:'Pistazie'},
 {group:'green',hex:'#858A50',sq:'Olive',en:'Olive',de:'Olive'},
 {group:'green',hex:'#68764D',sq:'Moss',en:'Moss',de:'Moos'},
 {group:'green',hex:'#3E8464',sq:'Emerald',en:'Emerald',de:'Smaragd'},
 {group:'green',hex:'#28533F',sq:'Jeshile pylli',en:'Forest green',de:'Waldgrün'},

 {group:'blue',hex:'#C8E1E5',sq:'Blu akull',en:'Ice blue',de:'Eisblau'},
 {group:'blue',hex:'#94C8D8',sq:'Blu qielli',en:'Sky blue',de:'Himmelblau'},
 {group:'blue',hex:'#6F93B2',sq:'Denim',en:'Denim',de:'Denim'},
 {group:'blue',hex:'#3F67A3',sq:'Blu mbretërore',en:'Royal blue',de:'Königsblau'},
 {group:'blue',hex:'#263E63',sq:'Blu e errët',en:'Navy',de:'Marineblau'},
 {group:'blue',hex:'#3B8582',sq:'Teal',en:'Teal',de:'Petrolgrün'},
 {group:'blue',hex:'#2C6269',sq:'Petrol',en:'Petrol',de:'Petrol'},

 {group:'violet',hex:'#C2B5D0',sq:'Lavandë',en:'Lavender',de:'Lavendel'},
 {group:'violet',hex:'#AE8DA8',sq:'Mauve',en:'Mauve',de:'Mauve'},
 {group:'violet',hex:'#825A75',sq:'Plum',en:'Plum',de:'Pflaume'},
 {group:'violet',hex:'#573849',sq:'Aubergine',en:'Aubergine',de:'Aubergine'}
]

const YARN_GROUPS=['neutral','warm','pinkred','green','blue','violet']
export default function Inventory(){
 const {lang}=useI18n(),tx=labels(lang),dialog=useRef(null)
 const [rows,setRows]=useState([]),[reports,setReports]=useState([]),[q,setQ]=useState(''),[editing,setEditing]=useState(null),[saving,setSaving]=useState(false),[form,setForm]=useState(empty()),[paletteGroup,setPaletteGroup]=useState('neutral'),[mobileFilter,setMobileFilter]=useState('all'),[mobileDetail,setMobileDetail]=useState(null)
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
  <MobileInventory tx={tx} rows={rows} q={q} setQ={setQ} filter={mobileFilter} setFilter={setMobileFilter} open={open} detail={mobileDetail} setDetail={setMobileDetail} csv={csv} totalValue={totalValue} updateQty={async(r,add)=>{await updateInventoryItem(r.id,{...r,stock_g:num(r.stock_g)+add});await load();setMobileDetail(v=>v?{...v,stock_g:num(v.stock_g)+add}:v)}}/>
  <section className="business-shell-card biz-desktop-only">
   <header className="business-head"><div className="business-number">2</div><div className="business-title-icon"><Boxes/></div><div className="business-heading"><h1>{tx.title}</h1><p>{tx.subtitle}</p></div><div className="business-actions"><button className="biz-btn retro-yellow" onClick={csv}><Download/>{tx.export}</button><button className="biz-btn retro-purple" onClick={pdf}>PDF</button><label className="biz-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={tx.search}/></label><button className="biz-btn primary" onClick={()=>open()}><Plus/>{tx.add}</button></div></header>
   <div className="biz-layout-split">
    <div className="business-table-wrap"><table className="business-table inventory-table"><thead><tr><th>{tx.yarnType}</th><th>{tx.color}</th><th>{tx.hex}</th><th>{tx.brand}</th><th>{tx.ballG}</th><th>{tx.stock}</th><th>{tx.price}</th><th>{tx.alert}</th><th/></tr></thead><tbody>{shown.map(r=>{const low=num(r.stock_g)<=num(r.min_stock_g);return <tr key={r.id}><td><b>{labelYarn(r.yarn_type,tx)}</b></td><td><div className="yarn-cell"><span className="biz-color-swatch" style={{background:hex(r.hex)}}/><span>{r.name||'—'}</span></div></td><td><code>{r.hex||'—'}</code></td><td>{r.brand||'—'}</td><td>{r.ball_g||0} g</td><td><b>{r.stock_g||0} g</b></td><td><b>€{money(r.price_per_ball)}</b></td><td>{low?<span className="biz-stock-alert">{tx.low}</span>:<span className="biz-stock-ok">OK</span>}</td><td><button className="biz-kebab" onClick={()=>open(r)}>•••</button></td></tr>})}</tbody></table>{!shown.length&&<div className="biz-empty">{tx.empty}</div>}</div>
    <aside className="biz-summary colorful-summary inventory-summary"><h3>{tx.summary}</h3>{rows.length?<><div className="biz-donut" style={{background:inventoryGradient(rows)}}><div className="biz-donut-center"><b>{rows.length} {tx.items}</b><strong>{totalG.toLocaleString()} g</strong></div></div><div className="biz-legend">{rows.slice(0,8).map(r=><div className="biz-legend-row" key={r.id}><i className="biz-legend-dot" style={{background:hex(r.hex)}}/><span>{r.name}</span><b>{r.stock_g||0} g</b></div>)}</div></>:<div className="inventory-empty-summary"><Boxes/><strong>0 g</strong><span>{tx.noStock}</span></div>}<div className="biz-summary-total"><span>{tx.totalValue}</span><strong>€{money(totalValue)}</strong></div></aside>
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
    <section className="retro-field-card full color-card yarn-catalog-card">
     <div className="retro-field-title"><Palette/>{tx.colorCatalog}</div>
     <div className="yarn-catalog-tabs">{YARN_GROUPS.map(group=><button type="button" key={group} className={paletteGroup===group?'active':''} onClick={()=>setPaletteGroup(group)}>{groupLabel(group,lang)}</button>)}</div>
     <div className="yarn-swatch-grid">{YARN_PALETTE.filter(c=>c.group===paletteGroup).map(c=><button type="button" key={c.hex} className={`yarn-swatch ${hex(form.hex)===c.hex?'selected':''}`} onClick={()=>setForm(v=>({...v,hex:c.hex,name:v.name.trim()?v.name:colorLabel(c,lang)}))} title={`${colorLabel(c,lang)} · ${c.hex}`} aria-label={`${colorLabel(c,lang)} ${c.hex}`}><i style={{background:c.hex}}/><span>{colorLabel(c,lang)}</span></button>)}</div>
     <div className="yarn-catalog-selected"><span className="yarn-selected-preview" style={{background:hex(form.hex)}}/><div><b>{tx.selectedColor}</b><code>{hex(form.hex)}</code></div><label className="yarn-custom-picker"><span>{tx.otherColor}</span><input type="color" value={hex(form.hex)} onChange={e=>setForm(v=>({...v,hex:e.target.value.toUpperCase()}))}/></label></div>
    </section>
    <section className="retro-field-card green"><div className="retro-field-title"><Database/>{tx.stock}</div><input type="number" min="0" value={form.stock_g} onChange={e=>setForm(v=>({...v,stock_g:e.target.value}))}/></section>
    <section className="retro-field-card blue"><div className="retro-field-title"><Hash/>{tx.hex}</div><input value={form.hex} onChange={e=>setForm(v=>({...v,hex:e.target.value}))}/></section>
    <section className="retro-field-card pink"><div className="retro-field-title">€ {tx.price}</div><input type="number" min="0" step="0.01" value={form.price_per_ball} onChange={e=>setForm(v=>({...v,price_per_ball:e.target.value}))}/></section>
    <section className="retro-field-card blue"><div className="retro-field-title"><ShieldCheck/>{tx.min}</div><input type="number" min="0" value={form.min_stock_g} onChange={e=>setForm(v=>({...v,min_stock_g:e.target.value}))}/></section>
    <div className="biz-form-actions retro-actions">{editing&&<button type="button" className="biz-btn danger" onClick={()=>remove(editing.id)}><Trash2/>{tx.delete}</button>}<button type="button" className="biz-btn" onClick={close}>{tx.cancel}</button><button className="biz-btn retro-save" disabled={saving}><Save/>{saving?tx.saving:tx.save}</button></div>
   </form>
  </dialog>
 </div>
}

function MobileInventory({tx,rows,q,setQ,filter,setFilter,open,detail,setDetail,csv,totalValue,updateQty}){
 const shown=rows.filter(r=>[r.name,r.hex,r.brand,r.yarn_type].join(' ').toLowerCase().includes(q.toLowerCase())&&(filter==='all'||(filter==='low'?num(r.stock_g)<=num(r.min_stock_g):r.yarn_type===filter)))
 const low=rows.filter(r=>num(r.stock_g)<=num(r.min_stock_g)).length
 const totalG=rows.reduce((s,r)=>s+num(r.stock_g),0)
 function addStock(r){const value=prompt('Sasia që do të shtosh (g)','100');const n=Number(value);if(Number.isFinite(n)&&n>0)updateQty(r,n)}
 return <section className="biz-mobile-app biz-mobile-inventory">
  <div className="bma-head"><button type="button" className="bma-back" onClick={mobileBack} aria-label="Kthehu mbrapa"><ArrowLeft/></button><div><h1>{tx.title}</h1><p>{tx.subtitle}</p></div><div className="bma-head-group"><button className="bma-head-btn secondary" onClick={csv}><Download/></button><button className="bma-head-btn" onClick={()=>open()}><Plus/></button></div></div>
  <div className="bma-stats three"><div><b>{rows.length}</b><span>{tx.items}</span></div><div><b>{rows.filter(r=>num(r.stock_g)>num(r.min_stock_g)).length}</b><span>OK</span></div><div className={low?'warning':''}><b>{low}</b><span>{tx.low}</span></div></div>
  <label className="bma-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={tx.search}/></label>
  <div className="bma-chips">{[['all','Të gjitha'],['Acrylic',tx.acrylic],['Wool',tx.wool],['low',tx.low]].map(([k,l])=><button key={k} className={filter===k?'active':''} onClick={()=>setFilter(k)}>{l}</button>)}</div>
  <div className="bma-list inventory">{shown.length?shown.map(r=>{const isLow=num(r.stock_g)<=num(r.min_stock_g);return <button className="bma-row inventory" key={r.id} onClick={()=>setDetail(r)}><span className="bma-color" style={{background:hex(r.hex)}}/><div className="bma-row-main"><div className="bma-row-title"><b>{r.name||'—'}</b><strong>{formatStock(r.stock_g)}</strong></div><small>{labelYarn(r.yarn_type,tx)}{r.brand?` · ${r.brand}`:''}</small><span>{r.hex||'—'} · €{money(r.price_per_ball)}</span></div><div className="bma-row-side"><em className={isLow?'stock-low':'stock-ok'}>{isLow?tx.low:'Në stok'}</em><b>›</b></div></button>}):<div className="bma-empty"><Boxes/><b>{tx.empty}</b><span>{tx.add}</span></div>}</div>
  <div className="bma-summary"><h3>{tx.summary}</h3><div><span><b>{formatStock(totalG)}</b><small>{tx.total}</small></span><span><b>€{money(totalValue)}</b><small>{tx.totalValue}</small></span></div></div>
  <button className="bma-primary inventory" onClick={()=>open()}><Plus/>{tx.add}</button>
  {detail&&<div className="bma-detail"><div className="bma-detail-head"><button onClick={()=>setDetail(null)}>‹</button><h2>{detail.name||tx.color}</h2><em className={num(detail.stock_g)<=num(detail.min_stock_g)?'stock-low':'stock-ok'}>{num(detail.stock_g)<=num(detail.min_stock_g)?tx.low:'Në stok'}</em></div><div className="bma-inventory-detail"><span className="bma-big-color" style={{background:hex(detail.hex)}}/><dl><dt>{tx.hex}</dt><dd>{detail.hex}</dd><dt>{tx.brand}</dt><dd>{detail.brand||'—'}</dd><dt>{tx.stock}</dt><dd>{formatStock(detail.stock_g)}</dd><dt>{tx.price}</dt><dd>€{money(detail.price_per_ball)}</dd><dt>{tx.min}</dt><dd>{formatStock(detail.min_stock_g)}</dd></dl></div><div className="bma-stock-level"><div><b>Niveli i stokut</b><span>{Math.max(0,Math.min(100,Math.round(num(detail.stock_g)/Math.max(num(detail.min_stock_g)*2,1)*100)))}%</span></div><i><em style={{width:`${Math.max(0,Math.min(100,Math.round(num(detail.stock_g)/Math.max(num(detail.min_stock_g)*2,1)*100)))}%`}}/></i></div><div className="bma-detail-actions"><button onClick={()=>{setDetail(null);open(detail)}}>{tx.edit}</button><button className="dark" onClick={()=>addStock(detail)}>Shto sasi</button></div></div>}
 </section>
}
function formatStock(v){const n=num(v);return n>=1000?`${(n/1000).toFixed(n%1000?1:0)} kg`:`${n} g`}

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
function mobileBack(){if(typeof window==='undefined')return;if(window.history.length>1)window.history.back();else window.location.hash='#/'}
function colorLabel(c,lang){return lang==='de'?c.de:lang==='en'?c.en:c.sq}
function groupLabel(group,lang){
 const names={
  neutral:{sq:'Neutrale',en:'Neutrals',de:'Neutral'},
  warm:{sq:'Të ngrohta',en:'Warm',de:'Warm'},
  pinkred:{sq:'Rozë / Kuqe',en:'Pink / Red',de:'Rosa / Rot'},
  green:{sq:'Jeshile',en:'Greens',de:'Grün'},
  blue:{sq:'Blu',en:'Blues',de:'Blau'},
  violet:{sq:'Vjollcë',en:'Violets',de:'Violett'}
 }
 const item=names[group]||names.neutral
 return lang==='de'?item.de:lang==='en'?item.en:item.sq
}
function labels(lang){
 if(lang==='de')return{title:'Inventar',subtitle:'Verwalte Garnbestand, Farben und Preise.',export:'Export',search:'Material suchen...',add:'Material hinzufügen',yarnType:'Garnart',acrylic:'Acryl',wool:'Wolle',color:'Farbe',hex:'HEX-Code',brand:'Marke',ballG:'Ballgewicht',stock:'Gesamtbestand (g)',price:'Preis / Ball',alert:'Bestand',low:'Niedrig',summary:'Bestandsübersicht',total:'Gesamt',items:'Materialien',noStock:'Noch kein realer Bestand.',totalValue:'Inventarwert',colorCard:'Farbkarte',colorCatalog:'Garn-Farbkatalog',selectedColor:'Ausgewählt',otherColor:'Andere Farbe',min:'Mindestbestand (g)',save:'Material speichern',saving:'Speichern…',cancel:'Schließen',edit:'Material bearbeiten',delete:'Löschen',empty:'Noch keine Materialien.',confirmDelete:'Dieses Material löschen?',dialogSubtitle:'Garn und Bestand sauber erfassen.',saved:'Gespeicherte PDFs',pdfTitle:'Tufting Studio – Inventar'}
 if(lang==='en')return{title:'Inventory',subtitle:'Manage yarn stock, colors and real prices.',export:'Export',search:'Search material...',add:'Add material',yarnType:'Yarn type',acrylic:'Acrylic',wool:'Wool',color:'Color',hex:'HEX code',brand:'Brand',ballG:'Ball weight',stock:'Total stock (g)',price:'Price / ball',alert:'Stock',low:'Low stock',summary:'Stock summary',total:'Total',items:'materials',noStock:'No real stock yet.',totalValue:'Inventory value',colorCard:'Color card',colorCatalog:'Yarn color catalog',selectedColor:'Selected',otherColor:'Other color',min:'Minimum stock (g)',save:'Save material',saving:'Saving…',cancel:'Close',edit:'Edit material',delete:'Delete',empty:'No inventory items yet.',confirmDelete:'Delete this material?',dialogSubtitle:'Record yarn and stock clearly.',saved:'Saved PDFs',pdfTitle:'Tufting Studio – Inventory'}
 return{title:'Inventari',subtitle:'Menaxho leshin, ngjyrat, markat dhe çmimet reale.',export:'Eksporto',search:'Kërko material...',add:'Shto material',yarnType:'Lloji i leshit',acrylic:'Akryl',wool:'Lesh',color:'Emri / Ngjyra',hex:'Kodi HEX',brand:'Marka',ballG:'Gramatura e topit',stock:'Stoku total (g)',price:'Çmimi / top',alert:'Alarm stok',low:'Stok i ulët',summary:'Përmbledhje stoku',total:'Totali',items:'lloje leshi',noStock:'Nuk ka ende stok real.',totalValue:'Vlera totale e inventarit',colorCard:'Karta e ngjyrës',colorCatalog:'Katalogu i ngjyrave të leshit',selectedColor:'Ngjyra e zgjedhur',otherColor:'Ngjyrë tjetër',min:'Minimumi i stokut (g)',save:'Ruaj materialin',saving:'Po ruhet…',cancel:'Mbyll',edit:'Redakto materialin',delete:'Fshi',empty:'Ende nuk ka materiale.',confirmDelete:'Ta fshij këtë material?',dialogSubtitle:'Shto një material të ri me të dhëna reale.',saved:'PDF / Faturat e ruajtura',pdfTitle:'Tufting Studio – Inventari'}
}
