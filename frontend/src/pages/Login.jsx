import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import React,{useState} from 'react'
import {Eye,EyeOff,Mail,Lock,Globe2} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import {useI18n} from '../i18n/I18n'

export default function Login(){
  const [username,setUsername]=useState('')
  const [password,setPassword]=useState('')
  const [show,setShow]=useState(false)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const nav=useNavigate()
  const {lang,setLang}=useI18n()

  async function submit(e){
    e.preventDefault()
    setError('')
    setBusy(true)
    try{
      const result=await signInWithEmailAndPassword(auth,username.trim(),password)
      localStorage.setItem('tufting_auth','1')
      localStorage.setItem('tufting_name',result.user.email||'Studio Owner')
      nav('/')
    }catch(err){
      console.error('FIREBASE LOGIN ERROR:',err.code,err.message)
      if(err.code==='auth/invalid-credential')setError(lang==='sq'?'Email ose fjalëkalimi është gabim':lang==='de'?'E-Mail oder Passwort ist falsch':'Email or password is incorrect')
      else if(err.code==='auth/unauthorized-domain')setError('This domain is not authorized in Firebase')
      else setError(err.code||'Login failed')
    }finally{setBusy(false)}
  }

  const emailPlaceholder=lang==='sq'?'Email':lang==='de'?'E-Mail-Adresse':'Email address'
  const passPlaceholder=lang==='sq'?'Fjalëkalimi':lang==='de'?'Passwort':'Password'
  const forgot=lang==='sq'?'Harrove fjalëkalimin?':lang==='de'?'Passwort vergessen?':'Forgot password?'
  const signIn=lang==='sq'?'Hyr':lang==='de'?'Anmelden':'Sign In'
  const welcome=lang==='sq'?'Mirë se u ktheve!':lang==='de'?'Willkommen zurück!':'Welcome back!'
  const subtitle=lang==='sq'?'Hyr për të vazhduar krijimin e artit tufting.':lang==='de'?'Melde dich an, um weiter Tufting-Kunst zu erstellen.':'Sign in to continue creating amazing tufted art.'
  const remember=lang==='sq'?'Më mbaj mend':lang==='de'?'Angemeldet bleiben':'Remember me'

  const fields=(kind='mobile')=>{const cls=kind==='desktop'?'desktop-login-field':'login-clean-ready-field';return <>
    <label className={cls}>
      <Mail/>
      <input value={username} onChange={e=>setUsername(e.target.value)} placeholder={emailPlaceholder} autoComplete="username" />
    </label>
    <label className={cls}>
      <Lock/>
      <input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder={passPlaceholder} autoComplete="current-password" />
      <button type="button" onClick={()=>setShow(!show)} aria-label="Show password">{show?<EyeOff/>:<Eye/>}</button>
    </label>
  </>}

  return <>
    {/* PHONE: the current approved mobile login stays intact */}
    <div className="login-clean-ready mobile-login-preserved">
      <div className="login-clean-ready-bg" aria-hidden="true"></div>
      <form className="login-clean-ready-form" onSubmit={submit}>
        {fields('mobile')}
        <button type="button" className="login-clean-ready-forgot">{forgot}</button>
        {error&&<div className="login-clean-ready-error">{error}</div>}
        <button className="login-clean-ready-signin" disabled={busy}><span>✦</span>{busy?'...':signIn}<span>✦</span></button>
      </form>
    </div>

    {/* TABLET + PC */}
    <div className="desktop-login-final">
      <div className="desktop-login-brand"><span>🌼</span><div><b>Tufting</b><strong>Studio</strong></div></div>
      <label className="desktop-language-pill"><Globe2/><select value={lang} onChange={e=>setLang(e.target.value)}><option value="sq">Shqip</option><option value="de">Deutsch</option><option value="en">English</option></select></label>

      <form className="desktop-login-card" onSubmit={submit}>
        <div className="desktop-login-logo"><span>Tufting</span><strong>Studio</strong><i>✦</i></div>
        <h1>{welcome}</h1>
        <p>{subtitle}</p>
        {fields('desktop')}
        <div className="desktop-login-meta"><label><input type="checkbox" defaultChecked/>{remember}</label><button type="button">{forgot}</button></div>
        {error&&<div className="desktop-login-error">{error}</div>}
        <button className="desktop-login-submit" disabled={busy}><span>✦</span>{busy?'...':signIn}<span>✦</span></button>
      </form>
    </div>
  </>
}
