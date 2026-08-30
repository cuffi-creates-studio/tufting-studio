import React,{useEffect,useState} from 'react'
import {ImagePlus,Save,Bell,Languages,UserCircle2,ArrowLeft,Check} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'

const toData=f=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(f)})

export default function Settings(){
 const {t,lang,setLang}=useI18n()
 const nav=useNavigate()
 const isMobile=useMedia('(max-width: 760px)')
 const [name,setName]=useState(localStorage.getItem('tufting_profile_name')||'Studio Owner')
 const [photo,setPhoto]=useState(localStorage.getItem('tufting_profile_photo')||'')
 const [logo,setLogo]=useState(localStorage.getItem('tufting_studio_logo')||'')
 const [notif,setNotif]=useState(localStorage.getItem('tufting_appointment_notifications')!=='off')
 const [saved,setSaved]=useState(false)

 async function pickProfile(e){
   const f=e.target.files?.[0];if(!f)return
   const data=await toData(f);setPhoto(data)
   localStorage.setItem('tufting_profile_photo',data)
   window.dispatchEvent(new Event('tufting-profile-updated'))
 }
 async function pickLogo(e){
   const f=e.target.files?.[0];if(!f)return
   const data=await toData(f);setLogo(data)
 }
 function removePhoto(){
   setPhoto('');localStorage.removeItem('tufting_profile_photo');window.dispatchEvent(new Event('tufting-profile-updated'))
 }
 function save(){
   localStorage.setItem('tufting_profile_name',name)
   localStorage.setItem('tufting_profile_photo',photo)
   localStorage.setItem('tufting_studio_logo',logo)
   localStorage.setItem('tufting_appointment_notifications',notif?'on':'off')
   window.dispatchEvent(new Event('tufting-profile-updated'))
   setSaved(true);setTimeout(()=>setSaved(false),1200)
 }

 if(!isMobile)return <div className="settings-desktop-page">
   <div className="settings-desktop-head">
     <button onClick={()=>nav(-1)}><ArrowLeft/></button>
     <div><h1>{t('settings')}</h1><p>Profili, gjuha dhe preferencat e studios</p></div>
   </div>

   <div className="settings-desktop-grid">
     <section className="settings-d-card profile-card">
       <div className="settings-card-title"><UserCircle2/><div><h2>{t('profile')}</h2><p>{t('profilePhotoNote')}</p></div></div>
       <div className="settings-profile-grid">
         <div className={`settings-d-avatar ${photo?'has-photo':''}`}>{photo?<img src={photo} alt={name}/>:name.slice(0,2).toUpperCase()}</div>
         <div className="settings-d-fields">
           <label><span>{t('displayName')}</span><input value={name} onChange={e=>setName(e.target.value)} placeholder={t('studioOwner')}/></label>
           <div className="settings-file-row">
             <label className="settings-file-button"><ImagePlus/>{t('chooseDashboardPhoto')}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={pickProfile}/></label>
             {photo&&<button className="settings-remove" type="button" onClick={removePhoto}>{t('removePhoto')}</button>}
           </div>
         </div>
       </div>
     </section>

     <section className="settings-d-card language-card">
       <div className="settings-card-title"><Languages/><div><h2>{t('language')}</h2><p>Shqip · Deutsch · English</p></div></div>
       <div className="settings-language-buttons">{[['sq','Shqip'],['de','Deutsch'],['en','English']].map(([k,l])=><button className={lang===k?'active':''} onClick={()=>setLang(k)} key={k}>{lang===k&&<Check/>}{l}</button>)}</div>
     </section>

     <section className="settings-d-card notification-card">
       <div className="settings-card-title"><Bell/><div><h2>{t('notifications')}</h2><p>{t('appointmentNotifications')}</p></div><button aria-label="notifications" className={`settings-d-switch ${notif?'on':''}`} onClick={()=>setNotif(!notif)}><i/></button></div>
     </section>

     <section className="settings-d-card logo-card">
       <div className="settings-card-title"><ImagePlus/><div><h2>{t('studioLogo')}</h2><p>Logo që përdoret nga studioja</p></div></div>
       <div className="settings-logo-preview">{logo?<img src={logo} alt="logo"/>:<span>🌼</span>}</div>
       <label className="settings-file-button logo-upload"><ImagePlus/>{t('upload')}<input type="file" accept="image/*" onChange={pickLogo}/></label>
     </section>
   </div>

   <button className="settings-d-save" onClick={save}><Save/>{saved?t('saved'):t('save')}</button>
 </div>

 return <div className="mobile-standard-page">
  <MobilePageHeader title={t('settings')}/>
  <div className="settings-mobile-stack">
   <section className="settings-mobile-card profile-photo-settings">
     <div className="settings-mobile-title"><UserCircle2/><div><b>{t('profile')}</b><small>{name}</small></div></div>
     <div className="settings-profile-edit">
       <div className={`settings-avatar ${photo?'has-photo':''}`}>{photo?<img src={photo} alt={name}/>:name.slice(0,2).toUpperCase()}</div>
       <div className="settings-profile-fields">
         <label className="settings-name-label">{t('displayName')}<input value={name} onChange={e=>setName(e.target.value)} placeholder={t('studioOwner')}/></label>
         <label className="settings-upload profile-photo-upload"><ImagePlus/>{t('chooseDashboardPhoto')}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={pickProfile}/></label>
         {photo&&<button type="button" className="settings-remove-photo" onClick={removePhoto}>{t('removePhoto')}</button>}
       </div>
     </div>
     <p className="settings-photo-note">{t('profilePhotoNote')}</p>
   </section>
   <section className="settings-mobile-card"><div className="settings-mobile-title"><Languages/><b>{t('language')}</b></div><div className="language-segment">{[['sq','Shqip'],['de','Deutsch'],['en','English']].map(([k,l])=><button className={lang===k?'active':''} onClick={()=>setLang(k)} key={k}>{l}</button>)}</div></section>
   <section className="settings-mobile-card"><div className="settings-mobile-title"><Bell/><div><b>{t('notifications')}</b><small>{t('appointmentNotifications')}</small></div><button className={`settings-switch ${notif?'on':''}`} onClick={()=>setNotif(!notif)}><i/></button></div></section>
   <section className="settings-mobile-card"><div className="settings-mobile-title"><ImagePlus/><b>{t('studioLogo')}</b></div><div className="logo-mini-preview">{logo?<img src={logo} alt="logo"/>:'🌼'}</div><label className="settings-upload"><ImagePlus/>{t('upload')}<input type="file" accept="image/*" onChange={pickLogo}/></label></section>
   <button className="settings-save" onClick={save}><Save/>{saved?t('saved'):t('save')}</button>
  </div>
 </div>
}

function useMedia(query){
 const [matches,setMatches]=useState(()=>typeof window!=='undefined'&&window.matchMedia(query).matches)
 useEffect(()=>{const m=window.matchMedia(query),f=()=>setMatches(m.matches);f();m.addEventListener?.('change',f);return()=>m.removeEventListener?.('change',f)},[query])
 return matches
}
