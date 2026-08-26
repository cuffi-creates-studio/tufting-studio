import React,{useEffect,useState} from 'react'
import {getProjects} from '../api/client'
import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'
export default function Gallery(){
 const {t}=useI18n(),[projects,setProjects]=useState([])
 useEffect(()=>{getProjects().then(setProjects).catch(()=>setProjects([]))},[])
 return <div className="mobile-standard-page">
  <MobilePageHeader title={t('gallery')}/>
  <p className="page-subtitle">{t('projectLibrary')}</p>
  {projects.length?<div className="gallery-grid">{projects.map((p,i)=><article className="gallery-card" key={p.id}><div className="gallery-art">{['🐶','🌸','🐱','🎨'][i%4]}</div><b>{p.name}</b><small>{p.status}</small></article>)}</div>:<div className="gallery-empty"><div>🖼️</div><h3>{t('noProjects')}</h3><p>{t('projectLibrary')}</p></div>}
 </div>
}
