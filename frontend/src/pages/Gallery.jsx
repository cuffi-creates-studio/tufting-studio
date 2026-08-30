import React,{useEffect,useState} from 'react'
import {X} from 'lucide-react'
import {getProjects} from '../lib/projectsStore'
import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'

export default function Gallery(){
 const {t}=useI18n()
 const [projects,setProjects]=useState([])
 const [selected,setSelected]=useState(null)

 useEffect(()=>{
  getProjects().then(setProjects).catch(()=>setProjects([]))
 },[])

 return <>
  <style>{`
    .gallery-page-wrap{width:100%}
    .gallery-project-grid{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(165px,1fr));
      gap:14px;
      align-items:start;
    }
    .gallery-project-card{
      overflow:hidden;
      border-radius:18px;
      background:#fffdf8;
      border:1px solid #eadfce;
      box-shadow:0 8px 22px rgba(57,42,27,.05);
    }
    .gallery-image-button{
      display:grid;
      place-items:center;
      width:100%;
      aspect-ratio:1 / 1;
      padding:10px;
      border:0;
      background:
        radial-gradient(circle at top left, rgba(255,199,154,.28), transparent 28%),
        linear-gradient(180deg,#fbf4ea 0%,#f6eee1 100%);
      overflow:hidden;
      cursor:zoom-in;
      box-sizing:border-box;
    }
    .gallery-project-image{
      width:100%;
      height:100%;
      object-fit:contain;
      object-position:center;
      display:block;
      border-radius:14px;
      background:#fffdf8;
    }
    .gallery-card-info{
      padding:12px 13px 14px;
      background:#fffdf8;
      color:#172033;
      border-top:1px solid #efe3d3;
    }
    .gallery-card-title{
      display:block;
      font-size:15px;
      line-height:1.25;
      color:#172033;
      margin-bottom:4px;
      word-break:break-word;
      font-weight:800;
    }
    .gallery-status{
      display:block;
      font-size:12px;
      font-weight:800;
    }
    .gallery-empty-card{
      min-height:220px;
      border-radius:22px;
      border:1px dashed #dfcfba;
      background:#fffdf8;
      display:grid;
      place-items:center;
      text-align:center;
      color:#6d7380;
      padding:20px;
    }
    @media (min-width:761px){
      .gallery-page-wrap{
        max-width:1320px;
        margin:0 auto;
      }
      .gallery-project-grid{
        grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
        gap:20px;
      }
      .gallery-project-card{border-radius:22px}
      .gallery-image-button{aspect-ratio:4 / 5;padding:14px}
      .gallery-card-info{padding:14px 16px 16px}
      .gallery-card-title{font-size:16px}
    }
  `}</style>

  <div className="mobile-standard-page gallery-page-wrap">
    <MobilePageHeader title={t('gallery')}/>
    <p className="page-subtitle">{t('projectLibrary')}</p>

    {projects.length
      ? <div className="gallery-project-grid">
          {projects.map(p=><article className="gallery-project-card" key={p.id}>
            <button type="button" className="gallery-image-button" onClick={()=>p.image_data&&setSelected(p)} style={{cursor:p.image_data?'zoom-in':'default'}}>
              {p.image_data
                ? <img className="gallery-project-image" src={p.image_data} alt={p.name}/>
                : <span style={{fontSize:42}}>🧶</span>}
            </button>
            <div className="gallery-card-info">
              <b className="gallery-card-title">{p.name}</b>
              <small className="gallery-status" style={{color:p.status==='Completed'?'#438f73':'#d98257'}}>{statusLabel(p.status,t)}</small>
            </div>
          </article>)}
        </div>
      : <div className="gallery-empty-card"><div><div style={{fontSize:42,marginBottom:8}}>🖼️</div><h3 style={{margin:'0 0 8px'}}>{t('noProjects')}</h3><p style={{margin:0}}>{t('projectLibrary')}</p></div></div>}

    {selected&&<div onClick={()=>setSelected(null)} style={{position:'fixed',inset:0,zIndex:10000,background:'rgba(9,13,22,.9)',display:'grid',placeItems:'center',padding:20}}>
      <button onClick={()=>setSelected(null)} aria-label="Close" style={{position:'absolute',right:18,top:'calc(18px + env(safe-area-inset-top))',width:46,height:46,borderRadius:'50%',border:0,background:'#fff',display:'grid',placeItems:'center',zIndex:2,cursor:'pointer'}}><X/></button>
      <div onClick={e=>e.stopPropagation()} style={{width:'min(94vw,1100px)',maxHeight:'90dvh',display:'grid',gap:12}}>
        <img src={selected.image_data} alt={selected.name} style={{width:'100%',maxHeight:'80dvh',objectFit:'contain',display:'block',borderRadius:18,background:'#fffaf3'}}/>
        <div style={{color:'#fff',textAlign:'center'}}>
          <b style={{fontSize:18}}>{selected.name}</b>
          <div style={{opacity:.82,marginTop:3}}>{statusLabel(selected.status,t)}</div>
        </div>
      </div>
    </div>}
  </div>
 </>
}

function statusLabel(s,t){
 return s==='Completed' ? t('completed') : s==='In Progress' ? t('inProgress') : s
}
