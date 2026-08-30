import React,{useEffect,useMemo,useState} from 'react'
import {Calculator as CalculatorIcon,Coins,Scale,PackageOpen,Save,RotateCcw,CheckCircle2} from 'lucide-react'
import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'
import {getCalculations,saveCalculation} from '../lib/calculationsStore'
import '../styles/calculator-retro.css'

const num=v=>{
 const n=Number(String(v ?? '').replace(',','.'))
 return Number.isFinite(n)?n:0
}
const money=v=>`€${Number(v||0).toFixed(2)}`
const grams=v=>`${Number(v||0).toFixed(1).replace('.0','')} g`

export default function Calculator(){
 const {t}=useI18n()
 const [f,setF]=useState({
   yarn_type:'Acrylic',
   ball_weight_g:'100',
   ball_price:'3.50',
   start_weight_g:'100',
   remaining_weight_g:'60',
   full_balls_used:'0',
   yarn_color_name:'',
   yarn_color_code:'#FF6B6B'
 })
 const [history,setHistory]=useState([])
 const [saved,setSaved]=useState(false)

 async function load(){try{setHistory(await getCalculations())}catch{setHistory([])}}
 useEffect(()=>{load()},[])

 const r=useMemo(()=>{
   const ballWeight=Math.max(0,num(f.ball_weight_g))
   const ballPrice=Math.max(0,num(f.ball_price))
   const start=Math.max(0,num(f.start_weight_g))
   const remaining=Math.max(0,num(f.remaining_weight_g))
   const fullBalls=Math.max(0,Math.floor(num(f.full_balls_used)))
   const partialUsed=Math.max(0,start-remaining)
   const totalUsed=fullBalls*ballWeight+partialUsed
   const pricePerGram=ballWeight>0?ballPrice/ballWeight:0
   const actualCost=totalUsed*pricePerGram
   const remainingValue=remaining*pricePerGram
   const percentOfOpenBall=start>0?(partialUsed/start)*100:0
   const equivalentBalls=ballWeight>0?totalUsed/ballWeight:0
   const valid=ballWeight>0&&ballPrice>=0&&start>=remaining
   return {ballWeight,ballPrice,start,remaining,fullBalls,partialUsed,totalUsed,pricePerGram,actualCost,remainingValue,percentOfOpenBall,equivalentBalls,valid}
 },[f])

 function set(key,value){setSaved(false);setF(v=>({...v,[key]:value}))}

 async function saveRealCalculation(){
   if(!r.valid)return
   try{
     await saveCalculation({
       width_cm:0,
       height_cm:0,
       yarn_type:f.yarn_type,
       density:0,
       price_per_100g:r.ballWeight>0?r.ballPrice*(100/r.ballWeight):0,
       waste_percent:0,
       area_m2:0,
       base_g:r.partialUsed,
       total_g:r.totalUsed,
       cost:r.actualCost,
       calculation_type:'real_weight',
       ball_weight_g:r.ballWeight,
       ball_price:r.ballPrice,
       start_weight_g:r.start,
       remaining_weight_g:r.remaining,
       full_balls_used:r.fullBalls,
       yarn_color_name:f.yarn_color_name.trim(),
       yarn_color_code:normalizeHex(f.yarn_color_code),
       price_per_gram:r.pricePerGram,
       remaining_value:r.remainingValue
     })
     setSaved(true)
     await load()
     setTimeout(()=>setSaved(false),1600)
   }catch(err){console.error('CALC SAVE ERROR',err)}
 }

 function reset(){
   setF({yarn_type:'Acrylic',ball_weight_g:'100',ball_price:'3.50',start_weight_g:'100',remaining_weight_g:'60',full_balls_used:'0',yarn_color_name:'',yarn_color_code:'#FF6B6B'})
   setSaved(false)
 }

 return <div className="real-calc-page">
   <MobilePageHeader title={t('calculator')}/>

   <div className="page-title real-calc-title">
     <div>
       <h1>Yarn Cost Calculator</h1>
       <p>Llogaritje reale sipas peshës së leshit që ke përdorur — jo vlerësim teorik.</p>
     </div>
     <div className="real-calc-badge"><Scale size={18}/> REAL WEIGHT</div>
   </div>

   <div className="real-calc-layout">
     <section className="card real-calc-form-card">
       <div className="real-section-head">
         <div className="real-icon retro-purple"><PackageOpen/></div>
         <div><h2>Leshi / Yarn</h2><p>Vendos të dhënat reale të topit.</p></div>
       </div>

       <div className="real-field-grid">
         <label className="real-field full">
           <span>Lloji i leshit</span>
           <div className="retro-choice-row">
             <button type="button" className={`retro-choice acrylic ${f.yarn_type==='Acrylic'?'active':''}`} onClick={()=>set('yarn_type','Acrylic')}>Acrylic</button>
             <button type="button" className={`retro-choice wool ${f.yarn_type==='Wool'?'active':''}`} onClick={()=>set('yarn_type','Wool')}>Wool / Lesh</button>
           </div>
         </label>

         <label className="real-field">
           <span>Ngjyra e leshit</span>
           <input className="real-text-input" type="text" value={f.yarn_color_name} onChange={e=>set('yarn_color_name',e.target.value)} placeholder="p.sh. Rozë, Beige, E zezë"/>
           <small>Shkruaj emrin e ngjyrës që përdore.</small>
         </label>

         <label className="real-field">
           <span>Kodi i ngjyrës</span>
           <div className="real-color-input-wrap">
             <input className="real-color-picker" type="color" value={validHex(f.yarn_color_code)} onChange={e=>set('yarn_color_code',e.target.value.toUpperCase())}/>
             <input className="real-text-input color-code" type="text" value={f.yarn_color_code} onChange={e=>set('yarn_color_code',e.target.value.toUpperCase())} placeholder="#FF6B6B" maxLength={7}/>
             <span className="real-color-preview" style={{background:validHex(f.yarn_color_code)}}/>
           </div>
           <small>Vendos kodin HEX, p.sh. #FF6B6B.</small>
         </label>

         <label className="real-field">
           <span>Gramatura e një topi</span>
           <div className="input-with-unit"><input inputMode="decimal" type="number" min="0" step="1" value={f.ball_weight_g} onChange={e=>set('ball_weight_g',e.target.value)}/><b>g</b></div>
           <small>P.sh. 50 g, 100 g, 200 g — e vendos vetë.</small>
         </label>

         <label className="real-field">
           <span>Çmimi i një topi</span>
           <div className="input-with-unit money"><b>€</b><input inputMode="decimal" type="number" min="0" step="0.01" value={f.ball_price} onChange={e=>set('ball_price',e.target.value)}/></div>
           <small>Shkruaj çmimin real që ke paguar.</small>
         </label>

         <label className="real-field">
           <span>Pesha para se të fillosh</span>
           <div className="input-with-unit"><input inputMode="decimal" type="number" min="0" step="0.1" value={f.start_weight_g} onChange={e=>set('start_weight_g',e.target.value)}/><b>g</b></div>
           <small>Nëse topi është i ri: zakonisht e njëjtë me gramaturën.</small>
         </label>

         <label className="real-field">
           <span>Pesha që ka mbetur pas punës</span>
           <div className="input-with-unit"><input inputMode="decimal" type="number" min="0" step="0.1" value={f.remaining_weight_g} onChange={e=>set('remaining_weight_g',e.target.value)}/><b>g</b></div>
           <small>Peshoje pjesën e mbetur dhe shkruaje këtu.</small>
         </label>

         <label className="real-field full">
           <span>Topa të plotë të harxhuar</span>
           <div className="input-with-unit compact"><input inputMode="numeric" type="number" min="0" step="1" value={f.full_balls_used} onChange={e=>set('full_balls_used',e.target.value)}/><b>topa</b></div>
           <small>Nëse ke përdorur vetëm nga një top, lëre 0. Nëse ke mbaruar 2 topa dhe po punon me të tretin, shkruaj 2.</small>
         </label>
       </div>

       {!r.valid&&<div className="real-error">Pesha e mbetur nuk mund të jetë më e madhe se pesha para punës.</div>}

       <div className="real-form-actions">
         <button type="button" className="real-reset" onClick={reset}><RotateCcw size={18}/> Reset</button>
         <button type="button" className="real-save" disabled={!r.valid} onClick={saveRealCalculation}>{saved?<CheckCircle2 size={19}/>:<Save size={19}/>} {saved?'U ruajt':'Ruaj llogaritjen'}</button>
       </div>
     </section>

     <section className="card real-results-card">
       <div className="real-section-head">
         <div className="real-icon retro-orange"><CalculatorIcon/></div>
         <div><h2>Rezultati real</h2><p>Llogaritet direkt nga pesha dhe çmimi që vendose.</p></div>
       </div>

       <div className="real-result-grid">
         <article className="real-result used">
           <span>Ke harxhuar</span>
           <strong>{grams(r.totalUsed)}</strong>
           <small>{r.fullBalls>0?`${r.fullBalls} top(a) të plotë + ${grams(r.partialUsed)} nga topi i hapur`:`${grams(r.start)} − ${grams(r.remaining)} = ${grams(r.partialUsed)}`}</small>
         </article>

         <article className="real-result cost">
           <span>Kosto reale e leshit të përdorur</span>
           <strong>{money(r.actualCost)}</strong>
           <small>{money(r.pricePerGram)} për gram</small>
         </article>

         <article className="real-result remaining">
           <span>Leshi që ka mbetur</span>
           <strong>{grams(r.remaining)}</strong>
           <small>Vlera e mbetur: {money(r.remainingValue)}</small>
         </article>

         <article className="real-result ball">
           <span>Topa ekuivalent të përdorur</span>
           <strong>{r.equivalentBalls.toFixed(2)}</strong>
           <small>{r.ballWeight?`${grams(r.ballWeight)} = 1 top`:''}</small>
         </article>
       </div>

       <div className="real-example-line">
         <div className="real-icon retro-teal"><Coins/></div>
         <div>
           <b>Shembulli yt</b>
           <span>Nëse topi është 100 g dhe pas punës mbeten 60 g, programi nxjerr <strong>40 g të përdorura</strong>. Nëse topi kushton €3.50, kostoja reale e atyre 40 g është <strong>€1.40</strong>.</span>
         </div>
       </div>
     </section>
   </div>

   {history.length>0&&<section className="card real-history-card">
     <div className="real-section-head compact"><div className="real-icon retro-pink"><Save/></div><div><h2>Llogaritjet e ruajtura</h2><p>Historiku i konsumit dhe kostos reale.</p></div></div>
     <div className="real-history-list">
       {history.slice(0,8).map(c=><div className="real-history-row" key={c.id}>
         <div className="real-history-main">
           <span className="history-color-dot" style={{background:validHex(c.yarn_color_code||'#D8CBB8')}}/>
           <div>
             <b>{c.yarn_type==='Wool'?'Wool / Lesh':'Acrylic'}{c.yarn_color_name?` · ${c.yarn_color_name}`:''}</b>
             <small>{c.yarn_color_code?`${normalizeHex(c.yarn_color_code)} · `:''}{new Date(c.created_at).toLocaleDateString()} · {grams(c.total_g)}</small>
           </div>
         </div>
         <strong>{money(c.cost)}</strong>
       </div>)}
     </div>
   </section>}
 </div>
}


function normalizeHex(value){
 const raw=String(value||'').trim().toUpperCase()
 if(/^#[0-9A-F]{6}$/.test(raw))return raw
 if(/^[0-9A-F]{6}$/.test(raw))return '#'+raw
 return raw||'#D8CBB8'
}
function validHex(value){
 const hex=normalizeHex(value)
 return /^#[0-9A-F]{6}$/.test(hex)?hex:'#D8CBB8'
}
