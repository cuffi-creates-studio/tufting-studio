import React,{useEffect,useMemo,useRef,useState} from 'react'
import {ArrowLeft,X,UploadCloud,Camera,Check,Palette,Image as ImageIcon,SlidersHorizontal,ChevronRight} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import {useI18n} from '../i18n/I18n'

export default function DesignStudio(){
 const nav=useNavigate()
 const {t}=useI18n()
 const isMobile=useMedia('(max-width: 760px)')
 const [step,setStep]=useState(0)
 const [preview,setPreview]=useState('')
 const [style,setStyle]=useState('Cartoon')
 const [view,setView]=useState('cartoon')
 const [processed,setProcessed]=useState({original:'',sketch:'',cartoon:'',popArt:'',palette:[]})
 const [paletteCount,setPaletteCount]=useState(8)
 const [isProcessing,setIsProcessing]=useState(false)

 async function pick(e){
  const f=e.target.files?.[0]
  if(!f)return
  const url=URL.createObjectURL(f)
  setPreview(url)
  setIsProcessing(true)
  try{
    const result=await processImage(url,paletteCount)
    setProcessed(result)
    setStep(1)
    setView('cartoon')
    setStyle('Cartoon')
  }finally{
    setIsProcessing(false)
  }
 }

 async function regenerate(nextCount){
  setPaletteCount(nextCount)
  if(!preview)return
  setIsProcessing(true)
  try{
    const result=await processImage(preview,nextCount)
    setProcessed(result)
  }finally{
    setIsProcessing(false)
  }
 }

 const selectedKey=useMemo(()=>{
   if(style==='Sketch')return 'sketch'
   if(style==='Cartoon')return 'cartoon'
   if(style==='Pop Art')return 'popArt'
   return 'original'
 },[style])

 function continueToProjector(explicitView){
   const key=explicitView||selectedKey
   const image=processed[key]||processed.original||preview
   try{
     sessionStorage.setItem('tufting_projector_image',image||'')
     sessionStorage.setItem('tufting_projector_style',style)
     sessionStorage.setItem('tufting_projector_palette',JSON.stringify(processed.palette||[]))
   }catch(e){console.warn('Could not cache projector image',e)}
   nav('/projector')
 }

 useEffect(()=>()=>{if(preview?.startsWith('blob:')) URL.revokeObjectURL(preview)},[preview])

 if(isMobile){
   return <MobileDesignStudio nav={nav} step={step} setStep={setStep} pick={pick} preview={preview} processed={processed} setProcessed={setProcessed} style={style} setStyle={setStyle} paletteCount={paletteCount} setPaletteCount={setPaletteCount} continueToProjector={continueToProjector} t={t} isProcessing={isProcessing}/>
 }

 return <DesktopDesignStudio
   nav={nav}
   step={step}
   setStep={setStep}
   pick={pick}
   preview={preview}
   processed={processed}
   style={style}
   setStyle={setStyle}
   view={view}
   setView={setView}
   paletteCount={paletteCount}
   regenerate={regenerate}
   continueToProjector={continueToProjector}
   t={t}
   isProcessing={isProcessing}
 />
}

