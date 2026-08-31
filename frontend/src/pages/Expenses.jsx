import React,{useEffect,useMemo,useRef,useState} from 'react'
import {Banknote,Filter,Package,Plus,Search,Truck,WalletCards,Wrench,Zap,Megaphone,Boxes,X} from 'lucide-react'
import {useI18n} from '../i18n/I18n'
import {getProjects} from '../lib/projectsStore'
import {createExpense,deleteExpense,getExpenses,updateExpense} from '../lib/businessStore'
import '../styles/business-pc.css'

const CAT_ICON={'Post & Transport':Truck,'Packaging':Package,'Energy':Zap,'Materials':Boxes,'Equipment':Wrench,'Advertising':Megaphone,'Other':Banknote}
const CAT_COLOR={'Post & Transport':'#058CD7','Packaging':'#552CB7','Energy':'#FFC567','Materials':'#00995E','Equipment':'#058CD7','Advertising':'#FD5A46','Other':'#FB7DA8'}

export default function Expenses(){
 const {lang}=useI18n(),tx=labels(lang),dialog=useRef(null)
 const [rows,setRows]=useState([]),[projects,setProjects]=useState([]),[q,setQ]=useState(''),[editing,setEditing]=useState(null),[saving,setSaving]=useState(false),[month,setMonth]=useState(currentMonth())
 async function load(){const[a,b]=await Promise.all([getExpenses().catch(()=>[]),getProjects().catch(()=>[])]);setRows(a);setProjects(b)}
 useEffect(()=>{load()},[])
 const shown=useMemo(()=>rows.filter(r=>String(r.date||'').startsWith(month)&&[r.category,r.description,r.project_name,r.payment_method].join(' ').toLowerCase().includes(q.toLowerCase())),[rows,q,month])
 const total=shown.reduce((s,r)=>s+(Number(r.amount)||0),0)
 const byCat=useMemo(()=>{const m={};shown.forEach(r=>m[r.category]=(m[r.category]||0)+(Number(r.amount)||0));return Object.entries(m).sort((a,b)=>b[1]-a[1])},[shown])
 function open(row=null){setEditing(row);dialog.current?.showModal()}
 async function submit(e){e.preventDefault();setSaving(true);const f=new FormData(e.currentTarget),p=projects.find(x=>x.id===f.get('project_id'));const data={category:String(f.get('category')||'Other'),description:String(f.get('description')||'').trim(),amount:Number(f.get('amount'))||0,date:String(f.get('date')||new Date().toISOString().slice(0,10)),project_id:String(f.get('project_id')||''),project_name:String(p?.name||''),payment_method:String(f.get('payment_method')||'Cash'),invoice_ref:String(f.get('invoice_ref')||'').trim(),notes:String(f.get('notes')||'')};if(editing)await updateExpense(editing.id,data);else await createExpense(data);await load();setSaving(false);dialog.current?.close();setEditing(null)}
 async function remove(id){if(!confirm(tx.confirmDelete))return;await deleteExpense(id);await load()}
 return <div className="business-page expenses"><section className="business-shell-card">
  <header className="business-head"><div className="business-number">3</div><div className="business-title-icon"><WalletCards/></div><div className="business-heading"><h1>{tx.title}</h1><p>{tx.subtitle}</p></div><div className="business-actions"><label className="biz-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={tx.search}/></label><button className="biz-btn"><Filter/>{tx.filter}</button><button className="biz-btn primary" onClick={()=>open()}><Plus/>{tx.add}</button></div></header>
  <div className="biz-layout-split">
   <div className="business-table-wrap">{shown.length?<table className="business-table"><thead><tr><th>{tx.category}</th><th>{tx.description}</th><th>{tx.amount}</th><th>{tx.date}</th><th>{tx.project}</th><th>{tx.method}</th><th>{tx.invoice}</th><th/></tr></thead><tbody>{shown.map(r=>{const I=CAT_ICON[r.category]||Banknote;return <tr key={r.id}><td><div className="biz-person"><span className="biz-expense-icon" style={{color:CAT_COLOR[r.category]||'#777'}}><I/></span>{categoryLabel(r.category,tx)}</div></td><td>{r.description||'—'}</td><td className="biz-money">€{money(r.amount)}</td><td>{formatDate(r.date)}</td><td>{r.project_name||'—'}</td><td>{r.payment_method||'—'}</td><td>{r.invoice_ref||'—'}</td><td><button className="biz-kebab" onClick={()=>open(r)}>•••</button></td></tr>})}</tbody></table>:<div className="biz-empty">{tx.empty}</div>}</div>
   <aside className="biz-summary"><select className="biz-month-select" value={month} onChange={e=>setMonth(e.target.value)}>{monthOptions().map(x=><option key={x} value={x}>{monthLabel(x,lang)}</option>)}</select><div className="biz-month-card"><label>{tx.monthTotal}</label><strong>€{money(total)}</strong></div><div className="biz-donut" style={{background:expenseGradient(byCat)}}><div className="biz-donut-center"><b>{tx.total}</b><strong>€{money(total)}</strong></div></div><div className="biz-legend">{byCat.map(([cat,val])=><div className="biz-legend-row" key={cat}><i className="biz-legend-dot" style={{background:CAT_COLOR[cat]||'#aaa'}}/><span>{categoryLabel(cat,tx)}</span><b>€{money(val)}</b></div>)}</div><div className="biz-bottom-stats"><div className="biz-mini-stat pink"><span>{tx.average}</span><strong>€{money(shown.length?total/shown.length:0)}</strong></div><div className="biz-mini-stat good"><span>{tx.transactions}</span><strong>{shown.length}</strong></div></div></aside>
  </div>
 </section>
 <dialog className="biz-dialog" ref={dialog} onClose={()=>setEditing(null)}><div className="biz-dialog-head"><h2>{editing?tx.edit:tx.add}</h2><button className="biz-dialog-close" onClick={()=>dialog.current?.close()}><X/></button></div><form className="biz-form" onSubmit={submit} key={editing?.id||'new'}>
  <label>{tx.category}<select name="category" defaultValue={editing?.category||'Post & Transport'}>{Object.keys(CAT_ICON).map(x=><option key={x}>{x}</option>)}</select></label>
  <label>{tx.amount}<input name="amount" type="number" min="0" step="0.01" required defaultValue={editing?.amount||''}/></label>
  <label className="full">{tx.description}<input name="description" required defaultValue={editing?.description||''}/></label>
  <label>{tx.date}<input name="date" type="date" defaultValue={editing?.date||new Date().toISOString().slice(0,10)}/></label>
  <label>{tx.project}<select name="project_id" defaultValue={editing?.project_id||''}><option value="">—</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
  <label>{tx.method}<select name="payment_method" defaultValue={editing?.payment_method||'Cash'}><option>Cash</option><option>Card</option><option>Bank</option><option>PayPal</option><option>Other</option></select></label>
  <label>{tx.invoice}<input name="invoice_ref" defaultValue={editing?.invoice_ref||''}/></label>
  <label className="full">{tx.notes}<textarea name="notes" defaultValue={editing?.notes||''}/></label>
  <div className="biz-form-actions">{editing&&<button type="button" className="biz-btn danger" onClick={()=>remove(editing.id)}>{tx.delete}</button>}<button type="button" className="biz-btn" onClick={()=>dialog.current?.close()}>{tx.cancel}</button><button className="biz-btn primary" disabled={saving}>{saving?tx.saving:tx.save}</button></div>
 </form></dialog>
 </div>
}
function money(v){return(Number(v)||0).toFixed(2)}
function formatDate(v){if(!v)return'—';const[y,m,d]=String(v).split('-');return y&&m&&d?`${d}.${m}.${y}`:v}
function currentMonth(){return new Date().toISOString().slice(0,7)}
function monthOptions(){const a=[];const d=new Date();for(let i=0;i<12;i++){const x=new Date(d.getFullYear(),d.getMonth()-i,1);a.push(`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`)}return a}
function monthLabel(v,lang){const[y,m]=v.split('-').map(Number);return new Intl.DateTimeFormat(lang==='sq'?'sq-AL':lang==='de'?'de-DE':'en-US',{month:'long',year:'numeric'}).format(new Date(y,m-1,1))}
function categoryLabel(v,t){return t.cat?.[v]||v}
function expenseGradient(byCat){if(!byCat.length)return'conic-gradient(#eee 0 100%)';const total=byCat.reduce((s,x)=>s+x[1],0)||1;let at=0;const parts=[];for(const [cat,val] of byCat){const next=at+val/total*100;parts.push(`${CAT_COLOR[cat]||'#aaa'} ${at}% ${next}%`);at=next}return `conic-gradient(${parts.join(',')})`}
function labels(lang){
 const catSq={'Post & Transport':'Postë / Transport','Packaging':'Paketim','Energy':'Energji','Materials':'Materiale','Equipment':'Pajisje','Advertising':'Reklama','Other':'Të tjera'}
 if(lang==='de')return{title:'Ausgaben',subtitle:'Studioausgaben überwachen und Budget kontrollieren.',search:'Ausgaben suchen...',filter:'Filter',add:'Ausgabe hinzufügen',category:'Kategorie',description:'Beschreibung',amount:'Betrag',date:'Datum',project:'Projekt',method:'Methode',invoice:'Beleg',notes:'Notizen',monthTotal:'Gesamtausgaben',total:'Gesamt',average:'Durchschnitt',transactions:'Transaktionen',save:'Ausgabe speichern',saving:'Speichern…',cancel:'Abbrechen',edit:'Ausgabe bearbeiten',delete:'Löschen',empty:'Noch keine Ausgaben in diesem Monat.',confirmDelete:'Diese Ausgabe löschen?',cat:{'Post & Transport':'Post / Transport','Packaging':'Verpackung','Energy':'Energie','Materials':'Materialien','Equipment':'Ausrüstung','Advertising':'Werbung','Other':'Sonstige'}}
 if(lang==='en')return{title:'Expenses',subtitle:'Monitor studio expenses and control your budget.',search:'Search expenses...',filter:'Filter',add:'Add expense',category:'Category',description:'Description',amount:'Amount',date:'Date',project:'Project',method:'Method',invoice:'Receipt',notes:'Notes',monthTotal:'Total expenses',total:'Total',average:'Average',transactions:'Transactions',save:'Save expense',saving:'Saving…',cancel:'Cancel',edit:'Edit expense',delete:'Delete',empty:'No expenses for this month.',confirmDelete:'Delete this expense?',cat:{}}
 return{title:'Shpenzimet',subtitle:'Monitoro shpenzimet e studios dhe kontrollo buxhetin.',search:'Kërko shpenzim...',filter:'Filtro',add:'Shto shpenzim',category:'Kategoria',description:'Përshkrimi',amount:'Shuma',date:'Data',project:'Projekti',method:'Metoda',invoice:'Faturë',notes:'Shënime',monthTotal:'Totali i shpenzimeve',total:'Totali',average:'Mesatarja',transactions:'Transaksione',save:'Ruaj shpenzimin',saving:'Po ruhet…',cancel:'Mbyll',edit:'Redakto shpenzimin',delete:'Fshi',empty:'Ende nuk ka shpenzime për këtë muaj.',confirmDelete:'Ta fshij këtë shpenzim?',cat:catSq}
}
