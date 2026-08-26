import React,{useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Eye,EyeOff,Mail,Lock} from 'lucide-react'
import {login,token} from '../api/client'

export default function Login(){
  const [username,setUsername]=useState('admin')
  const [password,setPassword]=useState('admin123')
  const [show,setShow]=useState(false)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const nav=useNavigate()

  async function submit(e){
    e.preventDefault()
    setError('')
    setBusy(true)
    try{
      const data=await login(username,password)
      token.set(data.access_token)
      localStorage.setItem('tufting_name',data.display_name||'Studio Owner')
      nav('/')
    }catch(err){
      setError(err.message||'Login failed')
    }finally{
      setBusy(false)
    }
  }

  return (
    <div className="login-clean-ready">
      <div className="login-clean-ready-bg" aria-hidden="true"></div>

      <form className="login-clean-ready-form" onSubmit={submit}>
        <label className="login-clean-ready-field">
          <Mail/>
          <input
            value={username}
            onChange={e=>setUsername(e.target.value)}
            placeholder="Email address"
            autoComplete="username"
          />
        </label>

        <label className="login-clean-ready-field">
          <Lock/>
          <input
            type={show?'text':'password'}
            value={password}
            onChange={e=>setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
          />
          <button type="button" onClick={()=>setShow(!show)}>
            {show?<EyeOff/>:<Eye/>}
          </button>
        </label>

        <button type="button" className="login-clean-ready-forgot">
          Forgot password?
        </button>

        {error&&<div className="login-clean-ready-error">{error}</div>}

        <button className="login-clean-ready-signin" disabled={busy}>
          <span>✦</span>
          {busy?'Signing in...':'Sign In'}
          <span>✦</span>
        </button>
      </form>
    </div>
  )
}
