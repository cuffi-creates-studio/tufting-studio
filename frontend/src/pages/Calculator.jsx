import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'
import React,{useState} from 'react'
import {calculateYarn} from '../api/client'

export default function Calculator(){
 const {t}=useI18n()
 const [f,setF]=useState({width_cm:80,height_cm:60,density_g_per_cm2:.135,price_per_100g:3.5,waste_percent:10})
 const [r,setR]=useState(null)
 async function calc(e){
   e.preventDefault()
   try{setR(await calculateYarn({...f,width_cm:+f.width_cm,height_cm:+f.height_cm,density_g_per_cm2:+f.density_g_per_cm2,price_per_100g:+f.price_per_100g,waste_percent:+f.waste_percent}))}
   catch{
     const area=(+f.width_cm*+f.height_cm)/10000
     const base=Math.round(+f.width_cm*+f.height_cm*+f.density_g_per_cm2)
     const total=Math.round(base*(1+(+f.waste_percent/100)))
     const cost=(total/100*+f.price_per_100g).toFixed(2)
     setR({area_m2:area.toFixed(2),base_g:base,total_g:total,cost})
   }
 }
 return <><MobilePageHeader title={t('calculator')}/>
  <div className="page-title"><div><h1>{t('yarnCostCalculator')}</h1><p>{t('calculatorDesc')}</p></div></div>
  <div className="calc-layout">
   <form className="card calc-form" onSubmit={calc}>
    <label>{t('widthCm')}<input type="number" value={f.width_cm} onChange={e=>setF({...f,width_cm:e.target.value})}/></label>
    <label>{t('heightCm')}<input type="number" value={f.height_cm} onChange={e=>setF({...f,height_cm:e.target.value})}/></label>
    <label>{t('yarnType')}<select><option>{t('acrylic')}</option><option>{t('wool')}</option></select></label>
    <label>{t('density')}<select value={f.density_g_per_cm2} onChange={e=>setF({...f,density_g_per_cm2:e.target.value})}><option value=".11">{t('light')}</option><option value=".135">{t('standard')}</option><option value=".17">{t('dense')}</option></select></label>
    <label>{t('price100g')} €<input type="number" step=".01" value={f.price_per_100g} onChange={e=>setF({...f,price_per_100g:e.target.value})}/></label>
    <label>{t('waste')} %<input type="number" value={f.waste_percent} onChange={e=>setF({...f,waste_percent:e.target.value})}/></label>
    <button className="btn teal">{t('calculate')}</button>
   </form>
   <section className="card calc-results">
    <div><small>{t('area')}</small><b>{r?r.area_m2:'0.48'} m²</b></div>
    <div><small>{t('baseYarn')}</small><b>{r?r.base_g:'648'} g</b></div>
    <div><small>{t('totalYarn')}</small><b>{r?r.total_g:'713'} g</b></div>
    <div className="cost-box"><small>{t('materialCost')}</small><b>€{r?r.cost:'24.96'}</b></div>
    <p>{t('planningEstimate')}</p>
   </section>
  </div>
 </>
}
