import React,{useEffect,useState} from 'react'
import {ArrowLeft,X,UploadCloud,Camera,Check,Palette,Image as ImageIcon} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import {useI18n} from '../i18n/I18n'

export default function DesignStudio(){
 const nav=useNavigate()
 const {t}=useI18n()
 const isMobile=useMedia('(max-width: 760px)')
 const [step,setStep]=useState(0)
 const [preview,setPreview]=useState('')
 const [style,setStyle]=useState('Cartoon')
 const [processed,setProcessed]=useState({original:'',sketch:'',cartoon:'',palette:[]})
 const [paletteCount,setPaletteCount]=useState(8)

 async function pick(e){
  const f=e.target.files?.[0]
  if(!f)return
  const url=URL.createObjectURL(f)
  setPreview(url)
  const result=await processImage(url,paletteCount)
  setProcessed(result)
  setStep(1)
 }

 function continueToProjector(view='cartoon'){
   const key=style==='Sketch'?'sketch':style==='Cartoon'?'cartoon':view
   const image=processed[key]||processed.cartoon||processed.original||preview
   try{
     sessionStorage.setItem('tufting_projector_image',image||'')
     sessionStorage.setItem('tufting_projector_style',style)
     sessionStorage.setItem('tufting_projector_palette',JSON.stringify(processed.palette||[]))
   }catch(e){console.warn('Could not cache projector image',e)}
   nav('/projector')
 }

 if(!isMobile){
   if(step===0)return <div className="mobile-flow-page exact-upload desktop-design-preserved">
     <div className="flow-top"><button onClick={()=>nav(-1)}><X/></button><h1>{t('newProject')}</h1><button onClick={()=>nav(-1)}><X/></button></div>
     <FlowSteps active={0} t={t}/>
     <div className="upload-panel">
       <UploadCloud size={62}/>
       <h2>{t('uploadPhoto')}</h2><p>{t('photoFormats')}</p>
       <label className="big-action teal">{t('fromGallery')}<input type="file" accept="image/*" onChange={pick}/></label>
       <label className="big-action purple"><Camera/>{t('takePhoto')}<input type="file" accept="image/*" capture="environment" onChange={pick}/></label>
     </div>
     <div className="tips-panel"><h3>{t('tipsBestResults')}</h3><p>✧ {t('tipClear')}</p><p>☼ {t('tipCentered')}</p><p>▣ {t('tipResolution')}</p></div>
   </div>

   return <div className="mobile-flow-page exact-preview desktop-design-preserved">
     <div className="flow-top"><button onClick={()=>setStep(0)}><ArrowLeft/></button><h1>{t('preview')}</h1><button onClick={()=>nav(-1)}><X/></button></div>
     <FlowSteps active={2} t={t}/>
     <div className="preview-pair">
       <div><div className="img-stage sketch-stage">{processed.sketch?<img src={processed.sketch}/>:preview?<img src={preview}/>:<span>{t('sketch')}</span>}</div><b>{t('sketch')}</b></div>
       <div><div className="img-stage cartoon-stage">{processed.cartoon?<img src={processed.cartoon}/>:preview?<img src={preview}/>:<span>{t('cartoon')}</span>}</div><b>{t('cartoon')}</b></div>
     </div>
     <h3 className="style-title">{t('style')}</h3>
     <div className="style-segment">{['Sketch','Cartoon','Pop Art'].map(s=><button className={style===s?'active':''} onClick={()=>setStyle(s)} key={s}>{styleLabel(s,t)}</button>)}</div>
     <div className="palette-head"><h3>{t('colorPalette')}</h3><button><Palette/></button></div>
     <div className="palette-dots">{processed.palette.map(c=><span key={c} style={{background:c}}></span>)}</div>
     <button className="continue-tools" onClick={()=>continueToProjector()}>{t('continueTools')}</button>
   </div>
 }

 return <MobileDesignStudio nav={nav} step={step} setStep={setStep} pick={pick} preview={preview} processed={processed} setProcessed={setProcessed} style={style} setStyle={setStyle} paletteCount={paletteCount} setPaletteCount={setPaletteCount} continueToProjector={continueToProjector} t={t}/>
}

