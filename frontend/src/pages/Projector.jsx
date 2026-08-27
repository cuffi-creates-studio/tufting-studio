import React,{useMemo,useRef,useState} from 'react'
import {
  ArrowLeft,ArrowRight,ArrowUp,ArrowDown,
  ZoomIn,ZoomOut,FlipHorizontal2,Grid3X3,
  Maximize2,RotateCcw,X,Move,Focus,
  SquareDashedMousePointer,Blend,Save
} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import {useI18n} from '../i18n/I18n'
import {createProject} from '../lib/projectsStore'
import '../styles/projector-retro-big-save.css'

export default function Projector(){
  const nav=useNavigate()
  const {t}=useI18n()
  const stageRef=useRef(null)

  const [mirror,setMirror]=useState(false)
  const [grid,setGrid]=useState(true)
  const [opacity,setOpacity]=useState(60)
  const [zoom,setZoom]=useState(100)
  const [x,setX]=useState(0)
  const [y,setY]=useState(0)
  const [fullscreenMode,setFullscreenMode]=useState(false)
  const [busy,setBusy]=useState(false)
  const [saved,setSaved]=useState(false)
  const [error,setError]=useState('')

  const drag=useRef({
    active:false,startX:0,startY:0,baseX:0,baseY:0
  })

  const image=useMemo(
    ()=>sessionStorage.getItem('tufting_projector_image')||'',
    []
  )

  const style=useMemo(
    ()=>sessionStorage.getItem('tufting_projector_style')||'Projector',
    []
  )

  const palette=useMemo(()=>{
    try{
      return JSON.parse(sessionStorage.getItem('tufting_projector_palette')||'[]')
    }catch{
      return []
    }
  },[])

  function move(dx,dy){
    setX(v=>v+dx)
    setY(v=>v+dy)
  }

  function reset(){
    setMirror(false)
    setGrid(true)
    setOpacity(60)
    setZoom(100)
    setX(0)
    setY(0)
  }

  function beginDrag(clientX,clientY){
    drag.current={
      active:true,
      startX:clientX,
      startY:clientY,
      baseX:x,
      baseY:y
    }
  }

  function updateDrag(clientX,clientY){
    if(!drag.current.active)return
    setX(drag.current.baseX+(clientX-drag.current.startX))
    setY(drag.current.baseY+(clientY-drag.current.startY))
  }

  function endDrag(){
    drag.current.active=false
  }

  function onPointerDown(e){
    if(!fullscreenMode)return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    beginDrag(e.clientX,e.clientY)
  }

  function onPointerMove(e){
    if(!fullscreenMode)return
    updateDrag(e.clientX,e.clientY)
  }

  async function openFullscreen(){
    setFullscreenMode(true)
    try{
      await stageRef.current?.requestFullscreen?.()
    }catch{}
  }

  async function closeFullscreen(){
    setFullscreenMode(false)
    endDrag()
    try{
      if(document.fullscreenElement)await document.exitFullscreen()
    }catch{}
  }

  async function saveToProject(){
    if(!image){
      setError('Hap fillimisht një foto nga Studio Dizajni.')
      return
    }

    setBusy(true)
    setSaved(false)
    setError('')

    try{
      const defaultName=`${style} Project`
      const entered=window.prompt('Emri i projektit',defaultName)
      if(entered===null){
        setBusy(false)
        return
      }

      const name=entered.trim()||defaultName
      const savedImage=await compressDataUrl(image,720,.76)

      await createProject({
        name,
        status:'In Progress',
        style,
        palette,
        image_data:savedImage,
        notes:`Projector: zoom ${zoom}%, opacity ${opacity}%, x ${Math.round(x)}, y ${Math.round(y)}, mirror ${mirror?'on':'off'}`,
        material_cost:0
      })

      setSaved(true)
      setTimeout(()=>nav('/projects'),700)
    }catch(err){
      console.error(err)
      setError(t('saveFailed')||'Nuk u ruajt.')
    }finally{
      setBusy(false)
    }
  }

  return (
    <div className="retro-big-page">

      <header className="retro-big-header">
        <button className="retro-back" onClick={()=>nav(-1)} aria-label="Mbrapa">
          <ArrowLeft/>
        </button>

        <div className="retro-big-title">
          <div className="retro-camera">📽️</div>
          <div>
            <h1>{t('projectorTools')}</h1>
            <p>Projektim & kontroll me prekje</p>
          </div>
        </div>

        <button className="retro-help" onClick={reset} aria-label="Reset">
          <RotateCcw/>
        </button>
      </header>

      <section className="retro-big-shell">

        <div className="retro-top-tools">
          <button title="Move"><Move/></button>
          <button title="Zoom +" onClick={()=>setZoom(v=>Math.min(300,v+10))}><ZoomIn/></button>
          <button title="Zoom -" onClick={()=>setZoom(v=>Math.max(20,v-10))}><ZoomOut/></button>
          <button className={mirror?'active plum':''} title={t('mirror')} onClick={()=>setMirror(v=>!v)}><FlipHorizontal2/></button>
          <button className={grid?'active yellow':''} title="Grid" onClick={()=>setGrid(v=>!v)}><Grid3X3/></button>
          <button title="Fullscreen" onClick={openFullscreen}><Maximize2/></button>
          <button className="reset-tool" title="Reset" onClick={reset}><RotateCcw/></button>
        </div>

        <div className="retro-main-grid">

          <div className="retro-left-tools">
            <button onClick={()=>move(0,-10)}><ArrowUp/></button>
            <button onClick={()=>move(-10,0)}><ArrowLeft/></button>
            <button onClick={()=>move(10,0)}><ArrowRight/></button>
            <button onClick={()=>move(0,10)}><ArrowDown/></button>
          </div>

          <div
            ref={stageRef}
            className={`retro-big-stage ${grid?'with-grid':''} ${fullscreenMode?'is-fullscreen':''}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {fullscreenMode&&(
              <button className="retro-full-close" onClick={closeFullscreen}>
                <X/>
              </button>
            )}

            {image ? (
              <img
                src={image}
                alt={t('preview')}
                draggable="false"
                style={{
                  opacity:opacity/100,
                  transform:`translate(${x}px,${y}px) scale(${zoom/100}) scaleX(${mirror?-1:1})`
                }}
              />
            ) : (
              <div className="retro-stage-empty">
                <div>🖼️</div>
                <b>{t('noProjectorImage')}</b>
              </div>
            )}

            {fullscreenMode&&image&&(
              <div className="retro-drag-label">
                Lëvize foton me gisht
              </div>
            )}
          </div>

          <div className="retro-right-tools">
            <button title="Focus"><Focus/></button>
            <button className={grid?'active teal':''} onClick={()=>setGrid(v=>!v)} title="Grid"><Grid3X3/></button>
            <button title="Selection"><SquareDashedMousePointer/></button>
            <button title="Blend"><Blend/></button>
            <button className="danger" onClick={reset} title="Reset"><X/></button>
          </div>

        </div>

        <div className="retro-opacity">
          <b>Opacity</b>
          <input
            type="range"
            min="20"
            max="100"
            value={opacity}
            onChange={e=>setOpacity(Number(e.target.value))}
          />
          <strong>{opacity}%</strong>
        </div>

        <div className="retro-status-row">
          <span>Zoom <b>{zoom}%</b></span>
          <span>Mirror <b>{mirror?'ON':'OFF'}</b></span>
        </div>

      </section>

      {error&&<p className="retro-save-error">{error}</p>}

      <button className="retro-save-project" disabled={busy} onClick={saveToProject}>
        <Save/>
        {busy?'Duke ruajtur...':saved?'U ruajt':'Ruaj foton në projekt'}
      </button>

    </div>
  )
}

function compressDataUrl(src,max=720,quality=.76){
  return new Promise(resolve=>{
    const img=new Image()
    img.onload=()=>{
      const scale=Math.min(1,max/Math.max(img.width,img.height))
      const canvas=document.createElement('canvas')
      canvas.width=Math.max(1,Math.round(img.width*scale))
      canvas.height=Math.max(1,Math.round(img.height*scale))
      canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height)
      resolve(canvas.toDataURL('image/jpeg',quality))
    }
    img.onerror=()=>resolve('')
    img.src=src
  })
}
