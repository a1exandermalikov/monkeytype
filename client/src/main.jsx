import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { TypingSettingsProvider } from './context/TypingSettingsContext'
import './styles/Global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
	<TypingSettingsProvider>
		<App />
	</TypingSettingsProvider>
)
