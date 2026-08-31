import React,{useEffect,useMemo,useRef,useState} from 'react'
import {Boxes,Download,Plus,Search,X,Yarn,Tag,Palette,Hash,Database,ShieldCheck,Trash2,Save,Euro} from 'lucide-react'
import {useI18n} from '../i18n/I18n'
import {createInventoryItem,deleteInventoryItem,getInventory,updateInventoryItem} from '../lib/businessStore'
import '../styles/business-pc.css'
import '../styles/inventory-retro.css'

const RETRO=['#FFC567','#FB7DA8','#FD5A46','#552CB7','#00995E','#058CD7']

export default function Inventory(){
 const {lang}=useI18n(),tx=labels(lang),dialog=useRef(null)
 const [rows,setRows]=useState([]),[q,setQ]=useState(''),[editing,setEditing]=useState(null),[saving,setSaving]=useState(false)
 const [form,setForm]=useState(emptyForm())

 async function load(){setRows(await getInventory().catch(()=>[]))}
 useEffect(()=>{load()},[])

 const shown=useMemo(()=>rows.filter(r=>[r.name,r.hex,r.brand,r.type,r.yarn_type].join(' ').toLowerCase().includes(q.toLowerCase())),[rows,q])
 const totalG=rows.reduce((s,r)=>s+(Number(r.stock_g)||0),0)
 const totalValue=rows.reduce((s,r)=>s+((Number(r.stock_g)||0)/(Number(r.ball_g)||100))*(Number(r.price_per_ball)||0),0)

 function open(row=null){
   setEditing(row)
   setForm(row?normalizeRow(row):emptyForm())
   dialog.current?.showModal()
 }

 function close(){dialog.current?.close();setEditing(null);setForm(emptyForm())}

 async function submit(e){
   e.preventDefault()
   const data={
     type:'Yarn',
     yarn_type:form.yarn_type,
     name:form.name.trim(),
     hex:normalizeHex(form.hex),
     brand:form.brand.trim(),
     stock_g:positive(form.stock_g),
     ball_g:positive(form.ball_g)||100,
     price_per_ball:positive(form.price_per_ball),
     min_stock_g:positive(form.min_stock_g),
   }
   if(!data.name)return
   setSaving(true)
   try{
     if(editing)await updateInventoryItem(editing.id,data)
     else await createInventoryItem(data)
     await load();close()
   }finally{setSaving(false)}
 }

 async function remove(id){if(!confirm(tx.confirmDelete))return;await deleteInventoryItem(id);await load();close()}

 function exportCsv(){
   const head=['Yarn type','Color','HEX','Brand','Total stock g','Ball g','Price/ball','Minimum stock g']
   const body=rows.map(r=>[displayType(r,lang),r.name,r.hex,r.brand,r.stock_g,r.ball_g,r.price_per_ball,r.min_stock_g])
   const csv=[head,...body].map(a=>a.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n')
   const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='tufting-inventory.csv';a.click();URL.revokeObjectURL(a.href)
 }

 return <div className="business-page inventory inventory-pro-page"><section className="business-shell-card inventory-pro-shell">
  <header className="business-head inventory-pro-head">
   <div className="business-number">2</div><div className="business-title-icon inventory-title-icon"><Yarn/></div>
   <div className="business-heading"><h1>{tx.title}</h1><p>{tx.subtitle}</p></div>
   <div className="business-actions"><button className="biz-btn" onClick={exportCsv}><Download/>{tx.export}</button><label className="biz-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={tx.search}/></label><button className="biz-btn primary" onClick={()=>open()}><Plus/>{tx.add}</button></div>
  </header>

  <div className="biz-layout-split inventory-pro-layout">
   <div className="business-table-wrap inventory-pro-table-wrap">{shown.length?<table className="business-table inventory-pro-table"><thead><tr><th>{tx.yarnType}</th><th>{tx.color}</th><th>{tx.hex}</th><th>{tx.brand}</th><th>{tx.ballG}</th><th>{tx.totalStock}</th><th>{tx.price}</th><th>{tx.alert}</th><th/></tr></thead><tbody>{shown.map(r=>{
    const low=(Number(r.stock_g)||0)<=(Number(r.min_stock_g)||0)
    return <tr key={r.id}>
      <td><span className={`inventory-type-pill ${isWool(r)?'wool':'acrylic'}`}>{displayType(r,lang)}</span></td>
      <td><div className="inventory-color-cell"><YarnBall color={r.hex||'#ddd'} size="sm"/><strong>{r.name||'—'}</strong></div></td>
      <td className="inventory-hex">{normalizeHex(r.hex||'#DDDDDD').toUpperCase()}</td>
      <td>{r.brand||'—'}</td>
      <td><b>{Number(r.ball_g)||100} g</b></td>
      <td><b>{(Number(r.stock_g)||0).toLocaleString()} g</b></td>
      <td><b>€{money(r.price_per_ball)}</b></td>
      <td>{low?<span className="biz-stock-alert">{tx.low}</span>:<span className="biz-stock-ok">OK</span>}</td>
      <td><button className="biz-kebab" aria-label={tx.edit} onClick={()=>open(r)}>•••</button></td>
    </tr>})}</tbody></table>:<div className="biz-empty">{tx.empty}</div>}</div>

   <aside className="biz-summary inventory-pro-summary"><h3>{tx.summary}</h3><div className="inventory-donut-wrap"><div className="biz-donut"><div className="biz-donut-center"><b>{tx.total}</b><strong>{totalG.toLocaleString()} g</strong></div></div></div><div className="biz-legend inventory-legend">{rows.slice(0,8).map(r=><div className="biz-legend-row" key={r.id}><YarnBall color={r.hex||'#ccc'} size="xs"/><span>{r.name||'—'}</span><b>{(Number(r.stock_g)||0).toLocaleString()} g</b></div>)}</div><div className="inventory-summary-cards"><div><span>{tx.stockTotal}</span><strong>{totalG.toLocaleString()} g</strong></div><div><span>{tx.totalValue}</span><strong>€{money(totalValue)}</strong></div></div></aside>
  </div>
 </section>

 <dialog className="biz-dialog inventory-retro-dialog" ref={dialog} onClose={()=>{setEditing(null);setForm(emptyForm())}}>
  <div className="inventory-dialog-top">
   <div className="inventory-dialog-icon"><Yarn/></div>
   <div><h2>{editing?tx.edit:tx.add}</h2><p>{editing?tx.editSubtitle:tx.addSubtitle}</p></div>
   <div className="inventory-sparkles"><i/><i/><i/></div>
   <button className="biz-dialog-close inventory-dialog-close" type="button" onClick={close}><X/></button>
  </div>

  <form className="inventory-retro-form" onSubmit={submit}>
   <section className="inventory-form-card pink"><div className="inventory-field-title"><Yarn/>{tx.yarnType}</div><div className="inventory-choice-row"><button type="button" className={form.yarn_type==='Acrylic'?'active':''} onClick={()=>setForm(v=>({...v,yarn_type:'Acrylic'}))}><Yarn/>{tx.acrylic}</button><button type="button" className={form.yarn_type==='Wool'?'active wool':''} onClick={()=>setForm(v=>({...v,yarn_type:'Wool'}))}><Yarn/>{tx.wool}</button></div><small>{tx.yarnHelp}</small></section>

   <section className="inventory-form-card green"><label><span className="inventory-field-title"><Tag/>{tx.brand}</span><input value={form.brand} onChange={e=>setForm(v=>({...v,brand:e.target.value}))} placeholder={tx.brandPlaceholder}/><small>{tx.brandHelp}</small></label></section>

   <section className="inventory-form-card purple"><label><span className="inventory-field-title"><Palette/>{tx.name}</span><input required value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))} placeholder={tx.colorPlaceholder}/><small>{tx.colorHelp}</small></label></section>

   <section className="inventory-form-card yellow"><div className="inventory-field-title"><Boxes/>{tx.ballG}</div><div className="inventory-grams-row">{[50,100,500].map(g=><button type="button" key={g} className={Number(form.ball_g)===g?'active':''} onClick={()=>setForm(v=>({...v,ball_g:g}))}>{g} g</button>)}</div><small>{tx.ballHelp}</small></section>

   <section className="inventory-form-card coral inventory-color-picker-card"><div className="inventory-field-title"><Palette/>{tx.colorCard}</div><div className="inventory-color-picker-layout"><YarnBall color={form.hex} size="lg"/><div><span>{tx.colorPreview}</span><label className="inventory-color-picker-button"><Palette/>{tx.chooseColor}<input type="color" value={normalizeHex(form.hex)} onChange={e=>setForm(v=>({...v,hex:e.target.value}))}/></label></div></div></section>

   <section className="inventory-form-card green"><label><span className="inventory-field-title"><Database/>{tx.totalStock}</span><div className="inventory-input-unit"><input type="number" min="0" inputMode="decimal" value={form.stock_g} onChange={e=>setForm(v=>({...v,stock_g:e.target.value}))} placeholder="1000"/><b>g</b></div><small>{tx.stockHelp}</small></label></section>

   <section className="inventory-form-card blue"><label><span className="inventory-field-title"><Hash/>{tx.hex}</span><input value={form.hex} onChange={e=>setForm(v=>({...v,hex:e.target.value}))} onBlur={()=>setForm(v=>({...v,hex:normalizeHex(v.hex)}))} placeholder="#FB7DA8"/><small>{tx.hexHelp}</small></label></section>

   <section className="inventory-form-card pink"><label><span className="inventory-field-title"><Euro/>{tx.price}</span><div className="inventory-input-unit euro"><b>€</b><input type="number" min="0" step="0.01" inputMode="decimal" value={form.price_per_ball} onChange={e=>setForm(v=>({...v,price_per_ball:e.target.value}))} placeholder="1.75"/></div><small>{tx.priceHelp(Number(form.ball_g)||100)}</small></label></section>

   <section className="inventory-form-card blue"><label><span className="inventory-field-title"><ShieldCheck/>{tx.min}</span><div className="inventory-input-unit"><input type="number" min="0" inputMode="decimal" value={form.min_stock_g} onChange={e=>setForm(v=>({...v,min_stock_g:e.target.value}))} placeholder="100"/><b>g</b></div><small>{tx.minHelp}</small></label></section>

   <div className="inventory-retro-actions">
    {editing&&<button type="button" className="inventory-delete-btn" onClick={()=>remove(editing.id)}><Trash2/>{tx.delete}</button>}
    <span className="inventory-action-decoration"><YarnBall color="#FB7DA8" size="xs"/><YarnBall color="#00995E" size="xs"/></span>
    <button type="button" className="inventory-close-btn" onClick={close}>{tx.cancel}</button>
    <button className="inventory-save-btn" disabled={saving}><Save/>{saving?tx.saving:tx.save}</button>
   </div>
  </form>
 </dialog>
 </div>
}

