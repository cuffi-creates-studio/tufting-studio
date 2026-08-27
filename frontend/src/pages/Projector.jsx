import React,{useMemo,useState} from 'react'
import {ArrowLeft,ArrowUp,ArrowDown,ArrowRight,Minus,Plus} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import {useI18n} from '../i18n/I18n'
import {createProject} from '../lib/projectsStore'

export default function Projector(){
 const nav=useNavigate()
 const {t}=useI18n()
 const [mirror,setMirror]=useState(true)
 const [zoom,setZoom]=useState(125)
 const [fiber,setFiber]=useState('Acrylic')
 const [x,setX]=useState(0)
 const [y,setY]=useState(0)
 const [busy,setBusy]=useState(false)
 const [saved,setSaved]=useState(false)
 const [error,setError]=useState('')

 const image=useMemo(()=>sessionStorage.getItem('tufting_projector_image')||'',[ ])
 const style=useMemo(()=>sessionStorage.getItem('tufting_projector_style')||'Cartoon',[ ])
 const palette=useMemo(()=>{try{return JSON.parse(sessionStorage.getItem('tufting_projector_palette')||'[]')}catch{return[]}},[])
 const lastCalc=useMemo(()=>{try{return JSON.parse(localStorage.getItem('tufting_last_calculation')||'{}')}catch{return{}}},[])

 const yarn=fiber==='Acrylic'?620:690
 const cost=fiber==='Acrylic'?24.80:31.50

 async function saveProject(){
   setBusy(true);setError('');setSaved(false)
   try{
     const name=prompt(t('projectName'),`${style} Project`)||`${style} Project`
     const smallImage=image?await compressDataUrl(image,560,.68):''
     await createProject({
       name,
       status:'In Progress',
       material_cost:cost,
       width_cm:Number(lastCalc.width_cm)||80,
       height_cm:Number(lastCalc.height_cm)||60,
       yarn_type:fiber,
       yarn_g:yarn,
       coverage_area:.85,
       style,
       palette,
       image_data:smallImage
     })
     setSaved(true)
     setTimeout(()=>nav('/projects'),650)
   }catch(e){
     console.error(e)
     setError(t('saveFailed'))
   }finally{setBusy(false)}
 }

 return <div className="mobile-flow-page exact-projector">
   <div className="flow-top"><button onClick={()=>nav(-1)}><ArrowLeft/></button><h1>{t('projectorTools')}</h1><span/></div>

   <div className="projector-box">
     <div className="mirror-row"><b>◫ {t('mirror')}</b><button className={`switch ${mirror?'on':''}`} onClick={()=>setMirror(!mirror)}><i/></button></div>
     <div className="projector-controls">
       <button className="p-arrow top" onClick={()=>setY(v=>v-8)}><ArrowUp/></button>
       <button className="p-arrow bottom" style={{bottom:18}} onClick={()=>setY(v=>v+8)}><ArrowDown/></button>
       <button className="p-arrow left" onClick={()=>setX(v=>v-8)}>←</button>

       <div className="projector-preview-dog" style={{overflow:'hidden',display:'grid',placeItems:'center'}}>
         {image
           ? <img
               src={image}
               alt={t('preview')}
               style={{
                 maxWidth:'82%',maxHeight:'82%',objectFit:'contain',
                 transform:`translate(${x}px,${y}px) scale(${zoom/100}) scaleX(${mirror?-1:1})`,
                 transformOrigin:'center',
                 transition:'transform .15s ease'
               }}
             />
           : <div style={{fontSize:18,textAlign:'center',padding:20}}>🖼️<br/><small>{t('noProjectorImage')}</small></div>}
       </div>

       <button className="p-arrow right" onClick={()=>setX(v=>v+8)}><ArrowRight/></button>
     </div>
     <div className="zoom-row">
       <button onClick={()=>setZoom(Math.max(25,zoom-25))}><Minus/></button>
       <b>{zoom}%</b>
       <button onClick={()=>setZoom(Math.min(300,zoom+25))}><Plus/></button>
     </div>
   </div>

   <div className="yarn-card">
     <h2>{t('yarnCalculator')}</h2>
     <div className="fiber-tabs">
       <button className={fiber==='Acrylic'?'active':''} onClick={()=>setFiber('Acrylic')}>{t('acrylic')}</button>
       <button className={fiber==='Wool'?'active':''} onClick={()=>setFiber('Wool')}>{t('wool')}</button>
     </div>
     <div className="calc-line"><span>{t('estimatedYarn')}</span><b>{yarn} g</b></div>
     <div className="calc-line"><span>{t('coverageArea')}</span><b>0.85 m²</b></div>
     <div className="calc-line"><span>{t('costEstimate')}</span><b>€{cost.toFixed(2)}</b></div>
   </div>

   {error&&<p style={{textAlign:'center',color:'#b42318',fontWeight:800}}>{error}</p>}
   <button className="save-project-btn" disabled={busy} onClick={saveProject}>{busy?t('saving'):saved?t('saved'):t('saveProject')}</button>
 </div>
}

function compressDataUrl(src,max=560,quality=.68){
 return new Promise(resolve=>{
   const img=new Image()
   img.onload=()=>{
     const scale=Math.min(1,max/Math.max(img.width,img.height))
     const c=document.createElement('canvas')
     c.width=Math.max(1,Math.round(img.width*scale))
     c.height=Math.max(1,Math.round(img.height*scale))
     c.getContext('2d').drawImage(img,0,0,c.width,c.height)
     resolve(c.toDataURL('image/jpeg',quality))
   }
   img.onerror=()=>resolve('')
   img.src=src
 })
}