function DesktopDesignStudio({nav,step,setStep,pick,preview,processed,style,setStyle,view,setView,paletteCount,regenerate,continueToProjector,t,isProcessing}){
 const galleryInputRef=useRef(null)
 const cameraInputRef=useRef(null)
 const current=processed[view]||processed.original||preview
 return <div className="desktop-design-page">
   <div className="page-title desktop-design-header">
     <div>
       <h1>{t('newProject')}</h1>
       <p>{t('uploadPhoto')} · {t('style')} · {t('preview')} · {t('save')}</p>
     </div>
     <button className="btn outline-btn" type="button" onClick={()=>nav(-1)}><ArrowLeft size={18}/>{t('back')}</button>
   </div>

   <FlowSteps active={step===0?0:2} t={t}/>

   <div className="studio-layout desktop-studio-layout">
     <aside className="card studio-tools desktop-studio-tools">
       <div className="desktop-panel-title">
         <UploadCloud/>
         <div>
           <h3>{t('uploadPhoto')}</h3>
           <p>{t('photoFormats')}</p>
         </div>
       </div>

       <div className={`desktop-upload-drop ${preview?'has-preview':''}`}>
         <div className="desktop-upload-icon"><UploadCloud size={30}/></div>
         <strong>{preview?t('photo'):t('uploadPhoto')}</strong>
         <span>{preview?'Image ready for conversion':t('tipsBestResults')}</span>
         <div className="desktop-upload-actions">
           <button type="button" className="btn teal" onClick={()=>galleryInputRef.current?.click()}>{t('fromGallery')}</button>
           <button type="button" className="btn purple" onClick={()=>cameraInputRef.current?.click()}><Camera size={18}/>{t('takePhoto')}</button>
           <input ref={galleryInputRef} hidden type="file" accept="image/*" onChange={pick}/>
           <input ref={cameraInputRef} hidden type="file" accept="image/*" capture="environment" onChange={pick}/>
         </div>
       </div>

       <div className="desktop-style-card">
         <div className="desktop-panel-title compact">
           <SlidersHorizontal/>
           <div>
             <h3>{t('style')}</h3>
             <p>Select the result you want to send to Projector.</p>
           </div>
         </div>
         <div className="mode-buttons desktop-mode-buttons">
           {[
             ['Sketch','sketch',t('sketch')],
             ['Cartoon','cartoon',t('cartoon')],
             ['Pop Art','original',t('original')],
           ].map(([styleValue,viewValue,label])=>
             <button type="button" key={styleValue} className={style===styleValue?'active':''} onClick={()=>{setStyle(styleValue);setView(styleValue==='Pop Art'?'original':viewValue)}}>{label}</button>
           )}
         </div>
       </div>

       <label className="desktop-select-label">
         <span>{t('numberOfColors')}</span>
         <select value={paletteCount} onChange={e=>regenerate(+e.target.value)} disabled={!preview||isProcessing}>
           {[6,8,10,12,16].map(n=><option key={n} value={n}>{n}</option>)}
         </select>
       </label>

       <div className="card desktop-palette-card">
         <div className="palette-headline"><Palette size={18}/><strong>{t('colorPalette')}</strong></div>
         <div className="palette-row desktop-palette-row">
           {processed.palette?.length ? processed.palette.map((c,i)=><div className="palette-chip" key={c+i}><i style={{background:c}}/><span>{i+1}</span><small>{c.toUpperCase()}</small></div>) : <div className="empty-preview">{isProcessing?'Processing…':'Upload a photo to generate colors.'}</div>}
         </div>
       </div>

       <div className="card desktop-tips-card">
         <h3>{t('tipsBestResults')}</h3>
         <ul>
           <li>{t('tipClear')}</li>
           <li>{t('tipCentered')}</li>
           <li>{t('tipResolution')}</li>
         </ul>
       </div>

       <button type="button" className="btn primary-gradient desktop-continue-btn" disabled={!current||isProcessing} onClick={()=>continueToProjector(view==='original'?'popArt':view)}>
         {t('continueTools')} <ChevronRight size={18}/>
       </button>
     </aside>

     <section className="card studio-preview desktop-studio-preview">
       <div className="desktop-preview-head">
         <div>
           <h3>{t('preview')}</h3>
           <p>{isProcessing?'Processing image…':'Clean previews for tufting.'}</p>
         </div>
         <div className="desktop-preview-tabs">
           {[
             ['original',t('original')],
             ['sketch',t('sketch')],
             ['cartoon',t('cartoon')],
           ].map(([k,label])=>
             <button type="button" key={k} className={view===k?'active':''} onClick={()=>{setView(k); if(k==='sketch')setStyle('Sketch'); else if(k==='cartoon')setStyle('Cartoon'); else setStyle('Pop Art')}}>{label}</button>
           )}
         </div>
       </div>

       <div className="desktop-big-preview">
         {current ? <img src={current} alt={view}/> : <div className="empty-preview"><ImageIcon size={34}/><p>{t('noImage')}</p></div>}
       </div>

       <div className="preview-grid desktop-preview-grid">
         <button type="button" className={`preview-thumb ${view==='original'?'active':''}`} onClick={()=>{setView('original');setStyle('Pop Art')}}>
           <div>{processed.original?<img src={processed.original} alt="original"/>:<span>{t('original')}</span>}</div>
           <b>{t('original')}</b>
         </button>
         <button type="button" className={`preview-thumb ${view==='sketch'?'active':''}`} onClick={()=>{setView('sketch');setStyle('Sketch')}}>
           <div>{processed.sketch?<img src={processed.sketch} alt="sketch"/>:<span>{t('sketch')}</span>}</div>
           <b>{t('sketch')}</b>
         </button>
         <button type="button" className={`preview-thumb ${view==='cartoon'?'active':''}`} onClick={()=>{setView('cartoon');setStyle('Cartoon')}}>
           <div>{processed.cartoon?<img src={processed.cartoon} alt="cartoon"/>:<span>{t('cartoon')}</span>}</div>
           <b>{t('cartoon')}</b>
         </button>
       </div>
     </section>
   </div>
 </div>
}

