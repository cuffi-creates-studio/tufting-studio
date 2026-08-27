import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'
import React,{useEffect,useState} from 'react'
import {calculateYarn} from '../api/client'
import {getCalculations,saveCalculation} from '../lib/calculationsStore'

export default function Calculator(){
 const {t}=useI18n()
 const [f,setF]=useState({width_cm:80,height_cm:60,yarn_type:'Acrylic',density_g_per_cm2:.135,price_per_100g:3.5,waste_percent:10})
 const [r,setR]=useState(null)
 const [history,setHistory]=useState([])
 const [saved,setSaved]=useState(false)

 async function load(){try{setHistory(await getCalculations())}catch{setHistory([])}}
 useEffect(()=>{load()},[])

 async function calc(e){
   e.preventDefault();setSaved(false)
   let result
   try{result=await calculateYarn({...f,width_cm:+f.width_cm,height_cm:+f.height_cm,density_g_per_cm2:+f.density_g_per_cm2,price_per_100g:+f.price_per_100g,waste_percent:+f.waste_percent})}
   catch{
     const area=(+f.width_cm*+f.height_cm)/10000
     const base=Math.round(+f.width_cm*+f.height_cm*+f.density_g_per_cm2)
     const total=Math.round(base*(1+(+f.waste_percent/100)))
     const cost=total/100*+f.price_per_100g
     result={area_m2:area.toFixed(2),base_g:base,total_g:total,cost:cost.toFixed(2)}
   }
   setR(result)
   try{
     await saveCalculation({
       width_cm:+f.width_cm,height_cm:+f.height_cm,yarn_type:f.yarn_type,density:+f.density_g_per_cm2,
       price_per_100g:+f.price_per_100g,waste_percent:+f.waste_percent,
       area_m2:+result.area_m2,base_g:+result.base_g,total_g:+result.total_g,cost:+result.cost
     })
     setSaved(true);await load()
   }catch(err){console.error('CALC SAVE ERROR',err)}
 }
 return <><MobilePageHeader title={t('calculator')}/>
  <div className="page-title"><div><h1>{t('yarnCostCalculator')}</h1><p>{t('calculatorDesc')}</p></div></div>
  <div className="calc-layout">
   <form className="card calc-form" onSubmit={calc}>
    <label>{t('widthCm')}<input type="number" value={f.width_cm} onChange={e=>setF({...f,width_cm:e.target.value})}/></label>
    <label>{t('heightCm')}<input type="number" value={f.height_cm} onChange={e=>setF({...f,height_cm:e.target.value})}/></label>
    <label>{t('yarnType')}<select value={f.yarn_type} onChange={e=>setF({...f,yarn_type:e.target.value})}><option value="Acrylic">{t('acrylic')}</option><option value="Wool">{t('wool')}</option></select></label>
    <label>{t('density')}<select value={f.density_g_per_cm2} onChange={e=>setF({...f,density_g_per_cm2:e.target.value})}><option value=".11">{t('light')}</option><option value=".135">{t('standard')}</option><option value=".17">{t('dense')}</option></select></label>
    <label>{t('price100g')} €<input type="number" step=".01" value={f.price_per_100g} onChange={e=>setF({...f,price_per_100g:e.target.value})}/></label>
    <label>{t('waste')} %<input type="number" value={f.waste_percent} onChange={e=>setF({...f,waste_percent:e.target.value})}/></label>
    <button className="btn teal">{t('calculate')}</button>
    {saved&&<small className="calc-saved-note" style={{display:'block',textAlign:'center',color:'#008b70',fontWeight:900,marginTop:8}}>✓ {t('calculationSaved')}</small>}
   </form>
   <section className="card calc-results">
    <div><small>{t('area')}</small><b>{r?r.area_m2:'0.48'} m²</b></div>
    <div><small>{t('baseYarn')}</small><b>{r?r.base_g:'648'} g</b></div>
    <div><small>{t('totalYarn')}</small><b>{r?r.total_g:'713'} g</b></div>
    <div className="cost-box"><small>{t('materialCost')}</small><b>€{r?Number(r.cost).toFixed(2):'24.96'}</b></div>
    <p>{t('planningEstimate')}</p>
   </section>
  </div>
  {history.length>0&&<section className="card calc-history" style={{marginTop:14,padding:18}}>
    <h2>{t('savedCalculations')}</h2>
    {history.slice(0,8).map(c=><div className="calc-history-row" key={c.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,padding:'11px 0',borderBottom:'1px solid #eee3d4'}}>
      <div><b>{c.width_cm}×{c.height_cm} cm · {c.yarn_type==='Wool'?t('wool'):t('acrylic')}</b><small>{new Date(c.created_at).toLocaleDateString()} · {c.total_g} g</small></div>
      <strong>€{Number(c.cost||0).toFixed(2)}</strong>
    </div>)}
  </section>}
 </>
}
