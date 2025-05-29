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

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

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
			<Router>
				<Routes>
					<Route path='/monkeytype' element={<Home />} />
					<Route path='/monkeytype/register' element={<Register />} />
					<Route path='/monkeytype/login' element={<LogIn />} />
					<Route path='/monkeytype/auth/callback' element={<AuthCallback />} />
				</Routes>
			</Router>
		</TypingSettingsProvider>
	)
}

export default App
