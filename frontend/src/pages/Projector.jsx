import React,{useState} from 'react'
import {ArrowLeft,ArrowUp,ArrowRight,Minus,Plus} from 'lucide-react'
import {useNavigate} from 'react-router-dom'

export default function Projector(){
 const nav=useNavigate()
 const [mirror,setMirror]=useState(true)
 const [zoom,setZoom]=useState(125)
 const [fiber,setFiber]=useState('Acrylic')
 return <div className="mobile-flow-page exact-projector">
   <div className="flow-top"><button onClick={()=>nav(-1)}><ArrowLeft/></button><h1>Projector Tools</h1><span></span></div>

   <div className="projector-box">
     <div className="mirror-row"><b>◫ Mirror</b><button className={`switch ${mirror?'on':''}`} onClick={()=>setMirror(!mirror)}><i></i></button></div>
     <div className="projector-controls">
       <button className="p-arrow top"><ArrowUp/></button>
       <button className="p-arrow left">←</button>
       <div className="projector-preview-dog">🐶</div>
       <button className="p-arrow right"><ArrowRight/></button>
     </div>
     <div className="zoom-row"><button onClick={()=>setZoom(Math.max(25,zoom-25))}><Minus/></button><b>{zoom}%</b><button onClick={()=>setZoom(zoom+25)}><Plus/></button></div>
   </div>

   <div className="yarn-card">
     <h2>Yarn Calculator</h2>
     <div className="fiber-tabs"><button className={fiber==='Acrylic'?'active':''} onClick={()=>setFiber('Acrylic')}>Acrylic</button><button className={fiber==='Wool'?'active':''} onClick={()=>setFiber('Wool')}>Wool</button></div>
     <div className="calc-line"><span>Estimated Yarn</span><b>{fiber==='Acrylic'?'620 g':'690 g'}</b></div>
     <div className="calc-line"><span>Coverage Area</span><b>0.85 m²</b></div>
     <div className="calc-line"><span>Cost Estimate</span><b>{fiber==='Acrylic'?'€24.80':'€31.50'}</b></div>
   </div>

   <button className="save-project-btn">Save Project</button>
 </div>
}
