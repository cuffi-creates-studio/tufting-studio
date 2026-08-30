import React,{useEffect,useState} from 'react'
import {ArrowLeft,ImagePlus,Save,Bell,Languages,UserCircle2,CheckCircle2} from 'lucide-react'
import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'

const toData=f=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(f)})

export default function Settings(){
 const {t,lang,setLang}=useI18n()
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
 function save(){
   localStorage.setItem('tufting_profile_name',name)
   localStorage.setItem('tufting_profile_photo',photo)
   localStorage.setItem('tufting_studio_logo',logo)
   localStorage.setItem('tufting_appointment_notifications',notif?'on':'off')
   window.dispatchEvent(new Event('tufting-profile-updated'))
   setSaved(true);setTimeout(()=>setSaved(false),1400)
 }

 if(isMobile)return <MobileSettings {...{t,lang,setLang,name,setName,photo,setPhoto,logo,setLogo,notif,setNotif,saved,pickProfile,pickLogo,save}}/>

 return <DesktopSettings {...{t,lang,setLang,name,setName,photo,setPhoto,logo,setLogo,notif,setNotif,saved,pickProfile,pickLogo,save}}/>
}

function MobileSettings({t,lang,setLang,name,setName,photo,setPhoto,logo,notif,setNotif,saved,pickProfile,pickLogo,save}){
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

function DesktopSettings({t,lang,setLang,name,setName,photo,setPhoto,logo,notif,setNotif,saved,pickProfile,pickLogo,save}){
 return <div className="desktop-settings-page">
   <div className="page-title">
     <div>
       <h1>{t('settings')}</h1>
       <p>Profile, language, logo and notification preferences.</p>
     </div>
   </div>

   <div className="settings-grid settings-professional">
     <section className="card">
       <div className="settings-card-title">
         <UserCircle2/>
         <div>
           <h3>{t('profile')}</h3>
           <p>{t('profilePhotoNote')}</p>
         </div>
       </div>
       <div className="profile-settings-row">
         <div className="profile-preview-large">{photo?<img src={photo} alt={name}/>:name.slice(0,2).toUpperCase()}</div>
         <div className="settings-fields">
           <label>
             <span>{t('displayName')}</span>
             <input value={name} onChange={e=>setName(e.target.value)} placeholder={t('studioOwner')}/>
           </label>
           <div className="upload-actions">
             <label className="upload-btn"><ImagePlus size={18}/>{t('chooseDashboardPhoto')}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={pickProfile}/></label>
             {photo&&<button type="button" className="soft-danger" onClick={()=>{setPhoto('');localStorage.removeItem('tufting_profile_photo');window.dispatchEvent(new Event('tufting-profile-updated'))}}>{t('removePhoto')}</button>}
           </div>
         </div>
       </div>
     </section>

     <section className="card">
       <div className="settings-card-title">
         <ImagePlus/>
         <div>
           <h3>{t('studioLogo')}</h3>
           <p>Upload the logo used in the sidebar and login page.</p>
         </div>
       </div>
       <div className="logo-settings-row">
         <div className="logo-preview-box">{logo?<img src={logo} alt="logo"/>:<div className="logo-placeholder">🌼</div>}</div>
         <div className="settings-fields">
           <div className="upload-actions vertical">
             <label className="upload-btn"><ImagePlus size={18}/>{t('upload')}<input type="file" accept="image/*" onChange={pickLogo}/></label>
           </div>
         </div>
       </div>
     </section>

     <section className="card">
       <div className="settings-card-title">
         <Languages/>
         <div>
           <h3>{t('language')}</h3>
           <p>Switch the app language instantly.</p>
         </div>
       </div>
       <div className="language-segment desktop-language-segment">{[['sq','Shqip'],['de','Deutsch'],['en','English']].map(([k,l])=><button className={lang===k?'active':''} onClick={()=>setLang(k)} key={k}>{l}</button>)}</div>
     </section>

     <section className="card">
       <div className="settings-card-title">
         <Bell/>
         <div>
           <h3>{t('notifications')}</h3>
           <p>{t('appointmentNotifications')}</p>
         </div>
       </div>
       <div className="desktop-notification-row">
         <div>
           <strong>{notif?'On':'Off'}</strong>
           <p>Enable reminder notifications for appointments.</p>
         </div>
         <button type="button" className={`settings-switch ${notif?'on':''}`} onClick={()=>setNotif(!notif)}><i/></button>
       </div>
     </section>
   </div>

   <section className="card settings-save-card" style={{marginTop:18}}>
     <div>
       <h3>{saved?t('saved'):'Save changes'}</h3>
       <p>Store your studio profile and settings without affecting the mobile layout.</p>
     </div>
     <button className="btn save-profile-btn" onClick={save}>{saved?<CheckCircle2 size={18}/>:<Save size={18}/>}{saved?t('saved'):t('save')}</button>
   </section>
 </div>
}

function useMedia(query){
 const [matches,setMatches]=useState(()=>typeof window!=='undefined'&&window.matchMedia(query).matches)
 useEffect(()=>{
   const m=window.matchMedia(query),f=()=>setMatches(m.matches)
   f();m.addEventListener?.('change',f)
   return()=>m.removeEventListener?.('change',f)
 },[query])
 return matches
}
