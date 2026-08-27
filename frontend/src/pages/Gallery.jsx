import React,{useEffect,useState} from 'react'
import {getProjects} from '../lib/projectsStore'
import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'

export default function Gallery(){
 const {t}=useI18n()
 const [projects,setProjects]=useState([])
 useEffect(()=>{getProjects().then(setProjects).catch(()=>setProjects([]))},[])
 return <div className="mobile-standard-page">
  <MobilePageHeader title={t('gallery')}/>
  <p className="page-subtitle">{t('projectLibrary')}</p>
  {projects.length
    ? <div className="gallery-grid">{projects.map(p=><article className="gallery-card" key={p.id}>
        <div className="gallery-art">
          {p.image_data?<img src={p.image_data} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>:'🧶'}
        </div>
        <b>{p.name}</b><small>{statusLabel(p.status,t)}</small>
      </article>)}</div>
    : <div className="gallery-empty"><div>🖼️</div><h3>{t('noProjects')}</h3><p>{t('projectLibrary')}</p></div>}
 </div>
}
function statusLabel(s,t){return s==='Completed'?t('completed'):s==='In Progress'?t('inProgress'):s}