function MobileDesignStudio({nav,step,setStep,pick,preview,processed,setProcessed,style,setStyle,paletteCount,setPaletteCount,continueToProjector,t,isProcessing}){
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
     {['Sketch','Cartoon','Pop Art'].map(s=><button key={s} className={style===s?'active':''} onClick={()=>{setStyle(s);if(s==='Sketch')setView('sketch');else if(s==='Cartoon')setView('cartoon');else setView('original')}}>{styleLabel(s,t)}</button>)}
   </div>

   <div className="m-palette-head"><h3>{t('colorPalette')}</h3><div className="palette-count-control" style={{display:'flex',alignItems:'center',gap:8,fontSize:10,fontWeight:800}}><span>{t('numberOfColors')}</span><select style={{height:32,border:'1px solid #e4d9c9',borderRadius:9,background:'#fff',padding:'0 8px',fontWeight:800}} value={paletteCount} onChange={async e=>{const n=+e.target.value;setPaletteCount(n);if(preview){setProcessed(await processImage(preview,n))}}} disabled={isProcessing}>{[6,8,10,12,16].map(n=><option key={n} value={n}>{n}</option>)}</select></div></div>
   <div className="m-numbered-palette">
     {processed.palette.map((c,i)=><div className="m-color-item" key={c}>
       <span className="m-color-number">{i+1}</span><i style={{background:c}}></i>
       <div><b>{t('color')} {i+1}</b><small>{c.toUpperCase()}</small></div>
     </div>)}
   </div>

   <button className="m-continue-tools" onClick={()=>continueToProjector(view==='original'?'popArt':view)} disabled={isProcessing}>{t('continueTools')}</button>
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
 const max=1280
 const scale=Math.min(1,max/Math.max(img.width,img.height))
 const w=Math.max(1,Math.round(img.width*scale))
 const h=Math.max(1,Math.round(img.height*scale))

 const base=document.createElement('canvas')
 base.width=w
 base.height=h
 const bctx=base.getContext('2d',{willReadFrequently:true})
 bctx.drawImage(img,0,0,w,h)
 const src=bctx.getImageData(0,0,w,h)
 const source=new Uint8ClampedArray(src.data)

 const original=base.toDataURL('image/jpeg',0.96)

 const smooth=boxBlurRGBA(source,w,h,2,2)
 const palette=extractPaletteKMeans(smooth,paletteCount)
 const paletteRgb=palette.map(hexToRgb)

 const cartoonData=makeCartoon(source,smooth,w,h,paletteRgb)
 const cartoonCanvas=document.createElement('canvas')
 cartoonCanvas.width=w
 cartoonCanvas.height=h
 cartoonCanvas.getContext('2d').putImageData(new ImageData(cartoonData,w,h),0,0)
 const cartoon=cartoonCanvas.toDataURL('image/png')

 const sketchData=makeProfessionalSketch(source,w,h)
 const sketchCanvas=document.createElement('canvas')
 sketchCanvas.width=w
 sketchCanvas.height=h
 sketchCanvas.getContext('2d').putImageData(new ImageData(sketchData,w,h),0,0)
 const sketch=sketchCanvas.toDataURL('image/png')

 return {original,sketch,cartoon,popArt:original,palette}
}

