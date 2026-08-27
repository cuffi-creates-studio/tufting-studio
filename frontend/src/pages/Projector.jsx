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

  const drag=useRef({active:false,startX:0,startY:0,baseX:0,baseY:0})

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
    drag.current={active:true,startX:clientX,startY:clientY,baseX:x,baseY:y}
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
    <>
      <style>{`
        .pj-page{
          width:100%;
          max-width:980px;
          margin:0 auto;
          padding:6px 6px 104px;
          box-sizing:border-box;
          color:#14223b;
        }

        .pj-head{
          display:grid;
          grid-template-columns:46px 1fr 46px;
          align-items:center;
          gap:8px;
          margin-bottom:6px;
        }

        .pj-back,.pj-reset{
          width:44px;height:44px;
          border:1px solid #dfc7a3;
          border-radius:14px;
          background:#fffaf2;
          display:grid;
          place-items:center;
          color:#18304d;
        }

        .pj-title{
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          min-width:0;
        }

        .pj-cam{
          width:42px;height:42px;
          flex:0 0 42px;
          border-radius:13px;
          background:#2f948e;
          display:grid;
          place-items:center;
          font-size:22px;
        }

        .pj-title h1{
          margin:0;
          font-size:22px;
          line-height:1;
          white-space:nowrap;
        }

        .pj-title p{
          margin:4px 0 0;
          color:#7c838e;
          font-size:10px;
        }

        .pj-shell{
          width:100%;
          border:2px solid #2f918c;
          border-radius:22px;
          background:#fff9ef;
          padding:8px;
          box-sizing:border-box;
        }

        .pj-top{
          display:grid;
          grid-template-columns:repeat(7,minmax(0,1fr));
          gap:4px;
          margin-bottom:7px;
        }

        .pj-top button{
          min-width:0;
          height:43px;
          padding:0;
          border:1px solid #e0c9a7;
          border-radius:11px;
          background:#fffaf2;
          display:grid;
          place-items:center;
          color:#17233a;
        }

        .pj-top button.on-yellow{
          background:#fff1c9;
          color:#d29317;
        }

        .pj-top button.on-plum{
          background:#fff3fa;
          color:#673e69;
        }

        .pj-top .danger{
          color:#cf6042;
        }

        .pj-top svg{
          width:20px;height:20px;
        }

        .pj-grid{
          display:grid;
          grid-template-columns:39px minmax(0,1fr) 39px;
          gap:4px;
          align-items:center;
        }

        .pj-left,.pj-right{
          display:flex;
          flex-direction:column;
          gap:6px;
        }

        .pj-left button,.pj-right button{
          width:38px;
          height:50px;
          border:1px solid #e0c9a7;
          border-radius:11px;
          background:#fffaf2;
          display:grid;
          place-items:center;
          padding:0;
        }

        .pj-left button{color:#2a8e89}
        .pj-right button{color:#17233a}

        .pj-right .on-teal{
          background:#2f918c;
          color:#fff;
        }

        .pj-right .danger{
          background:#e24b4e;
          color:#fff;
        }

        .pj-stage{
          width:100%;
          height:52vh;
          min-height:350px;
          max-height:470px;
          position:relative;
          display:grid;
          place-items:center;
          overflow:hidden;
          border:2px solid #d9bd94;
          border-radius:18px;
          background:#fffdf8;
          box-sizing:border-box;
          touch-action:none;
        }

        .pj-stage.grid{
          background-image:
            linear-gradient(rgba(55,92,88,.12) 1px,transparent 1px),
            linear-gradient(90deg,rgba(55,92,88,.12) 1px,transparent 1px);
          background-size:28px 28px;
        }

        .pj-stage img{
          max-width:96%;
          max-height:96%;
          object-fit:contain;
          transform-origin:center;
          user-select:none;
          -webkit-user-drag:none;
          touch-action:none;
        }

        .pj-empty{
          text-align:center;
          padding:16px;
          color:#697383;
          font-size:18px;
        }

        .pj-empty div{
          font-size:40px;
          margin-bottom:8px;
        }

        .pj-opacity{
          margin-top:8px;
          min-height:50px;
          display:grid;
          grid-template-columns:70px 1fr 48px;
          align-items:center;
          gap:7px;
          padding:0 9px;
          border:1px solid #dfc7a3;
          border-radius:14px;
          background:#fffaf2;
        }

        .pj-opacity input{
          width:100%;
          accent-color:#2f918c;
        }

        .pj-info{
          display:flex;
          justify-content:center;
          gap:22px;
          padding:5px 2px 0;
          color:#7b8089;
          font-size:14px;
        }

        .pj-info b{color:#17233a}

        .pj-save{
          width:100%;
          min-height:56px;
          margin-top:8px;
          border:0;
          border-radius:17px;
          background:#5a36c9;
          color:#fff;
          font-size:18px;
          font-weight:900;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
        }

        .pj-error{
          text-align:center;
          color:#b42318;
          font-weight:800;
        }

        .pj-stage.full,
        .pj-stage:fullscreen{
          position:fixed!important;
          inset:0!important;
          width:100vw!important;
          height:100dvh!important;
          min-height:0!important;
          max-height:none!important;
          border:0!important;
          border-radius:0!important;
          z-index:100000!important;
          background-color:#fff9ef!important;
        }

        .pj-stage.full img,
        .pj-stage:fullscreen img{
          max-width:97vw!important;
          max-height:95dvh!important;
        }

        .pj-close{
          position:absolute;
          top:max(16px,env(safe-area-inset-top));
          right:16px;
          width:52px;height:52px;
          border:0;
          border-radius:50%;
          background:rgba(20,34,59,.9);
          color:#fff;
          display:grid;
          place-items:center;
          z-index:20;
        }

        .pj-drag{
          position:absolute;
          left:50%;
          bottom:max(18px,env(safe-area-inset-bottom));
          transform:translateX(-50%);
          white-space:nowrap;
          background:rgba(20,34,59,.78);
          color:#fff;
          padding:8px 14px;
          border-radius:999px;
          font-size:12px;
          pointer-events:none;
        }

        @media(max-width:430px){
          .pj-title p{display:none}
          .pj-title h1{font-size:20px}
          .pj-stage{
            height:50vh;
            min-height:330px;
            max-height:430px;
          }
          .pj-left button,.pj-right button{
            height:44px;
          }
          .pj-top button{
            height:40px;
          }
          .pj-opacity{
            min-height:48px;
          }
        }
      `}</style>

      <div className="pj-page">

        <header className="pj-head">
          <button className="pj-back" onClick={()=>nav(-1)} aria-label="Mbrapa">
            <ArrowLeft/>
          </button>

          <div className="pj-title">
            <div className="pj-cam">📽️</div>
            <div>
              <h1>{t('projectorTools')}</h1>
              <p>Projektim & kontroll me prekje</p>
            </div>
          </div>

          <button className="pj-reset" onClick={reset} aria-label="Reset">
            <RotateCcw/>
          </button>
        </header>

        <section className="pj-shell">

          <div className="pj-top">
            <button><Move/></button>
            <button onClick={()=>setZoom(v=>Math.min(300,v+10))}><ZoomIn/></button>
            <button onClick={()=>setZoom(v=>Math.max(20,v-10))}><ZoomOut/></button>
            <button className={mirror?'on-plum':''} onClick={()=>setMirror(v=>!v)}><FlipHorizontal2/></button>
            <button className={grid?'on-yellow':''} onClick={()=>setGrid(v=>!v)}><Grid3X3/></button>
            <button onClick={openFullscreen}><Maximize2/></button>
            <button className="danger" onClick={reset}><RotateCcw/></button>
          </div>

          <div className="pj-grid">
            <div className="pj-left">
              <button onClick={()=>move(0,-10)}><ArrowUp/></button>
              <button onClick={()=>move(-10,0)}><ArrowLeft/></button>
              <button onClick={()=>move(10,0)}><ArrowRight/></button>
              <button onClick={()=>move(0,10)}><ArrowDown/></button>
            </div>

            <div
              ref={stageRef}
              className={`pj-stage ${grid?'grid':''} ${fullscreenMode?'full':''}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              {fullscreenMode&&(
                <button className="pj-close" onClick={closeFullscreen}>
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
                <div className="pj-empty">
                  <div>🖼️</div>
                  <b>{t('noProjectorImage')}</b>
                </div>
              )}

              {fullscreenMode&&image&&(
                <div className="pj-drag">Lëvize foton me gisht</div>
              )}
            </div>

            <div className="pj-right">
              <button><Focus/></button>
              <button className={grid?'on-teal':''} onClick={()=>setGrid(v=>!v)}><Grid3X3/></button>
              <button><SquareDashedMousePointer/></button>
              <button><Blend/></button>
              <button className="danger" onClick={reset}><X/></button>
            </div>
          </div>

          <div className="pj-opacity">
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

          <div className="pj-info">
            <span>Zoom <b>{zoom}%</b></span>
            <span>Mirror <b>{mirror?'ON':'OFF'}</b></span>
          </div>

        </section>

        {error&&<p className="pj-error">{error}</p>}

        <button className="pj-save" disabled={busy} onClick={saveToProject}>
          <Save/>
          {busy?'Duke ruajtur...':saved?'U ruajt':'Ruaj foton në projekt'}
        </button>

      </div>
    </>
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
