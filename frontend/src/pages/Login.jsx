import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import React,{useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Eye,EyeOff,Mail,Lock,Globe2} from 'lucide-react'
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
      const result = await signInWithEmailAndPassword(
        auth,
        username.trim(),
        password
      )

      localStorage.setItem('tufting_auth','1')
      localStorage.setItem(
        'tufting_name',
        result.user.email || 'Studio Owner'
      )

      nav('/')
    }catch(err){
      console.error('FIREBASE LOGIN ERROR:', err.code, err.message)

      if(err.code==='auth/invalid-credential'){
        setError('Email ose password është gabim')
      }else if(err.code==='auth/user-not-found'){
        setError('Ky përdorues nuk ekziston')
      }else if(err.code==='auth/wrong-password'){
        setError('Password-i është gabim')
      }else if(err.code==='auth/unauthorized-domain'){
        setError('Ky domain nuk është autorizuar në Firebase')
      }else{
        setError(err.code || 'Login failed')
      }
    }finally{
      setBusy(false)
    }
  }

  const copy={
    en:{welcome:'Welcome back!',sub:'Sign in to continue creating amazing tufted art.',email:'Username or Email',password:'Password',remember:'Remember me',forgot:'Forgot password?',signin:'Sign In'},
    de:{welcome:'Willkommen zurück!',sub:'Melde dich an und gestalte weiter großartige Tufting-Kunst.',email:'E-Mail',password:'Passwort',remember:'Angemeldet bleiben',forgot:'Passwort vergessen?',signin:'Anmelden'},
    sq:{welcome:'Mirë se u ktheve!',sub:'Hyr për të vazhduar krijimin e artit tufting.',email:'Email',password:'Fjalëkalimi',remember:'Më mbaj mend',forgot:'Harrove fjalëkalimin?',signin:'Hyr'}
  }[lang]||{}

  return (
    <>
      <div className="desktop-login-final">
        <div className="desktop-login-brand"><span>🌼</span><b>Tufting<br/>Studio</b></div>
        <label className="desktop-login-lang"><Globe2/><select value={lang} onChange={e=>setLang(e.target.value)}><option value="sq">Shqip</option><option value="de">Deutsch</option><option value="en">English</option></select></label>
        <form className="desktop-login-card" onSubmit={submit}>
          <div className="desktop-login-logo"><span>Tufting</span><strong>Studio</strong><i>✦</i></div>
          <h1>{copy.welcome}</h1>
          <p>{copy.sub}</p>
          <label className="desktop-login-field"><Mail/><input value={username} onChange={e=>setUsername(e.target.value)} placeholder={copy.email} autoComplete="username"/></label>
          <label className="desktop-login-field"><Lock/><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder={copy.password} autoComplete="current-password"/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff/>:<Eye/>}</button></label>
          <div className="desktop-login-meta"><label><input type="checkbox" defaultChecked/> {copy.remember}</label><button type="button">{copy.forgot}</button></div>
          {error&&<div className="desktop-login-error">{error}</div>}
          <button className="desktop-login-signin" disabled={busy}><span>✦</span>{busy?'...':copy.signin}<span>✦</span></button>
        </form>
      </div>

      <div className="login-clean-ready">
        <div className="login-clean-ready-bg" aria-hidden="true"></div>
        <form className="login-clean-ready-form" onSubmit={submit}>
          <label className="login-clean-ready-field"><Mail/><input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Email address" autoComplete="username"/></label>
          <label className="login-clean-ready-field"><Lock/><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" autoComplete="current-password"/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff/>:<Eye/>}</button></label>
          <button type="button" className="login-clean-ready-forgot">Forgot password?</button>
          {error&&<div className="login-clean-ready-error">{error}</div>}
          <button className="login-clean-ready-signin" disabled={busy}><span>✦</span>{busy?'Signing in...':'Sign In'}<span>✦</span></button>
        </form>
      </div>
    </>
  )
}