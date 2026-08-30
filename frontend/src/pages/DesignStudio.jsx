import React,{useEffect,useRef,useState} from 'react'
import {ArrowLeft,UploadCloud,Camera,Check,Image as ImageIcon,Palette,ChevronRight,RefreshCw} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import {useI18n} from '../i18n/I18n'

export default function DesignStudio(){
  const nav=useNavigate()
  const {t}=useI18n()
  const isMobile=useMedia('(max-width: 760px)')
  const [step,setStep]=useState(0)
  const [preview,setPreview]=useState('')
  const [processed,setProcessed]=useState({original:'',sketch:'',cartoon:'',popArt:'',palette:[]})
  const [view,setView]=useState('cartoon')
  const [style,setStyle]=useState('Cartoon')
  const [paletteCount,setPaletteCount]=useState(8)
  const [busy,setBusy]=useState(false)
  const galleryRef=useRef(null)
  const cameraRef=useRef(null)

  async function pick(e){
    const file=e.target.files?.[0]
    if(!file)return
    const url=URL.createObjectURL(file)
    setPreview(url)
    setBusy(true)
    try{
      const result=await processImage(url,paletteCount)
      setProcessed(result)
      setView('cartoon')
      setStyle('Cartoon')
      setStep(1)
    }finally{
      setBusy(false)
    }
  }

  async function changePaletteCount(n){
    setPaletteCount(n)
    if(!preview)return
    setBusy(true)
    try{ setProcessed(await processImage(preview,n)) }
    finally{ setBusy(false) }
  }

  function selectView(next){
    setView(next)
    if(next==='sketch')setStyle('Sketch')
    else if(next==='cartoon')setStyle('Cartoon')
    else setStyle('Pop Art')
  }

  function sendToProjector(){
    const key=style==='Sketch'?'sketch':style==='Cartoon'?'cartoon':'original'
    const image=processed[key]||processed.original||preview
    try{
      sessionStorage.setItem('tufting_projector_image',image||'')
      sessionStorage.setItem('tufting_projector_style',style)
      sessionStorage.setItem('tufting_projector_palette',JSON.stringify(processed.palette||[]))
    }catch(e){console.warn(e)}
    nav('/projector')
  }

  useEffect(()=>()=>{
    if(preview?.startsWith('blob:'))URL.revokeObjectURL(preview)
  },[preview])

  return <>
    <DesignStyles/>
    {isMobile
      ? <MobileStudio {...{t,nav,step,setStep,preview,processed,view,selectView,style,setStyle,paletteCount,changePaletteCount,busy,pick,galleryRef,cameraRef,sendToProjector}}/>
      : <DesktopStudio {...{t,nav,step,setStep,preview,processed,view,selectView,style,setStyle,paletteCount,changePaletteCount,busy,pick,galleryRef,cameraRef,sendToProjector}}/>
    }
  </>
}

