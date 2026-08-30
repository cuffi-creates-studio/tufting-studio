import React,{useEffect,useState} from 'react'
import {ImagePlus,Save,Bell,Languages,UserCircle2,CheckCircle2,Globe2} from 'lucide-react'
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
 const languages=[
   ['sq','Shqip','🇦🇱','retro-lang-coral'],
   ['de','Deutsch','🇩🇪','retro-lang-yellow'],
   ['en','English','🇬🇧','retro-lang-teal']
 ]
 return <div className="retro-settings-desktop">
   <style>{`
   @media (min-width:761px){
     .retro-settings-desktop{--rs-ink:#172033;--rs-muted:#76736e;--rs-line:#eadfce;--rs-paper:#fffdf8;--rs-purple:#744be3;--rs-teal:#0ca892;--rs-coral:#ff5d55;--rs-yellow:#ffc75f;--rs-blue:#4ca5d8;color:var(--rs-ink)}
     .retro-settings-desktop .rs-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:18px}
     .retro-settings-desktop .rs-heading h1{margin:0;font-size:34px;letter-spacing:-.6px}.retro-settings-desktop .rs-heading p{margin:6px 0 0;color:var(--rs-muted)}
     .retro-settings-desktop .rs-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:18px}
     .retro-settings-desktop .rs-card{background:var(--rs-paper);border:1px solid var(--rs-line);border-radius:22px;padding:23px;box-shadow:0 12px 28px rgba(61,41,19,.07)}
     .retro-settings-desktop .rs-card-head{display:flex;align-items:center;gap:12px;margin-bottom:20px}.retro-settings-desktop .rs-card-head .rs-icon{width:46px;height:46px;border-radius:15px;display:grid;place-items:center;flex:0 0 auto}.retro-settings-desktop .rs-card-head h3{margin:0 0 4px;font-size:20px}.retro-settings-desktop .rs-card-head p{margin:0;color:var(--rs-muted);font-size:13px}
     .retro-settings-desktop .rs-profile-icon{background:#f0eaff;color:#744be3}.retro-settings-desktop .rs-logo-icon{background:#e7faf5;color:#0ca892}.retro-settings-desktop .rs-lang-icon{background:#fff1dc;color:#e8781d}.retro-settings-desktop .rs-bell-icon{background:#ffe9ee;color:#e64e77}
     .retro-settings-desktop .rs-profile-row{display:grid;grid-template-columns:126px 1fr;gap:22px;align-items:center}.retro-settings-desktop .rs-avatar{width:116px;height:116px;border-radius:50%;overflow:hidden;display:grid;place-items:center;background:linear-gradient(135deg,#ffc75f,#ff5d79 55%,#744be3);color:#fff;font-size:30px;font-weight:900;border:5px solid #fff;box-shadow:0 12px 28px rgba(61,41,19,.16)}.retro-settings-desktop .rs-avatar img{width:100%;height:100%;object-fit:cover}
     .retro-settings-desktop .rs-label{display:grid;gap:7px;font-weight:800}.retro-settings-desktop .rs-label input{height:48px;border:1px solid #dfd3c3;border-radius:13px;background:#fff;padding:0 14px;outline:none}.retro-settings-desktop .rs-label input:focus{border-color:#744be3;box-shadow:0 0 0 3px rgba(116,75,227,.09)}
     .retro-settings-desktop .rs-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}.retro-settings-desktop .rs-btn{min-height:46px;border:0;border-radius:13px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:850;cursor:pointer;transition:.18s}.retro-settings-desktop .rs-btn:hover{transform:translateY(-1px)}.retro-settings-desktop .rs-upload{background:#0ca892;color:#fff;box-shadow:0 8px 18px rgba(12,168,146,.18)}.retro-settings-desktop .rs-remove{background:#fff0ef;color:#c84942;border:1px solid #f3c8c4}.retro-settings-desktop .rs-purple{background:linear-gradient(90deg,#744be3,#9a6bf2);color:#fff;box-shadow:0 9px 20px rgba(116,75,227,.22)}.retro-settings-desktop .rs-btn input{display:none}
     .retro-settings-desktop .rs-logo-row{display:flex;align-items:center;gap:22px}.retro-settings-desktop .rs-logo-preview{width:176px;height:124px;border:2px dashed #ddcdb7;border-radius:18px;background:#fffaf1;display:grid;place-items:center;overflow:hidden}.retro-settings-desktop .rs-logo-preview img{width:100%;height:100%;object-fit:contain;padding:10px}.retro-settings-desktop .rs-logo-preview span{font-size:52px}
     .retro-settings-desktop .rs-globe-wrap{display:flex;align-items:center;gap:16px;padding:17px;border-radius:18px;background:linear-gradient(135deg,#fff7df,#fff1e8);border:1px solid #f2ddbc;margin-bottom:15px}.retro-settings-desktop .rs-globe{width:68px;height:68px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#0ca892,#4ca5d8);color:white;box-shadow:inset 0 -6px 0 rgba(0,0,0,.07),0 8px 18px rgba(51,121,126,.16)}.retro-settings-desktop .rs-globe svg{width:34px;height:34px}.retro-settings-desktop .rs-globe-copy b{display:block;font-size:18px}.retro-settings-desktop .rs-globe-copy span{display:block;margin-top:4px;color:var(--rs-muted);font-size:13px}
     .retro-settings-desktop .rs-language-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.retro-settings-desktop .rs-lang-btn{min-height:62px;border-radius:15px;border:2px solid transparent;padding:9px 12px;display:flex;align-items:center;justify-content:flex-start;gap:10px;font-weight:900;color:#172033;cursor:pointer;transition:.18s;box-shadow:0 7px 16px rgba(45,33,19,.07)}.retro-settings-desktop .rs-lang-btn:hover{transform:translateY(-1px)}.retro-settings-desktop .rs-lang-btn .flag{font-size:24px}.retro-settings-desktop .rs-lang-btn.active{border-color:#172033;box-shadow:0 0 0 3px #fff,0 0 0 5px #17203320,0 8px 18px rgba(45,33,19,.1)}.retro-settings-desktop .retro-lang-coral{background:#ff8a78}.retro-settings-desktop .retro-lang-yellow{background:#ffd46b}.retro-settings-desktop .retro-lang-teal{background:#63d6c0}
     .retro-settings-desktop .rs-notification{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:16px 18px;border-radius:17px;background:#fff6f8;border:1px solid #f3d8df}.retro-settings-desktop .rs-notification strong{font-size:18px}.retro-settings-desktop .rs-notification p{margin:4px 0 0;color:var(--rs-muted);font-size:13px}
     .retro-settings-desktop .rs-switch{width:72px;height:40px;border:0;border-radius:999px;background:#ded7cf;padding:4px;display:flex;align-items:center;cursor:pointer;transition:.2s}.retro-settings-desktop .rs-switch i{width:32px;height:32px;border-radius:50%;background:#fff;display:block;box-shadow:0 3px 8px rgba(0,0,0,.16);transition:.2s}.retro-settings-desktop .rs-switch.on{background:linear-gradient(90deg,#ff5d79,#744be3)}.retro-settings-desktop .rs-switch.on i{transform:translateX(32px)}
     .retro-settings-desktop .rs-savebar{margin-top:18px;display:flex;align-items:center;justify-content:space-between;gap:20px;background:linear-gradient(90deg,#fffdf8,#fff8ed);border:1px solid var(--rs-line);border-radius:20px;padding:18px 22px;box-shadow:0 10px 24px rgba(61,41,19,.06)}.retro-settings-desktop .rs-savebar h3{margin:0 0 4px}.retro-settings-desktop .rs-savebar p{margin:0;color:var(--rs-muted)}
     @media(max-width:1150px){.retro-settings-desktop .rs-grid{grid-template-columns:1fr}.retro-settings-desktop .rs-language-grid{grid-template-columns:repeat(3,minmax(150px,1fr))}}
   }
   `}</style>

   <div className="rs-heading">
     <div><h1>{t('settings')}</h1><p>Profile, language, logo and notification preferences.</p></div>
   </div>

   <div className="rs-grid">
     <section className="rs-card">
       <div className="rs-card-head"><div className="rs-icon rs-profile-icon"><UserCircle2 size={23}/></div><div><h3>{t('profile')}</h3><p>{t('profilePhotoNote')}</p></div></div>
       <div className="rs-profile-row">
         <div className="rs-avatar">{photo?<img src={photo} alt={name}/>:name.slice(0,2).toUpperCase()}</div>
         <div>
           <label className="rs-label"><span>{t('displayName')}</span><input value={name} onChange={e=>setName(e.target.value)} placeholder={t('studioOwner')}/></label>
           <div className="rs-actions">
             <label className="rs-btn rs-upload"><ImagePlus size={18}/>{t('chooseDashboardPhoto')}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={pickProfile}/></label>
             {photo&&<button type="button" className="rs-btn rs-remove" onClick={()=>{setPhoto('');localStorage.removeItem('tufting_profile_photo');window.dispatchEvent(new Event('tufting-profile-updated'))}}>{t('removePhoto')}</button>}
           </div>
         </div>
       </div>
     </section>

     <section className="rs-card">
       <div className="rs-card-head"><div className="rs-icon rs-logo-icon"><ImagePlus size={23}/></div><div><h3>{t('studioLogo')}</h3><p>Upload the logo used in the sidebar and login page.</p></div></div>
       <div className="rs-logo-row">
         <div className="rs-logo-preview">{logo?<img src={logo} alt="logo"/>:<span>🌼</span>}</div>
         <label className="rs-btn rs-upload"><ImagePlus size={18}/>{t('upload')}<input type="file" accept="image/*" onChange={pickLogo}/></label>
       </div>
     </section>

     <section className="rs-card">
       <div className="rs-card-head"><div className="rs-icon rs-lang-icon"><Languages size={23}/></div><div><h3>{t('language')}</h3><p>Choose the language for the whole app.</p></div></div>
       <div className="rs-globe-wrap">
         <div className="rs-globe"><Globe2/></div>
         <div className="rs-globe-copy"><b>{t('language')}</b><span>Shqip · Deutsch · English</span></div>
       </div>
       <div className="rs-language-grid">
         {languages.map(([k,label,flag,colorClass])=><button type="button" key={k} className={`rs-lang-btn ${colorClass} ${lang===k?'active':''}`} onClick={()=>setLang(k)}><span className="flag">{flag}</span><span>{label}</span></button>)}
       </div>
     </section>

     <section className="rs-card">
       <div className="rs-card-head"><div className="rs-icon rs-bell-icon"><Bell size={23}/></div><div><h3>{t('notifications')}</h3><p>{t('appointmentNotifications')}</p></div></div>
       <div className="rs-notification">
         <div><strong>{notif?'On':'Off'}</strong><p>Enable reminder notifications for appointments.</p></div>
         <button type="button" aria-label="Toggle notifications" className={`rs-switch ${notif?'on':''}`} onClick={()=>setNotif(!notif)}><i/></button>
       </div>
     </section>
   </div>

   <section className="rs-savebar">
     <div><h3>{saved?t('saved'):'Save changes'}</h3><p>Store your studio profile and settings.</p></div>
     <button className="rs-btn rs-purple" onClick={save}>{saved?<CheckCircle2 size={18}/>:<Save size={18}/>}{saved?t('saved'):t('save')}</button>
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
