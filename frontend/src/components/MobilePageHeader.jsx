import React from 'react'
import {ArrowLeft} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import {useI18n} from '../i18n/I18n'

export default function MobilePageHeader({title}){
  const nav=useNavigate()
  const {t}=useI18n()

  return (
    <div className="mobile-page-header">
      <button className="mobile-back" onClick={()=>nav(-1)} aria-label={t('back')}>
        <ArrowLeft/>
      </button>
      <h1>{title}</h1>
      <span className="mobile-header-spacer"/>
    </div>
  )
}
