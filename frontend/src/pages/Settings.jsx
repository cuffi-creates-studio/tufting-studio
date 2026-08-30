import React,{useEffect,useState} from 'react'
import {ImagePlus,Save,Bell,Languages,UserCircle2,Globe2,CheckCircle2} from 'lucide-react'
import MobilePageHeader from '../components/MobilePageHeader'
import {useI18n} from '../i18n/I18n'
import '../styles/settings-retro.css'

const readFileData=f=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(f)})

async function prepareStoredImage(file,maxSide=900,quality=.88){
 const raw=await readFileData(file)
 const img=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=raw})
 const scale=Math.min(1,maxSide/Math.max(img.naturalWidth||img.width,img.naturalHeight||img.height))
 const w=Math.max(1,Math.round((img.naturalWidth||img.width)*scale))
 const h=Math.max(1,Math.round((img.naturalHeight||img.height)*scale))
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h
 const ctx=canvas.getContext('2d',{alpha:true});ctx.drawImage(img,0,0,w,h)
 let data=''
 try{data=canvas.toDataURL('image/webp',quality)}catch{}
 if(!data||data==='data:,') data=canvas.toDataURL(file.type==='image/png'?'image/png':'image/jpeg',quality)
 return data
}

function persistImage(key,data){
 try{
   if(data)localStorage.setItem(key,data)
   else localStorage.removeItem(key)
   return true
 }catch(err){
   console.error('Could not save image',err)
   return false
 }
}