function YarnBall({color='#FFC567',size='sm'}){
 return <span className={`yarn-ball yarn-ball-${size}`} style={{'--yarn-color':normalizeHex(color)}} aria-hidden="true"><i/><i/><i/><i/></span>
}
function emptyForm(){return{yarn_type:'Acrylic',name:'',hex:'#FB7DA8',brand:'',stock_g:'',ball_g:100,price_per_ball:'',min_stock_g:''}}
function normalizeRow(r){return{yarn_type:isWool(r)?'Wool':'Acrylic',name:r.name||'',hex:normalizeHex(r.hex||'#FB7DA8'),brand:r.brand||'',stock_g:r.stock_g??'',ball_g:Number(r.ball_g)||100,price_per_ball:r.price_per_ball??'',min_stock_g:r.min_stock_g??''}}
function isWool(r){const v=String(r.yarn_type||r.type||'').toLowerCase();return v==='wool'||v==='lesh'}
function displayType(r,lang){if(isWool(r))return lang==='de'?'Wolle':lang==='en'?'Wool':'Lesh';return lang==='de'?'Acryl':lang==='en'?'Acrylic':'Akryl'}
function normalizeHex(v){const s=String(v||'').trim();return /^#[0-9a-fA-F]{6}$/.test(s)?s:'#FB7DA8'}
function positive(v){const n=Number(v);return Number.isFinite(n)&&n>=0?n:0}
function money(v){return(Number(v)||0).toFixed(2)}

function labels(lang){
 if(lang==='de')return{title:'Inventar',subtitle:'Verwalte Garnbestand, Farben und Kosten für deine Projekte.',export:'Export',search:'Material suchen...',add:'Material hinzufügen',yarnType:'Garnart',color:'Farbe',hex:'HEX-Code',brand:'Marke',ballG:'Knäuelgröße',totalStock:'Gesamtbestand (g)',stockTotal:'Gesamtbestand',price:'Preis / Knäuel',alert:'Bestand',low:'Niedrig',summary:'Bestandsübersicht',total:'Gesamt',totalValue:'Inventarwert',acrylic:'Acryl',wool:'Wolle',yarnHelp:'Wähle die Garnart.',name:'Name / Farbe',brandPlaceholder:'z. B. Kartopu, Alize',brandHelp:'Marke des Garns.',colorPlaceholder:'z. B. Altrosa',colorHelp:'Name der Farbe.',ballHelp:'Gewicht eines Knäuels.',colorCard:'Farbkarte',colorPreview:'Vorschau der Garnfarbe',chooseColor:'Farbe wählen',stockHelp:'Wie viele Gramm du insgesamt von dieser Farbe hast.',hexHelp:'HEX-Code für eine genaue Farbreferenz.',priceHelp:g=>`Preis für ein ${g}-g-Knäuel.`,min:'Mindestbestand (g)',minHelp:'Warnung, sobald der Bestand darunter fällt.',save:'Material speichern',saving:'Speichern…',cancel:'Schließen',edit:'Material bearbeiten',addSubtitle:'Neues Garn professionell im Inventar speichern.',editSubtitle:'Bestandsdaten aktualisieren.',delete:'Löschen',empty:'Noch keine Materialien.',confirmDelete:'Dieses Material löschen?'}
 if(lang==='en')return{title:'Inventory',subtitle:'Manage yarn stock, colors and real costs for your projects.',export:'Export',search:'Search material...',add:'Add material',yarnType:'Yarn type',color:'Color',hex:'HEX code',brand:'Brand',ballG:'Ball weight',totalStock:'Total stock (g)',stockTotal:'Total stock',price:'Price / ball',alert:'Stock',low:'Low stock',summary:'Stock summary',total:'Total',totalValue:'Inventory value',acrylic:'Acrylic',wool:'Wool',yarnHelp:'Choose the yarn type.',name:'Name / Color',brandPlaceholder:'e.g. Kartopu, Alize',brandHelp:'Write the yarn brand.',colorPlaceholder:'e.g. Pastel pink',colorHelp:'Write the material color name.',ballHelp:'Weight of one yarn ball.',colorCard:'Color card',colorPreview:'Yarn color preview',chooseColor:'Choose color',stockHelp:'Total grams you currently have of this color.',hexHelp:'HEX code for an exact color reference.',priceHelp:g=>`Price paid for one ${g} g ball.`,min:'Minimum stock (g)',minHelp:'You will see a warning below this amount.',save:'Save material',saving:'Saving…',cancel:'Close',edit:'Edit material',addSubtitle:'Add a new yarn item to your inventory.',editSubtitle:'Update the real inventory values.',delete:'Delete',empty:'No inventory items yet.',confirmDelete:'Delete this material?'}
 return{title:'Inventari',subtitle:'Menaxho leshin, ngjyrat dhe stokun real për projektet e tua.',export:'Eksporto',search:'Kërko material...',add:'Shto material',yarnType:'Lloji i leshit',color:'Ngjyra',hex:'Kodi HEX',brand:'Marka',ballG:'Gramatura / top',totalStock:'Gjithsej (g)',stockTotal:'Stoku total',price:'Çmimi / top',alert:'Alarm stok',low:'Stok i ulët',summary:'Përmbledhje stoku',total:'Totali',totalValue:'Vlera totale e inventarit',acrylic:'Akryl',wool:'Lesh',yarnHelp:'Zgjidh llojin e leshit për këtë material.',name:'Emri / Ngjyra',brandPlaceholder:'P.sh. Kartopu, Alize, Himalaya',brandHelp:'Shkruaj markën e leshit.',colorPlaceholder:'P.sh. Rozë pastel',colorHelp:'Shkruaj emrin e ngjyrës.',ballHelp:'Zgjidh peshën e një topi leshi.',colorCard:'Karta e ngjyrës',colorPreview:'Pamja e ngjyrës së leshit',chooseColor:'Zgjidh ngjyrën',stockHelp:'Sa gram ke gjithsej nga kjo ngjyrë.',hexHelp:'Kodi HEX për referencë të saktë të ngjyrës.',priceHelp:g=>`Çmimi real që paguan për një top ${g} g.`,min:'Minimumi i stokut (g)',minHelp:'Programi të paralajmëron kur stoku bie poshtë kësaj sasie.',save:'Ruaj materialin',saving:'Po ruhet…',cancel:'Mbyll',edit:'Redakto materialin',addSubtitle:'Shto një material të ri në inventarin tënd.',editSubtitle:'Përditëso të dhënat reale të këtij materiali.',delete:'Fshi',empty:'Ende nuk ka materiale.',confirmDelete:'Ta fshij këtë material?'}
}
