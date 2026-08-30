import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import React,{useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Eye,EyeOff,Mail,Lock,Globe2} from 'lucide-react'
import {useI18n} from '../i18n/I18n'
import '../styles/desktop-restore.css'

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

  return (
    <>
      <div className="desktop-login-restore">
        <div className="desktop-login-brand"><span>🌼</span><div><b>Tufting</b><strong>Studio</strong></div></div>
        <label className="desktop-login-language"><Globe2/><select value={lang} onChange={e=>setLang(e.target.value)}><option value="en">English</option><option value="de">Deutsch</option><option value="sq">Shqip</option></select></label>

        <form className="desktop-login-card" onSubmit={submit}>
          <div className="desktop-login-wordmark"><span>Tufting</span><strong>Studio</strong><i>✦</i></div>
          <h1>Welcome back!</h1>
          <p>Sign in to continue creating amazing tufted art.</p>

          <label className="desktop-login-field"><Mail/><input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username or Email" autoComplete="username"/></label>
          <label className="desktop-login-field"><Lock/><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" autoComplete="current-password"/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff/>:<Eye/>}</button></label>

          <div className="desktop-login-meta"><label><input type="checkbox" defaultChecked/> Remember me</label><button type="button">Forgot password?</button></div>
          {error&&<div className="desktop-login-error">{error}</div>}
          <button className="desktop-login-signin" disabled={busy}><span>✦</span>{busy?'Signing in...':'Sign In'}<span>✦</span></button>
        </form>

        <div className="desktop-login-features">
          <div><b>🎨</b><span><strong>Design with joy</strong><small>Color your ideas to life</small></span></div>
          <div><b>▣</b><span><strong>Track with ease</strong><small>All your projects, in one place</small></span></div>
          <div><b>✦</b><span><strong>Create anywhere</strong><small>Your studio, always with you</small></span></div>
          <div><b>♙</b><span><strong>Secure & private</strong><small>Your creativity is safe with us</small></span></div>
        </div>
      </div>

      <div className="login-mobile-current">
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
      </div>
    </>
  )

}