export default function Settings(){
 const {t,lang,setLang}=useI18n()
 const isMobile=useMedia('(max-width: 760px)')
 const [name,setName]=useState(localStorage.getItem('tufting_profile_name')||'Studio Owner')
 const [photo,setPhoto]=useState(localStorage.getItem('tufting_profile_photo')||'')
 const [logo,setLogo]=useState(localStorage.getItem('tufting_studio_logo')||'')
 const [notif,setNotif]=useState(localStorage.getItem('tufting_appointment_notifications')!=='off')
 const [saved,setSaved]=useState(false)
 const [saveError,setSaveError]=useState('')

 async function pickProfile(e){
   const f=e.target.files?.[0];if(!f)return
   setSaveError('')
   try{
     const data=await prepareStoredImage(f,720,.88)
     if(!persistImage('tufting_profile_photo',data)) throw new Error('storage')
     setPhoto(data)
     window.dispatchEvent(new Event('tufting-profile-updated'))
   }catch(err){
     console.error(err)
     setSaveError('Fotoja e profilit nuk u ruajt. Provo një foto tjetër.')
   }finally{e.target.value=''}
 }
 async function pickLogo(e){
   const f=e.target.files?.[0];if(!f)return
   setSaveError('')
   try{
     const data=await prepareStoredImage(f,900,.9)
     if(!persistImage('tufting_studio_logo',data)) throw new Error('storage')
     setLogo(data)
     window.dispatchEvent(new Event('tufting-profile-updated'))
   }catch(err){
     console.error(err)
     setSaveError('Logoja nuk u ruajt. Provo një imazh tjetër.')
   }finally{e.target.value=''}
 }
 function removeProfilePhoto(){
   setPhoto('')
   persistImage('tufting_profile_photo','')
   window.dispatchEvent(new Event('tufting-profile-updated'))
 }
 function save(){
   setSaveError('')
   try{
     localStorage.setItem('tufting_profile_name',name)
     if(photo&&!persistImage('tufting_profile_photo',photo)) throw new Error('profile storage')
     if(logo&&!persistImage('tufting_studio_logo',logo)) throw new Error('logo storage')
     localStorage.setItem('tufting_appointment_notifications',notif?'on':'off')
     window.dispatchEvent(new Event('tufting-profile-updated'))
     setSaved(true);setTimeout(()=>setSaved(false),1400)
   }catch(err){
     console.error(err)
     setSaveError('Nuk u ruajtën ndryshimet. Provo përsëri.')
   }
 }

 if(isMobile){
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
          {photo&&<button type="button" className="settings-remove-photo" onClick={removeProfilePhoto}>{t('removePhoto')}</button>}
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

    {saveError&&<p style={{color:'#b42318',fontWeight:800,margin:'4px 2px 0'}}>{saveError}</p>}
    <button className="settings-save" onClick={save}><Save/>{saved?t('saved'):t('save')}</button>
   </div>
  </div>
 }

 const languages=[
   {id:'sq',label:'Shqip',flag:'🇦🇱',cls:'sq'},
   {id:'de',label:'Deutsch',flag:'🇩🇪',cls:'de'},
   {id:'en',label:'English',flag:'🇬🇧',cls:'en'},
 ]

 return <div className="settings-retro-page">
   <div className="settings-retro-title">
     <div><h1>{t('settings')}</h1><p>Profili, gjuha, logo dhe njoftimet e studios.</p></div>
   </div>

   <div className="settings-retro-grid">
     <section className="settings-retro-card profile-card">
       <div className="retro-card-head">
         <span className="retro-card-icon purple"><UserCircle2/></span>
         <div><h3>{t('profile')}</h3><p>{t('profilePhotoNote')}</p></div>
       </div>
       <div className="retro-profile-row">
         <div className="retro-avatar">{photo?<img src={photo} alt={name}/>:name.slice(0,2).toUpperCase()}</div>
         <div className="retro-profile-fields">
           <label><span>{t('displayName')}</span><input value={name} onChange={e=>setName(e.target.value)} placeholder={t('studioOwner')}/></label>
           <div className="retro-actions">
             <label className="retro-btn teal"><ImagePlus size={18}/>{t('chooseDashboardPhoto')}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={pickProfile}/></label>
             {photo&&<button type="button" className="retro-btn soft" onClick={removeProfilePhoto}>{t('removePhoto')}</button>}
           </div>
         </div>
       </div>
     </section>

     <section className="settings-retro-card logo-card">
       <div className="retro-card-head">
         <span className="retro-card-icon green"><ImagePlus/></span>
         <div><h3>{t('studioLogo')}</h3><p>Logoja që shfaqet në program.</p></div>
       </div>
       <div className="retro-logo-row">
         <div className="retro-logo-box">{logo?<img src={logo} alt="logo"/>:<span>🌼</span>}</div>
         <label className="retro-btn coral"><ImagePlus size={18}/>{t('upload')}<input type="file" accept="image/*" onChange={pickLogo}/></label>
       </div>
     </section>

     <section className="settings-retro-card language-card">
       <div className="retro-card-head">
         <span className="retro-card-icon orange"><Globe2/></span>
         <div><h3>{t('language')}</h3><p>Zgjidh gjuhën e gjithë programit.</p></div>
       </div>

       <div className="retro-globe-panel">
         <div className="retro-globe"><Globe2/></div>
         <div><b>{t('language')}</b><span>Shqip · Deutsch · English</span></div>
       </div>

       <div className="retro-language-buttons">
         {languages.map(l=><button type="button" key={l.id} onClick={()=>setLang(l.id)} className={`retro-lang ${l.cls} ${lang===l.id?'active':''}`}>
           <span className="retro-flag">{l.flag}</span><span>{l.label}</span>{lang===l.id&&<CheckCircle2 size={18}/>} 
         </button>)}
       </div>
     </section>

     <section className="settings-retro-card notification-card">
       <div className="retro-card-head">
         <span className="retro-card-icon pink"><Bell/></span>
         <div><h3>{t('notifications')}</h3><p>{t('appointmentNotifications')}</p></div>
       </div>
       <div className="retro-notification-row">
         <div><b>{notif?'ON':'OFF'}</b><span>Aktivizo kujtesat për terminet.</span></div>
         <button type="button" className={`retro-switch ${notif?'on':''}`} onClick={()=>setNotif(!notif)} aria-label="Toggle notifications"><i/></button>
       </div>
     </section>
   </div>

   {saveError&&<p style={{color:'#b42318',fontWeight:800,margin:'0 0 10px 4px'}}>{saveError}</p>}
   <div className="retro-save-bar">
     <div><h3>{saved?t('saved'):'Ruaj ndryshimet'}</h3><p>Ruaji cilësimet e studios.</p></div>
     <button className="retro-save-btn" onClick={save}>{saved?<CheckCircle2/>:<Save/>}{saved?t('saved'):t('save')}</button>
   </div>
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
