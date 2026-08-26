import React,{useEffect,useMemo,useState} from 'react'
import {ArrowLeft,X,UploadCloud,Camera,Check,Palette,Image as ImageIcon} from 'lucide-react'
import {useNavigate} from 'react-router-dom'

export default function DesignStudio(){
 const nav=useNavigate()
 const isMobile=useMedia('(max-width: 760px)')
 const [step,setStep]=useState(0)
 const [file,setFile]=useState(null)
 const [preview,setPreview]=useState('')
 const [style,setStyle]=useState('Cartoon')
 const [processed,setProcessed]=useState({original:'',sketch:'',cartoon:'',palette:[]})

 async function pick(e){
  const f=e.target.files?.[0]
  if(!f)return
  setFile(f)
  const url=URL.createObjectURL(f)
  setPreview(url)
  if(isMobile){
    const result=await processImage(url)
    setProcessed(result)
  }
  setStep(1)
 }

 if(!isMobile){
   if(step===0) return <div className="mobile-flow-page exact-upload desktop-design-preserved">
     <div className="flow-top"><button onClick={()=>nav(-1)}><X/></button><h1>New Project</h1><button onClick={()=>nav(-1)}><X/></button></div>
     <FlowSteps active={0}/>
     <div className="upload-panel">
       <UploadCloud size={62}/>
       <h2>Upload Your Photo</h2><p>JPG, PNG up to 20MB</p>
       <label className="big-action teal">From Gallery<input type="file" accept="image/*" onChange={pick}/></label>
       <label className="big-action purple"><Camera/>Take Photo<input type="file" accept="image/*" capture="environment" onChange={pick}/></label>
     </div>
     <div className="tips-panel"><h3>💡 Tips for best results</h3><p>✧ Use clear, well-lit photos</p><p>☼ Front-facing works best</p><p>▣ High resolution is ideal</p></div>
   </div>

   return <div className="mobile-flow-page exact-preview desktop-design-preserved">
     <div className="flow-top"><button onClick={()=>setStep(0)}><ArrowLeft/></button><h1>Preview</h1><button onClick={()=>nav(-1)}><X/></button></div>
     <FlowSteps active={2}/>
     <div className="preview-pair">
       <div><div className="img-stage sketch-stage">{preview?<img src={preview}/>:<span>Sketch</span>}</div><b>Sketch</b></div>
       <div><div className="img-stage cartoon-stage">{preview?<img src={preview}/>:<span>Cartoon</span>}</div><b>Cartoon</b></div>
     </div>
     <h3 className="style-title">Style</h3>
     <div className="style-segment">{['Sketch','Cartoon','Pop Art'].map(s=><button className={style===s?'active':''} onClick={()=>setStyle(s)} key={s}>{s}</button>)}</div>
     <div className="palette-head"><h3>Color Palette</h3><button><Palette/></button></div>
     <div className="palette-dots">{['#30208f','#ff5b26','#ff8d22','#6243c7','#2c7ca9','#359647'].map(c=><span key={c} style={{background:c}}></span>)}<button>Customize</button></div>
     <button className="continue-tools" onClick={()=>nav('/projector')}>Continue to Tools</button>
   </div>
 }

 return <MobileDesignStudio
   nav={nav}
   step={step}
   setStep={setStep}
   pick={pick}
   processed={processed}
   style={style}
   setStyle={setStyle}
 />
}

