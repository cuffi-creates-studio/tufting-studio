import React,{useRef,useState} from 'react'
import {
  ArrowLeft,ArrowRight,ArrowUp,ArrowDown,
  ZoomIn,ZoomOut,FlipHorizontal2,Grid3X3,
  Maximize2,RotateCcw,X,Move,Focus,
  Crosshair,Blend,HelpCircle
} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import {useI18n} from '../i18n/I18n'
import '../styles/projector-all-controls.css'

export default function Projector(){
  const nav=useNavigate()
  const {t}=useI18n()
  const stageRef=useRef(null)

  const [image,setImage]=useState(
    ()=>sessionStorage.getItem('tufting_projector_image')||''
  )

  const [mirror,setMirror]=useState(false)
  const [grid,setGrid]=useState(true)
  const [gridSize,setGridSize]=useState(22)
  const [opacity,setOpacity]=useState(60)
  const [zoom,setZoom]=useState(100)
  const [x,setX]=useState(0)
  const [y,setY]=useState(0)
  const [fullscreenMode,setFullscreenMode]=useState(false)
  const [moveMode,setMoveMode]=useState(false)
  const [blendIndex,setBlendIndex]=useState(0)

  const blendModes=['normal','multiply','screen','overlay']

  const pointers=useRef(new Map())
  const gesture=useRef({
    dragging:false,
    startX:0,
    startY:0,
    baseX:0,
    baseY:0,
    pinchStartDistance:0,
    pinchStartZoom:100
  })

  function distance(a,b){
    return Math.hypot(a.x-b.x,a.y-b.y)
  }

  function reset(){
    setMirror(false)
    setGrid(true)
    setGridSize(22)
    setOpacity(60)
    setZoom(100)
    setX(0)
    setY(0)
    setMoveMode(false)
    setBlendIndex(0)
  }

  function fitImage(){
    setX(0)
    setY(0)
    setZoom(100)
    setOpacity(100)
  }

  function centerImage(){
    setX(0)
    setY(0)
  }

  function cycleBlend(){
    setBlendIndex(i=>(i+1)%blendModes.length)
  }

  function cycleGrid(){
    setGrid(true)
    setGridSize(s=>s===16?22:s===22?32:16)
  }

  function removeImage(){
    if(!image)return
    if(window.confirm('Ta heq foton nga projektori?')){
      sessionStorage.removeItem('tufting_projector_image')
      setImage('')
      setX(0)
      setY(0)
      setZoom(100)
    }
  }

  function move(dx,dy){
    setX(v=>v+dx)
    setY(v=>v+dy)
  }

  function handlePointerDown(e){
    const canDrag=fullscreenMode||moveMode
    if(!canDrag)return

    e.preventDefault()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY})

    const pts=[...pointers.current.values()]

    if(pts.length===1){
      gesture.current.dragging=true
      gesture.current.startX=e.clientX
      gesture.current.startY=e.clientY
      gesture.current.baseX=x
      gesture.current.baseY=y
    }

    if(pts.length===2){
      gesture.current.dragging=false
      gesture.current.pinchStartDistance=distance(pts[0],pts[1])
      gesture.current.pinchStartZoom=zoom
    }
  }

  function handlePointerMove(e){
    const canDrag=fullscreenMode||moveMode
    if(!canDrag || !pointers.current.has(e.pointerId))return

    e.preventDefault()
    pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY})
    const pts=[...pointers.current.values()]

    if(pts.length===1 && gesture.current.dragging){
      setX(gesture.current.baseX+(e.clientX-gesture.current.startX))
      setY(gesture.current.baseY+(e.clientY-gesture.current.startY))
      return
    }

    if(pts.length===2){
      const d=distance(pts[0],pts[1])
      if(gesture.current.pinchStartDistance>0){
        const ratio=d/gesture.current.pinchStartDistance
        setZoom(
          Math.round(
            Math.max(
              20,
              Math.min(300,gesture.current.pinchStartZoom*ratio)
            )
          )
        )
      }
    }
  }

  function handlePointerEnd(e){
    pointers.current.delete(e.pointerId)

    const pts=[...pointers.current.values()]
    if(pts.length===1){
      const p=pts[0]
      gesture.current.dragging=true
      gesture.current.startX=p.x
      gesture.current.startY=p.y
      gesture.current.baseX=x
      gesture.current.baseY=y
    }else if(pts.length===0){
      gesture.current.dragging=false
      gesture.current.pinchStartDistance=0
    }
  }

  async function openFullscreen(){
    setFullscreenMode(true)
    document.documentElement.classList.add('projector-fullscreen-open')
    try{
      await stageRef.current?.requestFullscreen?.()
    }catch{}
  }

  async function closeFullscreen(){
    setFullscreenMode(false)
    pointers.current.clear()
    gesture.current.dragging=false
    document.documentElement.classList.remove('projector-fullscreen-open')

    try{
      if(document.fullscreenElement){
        await document.exitFullscreen()
      }
    }catch{}
  }

  const blendMode=blendModes[blendIndex]

  return (
    <div className="projector-all-page">

      <header className="projector-all-header">
        <div className="projector-title">
          <div className="projector-app-icon">📽️</div>
          <div>
            <h1>{t('projectorTools')}</h1>
            <small>{moveMode?'Prekja për lëvizje është aktive':'Projektim & kontroll me prekje'}</small>
          </div>
        </div>

        <button
          className="projector-help"
          onClick={()=>alert(
            'Move: lëviz me gisht\nZoom + / -\nPasqyrë\nGrid\nFullscreen\nReset\nNë fullscreen: 1 gisht lëviz, 2 gishta bëjnë zoom.'
          )}
        >
          <HelpCircle/>
        </button>
      </header>

      <section className="projector-all-shell">

        {/* 7 FUNCTIONAL TOP BUTTONS */}
        <div className="projector-top-seven">

          <button
            className={moveMode?'active-teal':''}
            onClick={()=>setMoveMode(v=>!v)}
            title="Move with finger"
          >
            <Move/>
          </button>

          <button
            onClick={()=>setZoom(v=>Math.min(300,v+10))}
            title="Zoom in"
          >
            <ZoomIn/>
          </button>

          <button
            onClick={()=>setZoom(v=>Math.max(20,v-10))}
            title="Zoom out"
          >
            <ZoomOut/>
          </button>

          <button
            className={mirror?'active-plum':''}
            onClick={()=>setMirror(v=>!v)}
            title={t('mirror')}
          >
            <FlipHorizontal2/>
          </button>

          <button
            className={grid?'active-gold':''}
            onClick={()=>setGrid(v=>!v)}
            title="Grid on/off"
          >
            <Grid3X3/>
          </button>

          <button onClick={openFullscreen} title="Fullscreen">
            <Maximize2/>
          </button>

          <button className="reset-btn" onClick={reset} title="Reset all">
            <RotateCcw/>
          </button>

        </div>

        <div className="projector-main">

          {/* 4 FUNCTIONAL LEFT BUTTONS */}
          <aside className="projector-left-four">
            <button onClick={()=>move(0,-10)}><ArrowUp/></button>
            <button onClick={()=>move(-10,0)}><ArrowLeft/></button>
            <button onClick={()=>move(10,0)}><ArrowRight/></button>
            <button onClick={()=>move(0,10)}><ArrowDown/></button>
          </aside>

          {/* STAGE */}
          <div
            ref={stageRef}
            className={[
              'projector-stage-all',
              grid?'with-grid':'',
              fullscreenMode?'is-fullscreen':'',
              (fullscreenMode||moveMode)?'touch-enabled':''
            ].join(' ')}
            style={{
              '--grid-size':`${gridSize}px`
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onContextMenu={e=>e.preventDefault()}
          >

            {fullscreenMode&&(
              <>
                <button className="projector-full-close" onClick={closeFullscreen}>
                  <X/>
                </button>

                <div className="projector-full-info">
                  1 gisht = lëviz • 2 gishta = zoom
                </div>
              </>
            )}

            {image ? (
              <img
                src={image}
                alt={t('preview')}
                draggable="false"
                style={{
                  opacity:opacity/100,
                  mixBlendMode:blendMode,
                  transform:`
                    translate3d(${x}px,${y}px,0)
                    scale(${zoom/100})
                    scaleX(${mirror?-1:1})
                  `
                }}
              />
            ) : (
              <div className="projector-empty-all">
                <div>🖼️</div>
                <b>{t('noProjectorImage')}</b>
              </div>
            )}

          </div>

          {/* 5 FUNCTIONAL RIGHT BUTTONS */}
          <aside className="projector-right-five">

            {/* 1: FIT */}
            <button
              onClick={fitImage}
              title="Fit image"
            >
              <Focus/>
            </button>

            {/* 2: GRID DENSITY */}
            <button
              className="grid-density"
              onClick={cycleGrid}
              title="Change grid density"
            >
              <Grid3X3/>
              <small>{gridSize}</small>
            </button>

            {/* 3: CENTER */}
            <button
              onClick={centerImage}
              title="Center image"
            >
              <Crosshair/>
            </button>

            {/* 4: BLEND MODE */}
            <button
              className={blendIndex!==0?'active-plum':''}
              onClick={cycleBlend}
              title={`Blend: ${blendMode}`}
            >
              <Blend/>
              <small>{blendIndex+1}</small>
            </button>

            {/* 5: REMOVE IMAGE */}
            <button
              className="danger"
              onClick={removeImage}
              title="Remove image"
            >
              <X/>
            </button>

          </aside>

        </div>

        <div className="projector-opacity-all">
          <span>Opacity</span>
          <input
            type="range"
            min="20"
            max="100"
            value={opacity}
            onChange={e=>setOpacity(Number(e.target.value))}
          />
          <b>{opacity}%</b>
        </div>

        <div className="projector-status-row">
          <span>Zoom <b>{zoom}%</b></span>
          <span>Blend <b>{blendMode}</b></span>
        </div>

      </section>

    </div>
  )
}
