import React,{useEffect,useState} from 'react'
import {ArrowLeft,X} from 'lucide-react'
import {getProjects} from '../lib/projectsStore'
import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'

export default function Gallery(){
 const {t}=useI18n()
 const isMobile=useMedia('(max-width: 760px)')
 const [projects,setProjects]=useState([])
 const [selected,setSelected]=useState(null)
 useEffect(()=>{getProjects().then(setProjects).catch(()=>setProjects([]))},[])

 if(isMobile){
   return <GalleryMobile {...{t,projects,selected,setSelected}}/>
 }
 return <GalleryDesktop {...{t,projects,selected,setSelected}}/>
}

function GalleryDesktop({t,projects,selected,setSelected}){
 return <div className="desktop-gallery-page">
   <div className="page-title">
     <div>
       <h1>{t('gallery')}</h1>
       <p>{t('projectLibrary')}</p>
     </div>
   </div>

   {projects.length ? <div className="gallery-grid desktop-gallery-grid">
     {projects.map(p=><article className="gallery-card desktop-gallery-card" key={p.id}>
       <button type="button" className="desktop-gallery-image-button" onClick={()=>p.image_data&&setSelected(p)}>
         {p.image_data?<img src={p.image_data} alt={p.name} className="desktop-gallery-image"/>:<div className="desktop-gallery-placeholder">🧶</div>}
       </button>
       <div className="desktop-gallery-copy">
         <h3>{p.name}</h3>
         <small className={p.status==='Completed'?'done':'progress'}>{statusLabel(p.status,t)}</small>
       </div>
     </article>)}
   </div> : <div className="gallery-empty"><div>🖼️</div><h3>{t('noProjects')}</h3><p>{t('projectLibrary')}</p></div>}

   <Lightbox selected={selected} setSelected={setSelected} t={t}/>
 </div>
}

function GalleryMobile({t,projects,selected,setSelected}){
 return <div className="mobile-standard-page">
  <MobilePageHeader title={t('gallery')}/>
  <p className="page-subtitle">{t('projectLibrary')}</p>

  {projects.length
    ? <div className="gallery-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))',gap:14}}>
      {projects.map(p=><article className="gallery-card" key={p.id} style={{overflow:'hidden',borderRadius:18,background:'#fffdf8',border:'1px solid #eadfce'}}>
        <button type="button" onClick={()=>p.image_data&&setSelected(p)} style={{display:'block',width:'100%',height:190,padding:0,border:0,background:'#f5eee3',overflow:'hidden',cursor:p.image_data?'zoom-in':'default'}}>
          {p.image_data?<img src={p.image_data} alt={p.name} style={{width:'100%',height:'100%',objectFit:'contain',display:'block'}}/>:<span style={{fontSize:42}}>🧶</span>}
        </button>
        <div style={{padding:'11px 12px 13px',background:'#fffdf8',color:'#172033'}}>
          <b style={{display:'block',fontSize:15,lineHeight:1.25,color:'#172033',marginBottom:4,wordBreak:'break-word'}}>{p.name}</b>
          <small style={{display:'block',fontSize:12,color:p.status==='Completed'?'#00995E':'#FD5A46',fontWeight:800}}>{statusLabel(p.status,t)}</small>
        </div>
      </article>)}
    </div>
    : <div className="gallery-empty"><div>🖼️</div><h3>{t('noProjects')}</h3><p>{t('projectLibrary')}</p></div>}

   <Lightbox selected={selected} setSelected={setSelected} t={t}/>
 </div>
}

function Lightbox({selected,setSelected,t}){
 if(!selected) return null
 return <div onClick={()=>setSelected(null)} style={{position:'fixed',inset:0,zIndex:10000,background:'rgba(9,13,22,.88)',display:'grid',placeItems:'center',padding:20}}>
   <button onClick={()=>setSelected(null)} aria-label="Close" style={{position:'absolute',right:18,top:'calc(18px + env(safe-area-inset-top))',width:46,height:46,borderRadius:'50%',border:0,background:'#fff',display:'grid',placeItems:'center',zIndex:2}}><X/></button>
   <div onClick={e=>e.stopPropagation()} style={{width:'min(94vw,1100px)',maxHeight:'88dvh',display:'grid',gap:10}}>
     <img src={selected.image_data} alt={selected.name} style={{width:'100%',maxHeight:'78dvh',objectFit:'contain',display:'block',borderRadius:18,background:'#fff'}}/>
     <div style={{color:'#fff',textAlign:'center'}}><b style={{fontSize:18}}>{selected.name}</b><div style={{opacity:.8,marginTop:3}}>{statusLabel(selected.status,t)}</div></div>
   </div>
 </div>
}

function statusLabel(s,t){return s==='Completed'?t('completed'):s==='In Progress'?t('inProgress'):s}

function useMedia(query){
 const [matches,setMatches]=useState(()=>typeof window!=='undefined'&&window.matchMedia(query).matches)
 useEffect(()=>{
   const m=window.matchMedia(query),f=()=>setMatches(m.matches)
   f();m.addEventListener?.('change',f)
   return()=>m.removeEventListener?.('change',f)
 },[query])
 return matches
}