function MobileDesignStudio({nav,step,setStep,pick,processed,style,setStyle}){
 const [view,setView]=useState('cartoon')
 if(step===0){
   return <div className="m-design-page">
     <div className="m-design-head"><button onClick={()=>nav(-1)}><ArrowLeft/></button><h1>New Project</h1><span/></div>
     <FlowSteps active={0}/>
     <div className="m-upload-card">
       <div className="m-upload-icon"><UploadCloud/></div>
       <h2>Upload Your Photo</h2>
       <p>JPG or PNG · clear photo works best</p>
       <label className="m-upload-primary">From Gallery<input type="file" accept="image/*" onChange={pick}/></label>
       <label className="m-upload-secondary"><Camera/>Take Photo<input type="file" accept="image/*" capture="environment" onChange={pick}/></label>
     </div>
     <div className="m-upload-tips">
       <b>Tips for best results</b>
       <span>• Use a clear, well-lit photo</span>
       <span>• Keep the subject centered</span>
       <span>• Higher resolution gives cleaner outlines</span>
     </div>
   </div>
 }

 const current=processed[view] || processed.original
 return <div className="m-design-page m-preview-page">
   <div className="m-design-head"><button onClick={()=>setStep(0)}><ArrowLeft/></button><h1>Preview</h1><button onClick={()=>nav(-1)}><X/></button></div>
   <FlowSteps active={2}/>

   <div className="m-preview-tabs">
     {[
       ['original','Original'],
       ['sketch','Sketch'],
       ['cartoon','Cartoon']
     ].map(([k,label])=><button key={k} className={view===k?'active':''} onClick={()=>setView(k)}>{label}</button>)}
   </div>

   <div className={`m-main-preview ${view}`}>
     {current?<img src={current} alt={view}/>:<div className="m-preview-placeholder"><ImageIcon/><span>No image</span></div>}
   </div>

   <div className="m-mini-comparison">
     <button className={view==='sketch'?'active':''} onClick={()=>setView('sketch')}>
       {processed.sketch&&<img src={processed.sketch}/>}<b>Sketch</b>
     </button>
     <button className={view==='cartoon'?'active':''} onClick={()=>setView('cartoon')}>
       {processed.cartoon&&<img src={processed.cartoon}/>}<b>Cartoon</b>
     </button>
   </div>

   <h3 className="m-section-title">Style</h3>
   <div className="m-style-segment">
     {['Sketch','Cartoon','Pop Art'].map(s=><button key={s} className={style===s?'active':''} onClick={()=>{setStyle(s); if(s==='Sketch')setView('sketch'); else if(s==='Cartoon')setView('cartoon')}}>{s}</button>)}
   </div>

   <div className="m-palette-head"><h3>Color Palette</h3><span>{processed.palette.length} colors</span></div>
   <div className="m-numbered-palette">
     {processed.palette.map((c,i)=><div className="m-color-item" key={c}>
       <span className="m-color-number">{i+1}</span>
       <i style={{background:c}}></i>
       <div><b>Color {i+1}</b><small>{c.toUpperCase()}</small></div>
     </div>)}
   </div>

   <button className="m-continue-tools" onClick={()=>nav('/projector')}>Continue to Tools</button>
 </div>
}

function FlowSteps({active}){
 const labels=['Photo','Style','Preview','Save']
 return <div className="flow-steps">{labels.map((l,i)=><div key={l} className={i<=active?'done':''}><span>{i<active?<Check size={15}/>:i+1}</span><b>{l}</b></div>)}</div>
}

function useMedia(query){
 const [matches,setMatches]=useState(()=>typeof window!=='undefined'&&window.matchMedia(query).matches)
 useEffect(()=>{
   const m=window.matchMedia(query)
   const f=()=>setMatches(m.matches)
   f()
   m.addEventListener?.('change',f)
   return()=>m.removeEventListener?.('change',f)
 },[query])
 return matches
}

async function processImage(url){
 const img=await loadImage(url)
 const max=900
 const scale=Math.min(1,max/Math.max(img.width,img.height))
 const w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale))
 const base=document.createElement('canvas'); base.width=w;base.height=h
 const bctx=base.getContext('2d',{willReadFrequently:true})
 bctx.drawImage(img,0,0,w,h)
 const original=base.toDataURL('image/jpeg',.92)

 const source=bctx.getImageData(0,0,w,h)
 const palette=extractPalette(source.data,6)

 const cartoonCanvas=document.createElement('canvas');cartoonCanvas.width=w;cartoonCanvas.height=h
 const cctx=cartoonCanvas.getContext('2d')
 const cartoon=new ImageData(new Uint8ClampedArray(source.data),w,h)
 for(let i=0;i<cartoon.data.length;i+=4){
   const r=cartoon.data[i],g=cartoon.data[i+1],b=cartoon.data[i+2]
   const nearest=nearestColor([r,g,b],palette.map(hexToRgb))
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
 const step=Math.max(4,Math.floor(data.length/(4*18000)))
 for(let p=0;p<data.length;p+=4*step){
  if(data[p+3]<200)continue
  const r=Math.round(data[p]/32)*32,g=Math.round(data[p+1]/32)*32,b=Math.round(data[p+2]/32)*32
  const key=`${Math.min(255,r)},${Math.min(255,g)},${Math.min(255,b)}`
  buckets.set(key,(buckets.get(key)||0)+1)
 }
 return [...buckets.entries()].sort((a,b)=>b[1]-a[1]).slice(0,count).map(([k])=>{
   const [r,g,b]=k.split(',').map(Number);return rgbToHex(r,g,b)
 })
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