function loadImage(url){
 return new Promise((resolve,reject)=>{
   const i=new Image()
   i.decoding='async'
   i.onload=()=>resolve(i)
   i.onerror=reject
   i.src=url
 })
}

function makeCartoon(source,smooth,w,h,palette){
 const edges=makeEdgeMap(smooth,w,h)
 const out=new Uint8ClampedArray(source.length)

 for(let i=0,p=0;i<source.length;i+=4,p++){
   const enhanced=enhanceForCartoon(source[i],source[i+1],source[i+2])
   const nearest=nearestColor(enhanced,palette)

   let r=mix(nearest[0],enhanced[0],0.22)
   let g=mix(nearest[1],enhanced[1],0.22)
   let b=mix(nearest[2],enhanced[2],0.22)

   const e=edges[p]
   if(e>0.14){
     const edgeStrength=Math.min(0.78,Math.pow((e-0.14)/0.86,0.92))
     const darken=1-edgeStrength*0.92
     r*=darken
     g*=darken
     b*=darken
   }

   out[i]=clamp255(r)
   out[i+1]=clamp255(g)
   out[i+2]=clamp255(b)
   out[i+3]=255
 }

 return out
}

function makeProfessionalSketch(source,w,h){
 const gray=toGray(source)
 const softGray=boxBlurGray(gray,w,h,1,1)
 const inverted=new Float32Array(gray.length)
 for(let i=0;i<gray.length;i++) inverted[i]=255-softGray[i]
 const blurredInv=boxBlurGray(inverted,w,h,8,1)
 const edges=makeEdgeMapFromGray(softGray,w,h)

 const out=new Uint8ClampedArray(source.length)
 for(let p=0,i=0;p<gray.length;p++,i+=4){
   const dodge=Math.min(255,(softGray[p]*255)/Math.max(18,255-blurredInv[p]))
   const edge=Math.max(0,(edges[p]-0.10)/0.68)
   const line=Math.pow(clamp01(edge),0.75)
   const shadow=Math.max(0,(145-softGray[p])/145)
   let value=Math.min(dodge,255-line*235-shadow*18)

   if(value>245) value=255
   else if(value>232) value=242+(value-232)*0.55
   else if(value<32) value=24

   out[i]=value
   out[i+1]=value
   out[i+2]=value
   out[i+3]=255
 }

 return out
}

function toGray(data){
 const gray=new Float32Array(data.length/4)
 for(let p=0,i=0;p<gray.length;p++,i+=4){
   gray[p]=0.299*data[i]+0.587*data[i+1]+0.114*data[i+2]
 }
 return gray
}

function boxBlurRGBA(data,w,h,radius=1,passes=1){
 let src=new Uint8ClampedArray(data)
 for(let pass=0;pass<passes;pass++){
   src=boxBlurRGBAOnce(src,w,h,radius)
 }
 return src
}

function boxBlurRGBAOnce(data,w,h,radius){
 const tmp=new Float32Array(data.length)
 const out=new Uint8ClampedArray(data.length)
 const span=radius*2+1

 for(let y=0;y<h;y++){
   let r=0,g=0,b=0,a=0
   for(let dx=-radius;dx<=radius;dx++){
     const xx=Math.max(0,Math.min(w-1,dx))
     const idx=(y*w+xx)*4
     r+=data[idx]; g+=data[idx+1]; b+=data[idx+2]; a+=data[idx+3]
   }
   for(let x=0;x<w;x++){
     const o=(y*w+x)*4
     tmp[o]=r/span; tmp[o+1]=g/span; tmp[o+2]=b/span; tmp[o+3]=a/span
     const removeX=Math.max(0,Math.min(w-1,x-radius))
     const addX=Math.max(0,Math.min(w-1,x+radius+1))
     const ri=(y*w+removeX)*4
     const ai=(y*w+addX)*4
     r+=data[ai]-data[ri]
     g+=data[ai+1]-data[ri+1]
     b+=data[ai+2]-data[ri+2]
     a+=data[ai+3]-data[ri+3]
   }
 }

 for(let x=0;x<w;x++){
   let r=0,g=0,b=0,a=0
   for(let dy=-radius;dy<=radius;dy++){
     const yy=Math.max(0,Math.min(h-1,dy))
     const idx=(yy*w+x)*4
     r+=tmp[idx]; g+=tmp[idx+1]; b+=tmp[idx+2]; a+=tmp[idx+3]
   }
   for(let y=0;y<h;y++){
     const o=(y*w+x)*4
     out[o]=clamp255(r/span); out[o+1]=clamp255(g/span); out[o+2]=clamp255(b/span); out[o+3]=clamp255(a/span)
     const removeY=Math.max(0,Math.min(h-1,y-radius))
     const addY=Math.max(0,Math.min(h-1,y+radius+1))
     const ri=(removeY*w+x)*4
     const ai=(addY*w+x)*4
     r+=tmp[ai]-tmp[ri]
     g+=tmp[ai+1]-tmp[ri+1]
     b+=tmp[ai+2]-tmp[ri+2]
     a+=tmp[ai+3]-tmp[ri+3]
   }
 }

 return out
}

