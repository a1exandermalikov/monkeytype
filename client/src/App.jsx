import { Header } from './components/Header.jsx'
import { GlobalRipple } from './components/GlobalRipple.jsx'
import { Nav } from './components/Nav.jsx'
import { TypingBox } from './components/TypingBox.jsx'
import { Footer } from './components/Footer.jsx'
import { Register } from './components/Register.jsx'
import { LogIn } from './components/LogIn.jsx'
import AuthCallback from './components/AuthCallback'
import {
	TypingSettingsProvider,
	useTypingSettings,
} from './context/TypingSettingsContext.jsx'

import { HashRouter as Router, Routes, Route } from 'react-router-dom'

function Home() {
	const { settings } = useTypingSettings()

	const handleStartTyping = () => {
		console.log('Началось печатание')
	}

	return (
		<>
			<GlobalRipple />
			<Header />
			<Nav />
			<TypingBox mode={settings.mode} onStartTyping={handleStartTyping} />
			<Footer />
		</>
	)
}

function App() {
	return (
		<TypingSettingsProvider>
			{/* HashRouter автоматически обрабатывает маршруты через # */}
			<Router>
				<Routes>
					<Route path='/' element={<Home />} />
					<Route path='/register' element={<Register />} />
					<Route path='/login' element={<LogIn />} />
					<Route path='/auth/callback' element={<AuthCallback />} />
				</Routes>
			</Router>
		</TypingSettingsProvider>
	)
}

export default App