function DesktopStudio({t,nav,step,setStep,preview,processed,view,selectView,style,setStyle,paletteCount,changePaletteCount,busy,pick,galleryRef,cameraRef,sendToProjector}){
  if(step===0){
    return <div className="ds-desktop ds-upload-screen">
      <header className="ds-head">
        <button className="ds-back" onClick={()=>nav(-1)}><ArrowLeft/></button>
        <div><h1>{t('newProject')}</h1><p>{t('photoFormats')}</p></div>
      </header>
      <FlowSteps active={0} t={t}/>
      <section className="ds-upload-card">
        <div className="ds-upload-mark"><UploadCloud/></div>
        <h2>{t('uploadPhoto')}</h2>
        <p>{t('tipsBestResults')}</p>
        <div className="ds-upload-buttons">
          <button className="ds-btn ds-pink" onClick={()=>galleryRef.current?.click()}><ImageIcon/>{t('fromGallery')}</button>
          <button className="ds-btn ds-teal" onClick={()=>cameraRef.current?.click()}><Camera/>{t('takePhoto')}</button>
        </div>
        <input ref={galleryRef} hidden type="file" accept="image/*" onChange={pick}/>
        <input ref={cameraRef} hidden type="file" accept="image/*" capture="environment" onChange={pick}/>
      </section>
      <section className="ds-tip-grid">
        <div><b>01</b><span>{t('tipClear')}</span></div>
        <div><b>02</b><span>{t('tipCentered')}</span></div>
        <div><b>03</b><span>{t('tipResolution')}</span></div>
      </section>
    </div>
  }

  const current=processed[view]||processed.original||preview
  return <div className="ds-desktop ds-preview-screen">
    <header className="ds-head">
      <button className="ds-back" onClick={()=>setStep(0)}><ArrowLeft/></button>
      <div><h1>{t('preview')}</h1><p>Tufting-ready image conversion</p></div>
      <button className="ds-soft-btn" onClick={()=>setStep(0)}><RefreshCw/> {t('photo')}</button>
    </header>

    <FlowSteps active={2} t={t}/>

    <div className="ds-workspace">
      <aside className="ds-toolbox">
        <section className="ds-panel ds-style-panel">
          <div className="ds-panel-title"><span className="ds-icon violet">✦</span><div><h3>{t('style')}</h3><p>Zgjidh rezultatin për tufting</p></div></div>
          <div className="ds-style-buttons">
            <button className={style==='Sketch'?'active sketch':''} onClick={()=>{setStyle('Sketch');selectView('sketch')}}>{t('sketch')}</button>
            <button className={style==='Cartoon'?'active cartoon':''} onClick={()=>{setStyle('Cartoon');selectView('cartoon')}}>{t('cartoon')}</button>
            <button className={style==='Pop Art'?'active original':''} onClick={()=>{setStyle('Pop Art');selectView('original')}}>{t('original')}</button>
          </div>
        </section>

        <section className="ds-panel">
          <div className="ds-panel-title"><span className="ds-icon gold"><Palette/></span><div><h3>{t('colorPalette')}</h3><p>Ngjyrat merren nga fotoja origjinale</p></div></div>
          <label className="ds-color-count"><span>{t('numberOfColors')}</span><select value={paletteCount} onChange={e=>changePaletteCount(+e.target.value)} disabled={busy}>{[6,8,10,12,16].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
          <div className="ds-palette-list">
            {processed.palette.map((c,i)=><div className="ds-color-row" key={`${c}-${i}`}><i style={{background:c}}/><b>{i+1}</b><span>{c.toUpperCase()}</span></div>)}
          </div>
        </section>

        <button className="ds-btn ds-purple ds-continue" onClick={sendToProjector} disabled={busy||!current}>{t('continueTools')}<ChevronRight/></button>
      </aside>

      <main className="ds-preview-area">
        <div className="ds-tabs">
          <button className={view==='original'?'active original':''} onClick={()=>selectView('original')}>{t('original')}</button>
          <button className={view==='sketch'?'active sketch':''} onClick={()=>selectView('sketch')}>{t('sketch')}</button>
          <button className={view==='cartoon'?'active cartoon':''} onClick={()=>selectView('cartoon')}>{t('cartoon')}</button>
        </div>

        <div className={`ds-main-image ${busy?'loading':''}`}>
          {current?<img src={current} alt={view}/>:<div className="ds-empty"><ImageIcon/><span>{t('noImage')}</span></div>}
          {busy&&<div className="ds-processing">Duke përpunuar foton…</div>}
        </div>

        <div className="ds-thumbs">
          <PreviewThumb label={t('original')} src={processed.original} active={view==='original'} tone="original" onClick={()=>selectView('original')}/>
          <PreviewThumb label={t('sketch')} src={processed.sketch} active={view==='sketch'} tone="sketch" onClick={()=>selectView('sketch')}/>
          <PreviewThumb label={t('cartoon')} src={processed.cartoon} active={view==='cartoon'} tone="cartoon" onClick={()=>selectView('cartoon')}/>
        </div>
      </main>
    </div>
  </div>
}

function MobileStudio({t,nav,step,setStep,preview,processed,view,selectView,style,setStyle,paletteCount,changePaletteCount,busy,pick,galleryRef,cameraRef,sendToProjector}){
  if(step===0){
    return <div className="ds-mobile">
      <header className="ds-mobile-head"><button onClick={()=>nav(-1)}><ArrowLeft/></button><h1>{t('newProject')}</h1><span/></header>
      <FlowSteps active={0} t={t}/>
      <section className="ds-mobile-upload">
        <div className="ds-upload-mark"><UploadCloud/></div>
        <h2>{t('uploadPhoto')}</h2>
        <p>{t('photoFormatsMobile')}</p>
        <button className="ds-btn ds-pink" onClick={()=>galleryRef.current?.click()}><ImageIcon/>{t('fromGallery')}</button>
        <button className="ds-btn ds-teal" onClick={()=>cameraRef.current?.click()}><Camera/>{t('takePhoto')}</button>
        <input ref={galleryRef} hidden type="file" accept="image/*" onChange={pick}/>
        <input ref={cameraRef} hidden type="file" accept="image/*" capture="environment" onChange={pick}/>
      </section>
      <section className="ds-mobile-tips"><b>{t('tipsBestResults')}</b><span>• {t('tipClear')}</span><span>• {t('tipCentered')}</span><span>• {t('tipResolution')}</span></section>
    </div>
  }

  const current=processed[view]||processed.original||preview
  return <div className="ds-mobile ds-mobile-preview">
    <header className="ds-mobile-head"><button onClick={()=>setStep(0)}><ArrowLeft/></button><h1>{t('preview')}</h1><span/></header>
    <FlowSteps active={2} t={t}/>

    <div className="ds-tabs ds-tabs-mobile">
      <button className={view==='original'?'active original':''} onClick={()=>selectView('original')}>{t('original')}</button>
      <button className={view==='sketch'?'active sketch':''} onClick={()=>selectView('sketch')}>{t('sketch')}</button>
      <button className={view==='cartoon'?'active cartoon':''} onClick={()=>selectView('cartoon')}>{t('cartoon')}</button>
    </div>

    <div className="ds-mobile-image">
      {current?<img src={current} alt={view}/>:<div className="ds-empty"><ImageIcon/><span>{t('noImage')}</span></div>}
      {busy&&<div className="ds-processing">Duke përpunuar…</div>}
    </div>

    <h3 className="ds-mobile-section">{t('style')}</h3>
    <div className="ds-mobile-style">
      <button className={style==='Sketch'?'active sketch':''} onClick={()=>{setStyle('Sketch');selectView('sketch')}}>{t('sketch')}</button>
      <button className={style==='Cartoon'?'active cartoon':''} onClick={()=>{setStyle('Cartoon');selectView('cartoon')}}>{t('cartoon')}</button>
      <button className={style==='Pop Art'?'active original':''} onClick={()=>{setStyle('Pop Art');selectView('original')}}>{t('original')}</button>
    </div>

    <div className="ds-mobile-palette-head"><h3>{t('colorPalette')}</h3><select value={paletteCount} onChange={e=>changePaletteCount(+e.target.value)} disabled={busy}>{[6,8,10,12,16].map(n=><option key={n} value={n}>{n}</option>)}</select></div>
    <div className="ds-mobile-colors">{processed.palette.map((c,i)=><div key={`${c}-${i}`}><i style={{background:c}}/><b>{i+1}</b></div>)}</div>

    <button className="ds-btn ds-purple ds-mobile-continue" onClick={sendToProjector} disabled={busy||!current}>{t('continueTools')}<ChevronRight/></button>
  </div>
}

function PreviewThumb({label,src,active,tone,onClick}){
  return <button className={`ds-thumb ${active?'active':''} ${tone}`} onClick={onClick}><div>{src?<img src={src} alt={label}/>:<ImageIcon/>}</div><b>{label}</b></button>
}

function FlowSteps({active,t}){
  const labels=[t('photo'),t('style'),t('preview'),t('save')]
  return <div className="ds-flow">{labels.map((label,i)=><div key={i} className={i<=active?'done':''}><span>{i<active?<Check/>:i+1}</span><b>{label}</b></div>)}</div>
}

function DesignStyles(){
 return <style>{`
  .ds-desktop{max-width:1220px;margin:0 auto;padding:4px 0 28px;color:#172033}.ds-head{display:grid;grid-template-columns:50px 1fr auto;align-items:center;gap:14px;margin-bottom:12px}.ds-head h1{margin:0;font-size:30px}.ds-head p{margin:4px 0 0;color:#7b746c}.ds-back{width:46px;height:46px;border:1px solid #e8d9c7;border-radius:15px;background:#fffaf2;color:#172033;display:grid;place-items:center}.ds-soft-btn{border:1px solid #e6d6c2;background:#fffaf2;border-radius:13px;min-height:44px;padding:0 14px;display:flex;align-items:center;gap:8px;font-weight:800;color:#5a5047}
  .ds-flow{position:relative;display:grid;grid-template-columns:repeat(4,1fr);max-width:720px;margin:12px auto 24px}.ds-flow:before{content:"";position:absolute;left:10%;right:10%;top:18px;height:3px;background:#eadfce;border-radius:99px}.ds-flow>div{position:relative;z-index:1;text-align:center}.ds-flow span{width:38px;height:38px;margin:0 auto 6px;border-radius:50%;display:grid;place-items:center;background:#efe6da;color:#7e756b;font-weight:900;border:3px solid #fff8ea}.ds-flow span svg{width:18px}.ds-flow b{font-size:12px;color:#837970}.ds-flow .done span{background:#78bdb1;color:#fff}.ds-flow .done b{color:#317f76}
  .ds-upload-screen{padding-top:8px}.ds-upload-card{width:min(760px,100%);margin:0 auto;border:2px dashed #e99aaa;border-radius:28px;background:linear-gradient(145deg,#fffdf8,#fff4ec);padding:48px 38px;text-align:center;box-shadow:0 18px 50px rgba(61,42,23,.07)}.ds-upload-mark{width:76px;height:76px;margin:0 auto 16px;border-radius:22px;background:#ffe3e8;color:#bd586c;display:grid;place-items:center}.ds-upload-mark svg{width:38px;height:38px}.ds-upload-card h2{font-size:30px;margin:0 0 7px}.ds-upload-card p{margin:0;color:#7b746c}.ds-upload-buttons{display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:560px;margin:28px auto 0}.ds-btn{border:0;border-radius:15px;min-height:54px;padding:0 18px;display:flex;align-items:center;justify-content:center;gap:9px;font-weight:900;font-size:15px}.ds-btn svg{width:21px}.ds-pink{background:#eaa0ae;color:#6f3341}.ds-teal{background:#8cc8bd;color:#245c55}.ds-purple{background:#a68ad0;color:#fff}.ds-tip-grid{width:min(760px,100%);margin:16px auto 0;display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.ds-tip-grid div{background:#fff9ee;border:1px solid #eadbc8;border-radius:18px;padding:15px;display:flex;align-items:center;gap:10px}.ds-tip-grid b{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#f4cf83;color:#694b11}.ds-tip-grid span{font-size:13px;color:#645d55}
  .ds-workspace{display:grid;grid-template-columns:310px minmax(0,1fr);gap:18px;align-items:start}.ds-toolbox{display:grid;gap:14px}.ds-panel{border:1px solid #e9dac8;border-radius:20px;background:#fffaf2;padding:16px;box-shadow:0 10px 28px rgba(61,42,23,.05)}.ds-panel-title{display:flex;align-items:flex-start;gap:10px}.ds-panel-title h3{margin:0;font-size:17px}.ds-panel-title p{margin:3px 0 0;color:#7b746c;font-size:12px;line-height:1.4}.ds-icon{width:38px;height:38px;flex:0 0 38px;border-radius:12px;display:grid;place-items:center;font-size:19px}.ds-icon svg{width:20px}.ds-icon.violet{background:#eee3f7;color:#75578c}.ds-icon.gold{background:#fae8b9;color:#8a6519}.ds-style-buttons{display:grid;gap:8px;margin-top:14px}.ds-style-buttons button,.ds-mobile-style button{height:46px;border-radius:13px;border:1px solid #e5d7c4;background:#fffdf8;font-weight:900;color:#5c554d}.ds-style-buttons button.active.sketch,.ds-mobile-style button.active.sketch{background:#d9c8eb;border-color:#c6afe0;color:#553d70}.ds-style-buttons button.active.cartoon,.ds-mobile-style button.active.cartoon{background:#f3bf93;border-color:#e8ab76;color:#704015}.ds-style-buttons button.active.original,.ds-mobile-style button.active.original{background:#9bcfc5;border-color:#83bdb3;color:#245d56}.ds-color-count{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:14px 0 10px;font-size:12px;font-weight:800}.ds-color-count select,.ds-mobile-palette-head select{height:36px;border-radius:10px;border:1px solid #e3d3bf;background:#fffdf8;padding:0 10px;font-weight:900}.ds-palette-list{display:grid;gap:7px;max-height:255px;overflow:auto}.ds-color-row{display:grid;grid-template-columns:30px 24px 1fr;align-items:center;gap:7px;border:1px solid #efe2d2;background:#fffdf8;border-radius:11px;padding:7px}.ds-color-row i{width:28px;height:28px;border-radius:9px;border:1px solid #0001}.ds-color-row b{font-size:12px;text-align:center}.ds-color-row span{font-size:10px;color:#6e665e}.ds-continue{width:100%;margin-top:2px}
  .ds-preview-area{border:1px solid #e6d6c4;border-radius:24px;background:#fffaf2;padding:16px;box-shadow:0 14px 34px rgba(61,42,23,.06)}.ds-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}.ds-tabs button{height:44px;border-radius:13px;border:1px solid #e4d4c0;background:#fffdf8;font-weight:900;color:#5a534b}.ds-tabs button.active.original{background:#9bcfc5;color:#245d56;border-color:#83bdb3}.ds-tabs button.active.sketch{background:#d9c8eb;color:#553d70;border-color:#c6afe0}.ds-tabs button.active.cartoon{background:#f3bf93;color:#704015;border-color:#e8ab76}.ds-main-image{height:500px;border-radius:20px;border:1px solid #e6d5c2;background:#f4ede3;display:grid;place-items:center;overflow:hidden;position:relative}.ds-main-image img{width:100%;height:100%;object-fit:contain;display:block}.ds-empty{display:flex;flex-direction:column;align-items:center;gap:8px;color:#8a837c}.ds-processing{position:absolute;inset:auto 16px 16px;z-index:4;border-radius:999px;padding:8px 14px;background:rgba(23,32,51,.82);color:#fff;font-size:12px;text-align:center}.ds-thumbs{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}.ds-thumb{border:1px solid #e6d7c4;background:#fffdf8;border-radius:14px;padding:8px;text-align:left}.ds-thumb.active{box-shadow:0 0 0 2px #a68ad0}.ds-thumb>div{height:110px;border-radius:10px;background:#f2eadf;display:grid;place-items:center;overflow:hidden}.ds-thumb img{width:100%;height:100%;object-fit:contain}.ds-thumb b{display:block;padding:8px 2px 1px;font-size:12px}
  .ds-mobile{min-height:100dvh;background:#fff8ea;padding:14px 14px 100px;color:#172033}.ds-mobile-head{height:52px;display:grid;grid-template-columns:44px 1fr 44px;align-items:center}.ds-mobile-head button{width:42px;height:42px;border:1px solid #eadac6;border-radius:13px;background:#fffdf8;display:grid;place-items:center}.ds-mobile-head h1{font-size:21px;margin:0;text-align:center}.ds-mobile .ds-flow{margin:8px 0 18px}.ds-mobile .ds-flow:before{top:14px}.ds-mobile .ds-flow span{width:30px;height:30px;border-width:2px;font-size:11px}.ds-mobile .ds-flow b{font-size:9px}.ds-mobile-upload{border:2px dashed #e99aaa;border-radius:22px;background:#fffaf2;padding:28px 20px;text-align:center}.ds-mobile-upload .ds-upload-mark{width:64px;height:64px}.ds-mobile-upload h2{margin:0 0 5px;font-size:24px}.ds-mobile-upload p{margin:0 0 18px;color:#7b746c;font-size:12px}.ds-mobile-upload .ds-btn{width:100%;margin-top:10px}.ds-mobile-tips{margin-top:14px;border:1px solid #e7d6bf;border-radius:17px;background:#fff3cf;padding:14px 16px;display:grid;gap:7px}.ds-mobile-tips b{color:#795510}.ds-mobile-tips span{font-size:12px;color:#62584b}.ds-tabs-mobile{margin-top:2px}.ds-tabs-mobile button{height:40px;font-size:12px}.ds-mobile-image{height:42dvh;min-height:300px;max-height:430px;border:1px solid #e5d4bf;border-radius:18px;background:#f3eadf;overflow:hidden;display:grid;place-items:center;position:relative}.ds-mobile-image img{width:100%;height:100%;object-fit:contain}.ds-mobile-section{font-size:18px;margin:16px 0 8px}.ds-mobile-style{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.ds-mobile-style button{height:44px;font-size:12px}.ds-mobile-palette-head{display:flex;align-items:center;justify-content:space-between;margin-top:16px}.ds-mobile-palette-head h3{font-size:18px;margin:0}.ds-mobile-colors{display:flex;gap:9px;overflow:auto;padding:11px 1px 3px}.ds-mobile-colors div{position:relative;min-width:42px;text-align:center}.ds-mobile-colors i{width:40px;height:40px;border-radius:12px;display:block;border:2px solid #fff;box-shadow:0 0 0 1px #ddcdb9}.ds-mobile-colors b{position:absolute;right:-2px;top:-5px;background:#172033;color:#fff;width:18px;height:18px;border-radius:50%;font-size:9px;display:grid;place-items:center}.ds-mobile-continue{width:100%;margin-top:18px}
  @media(max-width:1050px) and (min-width:761px){.ds-workspace{grid-template-columns:280px minmax(0,1fr)}.ds-main-image{height:430px}.ds-thumb>div{height:90px}}
 `}</style>
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

async function processImage(url,paletteCount=8){
  const img=await loadImage(url)
  const max=1280
  const scale=Math.min(1,max/Math.max(img.width,img.height))
  const w=Math.max(1,Math.round(img.width*scale))
  const h=Math.max(1,Math.round(img.height*scale))
  const base=document.createElement('canvas')
  base.width=w;base.height=h
  const ctx=base.getContext('2d',{willReadFrequently:true})
  ctx.drawImage(img,0,0,w,h)
  const imageData=ctx.getImageData(0,0,w,h)
  const source=new Uint8ClampedArray(imageData.data)
  const original=base.toDataURL('image/jpeg',.96)
  const smooth=boxBlurRGBA(source,w,h,2)
  const palette=extractPaletteKMeans(source,paletteCount)
  const paletteRgb=palette.map(hexToRgb)
  const cartoonData=makeCartoon(source,smooth,w,h,paletteRgb)
  const cartoonCanvas=document.createElement('canvas');cartoonCanvas.width=w;cartoonCanvas.height=h
  cartoonCanvas.getContext('2d').putImageData(new ImageData(cartoonData,w,h),0,0)
  const cartoon=cartoonCanvas.toDataURL('image/png')
  const sketchData=makeSketch(source,w,h)
  const sketchCanvas=document.createElement('canvas');sketchCanvas.width=w;sketchCanvas.height=h
  sketchCanvas.getContext('2d').putImageData(new ImageData(sketchData,w,h),0,0)
  const sketch=sketchCanvas.toDataURL('image/png')
  return {original,sketch,cartoon,popArt:original,palette}
}

function loadImage(url){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=url})}

