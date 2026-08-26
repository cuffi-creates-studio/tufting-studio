import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'
import React,{useState} from 'react'
import { calculateYarn } from '../api/client'

export default function Calculator(){
 const {t}=useI18n()
 const [f,setF]=useState({width_cm:80,height_cm:60,density_g_per_cm2:.135,price_per_100g:3.5,waste_percent:10})
 const [r,setR]=useState(null)
 async function calc(e){e.preventDefault();setR(await calculateYarn({...f,width_cm:+f.width_cm,height_cm:+f.height_cm,density_g_per_cm2:+f.density_g_per_cm2,price_per_100g:+f.price_per_100g,waste_percent:+f.waste_percent}))}
 return <><MobilePageHeader title={t('calculator')}/>
  <div className="page-title"><div><h1>Yarn & Cost Calculator</h1><p>Calculate grams and material cost before you start tufting.</p></div></div>
  <div className="calc-layout">
   <form className="card calc-form" onSubmit={calc}>
    <label>Width cm<input type="number" value={f.width_cm} onChange={e=>setF({...f,width_cm:e.target.value})}/></label>
    <label>Height cm<input type="number" value={f.height_cm} onChange={e=>setF({...f,height_cm:e.target.value})}/></label>
    <label>Yarn type<select><option>Acrylic</option><option>Wool</option></select></label>
    <label>Density<select value={f.density_g_per_cm2} onChange={e=>setF({...f,density_g_per_cm2:e.target.value})}><option value=".11">Light</option><option value=".135">Standard</option><option value=".17">Dense</option></select></label>
    <label>Price / 100g €<input type="number" step=".01" value={f.price_per_100g} onChange={e=>setF({...f,price_per_100g:e.target.value})}/></label>
    <label>Waste %<input type="number" value={f.waste_percent} onChange={e=>setF({...f,waste_percent:e.target.value})}/></label>
    <button className="btn teal">Calculate</button>
   </form>
   <section className="card calc-results">
    <div><small>Area</small><b>{r?r.area_m2:'0.48'} m²</b></div>
    <div><small>Base Yarn</small><b>{r?r.base_g:'648'} g</b></div>
    <div><small>Total Yarn</small><b>{r?r.total_g:'713'} g</b></div>
    <div className="cost-box"><small>Material Cost</small><b>€{r?r.cost:'24.96'}</b></div>
    <p>This is a planning estimate. Real yarn usage depends on pile height, strand count and your tufting density.</p>
   </section>
  </div>
 </>
}
