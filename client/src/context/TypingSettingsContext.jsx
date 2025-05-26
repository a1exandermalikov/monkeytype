import React, { createContext, useContext, useState, useEffect } from 'react'

const TypingSettingsContext = createContext()

const defaultSettings = {
	mode: 'time',
	selectedTime: 15,
	wordCount: 10,
	quoteLength: 'short',
	punctuation: false,
	numbers: false,
}

export function TypingSettingsProvider({ children }) {
	// Загружаем из localStorage при инициализации
	const [settings, setSettings] = useState(() => {
		try {
			const saved = localStorage.getItem('typingSettings')
			return saved ? JSON.parse(saved) : defaultSettings
		} catch {
			return defaultSettings
		}
	})

	const [isTypingStarted, setIsTypingStarted] = useState(false)

	// Сохраняем settings в localStorage при их изменении
	useEffect(() => {
		localStorage.setItem('typingSettings', JSON.stringify(settings))
	}, [settings])

	const resetSettings = () => {
		setSettings(defaultSettings)
		setIsTypingStarted(false)
	}

	return (
		<TypingSettingsContext.Provider
			value={{
				settings,
				setSettings,
				isTypingStarted,
				setIsTypingStarted,
				resetSettings,
			}}
		>
			{children}
		</TypingSettingsContext.Provider>
	)
}

export function useTypingSettings() {
	return useContext(TypingSettingsContext)
}