function boxBlurGray(data,w,h,radius=1,passes=1){
 let src=data instanceof Float32Array ? new Float32Array(data) : Float32Array.from(data)
 for(let pass=0;pass<passes;pass++) src=boxBlurGrayOnce(src,w,h,radius)
 return src
}

function boxBlurGrayOnce(data,w,h,radius){
 const tmp=new Float32Array(w*h)
 const out=new Float32Array(w*h)
 const span=radius*2+1

 for(let y=0;y<h;y++){
   let sum=0
   for(let dx=-radius;dx<=radius;dx++){
     const xx=Math.max(0,Math.min(w-1,dx))
     sum+=data[y*w+xx]
   }
   for(let x=0;x<w;x++){
     tmp[y*w+x]=sum/span
     const removeX=Math.max(0,Math.min(w-1,x-radius))
     const addX=Math.max(0,Math.min(w-1,x+radius+1))
     sum+=data[y*w+addX]-data[y*w+removeX]
   }
 }

 for(let x=0;x<w;x++){
   let sum=0
   for(let dy=-radius;dy<=radius;dy++){
     const yy=Math.max(0,Math.min(h-1,dy))
     sum+=tmp[yy*w+x]
   }
   for(let y=0;y<h;y++){
     out[y*w+x]=sum/span
     const removeY=Math.max(0,Math.min(h-1,y-radius))
     const addY=Math.max(0,Math.min(h-1,y+radius+1))
     sum+=tmp[addY*w+x]-tmp[removeY*w+x]
   }
 }

 return out
}

function makeEdgeMap(data,w,h){
 return makeEdgeMapFromGray(toGray(data),w,h)
}

function makeEdgeMapFromGray(gray,w,h){
 const edges=new Float32Array(w*h)
 for(let y=1;y<h-1;y++){
   for(let x=1;x<w-1;x++){
     const p=y*w+x
     const gx=-gray[p-w-1]-2*gray[p-1]-gray[p+w-1]+gray[p-w+1]+2*gray[p+1]+gray[p+w+1]
     const gy=-gray[p-w-1]-2*gray[p-w]-gray[p-w+1]+gray[p+w-1]+2*gray[p+w]+gray[p+w+1]
     edges[p]=Math.min(1,Math.hypot(gx,gy)/255)
   }
 }
 return edges
}

function enhanceForCartoon(r,g,b){
 let [h,s,l]=rgbToHsl(r,g,b)
 s=Math.min(1,s*1.08+0.02)
 l=clamp01((l-0.5)*1.04+0.5)
 const [rr,gg,bb]=hslToRgb(h,s,l)
 return [rr,gg,bb]
}

