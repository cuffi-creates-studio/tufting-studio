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
 const [processed,setProcessed]=useState({original:'',sketch:'',cartoon:'',pop:'',palette:[]})
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
   const key=
     style==='Sketch' ? 'sketch' :
     style==='Pop Art' ? 'original' :
     style==='Cartoon' ? 'cartoon' :
     (view==='pop' ? 'original' : view)
   const image=processed[key]||processed.original||preview
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
       <div><div className="img-stage sketch-stage">{processed.sketch?<img src={processed.sketch} alt="Sketch"/>:preview?<img src={preview} alt="Original"/>:<span>{t('sketch')}</span>}</div><b>{t('sketch')}</b></div>
       <div><div className="img-stage cartoon-stage">{processed.cartoon?<img src={processed.cartoon} alt="Cartoon"/>:preview?<img src={preview} alt="Original"/>:<span>{t('cartoon')}</span>}</div><b>{t('cartoon')}</b></div>
     </div>
     <h3 className="style-title">{t('style')}</h3>
     <div className="style-segment">
       {['Sketch','Cartoon','Pop Art'].map(s=><button className={style===s?'active':''} onClick={()=>setStyle(s)} key={s}>{styleLabel(s,t)}</button>)}
     </div>
     <div className="palette-head"><h3>{t('colorPalette')}</h3><div style={{display:'flex',alignItems:'center',gap:8,fontSize:11,fontWeight:800}}><span>{t('numberOfColors')}</span><select style={{height:34,border:'1px solid #e4d9c9',borderRadius:10,background:'#fff',padding:'0 10px',fontWeight:800}} value={paletteCount} onChange={async e=>{const n=+e.target.value;setPaletteCount(n);if(preview)setProcessed(await processImage(preview,n))}}>{[6,8,10,12,16].map(n=><option key={n} value={n}>{n}</option>)}</select><button type="button"><Palette/></button></div></div>
     <div className="palette-dots">{processed.palette.map(c=><span key={c} style={{background:c}}></span>)}</div>
     <button className="continue-tools" onClick={()=>continueToProjector(style==='Pop Art'?'original':style==='Sketch'?'sketch':'cartoon')}>{t('continueTools')}</button>
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

 const current=view==='pop' ? processed.original : processed[view]
 return <div className="m-design-page m-preview-page">
   <div className="m-design-head"><button onClick={()=>setStep(0)}><ArrowLeft/></button><h1>{t('preview')}</h1><button onClick={()=>nav(-1)}><X/></button></div>
   <FlowSteps active={2} t={t}/>

   <div className="m-preview-tabs">
     {[['original',t('original')],['sketch',t('sketch')],['cartoon',t('cartoon')],['pop',t('popArt')]].map(([k,label])=><button key={k} className={view===k?'active':''} onClick={()=>setView(k)}>{label}</button>)}
   </div>

   <div className={`m-main-preview ${view}`}>
     {current?<img src={current} alt={view}/>:<div className="m-preview-placeholder"><ImageIcon/><span>{t('noImage')}</span></div>}
   </div>

   <div className="m-mini-comparison">
     {[
       ['sketch',processed.sketch,t('sketch')],
       ['cartoon',processed.cartoon,t('cartoon')],
       ['pop',processed.original,t('popArt')]
     ].map(([k,src,label])=><button key={k} className={view===k?'active':''} onClick={()=>setView(k)}>{src&&<img src={src} alt={label}/>}<b>{label}</b></button>)}
   </div>

   <h3 className="m-section-title">{t('style')}</h3>
   <div className="m-style-segment">
     {['Sketch','Cartoon','Pop Art'].map(s=><button key={s} className={style===s?'active':''} onClick={()=>{
       setStyle(s)
       if(s==='Sketch')setView('sketch')
       else if(s==='Cartoon')setView('cartoon')
       else setView('pop')
     }}>{styleLabel(s,t)}</button>)}
   </div>

   <div className="m-palette-head"><h3>{t('colorPalette')}</h3><div className="palette-count-control" style={{display:'flex',alignItems:'center',gap:8,fontSize:10,fontWeight:800}}><span>{t('numberOfColors')}</span><select style={{height:32,border:'1px solid #e4d9c9',borderRadius:9,background:'#fff',padding:'0 8px',fontWeight:800}} value={paletteCount} onChange={async e=>{const n=+e.target.value;setPaletteCount(n);if(preview)setProcessed(await processImage(preview,n))}}>{[6,8,10,12,16].map(n=><option key={n} value={n}>{n}</option>)}</select></div></div>
   <div className="m-numbered-palette">
     {processed.palette.map((c,i)=><div className="m-color-item" key={c+i}>
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
 const max=1200
 const scale=Math.min(1,max/Math.max(img.width,img.height))
 const w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale))

 const base=document.createElement('canvas')
 base.width=w
 base.height=h
 const bctx=base.getContext('2d',{willReadFrequently:true})
 bctx.drawImage(img,0,0,w,h)
 const source=bctx.getImageData(0,0,w,h)
 const original=base.toDataURL('image/jpeg',0.94)

 const paletteRgb=buildPalette(source.data,paletteCount)
 const palette=paletteRgb.map(([r,g,b])=>rgbToHex(r,g,b))

 const cartoonData=makeCartoonImage(source,paletteRgb)
 const cartoonCanvas=document.createElement('canvas')
 cartoonCanvas.width=w
 cartoonCanvas.height=h
 cartoonCanvas.getContext('2d').putImageData(cartoonData,0,0)
 const cartoon=cartoonCanvas.toDataURL('image/png')

 const sketchData=makeSketchImage(source)
 const sketchCanvas=document.createElement('canvas')
 sketchCanvas.width=w
 sketchCanvas.height=h
 sketchCanvas.getContext('2d').putImageData(sketchData,0,0)
 const sketch=sketchCanvas.toDataURL('image/png')

 return {original,sketch,cartoon,pop:original,palette}
}