function MobileDesignStudio({nav,step,setStep,pick,preview,processed,setProcessed,style,setStyle,paletteCount,setPaletteCount,continueToProjector,t}){
 const [view,setView]=useState('cartoon')
 if(step===0){
   return <div className="m-design-page">
     <div className="m-design-head"><button onClick={()=>nav(-1)}><ArrowLeft/></button><h1>{t('newProject')}</h1><span/></div>
     <FlowSteps active={0} t={t}/>
     <div className="m-upload-card">
       <div className="m-upload-icon"><UploadCloud/></div>
       <h2>{t('uploadPhoto')}</h2>
       <p>{t('photoFormatsMobile')}</p>
       <label className="m-upload-primary">{t('fromGallery')}<input type="file" accept="image/*" onChange={pick}/></label>
       <label className="m-upload-secondary"><Camera/>{t('takePhoto')}<input type="file" accept="image/*" capture="environment" onChange={pick}/></label>
     </div>
     <div className="m-upload-tips">
       <b>{t('tipsBestResults')}</b>
       <span>• {t('tipClear')}</span>
       <span>• {t('tipCentered')}</span>
       <span>• {t('tipResolution')}</span>
     </div>
   </div>
 }

 const current=processed[view]||processed.original
 return <div className="m-design-page m-preview-page">
   <div className="m-design-head"><button onClick={()=>setStep(0)}><ArrowLeft/></button><h1>{t('preview')}</h1><button onClick={()=>nav(-1)}><X/></button></div>
   <FlowSteps active={2} t={t}/>

   <div className="m-preview-tabs">
     {[['original',t('original')],['sketch',t('sketch')],['cartoon',t('cartoon')]].map(([k,label])=><button key={k} className={view===k?'active':''} onClick={()=>setView(k)}>{label}</button>)}
   </div>

   <div className={`m-main-preview ${view}`}>
     {current?<img src={current} alt={view}/>:<div className="m-preview-placeholder"><ImageIcon/><span>{t('noImage')}</span></div>}
   </div>

   <div className="m-mini-comparison">
     <button className={view==='sketch'?'active':''} onClick={()=>setView('sketch')}>{processed.sketch&&<img src={processed.sketch}/>}<b>{t('sketch')}</b></button>
     <button className={view==='cartoon'?'active':''} onClick={()=>setView('cartoon')}>{processed.cartoon&&<img src={processed.cartoon}/>}<b>{t('cartoon')}</b></button>
   </div>

   <h3 className="m-section-title">{t('style')}</h3>
   <div className="m-style-segment">
     {['Sketch','Cartoon','Pop Art'].map(s=><button key={s} className={style===s?'active':''} onClick={()=>{setStyle(s);if(s==='Sketch')setView('sketch');else if(s==='Cartoon')setView('cartoon')}}>{styleLabel(s,t)}</button>)}
   </div>

   <div className="m-palette-head"><h3>{t('colorPalette')}</h3><div className="palette-count-control" style={{display:'flex',alignItems:'center',gap:8,fontSize:10,fontWeight:800}}><span>{t('numberOfColors')}</span><select style={{height:32,border:'1px solid #e4d9c9',borderRadius:9,background:'#fff',padding:'0 8px',fontWeight:800}} value={paletteCount} onChange={async e=>{const n=+e.target.value;setPaletteCount(n);if(preview)setProcessed(await processImage(preview,n))}}>{[6,8,10,12,16].map(n=><option key={n} value={n}>{n}</option>)}</select></div></div>
   <div className="m-numbered-palette">
     {processed.palette.map((c,i)=><div className="m-color-item" key={c}>
       <span className="m-color-number">{i+1}</span><i style={{background:c}}></i>
       <div><b>{t('color')} {i+1}</b><small>{c.toUpperCase()}</small></div>
     </div>)}
   </div>

   <button className="m-continue-tools" onClick={()=>continueToProjector(view)}>{t('continueTools')}</button>
 </div>
}

function FlowSteps({active,t}){
 const labels=[t('photo'),t('style'),t('preview'),t('save')]
 return <div className="flow-steps">{labels.map((l,i)=><div key={i} className={i<=active?'done':''}><span>{i<active?<Check size={15}/>:i+1}</span><b>{l}</b></div>)}</div>
}

function styleLabel(s,t){
 if(s==='Sketch')return t('sketch')
 if(s==='Cartoon')return t('cartoon')
 if(s==='Pop Art')return t('popArt')
 return s
}

function useMedia(query){
 const [matches,setMatches]=useState(()=>typeof window!=='undefined'&&window.matchMedia(query).matches)
 useEffect(()=>{
   const m=window.matchMedia(query),f=()=>setMatches(m.matches)
   f();m.addEventListener?.('change',f)
   return()=>m.removeEventListener?.('change',f)
 },[query])
 return matches
}

