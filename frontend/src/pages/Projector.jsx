import React,{useMemo,useRef,useState} from 'react'
import {
  ArrowLeft,ArrowRight,ArrowUp,ArrowDown,
  Minus,Plus,FlipHorizontal2,Grid3X3,
  Maximize2,RotateCcw,X
} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import {useI18n} from '../i18n/I18n'
import '../styles/projector-touch.css'

export default function Projector(){
  const nav=useNavigate()
  const {t}=useI18n()
  const stageRef=useRef(null)

  const [mirror,setMirror]=useState(false)
  const [grid,setGrid]=useState(true)
  const [opacity,setOpacity]=useState(100)
  const [zoom,setZoom]=useState(125)
  const [x,setX]=useState(0)
  const [y,setY]=useState(0)
  const [fullscreenMode,setFullscreenMode]=useState(false)

  const drag=useRef({
    active:false,
    startX:0,
    startY:0,
    baseX:0,
    baseY:0
  })

  const image=useMemo(
    ()=>sessionStorage.getItem('tufting_projector_image')||'',
    []
  )

  function move(dx,dy){
    setX(v=>v+dx)
    setY(v=>v+dy)
  }

  function reset(){
    setX(0)
    setY(0)
    setZoom(125)
    setOpacity(100)
    setMirror(false)
    setGrid(true)
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

  function onPointerUp(){
    endDrag()
  }

  async function openFullscreen(){
    setFullscreenMode(true)
    const el=stageRef.current
    try{
      await el?.requestFullscreen?.()
    }catch{
      // iOS Safari may not expose Fullscreen API for divs.
      // The CSS fullscreen mode still fills the viewport.
    }
  }

  async function closeFullscreen(){
    setFullscreenMode(false)
    endDrag()
    try{
      if(document.fullscreenElement){
        await document.exitFullscreen()
      }
    }catch{}
  }

  return (
    <div className="projector-touch-page">

      <div className="projector-touch-header">
        <button onClick={()=>nav(-1)} className="projector-round">
          <ArrowLeft/>
        </button>
        <div>
          <h1>{t('projectorTools')}</h1>
          <p>Projekto dhe rregullo imazhin me precizion.</p>
        </div>
        <button onClick={reset} className="projector-round">
          <RotateCcw/>
        </button>
      </div>

      <section className="projector-touch-card">

        <div className="projector-touch-toolbar">
          <button className={mirror?'active':''} onClick={()=>setMirror(v=>!v)}>
            <FlipHorizontal2/>
            <span>{t('mirror')}</span>
          </button>

          <button className={grid?'active':''} onClick={()=>setGrid(v=>!v)}>
            <Grid3X3/>
            <span>Grid</span>
          </button>

          <button onClick={openFullscreen}>
            <Maximize2/>
            <span>Full</span>
          </button>
        </div>

        <div className="projector-touch-layout">

          <button className="p-touch-arrow up" onClick={()=>move(0,-10)}>
            <ArrowUp/>
          </button>

          <button className="p-touch-arrow left" onClick={()=>move(-10,0)}>
            <ArrowLeft/>
          </button>

          <div
            ref={stageRef}
            className={`projector-touch-stage ${grid?'with-grid':''} ${fullscreenMode?'is-fullscreen':''}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {fullscreenMode&&(
              <button className="projector-full-close" onClick={closeFullscreen}>
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
                  transform:`
                    translate(${x}px,${y}px)
                    scale(${zoom/100})
                    scaleX(${mirror?-1:1})
                  `
                }}
              />
            ) : (
              <div className="projector-touch-empty">
                <div>🖼️</div>
                <b>{t('noProjectorImage')}</b>
              </div>
            )}

            {fullscreenMode&&image&&(
              <div className="projector-drag-hint">
                Lëvize foton me gisht
              </div>
            )}
          </div>

          <button className="p-touch-arrow right" onClick={()=>move(10,0)}>
            <ArrowRight/>
          </button>

          <button className="p-touch-arrow down" onClick={()=>move(0,10)}>
            <ArrowDown/>
          </button>
        </div>

        <div className="projector-touch-zoom">
          <button onClick={()=>setZoom(v=>Math.max(25,v-10))}>
            <Minus/>
          </button>

          <strong>{zoom}%</strong>

          <button onClick={()=>setZoom(v=>Math.min(300,v+10))}>
            <Plus/>
          </button>
        </div>

        <div className="projector-touch-opacity">
          <div>
            <span>Opaciteti</span>
            <b>{opacity}%</b>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={opacity}
            onChange={e=>setOpacity(Number(e.target.value))}
          />
        </div>

      </section>

    </div>
  )
}
