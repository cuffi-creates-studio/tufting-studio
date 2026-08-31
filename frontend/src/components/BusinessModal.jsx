import React from 'react'
import {X} from 'lucide-react'

export default function BusinessModal({open,title,subtitle,onClose,children,wide=false}){
  if(!open)return null
  return <div className="biz-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose?.()}}>
    <section className={`biz-modal ${wide?'wide':''}`} role="dialog" aria-modal="true" aria-label={title}>
      <div className="biz-modal-head">
        <div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>
        <button type="button" className="biz-icon-btn" onClick={onClose} aria-label="Mbyll"><X size={20}/></button>
      </div>
      <div className="biz-modal-body">{children}</div>
    </section>
  </div>
}
