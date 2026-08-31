import React,{useEffect,useMemo,useRef,useState} from 'react'
import {Boxes,Download,Plus,Search,X} from 'lucide-react'
import {useI18n} from '../i18n/I18n'
import {createInventoryItem,deleteInventoryItem,getInventory,updateInventoryItem} from '../lib/businessStore'
import '../styles/business-pc.css'
import '../styles/inventory-clean.css'

const PRESETS=['#FFC567','#FB7DA8','#FD5A46','#552CB7','#00995E','#058CD7','#111111','#F5F1E8','#8B5E34','#D7C6A4','#183A8A','#1B7A55','#B44A7A','#7E57C2','#E07A2D','#7D8B55']

export default function Inventory(){
 const {lang}=useI18n(),tx=labels(lang),dialog=useRef(null)
 const [rows,setRows]=useState([]),[q,setQ]=useState(''),[editing,setEditing]=useState(null),[saving,setSaving]=useState(false)
 const [form,setForm]=useState(emptyForm())

 async function load(){setRows(await getInventory().catch(()=>[]))}
 useEffect(()=>{load()},[])

 const shown=useMemo(()=>rows.filter(r=>[r.name,r.hex,r.brand,r.yarn_type,r.type].join(' ').toLowerCase().includes(q.toLowerCase())),[rows,q])
 const totalG=rows.reduce((s,r)=>s+num(r.stock_g),0)
 const totalValue=rows.reduce((s,r)=>s+(num(r.stock_g)/(num(r.ball_g)||100))*num(r.price_per_ball),0)
 const lowCount=rows.filter(r=>num(r.min_stock_g)>0 && num(r.stock_g)<=num(r.min_stock_g)).length
 const donut=useMemo(()=>donutGradient(rows,totalG),[rows,totalG])

 function open(row=null){
   setEditing(row)
   setForm(row?normalize(row):emptyForm())
   dialog.current?.showModal()
 }
 function close(){dialog.current?.close();setEditing(null);setForm(emptyForm())}
 function patch(key,value){setForm(v=>({...v,[key]:value}))}

 async function submit(e){
   e.preventDefault()
   if(!form.name.trim())return
   const data={
     type:'Yarn',
     yarn_type:form.yarn_type,
     name:form.name.trim(),
     hex:hex(form.hex),
     brand:form.brand.trim(),
     stock_g:Math.max(0,num(form.stock_g)),
     ball_g:[50,100,500].includes(num(form.ball_g))?num(form.ball_g):100,
     price_per_ball:Math.max(0,num(form.price_per_ball)),
     min_stock_g:Math.max(0,num(form.min_stock_g)),
   }
   setSaving(true)
   try{
     if(editing)await updateInventoryItem(editing.id,data)
     else await createInventoryItem(data)
     await load();close()
   }finally{setSaving(false)}
 }
 async function remove(id){if(!confirm(tx.confirmDelete))return;await deleteInventoryItem(id);await load();close()}

 function exportCsv(){
   const head=['Yarn type','Color','HEX','Brand','Ball grams','Total stock grams','Price per ball','Minimum stock grams']
   const body=rows.map(r=>[r.yarn_type||'Acrylic',r.name,r.hex,r.brand,r.ball_g,r.stock_g,r.price_per_ball,r.min_stock_g])
   const csv=[head,...body].map(a=>a.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n')
   downloadBlob(new Blob([csv],{type:'text/csv;charset=utf-8'}),'tufting-inventory.csv')
 }
 function openPdf(){
   const w=window.open('','_blank','noopener,noreferrer')
   if(!w)return
   const lines=rows.map(r=>`<tr><td>${esc(r.yarn_type||'Acrylic')}</td><td>${esc(r.name||'')}</td><td>${esc(r.hex||'')}</td><td>${esc(r.brand||'')}</td><td>${num(r.ball_g)} g</td><td>${num(r.stock_g)} g</td><td>€${money(r.price_per_ball)}</td></tr>`).join('')
   w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(tx.title)}</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#13203a}h1{font-size:28px}table{width:100%;border-collapse:collapse;margin-top:18px}th,td{padding:10px;border-bottom:1px solid #ddd;text-align:left}th{background:#fff4df}.tot{margin-top:20px;font-weight:700}</style></head><body><h1>${esc(tx.title)}</h1><table><thead><tr><th>${esc(tx.yarnType)}</th><th>${esc(tx.color)}</th><th>HEX</th><th>${esc(tx.brand)}</th><th>${esc(tx.ballG)}</th><th>${esc(tx.totalStock)}</th><th>${esc(tx.price)}</th></tr></thead><tbody>${lines}</tbody></table><div class="tot">${esc(tx.totalStock)}: ${totalG.toLocaleString()} g &nbsp; • &nbsp; ${esc(tx.totalValue)}: €${money(totalValue)}</div><script>window.onload=()=>window.print()<\/script></body></html>`)
   w.document.close()
 }

 return <div className="business-page inventory inventory-clean">
  <section className="business-shell-card inventory-main-card">
   <header className="business-head inventory-head">
    <div className="business-number">2</div>
    <div className="inventory-brand-box"><YarnSkein color="#FFC567" size="logo"/></div>
    <div className="business-heading"><h1>{tx.title}</h1><p>{tx.subtitle}</p></div>
    <div className="business-actions">
     <button className="biz-btn retro-export" onClick={exportCsv}><Download/>{tx.export}</button>
     <button className="biz-btn retro-pdf" onClick={openPdf}>PDF</button>
     <label className="biz-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={tx.search}/></label>
     <button className="biz-btn primary retro-add" onClick={()=>open()}><Plus/>{tx.add}</button>
    </div>
   </header>

   <div className="inventory-stats-row">
    <div><span>{tx.items}</span><strong>{rows.length}</strong></div>
    <div><span>{tx.totalStock}</span><strong>{totalG.toLocaleString()} g</strong></div>
    <div><span>{tx.lowCount}</span><strong>{lowCount}</strong></div>
    <div><span>{tx.totalValue}</span><strong>€{money(totalValue)}</strong></div>
   </div>

   <div className="biz-layout-split inventory-layout">
    <div className="business-table-wrap inventory-table-wrap">
     {shown.length?<table className="business-table inventory-table"><thead><tr>
      <th>{tx.yarnType}</th><th>{tx.color}</th><th>{tx.hex}</th><th>{tx.brand}</th><th>{tx.ballG}</th><th>{tx.totalStock}</th><th>{tx.price}</th><th>{tx.alert}</th><th/>
     </tr></thead><tbody>{shown.map(r=>{const low=num(r.min_stock_g)>0&&num(r.stock_g)<=num(r.min_stock_g);return <tr key={r.id}>
      <td><b>{r.yarn_type||'Acrylic'}</b></td>
      <td><div className="inventory-color-cell"><YarnSkein color={r.hex} size="row"/><span>{r.name||'—'}</span></div></td>
      <td><code>{r.hex||'—'}</code></td><td>{r.brand||'—'}</td><td>{num(r.ball_g)||100} g</td><td><b>{num(r.stock_g).toLocaleString()} g</b></td><td>€{money(r.price_per_ball)}</td>
      <td>{low?<span className="biz-stock-alert">{tx.low}</span>:<span className="biz-stock-ok">OK</span>}</td>
      <td><button className="biz-kebab" onClick={()=>open(r)}>•••</button></td>
     </tr>})}</tbody></table>:<div className="inventory-empty"><YarnSkein color="#D9D4CA" size="empty"/><strong>{tx.empty}</strong><span>{tx.emptyHelp}</span><button className="biz-btn primary" onClick={()=>open()}><Plus/>{tx.addFirst}</button></div>}
    </div>

    <aside className="biz-summary inventory-summary">
     <h3>{tx.summary}</h3>
     <div className={`inventory-donut ${rows.length?'has-data':''}`} style={{background:donut}}><div><b>{tx.total}</b><strong>{totalG.toLocaleString()} g</strong>{!rows.length&&<small>{tx.noData}</small>}</div></div>
     {rows.length>0&&<div className="biz-legend">{rows.slice(0,8).map(r=><div className="biz-legend-row" key={r.id}><i className="biz-legend-dot" style={{background:hex(r.hex)}}/><span>{r.name||tx.unnamed}</span><b>{num(r.stock_g).toLocaleString()} g</b></div>)}</div>}
     <div className="biz-summary-total"><span>{tx.totalValue}</span><strong>€{money(totalValue)}</strong></div>
    </aside>
   </div>
  </section>

  <dialog className="biz-dialog inventory-dialog" ref={dialog} onClose={()=>{setEditing(null);setForm(emptyForm())}}>
   <form onSubmit={submit}>
    <div className="inventory-dialog-head"><div className="inventory-dialog-title-icon"><YarnSkein color={form.hex} size="dialogIcon"/></div><div><h2>{editing?tx.edit:tx.add}</h2><p>{tx.formSubtitle}</p></div><button type="button" className="biz-dialog-close" onClick={close}><X/></button></div>
    <div className="inventory-form-grid">
     <section className="inventory-field-card pink"><label>{tx.yarnType}</label><div className="choice-row"><button type="button" className={form.yarn_type==='Acrylic'?'active':''} onClick={()=>patch('yarn_type','Acrylic')}>{tx.acrylic}</button><button type="button" className={form.yarn_type==='Wool'?'active':''} onClick={()=>patch('yarn_type','Wool')}>{tx.wool}</button></div><small>{tx.yarnHelp}</small></section>
     <section className="inventory-field-card green"><label>{tx.brand}</label><input value={form.brand} onChange={e=>patch('brand',e.target.value)} placeholder={tx.brandPh}/><small>{tx.brandHelp}</small></section>
     <section className="inventory-field-card purple"><label>{tx.color}</label><input required value={form.name} onChange={e=>patch('name',e.target.value)} placeholder={tx.colorPh}/><small>{tx.colorHelp}</small></section>
     <section className="inventory-field-card orange"><label>{tx.ballG}</label><div className="choice-row three">{[50,100,500].map(g=><button type="button" key={g} className={num(form.ball_g)===g?'active':''} onClick={()=>patch('ball_g',g)}>{g} g</button>)}</div><small>{tx.ballHelp}</small></section>
     <section className="inventory-field-card coral color-card"><label>{tx.colorCard}</label><div className="color-preview"><YarnSkein color={form.hex} size="preview"/><div className="palette-wrap">{PRESETS.map(c=><button type="button" key={c} className={hex(form.hex)===c?'selected':''} style={{background:c}} onClick={()=>patch('hex',c)} aria-label={c}/>)}</div></div><small>{tx.paletteHelp}</small></section>
     <section className="inventory-field-card green"><label>{tx.totalStock}</label><input type="number" min="0" value={form.stock_g} onChange={e=>patch('stock_g',e.target.value)}/><small>{tx.stockHelp}</small></section>
     <section className="inventory-field-card blue"><label>{tx.hex}</label><div className="hex-row"><input value={form.hex} onChange={e=>patch('hex',e.target.value)} onBlur={()=>patch('hex',hex(form.hex))} placeholder="#FB7DA8"/><input type="color" value={hex(form.hex)} onChange={e=>patch('hex',e.target.value.toUpperCase())}/></div><small>{tx.hexHelp}</small></section>
     <section className="inventory-field-card pink"><label>{tx.price}</label><div className="money-input"><span>€</span><input type="number" min="0" step="0.01" value={form.price_per_ball} onChange={e=>patch('price_per_ball',e.target.value)} placeholder="0.00"/></div><small>{tx.priceHelp}</small></section>
     <section className="inventory-field-card blue"><label>{tx.min}</label><input type="number" min="0" value={form.min_stock_g} onChange={e=>patch('min_stock_g',e.target.value)}/><small>{tx.minHelp}</small></section>
    </div>
    <div className="inventory-form-actions">{editing&&<button type="button" className="biz-btn danger" onClick={()=>remove(editing.id)}>{tx.delete}</button>}<span/><button type="button" className="biz-btn" onClick={close}>{tx.cancel}</button><button className="biz-btn primary" disabled={saving}>{saving?tx.saving:tx.save}</button></div>
   </form>
  </dialog>
 </div>
}

