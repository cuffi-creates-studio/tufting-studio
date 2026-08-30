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
    .gallery-project-grid{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(155px,1fr));
      gap:14px;
      align-items:start;
    }

    .gallery-project-card{
      overflow:hidden;
      border-radius:18px;
      background:#fffdf8;
      border:1px solid #eadfce;
    }

    .gallery-image-button{
      display:grid;
      place-items:center;
      width:100%;
      height:190px;
      padding:0;
      border:0;
      background:#f5eee3;
      overflow:hidden;
    }

    .gallery-project-image{
      width:100%;
      height:100%;
      object-fit:contain;
      object-position:center;
      display:block;
    }

    .gallery-card-info{
      padding:11px 12px 13px;
      background:#fffdf8;
      color:#172033;
    }

    .gallery-card-info b{
      display:block;
      font-size:15px;
      line-height:1.25;
      color:#172033;
      margin-bottom:4px;
      word-break:break-word;
    }

    @media(min-width:761px){
      .mobile-standard-page.gallery-desktop-page{
        width:100%;
        max-width:1450px;
        margin:0 auto;
        padding:28px 30px 46px;
        box-sizing:border-box;
      }

      .gallery-desktop-page .page-subtitle{
        margin:0 0 20px;
        color:#737b86;
      }

      .gallery-project-grid{
        grid-template-columns:repeat(auto-fill,minmax(300px,1fr));
        gap:22px;
        align-items:start;
      }

      .gallery-project-card{
        border-radius:22px;
        border:1px solid #e5d5c1;
        background:#fffaf3;
        box-shadow:0 10px 28px rgba(39,31,21,.06);
      }

      .gallery-image-button{
        height:auto;
        min-height:220px;
        background:#f7efe5;
        cursor:zoom-in;
        overflow:visible;
      }

      .gallery-project-image{
        width:100%;
        height:auto;
        max-height:none;
        object-fit:contain;
        object-position:center;
        display:block;
      }

      .gallery-card-info{
        padding:15px 17px 17px;
        background:#fffaf3;
        border-top:1px solid #eee0cf;
      }

      .gallery-card-info b{
        font-size:17px;
        margin-bottom:6px;
      }
    }

    @media(min-width:761px) and (max-width:1050px){
      .gallery-project-grid{
        grid-template-columns:repeat(2,minmax(0,1fr));
      }
    }
  `}</style>

  <div className="mobile-standard-page gallery-desktop-page">
    <MobilePageHeader title={t('gallery')}/>
    <p className="page-subtitle">{t('projectLibrary')}</p>

    {projects.length
      ? <div className="gallery-project-grid">
        {projects.map(p=><article className="gallery-project-card" key={p.id}>
          <button
            type="button"
            className="gallery-image-button"
            onClick={()=>p.image_data&&setSelected(p)}
            style={{cursor:p.image_data?'zoom-in':'default'}}
          >
            {p.image_data
              ? <img className="gallery-project-image" src={p.image_data} alt={p.name}/>
              : <span style={{fontSize:42}}>🧶</span>}
          </button>

          <div className="gallery-card-info">
            <b>{p.name}</b>
            <small style={{
              display:'block',
              fontSize:12,
              color:p.status==='Completed'?'#00995E':'#FD5A46',
              fontWeight:800
            }}>
              {statusLabel(p.status,t)}
            </small>
          </div>
        </article>)}
      </div>
      : <div className="gallery-empty">
          <div>🖼️</div>
          <h3>{t('noProjects')}</h3>
          <p>{t('projectLibrary')}</p>
        </div>
    }

    {selected&&
      <div
        onClick={()=>setSelected(null)}
        style={{
          position:'fixed',
          inset:0,
          zIndex:10000,
          background:'rgba(9,13,22,.9)',
          display:'grid',
          placeItems:'center',
          padding:20
        }}
      >
        <button
          onClick={()=>setSelected(null)}
          aria-label="Close"
          style={{
            position:'absolute',
            right:18,
            top:'calc(18px + env(safe-area-inset-top))',
            width:46,
            height:46,
            borderRadius:'50%',
            border:0,
            background:'#fff',
            display:'grid',
            placeItems:'center',
            zIndex:2
          }}
        >
          <X/>
        </button>

        <div
          onClick={e=>e.stopPropagation()}
          style={{
            width:'min(94vw,1200px)',
            maxHeight:'90dvh',
            display:'grid',
            gap:12
          }}
        >
          <img
            src={selected.image_data}
            alt={selected.name}
            style={{
              width:'100%',
              maxHeight:'80dvh',
              objectFit:'contain',
              display:'block',
              margin:'0 auto',
              borderRadius:18,
              background:'#fffaf3'
            }}
          />

          <div style={{color:'#fff',textAlign:'center'}}>
            <b style={{fontSize:18}}>{selected.name}</b>
            <div style={{opacity:.8,marginTop:3}}>{statusLabel(selected.status,t)}</div>
          </div>
        </div>
      </div>
    }
  </div>
 </>
}

function statusLabel(s,t){
 return s==='Completed'
   ? t('completed')
   : s==='In Progress'
     ? t('inProgress')
     : s
}
