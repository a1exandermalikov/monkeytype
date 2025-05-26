import React from 'react'
import '../styles/Nav.css'
import { useTypingSettings } from '../context/TypingSettingsContext'

export function Nav() {
	const iconPath = './src/assets/icons'
	const { settings, setSettings, isTypingStarted, resetSettings } =
		useTypingSettings()

	const handleModeClick = key => {
		if (isTypingStarted) return
		console.log('Смена режима на:', key)
		setSettings(prev => ({ ...prev, mode: key }))
	}

	const handleTimeClick = val => {
		if (isTypingStarted) return
		setSettings(prev => ({ ...prev, selectedTime: val }))
	}

	const handleWordCountClick = val => {
		if (isTypingStarted) return
		setSettings(prev => ({ ...prev, wordCount: val }))
	}

	const handleQuoteLengthClick = val => {
		if (isTypingStarted) return
		setSettings(prev => ({ ...prev, quoteLength: val }))
	}

	const togglePuncAndNum = key => {
		if (isTypingStarted) return
		setSettings(prev => ({ ...prev, [key]: !prev[key] }))
	}

	const modes = ['time', 'words']

	return (
		<nav>
			<div className='nav-buttons'>
				<div className='PuncAndNum'>
					<button
						className={settings.punctuation ? 'active' : ''}
						onClick={() => togglePuncAndNum('punctuation')}
						disabled={isTypingStarted}
					>
						@ punctuation
					</button>
					<button
						className={settings.numbers ? 'active' : ''}
						onClick={() => togglePuncAndNum('numbers')}
						disabled={isTypingStarted}
					>
						# numbers
					</button>
				</div>

				<hr />

				<div className='mode'>
					{modes.map(btn => (
						<button
							key={btn}
							className={settings.mode === btn ? 'active' : ''}
							onClick={() => handleModeClick(btn)}
							disabled={isTypingStarted}
						>
							<img
								className='sIcon'
								src={`${iconPath}/${
									settings.mode === btn ? 'active' : 'static'
								}/${btn}.png`}
								alt={btn}
							/>
							{btn}
						</button>
					))}
				</div>

				<hr />

				{/* Dynamic Options */}
				{settings.mode === 'time' && (
					<div className='time'>
						{[15, 30, 60, 120].map(t => (
							<button
								key={t}
								className={settings.selectedTime === t ? 'active' : ''}
								onClick={() => handleTimeClick(t)}
								disabled={isTypingStarted}
							>
								{t}
							</button>
						))}
					</div>
				)}

				{settings.mode === 'words' && (
					<div className='word-count'>
						{[10, 25, 50, 100].map(n => (
							<button
								key={n}
								className={settings.wordCount === n ? 'active' : ''}
								onClick={() => handleWordCountClick(n)}
								disabled={isTypingStarted}
							>
								{n}
							</button>
						))}
					</div>
				)}

				{isTypingStarted && (
					<>
						<hr />
						<button onClick={resetSettings}>Reset</button>
					</>
				)}
			</div>
		</nav>
	)
}
