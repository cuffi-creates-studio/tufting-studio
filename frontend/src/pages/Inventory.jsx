import React,{useEffect,useMemo,useRef,useState} from 'react'
import {Boxes,Download,Plus,Search,X} from 'lucide-react'
import {useI18n} from '../i18n/I18n'
import {createInventoryItem,deleteInventoryItem,getInventory,updateInventoryItem} from '../lib/businessStore'
import '../styles/business-pc.css'
import '../styles/inventory-professional.css'
import yarnFibersReal from '../assets/yarn-skein-fibers-real.png'
import yarnMaskReal from '../assets/yarn-skein-mask.png'

const DEFAULT_FORM={yarn_type:'Acrylic',name:'',hex:'#FB7DA8',brand:'',ball_g:100,stock_g:0,price_per_ball:'',min_stock_g:0}
const PRESETS=['#FFC567','#FB7DA8','#FD5A46','#552CB7','#00995E','#058CD7','#111111','#F5F1E8','#8B5E34','#D7C6A4','#183A8A','#E94A8B']

export default function Inventory(){
 const {lang}=useI18n(),tx=labels(lang),dialog=useRef(null)
 const [rows,setRows]=useState([]),[q,setQ]=useState(''),[editing,setEditing]=useState(null),[saving,setSaving]=useState(false)
 const [form,setForm]=useState(DEFAULT_FORM)
 async function load(){setRows(await getInventory().catch(()=>[]))}
 useEffect(()=>{load()},[])
 const shown=useMemo(()=>rows.filter(r=>[r.name,r.hex,r.brand,r.yarn_type,r.type].join(' ').toLowerCase().includes(q.toLowerCase())),[rows,q])
 const totalG=rows.reduce((s,r)=>s+(Number(r.stock_g)||0),0)
 const totalValue=rows.reduce((s,r)=>s+((Number(r.stock_g)||0)/(Number(r.ball_g)||100))*(Number(r.price_per_ball)||0),0)
 const lowCount=rows.filter(r=>(Number(r.stock_g)||0)<=(Number(r.min_stock_g)||0)).length
 const chart=useMemo(()=>makeDonut(rows,totalG),[rows,totalG])

 function open(row=null){
  setEditing(row)
  setForm(row?normalize(row):DEFAULT_FORM)
  dialog.current?.showModal()
 }
 function close(){dialog.current?.close();setEditing(null);setForm(DEFAULT_FORM)}
 async function submit(e){
  e.preventDefault()
  const data={
   type:'Yarn',yarn_type:form.yarn_type,name:String(form.name||'').trim(),hex:normalizeHex(form.hex),brand:String(form.brand||'').trim(),
   stock_g:toPositive(form.stock_g),ball_g:toPositive(form.ball_g)||100,price_per_ball:toPositive(form.price_per_ball),min_stock_g:toPositive(form.min_stock_g)
  }
  if(!data.name)return
  setSaving(true)
  try{if(editing)await updateInventoryItem(editing.id,data);else await createInventoryItem(data);await load();close()}finally{setSaving(false)}
 }
 async function remove(id){if(!confirm(tx.confirmDelete))return;await deleteInventoryItem(id);await load();close()}
 function set(k,v){setForm(f=>({...f,[k]:v}))}
 function exportCsv(){
  const head=['Yarn type','Color','HEX','Brand','Ball g','Stock g','Price/ball','Min stock g']
  const body=rows.map(r=>[r.yarn_type||r.type,r.name,r.hex,r.brand,r.ball_g,r.stock_g,r.price_per_ball,r.min_stock_g])
  const csv=[head,...body].map(a=>a.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n')
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='tufting-inventory.csv';a.click();URL.revokeObjectURL(a.href)
 }

 return <div className="business-page inventory inventory-pro">
  <section className="business-shell-card inventory-shell">
   <header className="business-head inventory-head">
    <div className="business-number">2</div>
    <div className="inventory-app-icon"><YarnSkein color="#FFC567" size="mini"/></div>
    <div className="business-heading"><h1>{tx.title}</h1><p>{tx.subtitle}</p></div>
    <div className="business-actions">
     <button className="biz-btn inventory-export" onClick={exportCsv}><Download/>{tx.export}</button>
     <label className="biz-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={tx.search}/></label>
     <button className="biz-btn primary" onClick={()=>open()}><Plus/>{tx.add}</button>
    </div>
   </header>

   <div className="inventory-kpis">
    <div><span>{tx.items}</span><strong>{rows.length}</strong></div>
    <div><span>{tx.stockTotal}</span><strong>{totalG.toLocaleString()} g</strong></div>
    <div><span>{tx.lowItems}</span><strong>{lowCount}</strong></div>
   </div>

   <div className="biz-layout-split inventory-layout">
    <div className="business-table-wrap">
     {shown.length?<table className="business-table inventory-table"><thead><tr>
      <th>{tx.yarnType}</th><th>{tx.color}</th><th>{tx.hex}</th><th>{tx.brand}</th><th>{tx.ballG}</th><th>{tx.stock}</th><th>{tx.price}</th><th>{tx.alert}</th><th/>
     </tr></thead><tbody>{shown.map(r=>{
      const low=(Number(r.stock_g)||0)<=(Number(r.min_stock_g)||0)
      return <tr key={r.id}>
       <td><span className="inventory-yarn-type">{displayType(r.yarn_type||r.type,tx)}</span></td>
       <td><div className="inventory-color-cell"><YarnSkein color={r.hex||'#FB7DA8'} size="row"/><div><b>{r.name||'—'}</b></div></div></td>
       <td><code>{r.hex||'—'}</code></td><td>{r.brand||'—'}</td><td>{Number(r.ball_g)||100} g</td><td><b>{Number(r.stock_g)||0} g</b></td><td>€{money(r.price_per_ball)}</td>
       <td>{low?<span className="biz-stock-alert">{tx.low}</span>:<span className="biz-stock-ok">OK</span>}</td><td><button className="biz-kebab" onClick={()=>open(r)}>•••</button></td>
      </tr>})}</tbody></table>:<div className="inventory-empty"><YarnSkein color="#E9DED0" size="empty"/><b>{tx.empty}</b><span>{tx.emptyHint}</span><button className="biz-btn primary" onClick={()=>open()}><Plus/>{tx.add}</button></div>}
    </div>

    <aside className="biz-summary inventory-summary">
     <h3>{tx.summary}</h3>
     {rows.length&&totalG>0?<>
      <div className="inventory-donut" style={{background:chart.gradient}}><div><span>{tx.total}</span><strong>{totalG.toLocaleString()} g</strong></div></div>
      <div className="inventory-legend">{chart.items.map(r=><div key={r.id}><YarnSkein color={r.hex} size="tiny"/><span>{r.name}</span><b>{r.stock.toLocaleString()} g</b></div>)}</div>
     </>:<div className="inventory-no-stats"><YarnSkein color="#E9DED0" size="summary"/><strong>0 g</strong><span>{tx.noStats}</span></div>}
     <div className="biz-summary-total"><span>{tx.totalValue}</span><strong>€{money(totalValue)}</strong></div>
    </aside>
   </div>
  </section>

  <dialog className="biz-dialog inventory-dialog" ref={dialog} onClose={()=>{setEditing(null);setForm(DEFAULT_FORM)}}>
   <div className="inventory-dialog-head">
    <div className="inventory-dialog-title-icon"><YarnSkein color={form.hex} size="mini"/></div>
    <div><h2>{editing?tx.edit:tx.add}</h2><p>{editing?tx.editSub:tx.addSub}</p></div>
    <button className="biz-dialog-close" onClick={close}><X/></button>
   </div>
   <form className="inventory-form" onSubmit={submit}>
    <section className="inventory-field-card pink"><div className="field-label">{tx.yarnType}</div><div className="choice-row"><button type="button" className={form.yarn_type==='Acrylic'?'active':''} onClick={()=>set('yarn_type','Acrylic')}>{tx.acrylic}</button><button type="button" className={form.yarn_type==='Wool'?'active':''} onClick={()=>set('yarn_type','Wool')}>{tx.wool}</button></div><small>{tx.yarnHelp}</small></section>
    <section className="inventory-field-card green"><label>{tx.brand}<input value={form.brand} onChange={e=>set('brand',e.target.value)} placeholder={tx.brandPh}/></label><small>{tx.brandHelp}</small></section>
    <section className="inventory-field-card purple"><label>{tx.name}<input required value={form.name} onChange={e=>set('name',e.target.value)} placeholder={tx.colorPh}/></label><small>{tx.colorHelp}</small></section>
    <section className="inventory-field-card yellow"><div className="field-label">{tx.ballG}</div><div className="choice-row grams">{[50,100,500].map(v=><button type="button" key={v} className={Number(form.ball_g)===v?'active':''} onClick={()=>set('ball_g',v)}>{v} g</button>)}</div><small>{tx.ballHelp}</small></section>
    <section className="inventory-field-card coral color-card"><div><div className="field-label">{tx.colorCard}</div><div className="skein-preview"><YarnSkein color={form.hex} size="preview"/><div><b>{form.name||tx.preview}</b><code>{normalizeHex(form.hex)}</code></div></div></div><div className="preset-grid">{PRESETS.map(c=><button type="button" aria-label={c} key={c} className={normalizeHex(form.hex)===c?'selected':''} style={{'--preset':c}} onClick={()=>set('hex',c)}/>)}</div></section>
    <section className="inventory-field-card mint"><label>{tx.stock}<div className="input-unit"><input type="number" min="0" value={form.stock_g} onChange={e=>set('stock_g',e.target.value)}/><span>g</span></div></label><small>{tx.stockHelp}</small></section>
    <section className="inventory-field-card blue"><label>{tx.hex}<div className="hex-row"><input value={form.hex} onChange={e=>set('hex',e.target.value)} onBlur={()=>set('hex',normalizeHex(form.hex))} pattern="#[0-9A-Fa-f]{6}"/><input className="native-color" type="color" value={normalizeHex(form.hex)} onChange={e=>set('hex',e.target.value.toUpperCase())}/></div></label><small>{tx.hexHelp}</small></section>
    <section className="inventory-field-card rose"><label>{tx.price}<div className="input-unit euro"><span>€</span><input type="number" min="0" step="0.01" value={form.price_per_ball} onChange={e=>set('price_per_ball',e.target.value)} placeholder="0.00"/></div></label><small>{tx.priceHelp}</small></section>
    <section className="inventory-field-card sky"><label>{tx.min}<div className="input-unit"><input type="number" min="0" value={form.min_stock_g} onChange={e=>set('min_stock_g',e.target.value)}/><span>g</span></div></label><small>{tx.minHelp}</small></section>
    <div className="inventory-form-actions">{editing&&<button type="button" className="biz-btn danger" onClick={()=>remove(editing.id)}>{tx.delete}</button>}<span/><button type="button" className="biz-btn" onClick={close}>{tx.cancel}</button><button className="biz-btn primary" disabled={saving}>{saving?tx.saving:tx.save}</button></div>
   </form>
  </dialog>
 </div>
}

function YarnSkein({color='#FB7DA8',size='row'}){
 const c=normalizeHex(color)
 return <span className={`yarn-real-photo ${size}`} style={{'--yarn-color':c}} aria-hidden="true">
  <span className="yarn-real-color" style={{WebkitMaskImage:`url(${yarnMaskReal})`,maskImage:`url(${yarnMaskReal})`}}/>
  <img className="yarn-real-fibers" src={yarnFibersReal} alt="" draggable="false"/>
  <span className="yarn-real-label"><span>TS</span></span>
 </span>
}

function normalize(r){return{yarn_type:r.yarn_type||((r.type==='Wool')?'Wool':'Acrylic'),name:r.name||'',hex:normalizeHex(r.hex),brand:r.brand||'',ball_g:Number(r.ball_g)||100,stock_g:Number(r.stock_g)||0,price_per_ball:r.price_per_ball??'',min_stock_g:Number(r.min_stock_g)||0}}
function normalizeHex(v){const s=String(v||'').trim();return /^#[0-9a-fA-F]{6}$/.test(s)?s.toUpperCase():'#FB7DA8'}
function shade(hex,p){const h=normalizeHex(hex).slice(1),n=parseInt(h,16),r=n>>16,g=n>>8&255,b=n&255,m=v=>Math.max(0,Math.min(255,Math.round(p>=0?v+(255-v)*p/100:v*(1+p/100))));return '#'+[m(r),m(g),m(b)].map(v=>v.toString(16).padStart(2,'0')).join('')}
function toPositive(v){const n=Number(v);return Number.isFinite(n)&&n>0?n:0}
function money(v){return(Number(v)||0).toFixed(2)}
function displayType(v,tx){return String(v).toLowerCase().includes('wool')?tx.wool:tx.acrylic}
function makeDonut(rows,total){let acc=0;const items=rows.filter(r=>(Number(r.stock_g)||0)>0).slice(0,8).map(r=>({id:r.id,name:r.name||'—',hex:normalizeHex(r.hex),stock:Number(r.stock_g)||0}));const parts=items.map(r=>{const a=acc,b=acc+(r.stock/Math.max(total,1))*100;acc=b;return `${r.hex} ${a}% ${b}%`});return{items,gradient:`conic-gradient(${parts.join(',')||'#eee 0 100%'})`}}
function labels(lang){
 if(lang==='de')return{title:'Inventar',subtitle:'Garn, Farben, Marken und reale Kosten verwalten.',export:'Export',search:'Material suchen...',add:'Material hinzufügen',items:'Materialien',stockTotal:'Gesamtbestand',lowItems:'Niedrig',yarnType:'Garnart',color:'Farbe',hex:'HEX-Code',brand:'Marke',ballG:'Knäuelgewicht',stock:'Gesamtbestand (g)',price:'Preis / Knäuel',alert:'Bestand',low:'Niedrig',summary:'Bestandsübersicht',total:'Gesamt',totalValue:'Inventarwert',acrylic:'Acryl',wool:'Wolle',yarnHelp:'Acryl oder Wolle auswählen.',name:'Name / Farbe',colorPh:'z.B. Rosa Pastell',colorHelp:'Name der Garnfarbe.',brandPh:'z.B. Kartopu, Alize…',brandHelp:'Marke des Garns.',ballHelp:'Gewicht eines Knäuels.',colorCard:'Garnfarbe',preview:'Vorschau',stockHelp:'Gesamte Grammzahl dieser Farbe.',hexHelp:'HEX-Farbcode oder Farbfeld wählen.',priceHelp:'Preis pro Knäuel nach gewähltem Gewicht.',min:'Mindestbestand (g)',minHelp:'Warnung, wenn der Bestand diesen Wert erreicht.',save:'Material speichern',saving:'Speichern…',cancel:'Schließen',edit:'Material bearbeiten',editSub:'Reale Bestandsdaten aktualisieren.',addSub:'Neues Garn mit realen Daten erfassen.',delete:'Löschen',empty:'Noch keine Materialien.',emptyHint:'Füge dein erstes Garn hinzu; Statistiken erscheinen erst mit realen Daten.',noStats:'Noch keine realen Bestandsdaten.',confirmDelete:'Dieses Material löschen?'}
 if(lang==='en')return{title:'Inventory',subtitle:'Manage yarn, colors, brands and real costs.',export:'Export',search:'Search material...',add:'Add material',items:'Items',stockTotal:'Total stock',lowItems:'Low stock',yarnType:'Yarn type',color:'Color',hex:'HEX code',brand:'Brand',ballG:'Ball weight',stock:'Total stock (g)',price:'Price / ball',alert:'Stock',low:'Low stock',summary:'Stock summary',total:'Total',totalValue:'Inventory value',acrylic:'Acrylic',wool:'Wool',yarnHelp:'Choose Acrylic or Wool.',name:'Name / Color',colorPh:'e.g. Retro Pink',colorHelp:'Name of the yarn color.',brandPh:'e.g. Kartopu, Alize…',brandHelp:'Yarn brand.',ballHelp:'Weight of one yarn ball.',colorCard:'Yarn color',preview:'Preview',stockHelp:'Total grams you have of this color.',hexHelp:'Enter any HEX color or use the picker.',priceHelp:'Real price of one ball at the selected weight.',min:'Minimum stock (g)',minHelp:'Alert when stock reaches this level.',save:'Save material',saving:'Saving…',cancel:'Close',edit:'Edit material',editSub:'Update the real stock data.',addSub:'Add a new yarn with real data.',delete:'Delete',empty:'No materials yet.',emptyHint:'Add your first yarn; statistics appear only from real data.',noStats:'No real stock data yet.',confirmDelete:'Delete this material?'}
 return{title:'Inventari',subtitle:'Menaxho leshin, ngjyrat, markat dhe çmimet reale.',export:'Eksporto',search:'Kërko material...',add:'Shto material',items:'Materiale',stockTotal:'Stoku total',lowItems:'Stok i ulët',yarnType:'Lloji i leshit',color:'Ngjyra',hex:'Kodi HEX',brand:'Marka',ballG:'Gramatura e topit',stock:'Stoku total (g)',price:'Çmimi / top',alert:'Alarm stok',low:'Stok i ulët',summary:'Përmbledhje stoku',total:'Totali',totalValue:'Vlera totale e inventarit',acrylic:'Akryl',wool:'Lesh',yarnHelp:'Zgjidh Akryl ose Lesh.',name:'Emri / Ngjyra',colorPh:'p.sh. Rozë Pastel',colorHelp:'Shkruaj emrin e ngjyrës së leshit.',brandPh:'p.sh. Kartopu, Alize…',brandHelp:'Shkruaj markën e leshit.',ballHelp:'Pesha e një topi leshi.',colorCard:'Ngjyra e leshit',preview:'Pamja e leshit',stockHelp:'Sa gram ke gjithsej nga kjo ngjyrë.',hexHelp:'Shkruaj çdo HEX ose zgjidhe me color picker.',priceHelp:'Çmimi real i një topi sipas gramaturës.',min:'Minimumi i stokut (g)',minHelp:'Kur stoku arrin këtë nivel del alarm.',save:'Ruaj materialin',saving:'Po ruhet…',cancel:'Mbyll',edit:'Redakto materialin',editSub:'Përditëso të dhënat reale të stokut.',addSub:'Shto një lesh të ri me të dhëna reale.',delete:'Fshi',empty:'Ende nuk ka materiale.',emptyHint:'Shto leshin e parë; statistikat dalin vetëm nga të dhënat reale.',noStats:'Nuk ka ende stok real për statistika.',confirmDelete:'Ta fshij këtë material?'}
}
