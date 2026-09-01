import React,{useEffect,useMemo,useState} from 'react'
import {BookOpen,ChevronLeft,ChevronRight,FilePlus2,NotebookPen,Save,Trash2} from 'lucide-react'
import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'

const STORAGE_KEY='tufting_notebook_pages_v1'
const UI={
 sq:{title:'Shënimet e mia',subtitle:'Blloku yt privat me shumë fletë',pages:'Fletët',newPage:'Fletë e re',untitled:'Fletë pa titull',placeholder:'Shkruaj shënimin këtu…',saved:'U ruajt automatikisht',saving:'Duke ruajtur…',error:'Nuk u ruajt',delete:'Fshi fletën',confirm:'Ta fshij këtë fletë?',page:'Fleta',device:'Shënimet ruhen në këtë pajisje.'},
 de:{title:'Meine Notizen',subtitle:'Dein privates Notizbuch mit mehreren Seiten',pages:'Seiten',newPage:'Neue Seite',untitled:'Ohne Titel',placeholder:'Schreibe deine Notiz hier…',saved:'Automatisch gespeichert',saving:'Speichern…',error:'Nicht gespeichert',delete:'Seite löschen',confirm:'Diese Seite löschen?',page:'Seite',device:'Notizen werden auf diesem Gerät gespeichert.'},
 en:{title:'My Notes',subtitle:'Your private notebook with multiple pages',pages:'Pages',newPage:'New page',untitled:'Untitled page',placeholder:'Write your note here…',saved:'Saved automatically',saving:'Saving…',error:'Not saved',delete:'Delete page',confirm:'Delete this page?',page:'Page',device:'Notes are stored on this device.'}
}

function makePage(title=''){
 return {id:globalThis.crypto?.randomUUID?.()||`note-${Date.now()}-${Math.random().toString(16).slice(2)}`,title,body:'',updatedAt:Date.now()}
}
function loadPages(){
 try{
  const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')
  if(Array.isArray(parsed)&&parsed.length)return parsed.filter(p=>p&&p.id).map(p=>({...p,title:String(p.title||''),body:String(p.body||''),updatedAt:Number(p.updatedAt)||Date.now()}))
 }catch(err){console.error('Could not read notebook',err)}
 return [makePage('')]
}

export default function Notebook(){
 const {lang}=useI18n(),u=UI[lang]||UI.en
 const [pages,setPages]=useState(loadPages)
 const [activeId,setActiveId]=useState(()=>pages[0].id)
 const [saveState,setSaveState]=useState('saved')
 const activeIndex=Math.max(0,pages.findIndex(p=>p.id===activeId)),active=pages[activeIndex]||pages[0]

 useEffect(()=>{
  setSaveState('saving')
  const timer=setTimeout(()=>{
   try{localStorage.setItem(STORAGE_KEY,JSON.stringify(pages));setSaveState('saved')}
   catch(err){console.error('Could not save notebook',err);setSaveState('error')}
  },260)
  return()=>clearTimeout(timer)
 },[pages])

 const wordCount=useMemo(()=>active.body.trim()?active.body.trim().split(/\s+/).length:0,[active.body])
 const update=patch=>setPages(items=>items.map(p=>p.id===active.id?{...p,...patch,updatedAt:Date.now()}:p))
 const add=()=>{const p=makePage('');setPages(items=>[...items,p]);setActiveId(p.id)}
 const remove=()=>{
  if(pages.length===1){update({title:'',body:''});return}
  if(!window.confirm(u.confirm))return
  const next=pages[activeIndex+1]||pages[activeIndex-1]
  setPages(items=>items.filter(p=>p.id!==active.id));setActiveId(next.id)
 }
 const selectOffset=delta=>{const next=Math.max(0,Math.min(pages.length-1,activeIndex+delta));setActiveId(pages[next].id)}

 return <div className="knowledge-page notebook-page mobile-standard-page">
  <MobilePageHeader title={u.title}/>
  <header className="knowledge-title"><div><span className="knowledge-kicker"><NotebookPen/>{u.pages}</span><h1>{u.title}</h1><p>{u.subtitle}</p></div><button className="notebook-add-top" onClick={add}><FilePlus2/>{u.newPage}</button></header>
  <div className="notebook-layout">
   <aside className="notebook-pages"><div className="notebook-pages-head"><b>{u.pages}</b><span>{pages.length}</span></div><div className="notebook-page-list">{pages.map((p,i)=><button key={p.id} className={p.id===active.id?'active':''} onClick={()=>setActiveId(p.id)}><span>{i+1}</span><div><b>{p.title.trim()||u.untitled}</b><small>{p.body.trim().slice(0,45)||u.placeholder}</small></div></button>)}</div><button className="notebook-add-side" onClick={add}><FilePlus2/>{u.newPage}</button></aside>
   <main className="notebook-paper">
    <div className="paper-binding">{Array.from({length:9},(_,i)=><i key={i}/>)}</div>
    <div className="paper-toolbar"><span><BookOpen/>{u.page} {activeIndex+1} / {pages.length}</span><div className={`autosave ${saveState}`}><Save/>{u[saveState]}</div><button className="paper-delete" onClick={remove} title={u.delete} aria-label={u.delete}><Trash2/></button></div>
    <input className="paper-title" value={active.title} onChange={e=>update({title:e.target.value})} placeholder={u.untitled} maxLength={100}/>
    <textarea className="paper-body" value={active.body} onChange={e=>update({body:e.target.value})} placeholder={u.placeholder} spellCheck="true"/>
    <footer className="paper-footer"><span>{wordCount} {lang==='sq'?'fjalë':lang==='de'?'Wörter':'words'}</span><div><button disabled={activeIndex===0} onClick={()=>selectOffset(-1)}><ChevronLeft/></button><b>{activeIndex+1} / {pages.length}</b><button disabled={activeIndex===pages.length-1} onClick={()=>selectOffset(1)}><ChevronRight/></button></div><small>{u.device}</small></footer>
   </main>
  </div>
 </div>
}