function extractPaletteKMeans(data,count){
 const samples=[]
 const total=data.length/4
 const step=Math.max(1,Math.floor(total/7000))
 for(let p=0;p<total;p+=step){
   const i=p*4
   if(data[i+3]<220) continue
   const r=data[i],g=data[i+1],b=data[i+2]
   const max=Math.max(r,g,b),min=Math.min(r,g,b)
   const light=(max+min)/510
   if(light<0.02||light>0.98) continue
   samples.push([r,g,b])
 }

 if(!samples.length) return ['#111111','#ffffff'].slice(0,count)

 const centroids=[]
 centroids.push(samples[Math.floor(samples.length*0.15)]?.slice()||samples[0].slice())
 while(centroids.length<count){
   let bestSample=samples[0]
   let bestDistance=-1
   for(const s of samples){
     const nearest=nearestColor(s,centroids)
     const d=colorDistance(s,nearest)
     if(d>bestDistance){bestDistance=d;bestSample=s}
   }
   centroids.push(bestSample.slice())
 }

 for(let iter=0;iter<12;iter++){
   const sums=Array.from({length:count},()=>[0,0,0,0])
   for(const s of samples){
     let best=0,bestD=Infinity
     for(let i=0;i<count;i++){
       const c=centroids[i]
       const d=(s[0]-c[0])**2+(s[1]-c[1])**2+(s[2]-c[2])**2
       if(d<bestD){bestD=d;best=i}
     }
     sums[best][0]+=s[0]
     sums[best][1]+=s[1]
     sums[best][2]+=s[2]
     sums[best][3]++
   }
   for(let i=0;i<count;i++){
     if(sums[i][3]) centroids[i]=[
       Math.round(sums[i][0]/sums[i][3]),
       Math.round(sums[i][1]/sums[i][3]),
       Math.round(sums[i][2]/sums[i][3])
     ]
   }
 }

 const uniq=[]
 for(const c of centroids.sort((a,b)=>luminance(b)-luminance(a))){
   if(uniq.every(u=>colorDistance(u,c)>26)) uniq.push(c)
 }
 while(uniq.length<count){
   uniq.push(uniq[uniq.length-1]||samples[0])
 }
 return uniq.slice(0,count).map(([r,g,b])=>rgbToHex(r,g,b))
}

function nearestColor(rgb,palette){
 let best=palette[0]||rgb
 let dist=Infinity
 for(const c of palette){
  const d=(rgb[0]-c[0])**2+(rgb[1]-c[1])**2+(rgb[2]-c[2])**2
  if(d<dist){dist=d;best=c}
 }
 return best
}

function luminance(rgb){
 return 0.2126*rgb[0]+0.7152*rgb[1]+0.0722*rgb[2]
}
function colorDistance(a,b){
 return Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2)
}
function mix(a,b,t){return a*(1-t)+b*t}
function clamp01(v){return Math.max(0,Math.min(1,v))}
function clamp255(v){return Math.max(0,Math.min(255,Math.round(v)))}
function hexToRgb(h){
 h=h.replace('#','')
 return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]
}
function rgbToHex(r,g,b){
 return '#'+[r,g,b].map(v=>clamp255(v).toString(16).padStart(2,'0')).join('')
}

function rgbToHsl(r,g,b){
 r/=255; g/=255; b/=255
 const max=Math.max(r,g,b), min=Math.min(r,g,b)
 let h, s
 const l=(max+min)/2
 if(max===min){
   h=s=0
 }else{
   const d=max-min
   s=l>0.5 ? d/(2-max-min) : d/(max+min)
   switch(max){
     case r: h=(g-b)/d + (g<b?6:0); break
     case g: h=(b-r)/d + 2; break
     default: h=(r-g)/d + 4; break
   }
   h/=6
 }
 return [h,s||0,l]
}

function hslToRgb(h,s,l){
 if(s===0){
   const v=clamp255(l*255)
   return [v,v,v]
 }
 const hue2rgb=(p,q,t)=>{
   if(t<0) t+=1
   if(t>1) t-=1
   if(t<1/6) return p+(q-p)*6*t
   if(t<1/2) return q
   if(t<2/3) return p+(q-p)*(2/3-t)*6
   return p
 }
 const q=l<0.5 ? l*(1+s) : l+s-l*s
 const p=2*l-q
 return [
   clamp255(hue2rgb(p,q,h+1/3)*255),
   clamp255(hue2rgb(p,q,h)*255),
   clamp255(hue2rgb(p,q,h-1/3)*255),
 ]
}