function makeCartoonImage(source,palette){
 const w=source.width,h=source.height
 const blurred=boxBlur(source.data,w,h,2)
 const gray=toGray(blurred,w,h)
 const edges=sobel(gray,w,h)
 const avgEdge=edges.reduce((a,b)=>a+b,0)/Math.max(1,edges.length)
 const out=new ImageData(w,h)

 for(let p=0,i=0;p<w*h;p++,i+=4){
   const a=source.data[i+3]
   if(a<8){ out.data[i+3]=0; continue }
   const rgb=[blurred[i],blurred[i+1],blurred[i+2]]
   let [r,g,b]=nearestColor(rgb,palette)
   const edge=edges[p]
   if(edge>avgEdge*1.15){
     const dark=edge>avgEdge*1.9 ? 0.52 : 0.72
     r=Math.round(r*dark); g=Math.round(g*dark); b=Math.round(b*dark)
   }
   out.data[i]=r
   out.data[i+1]=g
   out.data[i+2]=b
   out.data[i+3]=255
 }
 return out
}

function makeSketchImage(source){
 const w=source.width,h=source.height
 const blurred=boxBlur(source.data,w,h,1)
 const gray=toGray(blurred,w,h)
 const soft=blurGray(gray,w,h,2)
 const strong=blurGray(gray,w,h,5)
 const edges=sobel(soft,w,h)
 const avgEdge=edges.reduce((a,b)=>a+b,0)/Math.max(1,edges.length)
 const out=new ImageData(w,h)

 for(let p=0,i=0;p<w*h;p++,i+=4){
   const edge=edges[p]
   const dog=Math.abs(soft[p]-strong[p])
   const lineStrength=edge*0.72 + dog*3.3
   let v=255
   if(lineStrength>avgEdge*1.45) v=0
   else if(lineStrength>avgEdge*1.05) v=55
   else if(lineStrength>avgEdge*0.78) v=135
   else {
     const shade=255-Math.max(0,(165-soft[p])*0.18)
     v=Math.max(232,Math.min(255,shade))
   }
   out.data[i]=v
   out.data[i+1]=v
   out.data[i+2]=v
   out.data[i+3]=255
 }
 return out
}

