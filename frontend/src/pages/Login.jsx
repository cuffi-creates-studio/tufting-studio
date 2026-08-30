import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import React,{useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Eye,EyeOff,Mail,Lock,Globe2,ChevronDown} from 'lucide-react'

export default function Login(){
  const [username,setUsername]=useState('')
  const [password,setPassword]=useState('')
  const [show,setShow]=useState(false)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const nav=useNavigate()

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
      if(err.code==='auth/invalid-credential') setError('Email ose password është gabim')
      else if(err.code==='auth/user-not-found') setError('Ky përdorues nuk ekziston')
      else if(err.code==='auth/wrong-password') setError('Password-i është gabim')
      else if(err.code==='auth/unauthorized-domain') setError('Ky domain nuk është autorizuar në Firebase')
      else setError(err.code||'Login failed')
    }finally{setBusy(false)}
  }

  const fields=(
    <>
      <label className="login-clean-ready-field">
        <Mail/>
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Email address" autoComplete="username"/>
      </label>
      <label className="login-clean-ready-field">
        <Lock/>
        <input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" autoComplete="current-password"/>
        <button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff/>:<Eye/>}</button>
      </label>
    </>
  )

  return <div className="login-clean-ready">
    {/* PHONE: unchanged visual system */}
    <div className="login-phone-only">
      <div className="login-clean-ready-bg" aria-hidden="true"></div>
      <form className="login-clean-ready-form" onSubmit={submit}>
        {fields}
        <button type="button" className="login-clean-ready-forgot">Forgot password?</button>
        {error&&<div className="login-clean-ready-error">{error}</div>}
        <button className="login-clean-ready-signin" disabled={busy}><span>✦</span>{busy?'Signing in...':'Sign In'}<span>✦</span></button>
      </form>
    </div>

    {/* TABLET + PC: dedicated composition */}
    <div className="login-desktop-only">
      <div className="desktop-login-brand"><span>🌼</span><b>Tufting<br/>Studio</b></div>
      <button className="desktop-login-language" type="button"><Globe2/><span>English</span><ChevronDown/></button>

      <form className="desktop-login-card" onSubmit={submit}>
        <div className="desktop-login-logo"><span>Tufting</span><strong>Studio</strong><i>✦</i></div>
        <h1>Welcome back!</h1>
        <p>Sign in to continue creating amazing tufted art.</p>

        {fields}

        <div className="desktop-login-meta">
          <label><input type="checkbox" defaultChecked/> <span>Remember me</span></label>
          <button type="button">Forgot password?</button>
        </div>

        {error&&<div className="desktop-login-error">{error}</div>}
        <button className="desktop-login-signin" disabled={busy}><span>✦</span>{busy?'Signing in...':'Sign In'}<span>✦</span></button>

        <div className="desktop-login-divider"><span>or</span></div>
        <button type="button" className="desktop-login-google" onClick={()=>alert('Google Sign-In nuk është aktivizuar ende.')}>G&nbsp;&nbsp; Continue with Google</button>
        <div className="desktop-login-create">Don’t have an account? <b>Create one</b></div>
      </form>

      <div className="desktop-login-features" aria-hidden="true">
        <div><b>🎨 Design with joy</b><span>Color your ideas to life</span></div>
        <div><b>▣ Track with ease</b><span>All your projects, in one place</span></div>
        <div><b>✦ Create anywhere</b><span>Your studio, always with you</span></div>
        <div><b>♙ Secure & private</b><span>Your creativity is safe with us</span></div>
      </div>
    </div>
  </div>
}
