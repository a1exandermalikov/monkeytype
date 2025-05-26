import { Header } from './components/Header.jsx'
import { GlobalRipple } from './components/GlobalRipple.jsx'
import { Nav } from './components/Nav.jsx'
import { TypingBox } from './components/TypingBox.jsx'
import { Footer } from './components/Footer.jsx'
import {
	TypingSettingsProvider,
	useTypingSettings,
} from './context/TypingSettingsContext.jsx'

function AppContent() {
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
			<AppContent />
		</TypingSettingsProvider>
	)
}

export default App