function YarnSkein({color='#FB7DA8',size='row'}){
 const c=hex(color),dark=shade(c,-34),deep=shade(c,-52),light=shade(c,34)
 const id=`y${size}${c.slice(1)}`
 return <span className={`yarn-skein ${size}`}><svg viewBox="0 0 150 92" aria-hidden="true"><defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={light}/><stop offset=".35" stopColor={c}/><stop offset=".78" stopColor={dark}/><stop offset="1" stopColor={deep}/></linearGradient><clipPath id={`${id}c`}><path d="M10 46C10 20 28 8 50 8h50c22 0 40 12 40 38s-18 38-40 38H50C28 84 10 72 10 46Z"/></clipPath></defs><path d="M10 46C10 20 28 8 50 8h50c22 0 40 12 40 38s-18 38-40 38H50C28 84 10 72 10 46Z" fill={`url(#${id})`} stroke={deep} strokeWidth="1.4"/><g clipPath={`url(#${id}c)`} fill="none" strokeLinecap="round">{[18,25,32,39,46,53,60,67,74].map((y,i)=><path key={y} d={`M-2 ${y} C23 ${y-16},48 ${y+11},75 ${y-2} S124 ${y-14},153 ${y+3}`} stroke={i%2?dark:light} strokeWidth={i%3===0?2.5:1.8} opacity={i%2?.72:.9}/>)}</g><rect x="58" y="5" width="34" height="82" rx="6" fill="#FFC567" stroke="#D99B31" strokeWidth="1.2"/><rect x="61" y="9" width="28" height="74" rx="4" fill="rgba(255,255,255,.11)"/><circle cx="75" cy="46" r="9" fill="#FFF8E9" opacity=".95"/><path d="M70 47c3-7 10-7 11-1 1 5-5 9-10 6-3-1-3-3-1-5Z" fill="none" stroke="#D99B31" strokeWidth="1.5"/></svg></span>
}
function emptyForm(){return{yarn_type:'Acrylic',name:'',hex:'#FB7DA8',brand:'',stock_g:0,ball_g:100,price_per_ball:'',min_stock_g:0}}
function normalize(r){return{yarn_type:r.yarn_type||'Acrylic',name:r.name||'',hex:hex(r.hex),brand:r.brand||'',stock_g:num(r.stock_g),ball_g:num(r.ball_g)||100,price_per_ball:r.price_per_ball??'',min_stock_g:num(r.min_stock_g)}}
function num(v){const n=Number(v);return Number.isFinite(n)?n:0}
function money(v){return num(v).toFixed(2)}
function hex(v){let h=String(v||'').trim().toUpperCase();if(!h.startsWith('#'))h='#'+h;if(/^#[0-9A-F]{6}$/.test(h))return h;return '#FB7DA8'}
function shade(input,pct){const h=hex(input).slice(1);let r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);const f=v=>Math.max(0,Math.min(255,Math.round(pct>=0?v+(255-v)*pct/100:v*(1+pct/100))));return'#'+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,'0')).join('')}
function donutGradient(rows,total){if(!rows.length||!total)return'conic-gradient(#ECE7DE 0 100%)';let at=0;const parts=[];for(const r of rows){const p=num(r.stock_g)/total*100;if(p<=0)continue;const end=at+p;parts.push(`${hex(r.hex)} ${at.toFixed(2)}% ${end.toFixed(2)}%`);at=end}if(at<100)parts.push(`#ECE7DE ${at.toFixed(2)}% 100%`);return`conic-gradient(${parts.join(',')})`}
function downloadBlob(blob,name){const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),500)}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}

