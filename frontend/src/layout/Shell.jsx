import React,{useEffect,useState} from 'react'
import {NavLink,Outlet,useNavigate} from 'react-router-dom'
import {Home,FolderKanban,Images,WandSparkles,Projector,Calculator,Boxes,Settings,Menu,Search,LogOut,X,Globe2,Clock3,ClipboardList,PackageCheck,WalletCards} from 'lucide-react'
import {useI18n} from '../i18n/I18n'
import {signOut} from 'firebase/auth'
import {auth} from '../lib/firebase'

const getProfile=()=>({
 name:localStorage.getItem('tufting_profile_name')||localStorage.getItem('tufting_name')||'Studio Owner',
 photo:localStorage.getItem('tufting_profile_photo')||'',
 logo:localStorage.getItem('tufting_studio_logo')||''
})

export default function Shell(){
 const {t,lang,setLang}=useI18n()
 const [drawer,setDrawer]=useState(false),[p,setP]=useState(getProfile())
 const nav=useNavigate()

 async function logout(){
  try{await signOut(auth)}catch(err){console.error('FIREBASE LOGOUT ERROR:',err)}finally{
   localStorage.removeItem('tufting_auth')
   localStorage.removeItem('tufting_name')
   nav('/login',{replace:true})
  }
 }

 useEffect(()=>{
  const f=()=>setP(getProfile())
  window.addEventListener('tufting-profile-updated',f)
  return()=>window.removeEventListener('tufting-profile-updated',f)
 },[])

 const items=[
  ['/',Home,t('dashboard')],['/projects',FolderKanban,t('projects')],['/gallery',Images,t('gallery')],
  ['/design',WandSparkles,t('design')],['/projector',Projector,t('projector')],
  ['/calculator',Calculator,t('calculator')],['/materials',Boxes,t('materials')],['/work-hours',Clock3,workHoursLabel(lang)],
  ['/orders',ClipboardList,businessLabel('orders',lang),'biz-nav-orders'],
  ['/inventory',PackageCheck,businessLabel('inventory',lang),'biz-nav-inventory'],
  ['/expenses',WalletCards,businessLabel('expenses',lang),'biz-nav-expenses'],
  ['/settings',Settings,t('settings')]
 ]
 const avatar=p.photo?<img src={p.photo} alt={p.name}/>:<span>{p.name.slice(0,2).toUpperCase()}</span>

 return <div className="app-shell">
  <aside className={`sidebar ${drawer?'mobile-open':''}`}>
   <div className="brand">
    <div className={`brand-logo ${p.logo?'has-image':''}`}>{p.logo?<img src={p.logo} alt="logo"/>:'🌼'}</div>
    <div className="brand-copy"><b>Tufting</b><strong>Studio</strong></div>
   </div>
   <nav>{items.map(([to,I,label,extraClass])=><NavLink key={to} to={to} end={to==='/'} className={({isActive})=>`${isActive?'active ':''}${extraClass||''}`.trim()} onClick={()=>setDrawer(false)}><span className="nav-icon"><I/></span><span>{label}</span>{extraClass&&<em className="biz-new-pill">New</em>}</NavLink>)}</nav>
   <div className="sidebar-bottom">
    <div className="profile-avatar">{avatar}</div>
    <div className="profile-text"><b>{adminLabel(lang)}</b><small>Professional</small></div>
    <button className="sidebar-logout-mobile" onClick={logout} aria-label="Logout"><LogOut/></button>
   </div>
  </aside>

  {drawer&&<button className="mobile-drawer-backdrop" onClick={()=>setDrawer(false)} aria-label="Close menu"/>}

  <main className="main-area">
   <header className="topbar">
    <button className="icon-button mobile-menu" onClick={()=>setDrawer(true)}><Menu/></button>
    <div className="search-box"><Search/><input placeholder="Search projects, materials..."/></div>
    <div className="topbar-spacer"/>
    <label className="desktop-shell-language"><Globe2/><select value={lang} onChange={e=>setLang(e.target.value)}><option value="sq">Shqip</option><option value="de">Deutsch</option><option value="en">English</option></select></label>
    <div className="top-profile"><div className="top-profile-avatar">{avatar}</div><button className="logout-button" onClick={logout}><LogOut/></button></div>
   </header>
   <div className="page-wrap"><Outlet/></div>
  </main>

  <nav className="retro-homebar">
    <NavLink to="/" end className={({isActive})=>`hb-item hb-home ${isActive?'active':''}`}><span className="hb-circle"><Home/></span><small>{t('home')}</small></NavLink>
    <NavLink to="/projects" className={({isActive})=>`hb-item hb-projects ${isActive?'active':''}`}><span className="hb-circle"><FolderKanban/></span><small>{t('projects')}</small></NavLink>
    <NavLink to="/gallery" className={({isActive})=>`hb-item hb-gallery ${isActive?'active':''}`}><span className="hb-circle"><Images/></span><small>{t('gallery')}</small></NavLink>
    <button className={`hb-item hb-menu ${drawer?'active':''}`} onClick={()=>setDrawer(v=>!v)}><span className="hb-circle">{drawer?<X/>:<Menu/>}</span><small>{t('menu')}</small></button>
  </nav>
 </div>
}

function workHoursLabel(lang){return lang==='sq'?'Orët e punës':lang==='de'?'Arbeitszeit':'Work Hours'}
function adminLabel(lang){return lang==='sq'?'Administratori':lang==='de'?'Administrator':'Administrator'}

function businessLabel(type,lang){
 if(type==='orders')return lang==='sq'?'Porositë':lang==='de'?'Bestellungen':'Orders'
 if(type==='inventory')return lang==='sq'?'Inventari':lang==='de'?'Inventar':'Inventory'
 return lang==='sq'?'Shpenzimet':lang==='de'?'Ausgaben':'Expenses'
}
