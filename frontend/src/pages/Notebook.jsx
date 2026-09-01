import React,{useEffect,useState} from 'react'
import {BookOpen,ChevronLeft,ChevronRight,FilePlus2,NotebookPen,Save,Trash2} from 'lucide-react'
import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'

const STORAGE_KEY='tufting_notebook_pages_v1'
const UI={sq:{title:'Shënimet e mia',subtitle:'Blloku yt privat me dy faqe përballë dhe shumë fletë',pages:'Fletët',newPage:'Shto fletë',untitled:'Fletë pa titull',placeholder:'Shkruaj shënimin këtu…',saved:'U ruajt automatikisht',saving:'Duke ruajtur…',error:'Nuk u ruajt',delete:'Fshi fletën',confirm:'Ta fshij këtë fletë?',spread:'Hapja',device:'Shënimet ruhen automatikisht në këtë pajisje.'},de:{title:'Meine Notizen',subtitle:'Privates Notizbuch mit zwei Seiten und vielen Blättern',pages:'Seiten',newPage:'Seite hinzufügen',untitled:'Ohne Titel',placeholder:'Notiz hier schreiben…',saved:'Automatisch gespeichert',saving:'Speichern…',error:'Nicht gespeichert',delete:'Seite löschen',confirm:'Diese Seite löschen?',spread:'Doppelseite',device:'Notizen werden automatisch auf diesem Gerät gespeichert.'},en:{title:'My Notes',subtitle:'Your private two-page notebook with many sheets',pages:'Pages',newPage:'Add page',untitled:'Untitled page',placeholder:'Write your note here…',saved:'Saved automatically',saving:'Saving…',error:'Not saved',delete:'Delete page',confirm:'Delete this page?',spread:'Spread',device:'Notes save automatically on this device.'}}

function makePage(title=''){return{id:globalThis.crypto?.randomUUID?.()||`note-${Date.now()}-${Math.random().toString(16).slice(2)}`,title,body:'',updatedAt:Date.now()}}
function loadPages(){
 let list=[]
 try{const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(Array.isArray(parsed))list=parsed.filter(p=>p&&p.id).map(p=>({...p,title:String(p.title||''),body:String(p.body||''),updatedAt:Number(p.updatedAt)||Date.now()}))}catch(err){console.error('Could not read notebook',err)}
 while(list.length<2)list.push(makePage(''))
 return list
}

export default function Notebook(){
 const {lang}=useI18n(),u=UI[lang]||UI.sq
 const [pages,setPages]=useState(loadPages),[spreadStart,setSpreadStart]=useState(0),[saveState,setSaveState]=useState('saved')
 const safeStart=Math.max(0,Math.min(spreadStart,Math.max(0,pages.length-2)))
 const normalizedStart=safeStart%2===0?safeStart:Math.max(0,safeStart-1)
 const spreadNumber=Math.floor(normalizedStart/2)+1,totalSpreads=Math.ceil(pages.length/2)

 useEffect(()=>{setSaveState('saving');const timer=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(pages));setSaveState('saved')}catch(err){console.error('Could not save notebook',err);setSaveState('error')}},260);return()=>clearTimeout(timer)},[pages])
 useEffect(()=>{if(spreadStart!==normalizedStart)setSpreadStart(normalizedStart)},[normalizedStart,spreadStart])

 const update=(id,patch)=>setPages(items=>items.map(p=>p.id===id?{...p,...patch,updatedAt:Date.now()}:p))
 const add=()=>{const p=makePage('');setPages(items=>{const next=[...items,p];if(next.length%2!==0)next.push(makePage(''));setSpreadStart(Math.floor((next.length-2)/2)*2);return next})}
 const remove=(id)=>{
  if(pages.length<=2){update(id,{title:'',body:''});return}
  if(!window.confirm(u.confirm))return
  setPages(items=>{const next=items.filter(p=>p.id!==id);while(next.length<2)next.push(makePage(''));if(next.length%2!==0)next.push(makePage(''));return next})
  setSpreadStart(v=>Math.max(0,Math.min(v,pages.length-4)))
 }
 const go=delta=>setSpreadStart(v=>Math.max(0,Math.min(Math.max(0,pages.length-2),v+delta*2)))

 return <div className="knowledge-page notebook-page mobile-standard-page"><MobilePageHeader title={u.title}/><header className="knowledge-title"><div><span className="knowledge-kicker"><NotebookPen/>{u.pages}</span><h1>{u.title}</h1><p>{u.subtitle}</p></div><button className="notebook-add-top" onClick={add}><FilePlus2/>{u.newPage}</button></header><div className="notebook-v2-layout"><aside className="notebook-pages notebook-v2-pages"><div className="notebook-pages-head"><b>{u.pages}</b><span>{pages.length}</span></div><div className="notebook-page-list">{pages.map((p,i)=><button key={p.id} className={Math.floor(i/2)*2===normalizedStart?'active':''} onClick={()=>setSpreadStart(Math.floor(i/2)*2)}><span>{i+1}</span><div><b>{p.title.trim()||u.untitled}</b><small>{p.body.trim().slice(0,42)||u.placeholder}</small></div></button>)}</div><button className="notebook-add-side" onClick={add}><FilePlus2/>{u.newPage}</button></aside><main className="personal-open-book"><div className="personal-cover"/><div className="personal-spine"/><div className="personal-rings">{Array.from({length:11},(_,i)=><i key={i}/>)}</div><NotePaper page={pages[normalizedStart]} index={normalizedStart} u={u} saveState={saveState} update={update} remove={remove}/><NotePaper page={pages[normalizedStart+1]} index={normalizedStart+1} u={u} saveState={saveState} update={update} remove={remove}/></main></div><footer className="notebook-spread-controls"><button disabled={spreadNumber===1} onClick={()=>go(-1)}><ChevronLeft/></button><div><BookOpen/><b>{u.spread} {spreadNumber} / {totalSpreads}</b><span>{normalizedStart+1}–{normalizedStart+2}</span></div><button disabled={spreadNumber===totalSpreads} onClick={()=>go(1)}><ChevronRight/></button></footer></div>
}

function NotePaper({page,index,u,saveState,update,remove}){
 if(!page)return null
 const words=page.body.trim()?page.body.trim().split(/\s+/).length:0
 return <section className={`personal-paper ${index%2===0?'left':'right'}`}><span className="personal-page-number">{index+1}</span><div className="personal-paper-toolbar"><span><BookOpen/>Fleta {index+1}</span><div className={`autosave ${saveState}`}><Save/>{u[saveState]}</div><button onClick={()=>remove(page.id)} title={u.delete} aria-label={u.delete}><Trash2/></button></div><input className="personal-paper-title" value={page.title} onChange={e=>update(page.id,{title:e.target.value})} placeholder={u.untitled} maxLength={100}/><textarea className="personal-paper-body" value={page.body} onChange={e=>update(page.id,{body:e.target.value})} placeholder={u.placeholder} spellCheck="true"/><footer><span>{words} fjalë</span><small>{u.device}</small></footer></section>
}