function labels(lang){
 if(lang==='de')return{title:'Inventar',subtitle:'Verwalte Garn, Farben, Marken und reale Bestände.',export:'Export',search:'Material suchen...',add:'Material hinzufügen',items:'Materialien',totalStock:'Gesamtbestand',lowCount:'Niedriger Bestand',totalValue:'Inventarwert',yarnType:'Garnart',color:'Name / Farbe',hex:'HEX-Code',brand:'Marke',ballG:'Ballgewicht',price:'Preis / Ball',alert:'Bestand',low:'Niedrig',summary:'Bestandsübersicht',total:'Gesamt',noData:'Keine Materialien',empty:'Noch keine Materialien.',emptyHelp:'Füge dein erstes Garn hinzu, damit die Statistik reale Daten zeigt.',addFirst:'Erstes Material hinzufügen',unnamed:'Ohne Namen',edit:'Material bearbeiten',formSubtitle:'Reale Materialdaten eintragen.',acrylic:'Acryl',wool:'Wolle',yarnHelp:'Wähle die Garnart.',brandPh:'z. B. Kartopu, Alize…',brandHelp:'Marke des Garns.',colorPh:'z. B. Altrosa',colorHelp:'Name der Farbe.',ballHelp:'Gewicht eines Garnballs.',colorCard:'Garnfarbe',paletteHelp:'Schnellfarben oder jede HEX-Farbe verwenden.',stockHelp:'Gesamte verfügbare Gramm dieser Farbe.',hexHelp:'Beliebigen HEX-Code eingeben oder Farbe wählen.',priceHelp:'Preis für einen Ball mit dem gewählten Gewicht.',min:'Mindestbestand (g)',minHelp:'Warnung erscheint, wenn der Bestand darunter fällt.',save:'Material speichern',saving:'Speichern…',cancel:'Schließen',delete:'Löschen',confirmDelete:'Dieses Material löschen?'}
 if(lang==='en')return{title:'Inventory',subtitle:'Manage yarn, colors, brands and real stock.',export:'Export',search:'Search material...',add:'Add material',items:'Items',totalStock:'Total stock',lowCount:'Low stock',totalValue:'Inventory value',yarnType:'Yarn type',color:'Name / Color',hex:'HEX code',brand:'Brand',ballG:'Ball weight',price:'Price / ball',alert:'Stock',low:'Low stock',summary:'Stock summary',total:'Total',noData:'No materials',empty:'No materials yet.',emptyHelp:'Add your first yarn so the statistics use real data.',addFirst:'Add first material',unnamed:'Unnamed',edit:'Edit material',formSubtitle:'Enter the real material data.',acrylic:'Acrylic',wool:'Wool',yarnHelp:'Choose the yarn type.',brandPh:'e.g. Kartopu, Alize…',brandHelp:'Yarn brand.',colorPh:'e.g. Dusty rose',colorHelp:'Name of the color.',ballHelp:'Weight of one yarn ball.',colorCard:'Yarn color',paletteHelp:'Use a quick color or any HEX color.',stockHelp:'Total grams available in this color.',hexHelp:'Enter any HEX code or pick a color.',priceHelp:'Price for one ball at the selected weight.',min:'Minimum stock (g)',minHelp:'Warning appears when stock reaches this level.',save:'Save material',saving:'Saving…',cancel:'Close',delete:'Delete',confirmDelete:'Delete this material?'}
 return{title:'Inventari',subtitle:'Menaxho leshin, ngjyrat, markat dhe stokun real.',export:'Eksporto',search:'Kërko material...',add:'Shto material',items:'Materiale',totalStock:'Stoku total',lowCount:'Stok i ulët',totalValue:'Vlera e inventarit',yarnType:'Lloji i leshit',color:'Emri / Ngjyra',hex:'Kodi HEX',brand:'Marka',ballG:'Gramatura e topit',price:'Çmimi / top',alert:'Alarm stok',low:'Stok i ulët',summary:'Përmbledhje stoku',total:'Totali',noData:'Nuk ka materiale',empty:'Ende nuk ka materiale.',emptyHelp:'Shto leshin e parë që statistikat të dalin vetëm nga të dhënat reale.',addFirst:'Shto materialin e parë',unnamed:'Pa emër',edit:'Redakto materialin',formSubtitle:'Vendos të dhënat reale të materialit.',acrylic:'Akryl',wool:'Lesh',yarnHelp:'Zgjidh llojin e leshit.',brandPh:'p.sh. Kartopu, Alize…',brandHelp:'Shkruaj markën e leshit.',colorPh:'p.sh. Rozë pastel',colorHelp:'Shkruaj emrin e ngjyrës.',ballHelp:'Pesha e një topi leshi.',colorCard:'Ngjyra e leshit',paletteHelp:'Zgjidh një ngjyrë të shpejtë ose vendos çdo HEX.',stockHelp:'Sa gram ke gjithsej nga kjo ngjyrë.',hexHelp:'Vendos çdo kod HEX ose zgjidh ngjyrën.',priceHelp:'Çmimi për një top sipas gramaturës së zgjedhur.',min:'Minimumi i stokut (g)',minHelp:'Programi të paralajmëron kur stoku arrin këtë nivel.',save:'Ruaj materialin',saving:'Po ruhet…',cancel:'Mbyll',delete:'Fshi',confirmDelete:'Ta fshij këtë material?'}
}