function buildPalette(data,count){
 const samples=[]
 const step=Math.max(4,Math.floor((data.length/4)/3800))
 for(let p=0;p<data.length;p+=4*step){
   const a=data[p+3]
   if(a<220)continue
   const r=data[p],g=data[p+1],b=data[p+2]
   const max=Math.max(r,g,b),min=Math.min(r,g,b)
   const light=(max+min)/2
   if(light<8||light>247)continue
   samples.push([r,g,b])
 }
 if(!samples.length)return [[0,0,0]]

 const centers=[]
 const jump=Math.max(1,Math.floor(samples.length/count))
 for(let i=0;i<count;i++)centers.push(samples[Math.min(samples.length-1,i*jump)].slice())

 for(let iter=0;iter<10;iter++){
   const sums=Array.from({length:centers.length},()=>[0,0,0,0])
   for(const s of samples){
     let best=0,bestD=Infinity
     for(let i=0;i<centers.length;i++){
       const c=centers[i]
       const d=(s[0]-c[0])**2+(s[1]-c[1])**2+(s[2]-c[2])**2
       if(d<bestD){bestD=d;best=i}
     }
     sums[best][0]+=s[0]; sums[best][1]+=s[1]; sums[best][2]+=s[2]; sums[best][3]++
   }
   for(let i=0;i<centers.length;i++){
     if(sums[i][3]) centers[i]=[
       Math.round(sums[i][0]/sums[i][3]),
       Math.round(sums[i][1]/sums[i][3]),
       Math.round(sums[i][2]/sums[i][3])
     ]
   }
 }

 const unique=[]
 for(const c of centers){
   if(unique.every(u=>distance(u,c)>28)) unique.push(c)
 }
 if(unique.length<count){
   for(const s of samples){
     if(unique.every(u=>distance(u,s)>34)) unique.push(s)
     if(unique.length>=count)break
   }
 }
 return unique.slice(0,count)
}

function boxBlur(data,w,h,radius=1){
 const src=new Uint8ClampedArray(data)
 let out=new Uint8ClampedArray(data.length)
 let tmp=src
 for(let pass=0;pass<2;pass++){
   for(let y=0;y<h;y++){
     for(let x=0;x<w;x++){
       let rr=0,gg=0,bb=0,aa=0,n=0
       for(let dy=-radius;dy<=radius;dy++){
         const yy=Math.max(0,Math.min(h-1,y+dy))
         for(let dx=-radius;dx<=radius;dx++){
           const xx=Math.max(0,Math.min(w-1,x+dx))
           const i=(yy*w+xx)*4
           rr+=tmp[i]; gg+=tmp[i+1]; bb+=tmp[i+2]; aa+=tmp[i+3]; n++
         }
       }
       const o=(y*w+x)*4
       out[o]=rr/n; out[o+1]=gg/n; out[o+2]=bb/n; out[o+3]=aa/n
     }
   }
   tmp=new Uint8ClampedArray(out)
 }
 return out
}

function toGray(data,w,h){
 const gray=new Float32Array(w*h)
 for(let p=0,i=0;p<gray.length;p++,i+=4) gray[p]=0.299*data[i]+0.587*data[i+1]+0.114*data[i+2]
 return gray
}

function blurGray(gray,w,h,radius=2){
 const out=new Float32Array(gray.length)
 for(let y=0;y<h;y++){
   for(let x=0;x<w;x++){
     let sum=0,n=0
     for(let dy=-radius;dy<=radius;dy++){
       const yy=Math.max(0,Math.min(h-1,y+dy))
       for(let dx=-radius;dx<=radius;dx++){
         const xx=Math.max(0,Math.min(w-1,x+dx))
         sum+=gray[yy*w+xx]
         n++
       }
     }
     out[y*w+x]=sum/n
   }
 }
 return out
}

function sobel(gray,w,h){
 const edges=new Float32Array(w*h)
 for(let y=1;y<h-1;y++){
   for(let x=1;x<w-1;x++){
     const p=y*w+x
     const gx=-gray[p-w-1]-2*gray[p-1]-gray[p+w-1]+gray[p-w+1]+2*gray[p+1]+gray[p+w+1]
     const gy=-gray[p-w-1]-2*gray[p-w]-gray[p-w+1]+gray[p+w-1]+2*gray[p+w]+gray[p+w+1]
     edges[p]=Math.min(255,Math.hypot(gx,gy))
   }
 }
 return edges
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

function distance(a,b){return Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2)}
function loadImage(url){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=url})}
function rgbToHex(r,g,b){return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')}