function makeCartoon(source,smooth,w,h,palette){
  const edges=edgeMap(smooth,w,h)
  const out=new Uint8ClampedArray(source.length)
  for(let i=0,p=0;i<source.length;i+=4,p++){
    const original=[source[i],source[i+1],source[i+2]]
    const nearest=nearestColor(original,palette)
    let r=nearest[0]*.82+original[0]*.18
    let g=nearest[1]*.82+original[1]*.18
    let b=nearest[2]*.82+original[2]*.18
    const e=edges[p]
    if(e>48){const k=e>105?.48:.7;r*=k;g*=k;b*=k}
    out[i]=clamp(r);out[i+1]=clamp(g);out[i+2]=clamp(b);out[i+3]=255
  }
  return out
}

function makeSketch(source,w,h){
  const gray=new Float32Array(w*h)
  for(let p=0,i=0;p<gray.length;p++,i+=4)gray[p]=.299*source[i]+.587*source[i+1]+.114*source[i+2]
  const soft=blurGray(gray,w,h,1)
  const edges=edgeMapFromGray(soft,w,h)
  const out=new Uint8ClampedArray(source.length)
  for(let p=0,i=0;p<gray.length;p++,i+=4){
    const e=edges[p]
    const shade=Math.max(0,(150-soft[p])*.12)
    let v=255-e*1.12-shade
    if(e>80)v=Math.min(v,70)
    if(e>120)v=20
    if(v>238)v=255
    out[i]=clamp(v);out[i+1]=clamp(v);out[i+2]=clamp(v);out[i+3]=255
  }
  return out
}

