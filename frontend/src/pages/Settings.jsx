import React,{useState} from 'react'
import {ImagePlus,Save,Bell,Languages,UserCircle2} from 'lucide-react'
import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'

const toData=f=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(f)})

export default function Settings(){
 const {t,lang,setLang}=useI18n()
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
 function save(){
   localStorage.setItem('tufting_profile_name',name)
   localStorage.setItem('tufting_profile_photo',photo)
   localStorage.setItem('tufting_studio_logo',logo)
   localStorage.setItem('tufting_appointment_notifications',notif?'on':'off')
   window.dispatchEvent(new Event('tufting-profile-updated'))
   setSaved(true);setTimeout(()=>setSaved(false),1200)
 }
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
         {photo&&<button type="button" className="settings-remove-photo" onClick={()=>{setPhoto('');localStorage.removeItem('tufting_profile_photo');window.dispatchEvent(new Event('tufting-profile-updated'))}}>{t('removePhoto')}</button>}
       </div>
     </div>
     <p className="settings-photo-note">{t('profilePhotoNote')}</p>
   </section>

   <section className="settings-mobile-card">
     <div className="settings-mobile-title"><Languages/><b>{t('language')}</b></div>
     <div className="language-segment">{[['sq','Shqip'],['de','Deutsch'],['en','English']].map(([k,l])=><button className={lang===k?'active':''} onClick={()=>setLang(k)} key={k}>{l}</button>)}</div>
   </section>

   <section className="settings-mobile-card"><div className="settings-mobile-title"><Bell/><div><b>{t('notifications')}</b><small>{t('appointmentNotifications')}</small></div><button className={`settings-switch ${notif?'on':''}`} onClick={()=>setNotif(!notif)}><i/></button></div></section>

   <section className="settings-mobile-card">
     <div className="settings-mobile-title"><ImagePlus/><b>{t('studioLogo')}</b></div>
     <div className="logo-mini-preview">{logo?<img src={logo} alt="logo"/>:'🌼'}</div>
     <label className="settings-upload"><ImagePlus/>{t('upload')}<input type="file" accept="image/*" onChange={pickLogo}/></label>
   </section>

   <button className="settings-save" onClick={save}><Save/>{saved?t('saved'):t('save')}</button>
  </div>
 </div>
}