async function processImage(url,paletteCount=8){
 const img=await loadImage(url)
 const max=900
 const scale=Math.min(1,max/Math.max(img.width,img.height))
 const w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale))
 const base=document.createElement('canvas'); base.width=w;base.height=h
 const bctx=base.getContext('2d',{willReadFrequently:true})
 bctx.drawImage(img,0,0,w,h)
 const original=base.toDataURL('image/jpeg',.92)

 const source=bctx.getImageData(0,0,w,h)
 const palette=extractPalette(source.data,paletteCount)

 const cartoonCanvas=document.createElement('canvas');cartoonCanvas.width=w;cartoonCanvas.height=h
 const cctx=cartoonCanvas.getContext('2d')
 const cartoon=new ImageData(new Uint8ClampedArray(source.data),w,h)
 for(let i=0;i<cartoon.data.length;i+=4){
   const r=cartoon.data[i],g=cartoon.data[i+1],b=cartoon.data[i+2]
   const nearest=boostColor(nearestColor([r,g,b],palette.map(hexToRgb)))
   cartoon.data[i]=nearest[0];cartoon.data[i+1]=nearest[1];cartoon.data[i+2]=nearest[2]
 }
 cctx.putImageData(cartoon,0,0)
 cctx.globalAlpha=.16;cctx.drawImage(base,0,0);cctx.globalAlpha=1
 const cartoonUrl=cartoonCanvas.toDataURL('image/png')

 const sketchCanvas=document.createElement('canvas');sketchCanvas.width=w;sketchCanvas.height=h
 const sctx=sketchCanvas.getContext('2d')
 const sketch=new ImageData(w,h)
 const gray=new Float32Array(w*h)
 for(let p=0,i=0;p<gray.length;p++,i+=4) gray[p]=.299*source.data[i]+.587*source.data[i+1]+.114*source.data[i+2]
 for(let y=1;y<h-1;y++){
  for(let x=1;x<w-1;x++){
   const p=y*w+x
   const gx=-gray[p-w-1]-2*gray[p-1]-gray[p+w-1]+gray[p-w+1]+2*gray[p+1]+gray[p+w+1]
   const gy=-gray[p-w-1]-2*gray[p-w]-gray[p-w+1]+gray[p+w-1]+2*gray[p+w]+gray[p+w+1]
   const edge=Math.min(255,Math.hypot(gx,gy)*1.15)
   const v=edge>42?20:Math.max(224,255-edge*.35)
   const i=p*4; sketch.data[i]=v;sketch.data[i+1]=v;sketch.data[i+2]=v;sketch.data[i+3]=255
  }
 }
 sctx.fillStyle='#fff';sctx.fillRect(0,0,w,h);sctx.putImageData(sketch,0,0)
 const sketchUrl=sketchCanvas.toDataURL('image/png')

 return {original,sketch:sketchUrl,cartoon:cartoonUrl,palette}
}

function loadImage(url){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=url})}
function extractPalette(data,count){
 const buckets=new Map()
 const step=Math.max(2,Math.floor(data.length/(4*26000)))
 for(let p=0;p<data.length;p+=4*step){
  if(data[p+3]<220)continue
  const r=data[p],g=data[p+1],b=data[p+2]
  const max=Math.max(r,g,b),min=Math.min(r,g,b),light=(max+min)/510
  const sat=max===min?0:(max-min)/(255-Math.abs(max+min-255))
  if(light<.055||light>.965)continue
  const q=24
  const rr=Math.min(255,Math.round(r/q)*q),gg=Math.min(255,Math.round(g/q)*q),bb=Math.min(255,Math.round(b/q)*q)
  const key=`${rr},${gg},${bb}`
  const weight=.55+sat*1.7+(light>.2&&light<.82?.35:0)
  buckets.set(key,(buckets.get(key)||0)+weight)
 }
 const ranked=[...buckets.entries()].sort((a,b)=>b[1]-a[1]).map(([k,score])=>({rgb:k.split(',').map(Number),score}))
 const chosen=[]
 for(const item of ranked){
   if(chosen.every(c=>colorDistance(c.rgb,item.rgb)>52))chosen.push(item)
   if(chosen.length>=count)break
 }
 if(chosen.length<count){
   for(const item of ranked){
     if(!chosen.includes(item))chosen.push(item)
     if(chosen.length>=count)break
   }
 }
 return chosen.slice(0,count).map(x=>rgbToHex(...x.rgb))
}
function colorDistance(a,b){return Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2)}
function boostColor(rgb){
 const avg=(rgb[0]+rgb[1]+rgb[2])/3
 return rgb.map(v=>Math.max(0,Math.min(255,Math.round((avg+(v-avg)*1.12)*1.04+3))))
}
function nearestColor(rgb,palette){
 let best=palette[0]||rgb,dist=Infinity
 for(const c of palette){
  const d=(rgb[0]-c[0])**2+(rgb[1]-c[1])**2+(rgb[2]-c[2])**2
  if(d<dist){dist=d;best=c}
 }
 return best
}
function hexToRgb(h){h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
function rgbToHex(r,g,b){return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,v)).toString(16).padStart(2,'0')).join('')}