function boxBlurRGBA(data,w,h,radius=1){
  const out=new Uint8ClampedArray(data.length)
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    let r=0,g=0,b=0,a=0,n=0
    for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
      const xx=Math.max(0,Math.min(w-1,x+dx)),yy=Math.max(0,Math.min(h-1,y+dy)),i=(yy*w+xx)*4
      r+=data[i];g+=data[i+1];b+=data[i+2];a+=data[i+3];n++
    }
    const o=(y*w+x)*4;out[o]=r/n;out[o+1]=g/n;out[o+2]=b/n;out[o+3]=a/n
  }
  return out
}
function blurGray(data,w,h,radius=1){
  const out=new Float32Array(data.length)
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    let s=0,n=0
    for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
      const xx=Math.max(0,Math.min(w-1,x+dx)),yy=Math.max(0,Math.min(h-1,y+dy));s+=data[yy*w+xx];n++
    }
    out[y*w+x]=s/n
  }
  return out
}
function edgeMap(data,w,h){
  const gray=new Float32Array(w*h)
  for(let p=0,i=0;p<gray.length;p++,i+=4)gray[p]=.299*data[i]+.587*data[i+1]+.114*data[i+2]
  return edgeMapFromGray(gray,w,h)
}
function edgeMapFromGray(gray,w,h){
  const edges=new Float32Array(w*h)
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
    const p=y*w+x
    const gx=-gray[p-w-1]-2*gray[p-1]-gray[p+w-1]+gray[p-w+1]+2*gray[p+1]+gray[p+w+1]
    const gy=-gray[p-w-1]-2*gray[p-w]-gray[p-w+1]+gray[p+w-1]+2*gray[p+w]+gray[p+w+1]
    edges[p]=Math.min(255,Math.hypot(gx,gy))
  }
  return edges
}
function extractPaletteKMeans(data,count){
  const samples=[]
  const total=data.length/4
  const step=Math.max(1,Math.floor(total/6000))
  for(let p=0;p<total;p+=step){
    const i=p*4;if(data[i+3]<220)continue
    const r=data[i],g=data[i+1],b=data[i+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),light=(mx+mn)/510
    if(light<.025||light>.975)continue
    samples.push([r,g,b])
  }
  if(!samples.length)return ['#222222','#eeeeee'].slice(0,count)
  const centers=[]
  for(let i=0;i<count;i++)centers.push(samples[Math.floor((i+.5)*samples.length/count)]?.slice()||samples[0].slice())
  for(let it=0;it<10;it++){
    const sums=Array.from({length:count},()=>[0,0,0,0])
    for(const s of samples){let bi=0,bd=Infinity;for(let i=0;i<count;i++){const c=centers[i],d=(s[0]-c[0])**2+(s[1]-c[1])**2+(s[2]-c[2])**2;if(d<bd){bd=d;bi=i}}sums[bi][0]+=s[0];sums[bi][1]+=s[1];sums[bi][2]+=s[2];sums[bi][3]++}
    for(let i=0;i<count;i++)if(sums[i][3])centers[i]=[Math.round(sums[i][0]/sums[i][3]),Math.round(sums[i][1]/sums[i][3]),Math.round(sums[i][2]/sums[i][3])]
  }
  return centers.map(c=>rgbToHex(...c))
}
function nearestColor(rgb,palette){let best=palette[0]||rgb,dist=Infinity;for(const c of palette){const d=(rgb[0]-c[0])**2+(rgb[1]-c[1])**2+(rgb[2]-c[2])**2;if(d<dist){dist=d;best=c}}return best}
function hexToRgb(h){h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
function rgbToHex(r,g,b){return '#'+[r,g,b].map(v=>clamp(v).toString(16).padStart(2,'0')).join('')}
function clamp(v){return Math.max(0,Math.min(255,Math.round(v)))}
