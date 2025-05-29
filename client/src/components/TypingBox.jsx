import React, { useEffect, useRef, useState, useMemo } from 'react'
import '../styles/TypingBox.css'
import { useTypingSettings } from '../context/TypingSettingsContext'
import { generateText } from '../utils/generateText'

const LINES_TO_SHOW = 3

const TypingBox = ({ onStartTyping, mode }) => {
	const containerRef = useRef(null)
	const caretRef = useRef(null)
	const measureRef = useRef(null)

	const [currentCharIndex, setCurrentCharIndex] = useState(0)
	const [typed, setTyped] = useState([])
	const [wordCountTyped, setWordCountTyped] = useState(0)
	const [text, setText] = useState('')
	const [isTyping, setIsTyping] = useState(false)
	const [lines, setLines] = useState([])
	const [currentLineTyping, setCurrentLineTyping] = useState(0)
	const [animatingIndexes, setAnimatingIndexes] = useState(new Set())
	const [isFinished, setIsFinished] = useState(false)
	const [elapsedTime, setElapsedTime] = useState(0)
	const [timeLeft, setTimeLeft] = useState(0)

	const { settings, isTypingStarted, setIsTypingStarted } = useTypingSettings()

	// Генерация текста
	useEffect(() => {
		const generated = generateText({
			punctuation: settings.punctuation,
			numbers: settings.numbers,
			wordCount: 500,
		})
		setText(generated)
		setTyped([])
		setCurrentCharIndex(0)
		setWordCountTyped(0)
		setCurrentLineTyping(0)
		setAnimatingIndexes(new Set())
		setIsFinished(false)
		setElapsedTime(0)
		setTimeLeft(settings.selectedTime)
		setIsTypingStarted(false)
	}, [mode, settings])

	// Разбиение текста по словам и строкам
	const limitedText = useMemo(() => {
		if (mode === 'words') {
			const words = text.split(' ')
			return words.slice(0, settings.wordCount).join(' ') + ' '
		}
		return text
	}, [mode, text, settings.wordCount])

	const words = useMemo(() => limitedText.split(' '), [limitedText])

	// Расчёт строк
	useEffect(() => {
		if (!measureRef.current || !containerRef.current) return

		const containerWidth = containerRef.current.clientWidth
		const containerStyles = getComputedStyle(containerRef.current)

		Object.assign(measureRef.current.style, {
			fontSize: containerStyles.fontSize,
			fontFamily: containerStyles.fontFamily,
			fontWeight: containerStyles.fontWeight,
			letterSpacing: containerStyles.letterSpacing,
			whiteSpace: 'nowrap',
		})

		const newLines = []
		let currentLine = ''

		for (let word of words) {
			const testLine = currentLine ? currentLine + ' ' + word : word
			measureRef.current.textContent = testLine

			if (measureRef.current.getBoundingClientRect().width > containerWidth) {
				if (currentLine) newLines.push(currentLine)
				currentLine = word
			} else {
				currentLine = testLine
			}
		}
		if (currentLine) newLines.push(currentLine)
		newLines.push('') // Добавим пустую строку для последней каретки

		setLines(newLines.map(line => line + ' '))
	}, [limitedText, words])

	const charCountByLine = useMemo(() => lines.map(line => line.length), [lines])

	// Каретка позиционирование
	useEffect(() => {
		if (!caretRef.current || !containerRef.current) return

		const chars = containerRef.current.querySelectorAll('.char')
		if (!chars.length) return

		const visibleStart = charCountByLine
			.slice(0, Math.max(0, currentLineTyping - 1))
			.reduce((a, b) => a + b, 0)

		const index = currentCharIndex - visibleStart
		const target =
			index >= chars.length ? chars[chars.length - 1] : chars[index]

		if (!target) return

		const { left, top, height } = target.getBoundingClientRect()
		const containerRect = containerRef.current.getBoundingClientRect()

		caretRef.current.style.left = `${left - containerRect.left}px`
		caretRef.current.style.top = `${top - containerRect.top}px`
		caretRef.current.style.height = `${height}px`
	}, [currentCharIndex, charCountByLine, currentLineTyping, lines])

	// Таймер
	useEffect(() => {
		if (mode !== 'time' || !isTypingStarted) return
		const interval = setInterval(() => {
			setTimeLeft(prev => {
				if (prev <= 1) {
					clearInterval(interval)
					setIsTypingStarted(false)
					setIsFinished(true)
					return 0
				}
				return prev - 1
			})
		}, 1000)
		return () => clearInterval(interval)
	}, [isTypingStarted, mode])

	// Время печати
	useEffect(() => {
		if (!isTypingStarted || isFinished) return
		const start = Date.now()
		const interval = setInterval(() => {
			setElapsedTime(Math.floor((Date.now() - start) / 1000))
		}, 250)
		return () => clearInterval(interval)
	}, [isTypingStarted, isFinished])

	useEffect(() => {
		if (!containerRef.current) return
		containerRef.current.focus()
	}, [mode, settings])

	// Анимация последнего символа
	useEffect(() => {
		if (!currentCharIndex) return
		const idx = currentCharIndex - 1
		setAnimatingIndexes(prev => new Set(prev).add(idx))
		const timeout = setTimeout(() => {
			setAnimatingIndexes(prev => {
				const copy = new Set(prev)
				copy.delete(idx)
				return copy
			})
		}, 800)
		return () => clearTimeout(timeout)
	}, [currentCharIndex])

	const visibleLines = useMemo(() => {
		const start = Math.max(0, currentLineTyping - 1)
		const linesSlice = lines.slice(start, start + LINES_TO_SHOW)
		while (linesSlice.length < LINES_TO_SHOW) linesSlice.push(' ')
		return linesSlice
	}, [lines, currentLineTyping])

	const renderLine = (line, lineIdx) => {
		const globalLineIdx = Math.max(0, currentLineTyping - 1) + lineIdx
		const startIndex = charCountByLine
			.slice(0, globalLineIdx)
			.reduce((a, b) => a + b, 0)

		return (
			<p key={lineIdx} className='text-line'>
				{[...line].map((char, i) => {
					const idx = startIndex + i
					const typedChar = typed[idx]
					const className = [
						'char',
						idx === currentCharIndex && 'current',
						idx < currentCharIndex && (typedChar !== char ? 'error' : 'typed'),
					]
						.filter(Boolean)
						.join(' ')
					return (
						<span key={i} className='char-wrapper'>
							<span className={className}>
								{char === ' ' ? '\u00A0' : char}
							</span>
							{animatingIndexes.has(idx) && (
								<span className='char-effect'></span>
							)}
						</span>
					)
				})}
			</p>
		)
	}

	const handleBackspace = prev => {
		if (!prev.length) return prev
		const idx = prev.length - 1
		if (
			limitedText[idx + 1] === ' ' &&
			limitedText[idx] !== ' ' &&
			wordCountTyped > 0
		) {
			setWordCountTyped(prev => prev - 1)
		}
		const updated = [...prev]
		updated.pop()
		setCurrentCharIndex(updated.length)
		const lineStart = charCountByLine
			.slice(0, currentLineTyping)
			.reduce((a, b) => a + b, 0)
		if (updated.length < lineStart && currentLineTyping > 0) {
			setCurrentLineTyping(currentLineTyping - 1)
		}
		return updated
	}

	const handleChar = (prev, char) => {
		if (currentCharIndex >= limitedText.length) return prev
		const next = [...prev, char]
		const nextSpace = limitedText.indexOf(' ', currentCharIndex + 1)
		const endIdx = nextSpace === -1 ? limitedText.length - 1 : nextSpace - 1
		if (currentCharIndex === endIdx) {
			setWordCountTyped(prev => prev + 1)
		}
		const lineEnd = charCountByLine
			.slice(0, currentLineTyping + 1)
			.reduce((a, b) => a + b, 0)
		if (next.length > lineEnd) {
			setCurrentLineTyping(currentLineTyping + 1)
		}
		setCurrentCharIndex(next.length)
		return next
	}

	const handleKeyDown = e => {
		if (isFinished) return
		if (!isTypingStarted) {
			setIsTypingStarted(true)
			onStartTyping?.()
		}
		if (e.key === 'Backspace') {
			e.preventDefault()
			setTyped(prev => handleBackspace(prev))
		} else if (e.key.length === 1) {
			e.preventDefault()
			setTyped(prev => handleChar(prev, e.key))
		}
	}

	useEffect(() => {
		if (mode === 'words' && wordCountTyped >= settings.wordCount) {
			setIsTypingStarted(false)
			setIsFinished(true)
		}
	}, [wordCountTyped, mode, settings.wordCount])

	const correctChars = typed.filter((c, i) => c === limitedText[i]).length
	const errors = typed.length - correctChars
	const cpm = Math.round((correctChars / (elapsedTime || 1)) * 60)

	return (
		<div className='typing-box'>
			<div
				className='text-container'
				tabIndex={0}
				onKeyDown={handleKeyDown}
				ref={containerRef}
			>
				{!isFinished && (
					<>
						{visibleLines.map(renderLine)}
						<div className='caret' ref={caretRef}></div>
					</>
				)}

				<div
					aria-hidden='true'
					ref={measureRef}
					className='measure-element'
				></div>

				{!isFinished && (
					<div className='status-bar'>
						{mode === 'time' ? (
							<span>Time left: {timeLeft}s</span>
						) : (
							<span>
								Words typed: {wordCountTyped} / {settings.wordCount}
							</span>
						)}
					</div>
				)}

				{isFinished && (
					<div className='result'>
						<p>
							<span>{elapsedTime}s</span>Time
						</p>
						<p>
							<span>{cpm}</span>CPM
						</p>
						<p>
							<span>{correctChars}</span>Correct chars
						</p>
						<p>
							<span>{errors}</span>Errors
						</p>
					</div>
				)}
			</div>
		</div>
	)
}

export { TypingBox }
