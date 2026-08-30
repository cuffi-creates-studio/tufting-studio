import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import {I18nProvider} from './i18n/I18n'
import './styles/global.css'
import './styles/desktop-tablet-final.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <I18nProvider><App /></I18nProvider>
    </HashRouter>
  </React.StrictMode>
)
