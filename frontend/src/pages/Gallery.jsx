import React,{useEffect,useState} from 'react'
import {Image as ImageIcon,X} from 'lucide-react'
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

    .gallery-status{
      display:inline-flex;
      align-items:center;
      min-height:28px;
      padding:0 10px;
      border-radius:999px;
      font-size:12px;
      font-weight:800;
      border:1px solid transparent;
    }

    .gallery-status.done{
      background:#e9f8f0;
      color:#0d8e5d;
      border-color:#bde4cd;
    }

    .gallery-status.progress{
      background:#fff1ea;
      color:#e15e3d;
      border-color:#f3c8bb;
    }

    .gallery-desktop-hero{display:none;}

    @media(min-width:761px){
      .mobile-standard-page.gallery-desktop-page{
        width:100%;
        max-width:1450px;
        margin:0 auto;
        padding:24px 30px 50px;
        box-sizing:border-box;
      }

      .gallery-desktop-hero{
        display:flex;
        align-items:flex-end;
        justify-content:space-between;
        gap:18px;
        margin:0 0 26px;
        padding:28px 30px;
        border:1px solid #eadcc9;
        border-radius:28px;
        background:linear-gradient(135deg,#fffdf9 0%,#fff7ed 56%,#fdfaf6 100%);
        box-shadow:0 14px 36px rgba(39,31,21,.06);
      }

      .gallery-desktop-copy small{
        display:inline-block;
        margin:0 0 10px;
        color:#8f7a61;
        font-size:12px;
        font-weight:800;
        letter-spacing:.12em;
        text-transform:uppercase;
      }

      .gallery-desktop-copy h1{
        margin:0;
        font-size:42px;
        line-height:1;
        letter-spacing:-1.2px;
        color:#172033;
      }

      .gallery-desktop-copy p{
        max-width:640px;
        margin:10px 0 0;
        color:#6d7480;
        font-size:15px;
      }

      .gallery-desktop-badge{
        display:inline-flex;
        align-items:center;
        gap:10px;
        align-self:center;
        padding:13px 16px;
        border-radius:18px;
        border:1px solid #eadcc9;
        background:#fffdf8;
        color:#172033;
        font-weight:800;
        box-shadow:0 8px 20px rgba(39,31,21,.04);
        white-space:nowrap;
      }

      .gallery-desktop-badge svg{
        width:18px;
        height:18px;
        color:#744be3;
      }

      .gallery-desktop-page .page-subtitle{
        display:none;
      }

      .gallery-project-grid{
        grid-template-columns:repeat(auto-fill,minmax(300px,1fr));
        gap:22px;
        align-items:start;
      }

      .gallery-project-card{
        border-radius:24px;
        border:1px solid #e5d5c1;
        background:#fffaf3;
        box-shadow:0 12px 28px rgba(39,31,21,.06);
        transition:transform .18s ease, box-shadow .18s ease;
      }

      .gallery-project-card:hover{
        transform:translateY(-4px);
        box-shadow:0 18px 38px rgba(39,31,21,.09);
      }

      .gallery-image-button{
        height:310px;
        min-height:310px;
        background:linear-gradient(180deg,#fbf5eb 0%,#f7efe5 100%);
        cursor:zoom-in;
        overflow:hidden;
      }

      .gallery-project-image{
        width:100%;
        height:100%;
        object-fit:cover;
        object-position:center;
        display:block;
      }

      .gallery-card-info{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:14px;
        padding:16px 18px 18px;
        background:#fffaf3;
        border-top:1px solid #eee0cf;
      }

      .gallery-card-info b{
        font-size:18px;
        margin-bottom:5px;
      }

      .gallery-card-copy{
        min-width:0;
        flex:1;
      }
    }

    @media(min-width:761px) and (max-width:1050px){
      .gallery-project-grid{
        grid-template-columns:repeat(2,minmax(0,1fr));
      }

      .gallery-desktop-hero{
        padding:24px 22px;
      }

      .gallery-desktop-copy h1{
        font-size:36px;
      }
    }
  `}</style>

  <div className="mobile-standard-page gallery-desktop-page">
    <MobilePageHeader title={t('gallery')}/>

    <div className="gallery-desktop-hero">
      <div className="gallery-desktop-copy">
        <small>Tufting Studio</small>
        <h1>{t('gallery')}</h1>
        <p>{t('projectLibrary')}</p>
      </div>
      <div className="gallery-desktop-badge"><ImageIcon/>{projects.length} {t('projects')}</div>
    </div>

    <p className="page-subtitle">{t('projectLibrary')}</p>

    {projects.length
      ? <div className="gallery-project-grid">
        {projects.map(p=>{
          const done=p.status==='Completed'
          return <article className="gallery-project-card" key={p.id}>
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
              <div className="gallery-card-copy">
                <b>{p.name}</b>
                <small style={{display:'block',fontSize:12,color:'#7b8390'}}>{p.width_cm>0&&p.height_cm>0?`${p.width_cm} × ${p.height_cm} cm`:t('projectLibrary')}</small>
              </div>
              <span className={`gallery-status ${done?'done':'progress'}`}>{statusLabel(p.status,t)}</span>
            </div>
          </article>
        })}
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
