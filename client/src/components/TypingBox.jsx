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

	const { settings, isTypingStarted, setIsTypingStarted } = useTypingSettings()
	const [timeLeft, setTimeLeft] = useState(settings.selectedTime)

	const limitedText = useMemo(() => {
		if (mode === 'words') {
			const wordsArr = text.split(' ')
			return wordsArr.slice(0, settings.wordCount).join(' ') + ' '
		}
		return text
	}, [mode, text, settings.wordCount])

	// Генерация текста и сброс при смене режима/настроек
	useEffect(() => {
		setIsTypingStarted(false)
		setWordCountTyped(0)
		const generated = generateText({
			punctuation: settings.punctuation,
			numbers: settings.numbers,
			wordCount: 500,
		})
		setText(generated)
		setTyped([])
		setCurrentCharIndex(0)
		setCurrentLineTyping(0)
		setAnimatingIndexes(new Set())
		setTimeLeft(settings.selectedTime)
		setIsFinished(false)
		setElapsedTime(0)
	}, [mode, settings])

	// Таймер обратного отсчёта для режима time
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
	}, [isTypingStarted, settings.selectedTime, setIsTypingStarted, mode])

	// Счётчик времени печати с начала для статистики
	useEffect(() => {
		if (!isTypingStarted || isFinished) return
		const startTime = Date.now()

		const timer = setInterval(() => {
			setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
		}, 250)

		return () => clearInterval(timer)
	}, [isTypingStarted, isFinished])

	// Фокус на контейнер ввода
	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.focus()
		}
	}, [])

	// Установка фокуса при изменении режима или настроек
	useEffect(() => {
		if (containerRef.current) {
			// Установка фокуса с небольшим отложением, чтобы браузер успел переключить активный элемент
			setTimeout(() => {
				containerRef.current?.focus()
			}, 0)
		}
	}, [mode, settings])

	const words = useMemo(() => limitedText.split(' '), [limitedText])
	const charCountByLine = useMemo(() => lines.map(line => line.length), [lines])

	useEffect(() => {
		if (!measureRef.current || !containerRef.current) return

		const containerWidth = containerRef.current.clientWidth

		// Обновим стили measureRef, чтобы совпадали с контейнером (если надо)
		const containerStyles = getComputedStyle(containerRef.current)
		const measureElem = measureRef.current
		measureElem.style.fontSize = containerStyles.fontSize
		measureElem.style.fontFamily = containerStyles.fontFamily
		measureElem.style.fontWeight = containerStyles.fontWeight
		measureElem.style.letterSpacing = containerStyles.letterSpacing
		measureElem.style.whiteSpace = 'nowrap'

		let currentLine = ''
		let linesArr = []

		for (let word of words) {
			const testLine = currentLine ? currentLine + ' ' + word : word
			measureElem.textContent = testLine

			const measuredWidth = measureElem.getBoundingClientRect().width

			if (measuredWidth > containerWidth) {
				if (currentLine) linesArr.push(currentLine)
				currentLine = word
			} else {
				currentLine = testLine
			}
		}
		if (currentLine) linesArr.push(currentLine)
		linesArr.push('')

		setLines(linesArr.map(line => line + ' '))
	}, [limitedText, words])

	// Добавляем обработчик ресайза
	useEffect(() => {
		const handleResize = () => {
			// просто вызовем пересчёт, изменив состояние, чтобы useEffect сработал
			setText(prev => prev) // триггер обновления эффекта с зависимостью limitedText и words
		}
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	useEffect(() => {
		if (currentCharIndex === 0) return

		const lastIndex = currentCharIndex - 1
		setAnimatingIndexes(prev => new Set(prev).add(lastIndex))

		const timeout = setTimeout(() => {
			setAnimatingIndexes(prev => {
				const newSet = new Set(prev)
				newSet.delete(lastIndex)
				return newSet
			})
		}, 800)

		return () => clearTimeout(timeout)
	}, [currentCharIndex])

	const visibleLines = useMemo(() => {
		const maxStartLine = Math.max(0, lines.length - LINES_TO_SHOW)
		let startLineIndex = Math.max(0, currentLineTyping - 1)
		if (startLineIndex > maxStartLine) startLineIndex = maxStartLine

		const sliceLines = lines.slice(
			startLineIndex,
			startLineIndex + LINES_TO_SHOW
		)
		const emptyLinesCount = LINES_TO_SHOW - sliceLines.length
		if (emptyLinesCount > 0) {
			return [...sliceLines, ...Array(emptyLinesCount).fill(' ')]
		}
		return sliceLines
	}, [lines, currentLineTyping])

	const renderLine = (line, lineIdx) => {
		const globalLineIdx = Math.max(0, currentLineTyping - 1) + lineIdx
		const startCharIndex = charCountByLine
			.slice(0, globalLineIdx)
			.reduce((a, b) => a + b, 0)

		return (
			<p key={lineIdx} className='text-line'>
				{Array.from(line).map((char, idx) => {
					const globalIdx = startCharIndex + idx
					const isTyped = globalIdx < currentCharIndex
					const isCurrent = globalIdx === currentCharIndex
					const isTypedCorrect = typed[globalIdx] === char
					const isError = isTyped && !isTypedCorrect
					const displayChar = char === ' ' ? '\u00A0' : char

					let className = 'char'
					if (isError) className += ' error'
					else if (isCurrent) className += ' current'
					else if (isTyped) className += ' typed'

					return (
						<span key={idx} className='char-wrapper'>
							<span className={className}>{displayChar}</span>
							{animatingIndexes.has(globalIdx) && (
								<span className='char-effect'></span>
							)}
						</span>
					)
				})}
			</p>
		)
	}

	useEffect(() => {
		if (!containerRef.current || !caretRef.current) return

		const chars = containerRef.current.querySelectorAll('.char')
		if (chars.length === 0) return

		const visibleStartCharIndex = charCountByLine
			.slice(0, Math.max(0, currentLineTyping - 1))
			.reduce((a, b) => a + b, 0)
		const relativeIndex = currentCharIndex - visibleStartCharIndex

		let left, top, height

		if (relativeIndex >= chars.length) {
			const lastCharRect = chars[chars.length - 1].getBoundingClientRect()
			const parentRect = containerRef.current.getBoundingClientRect()
			left = lastCharRect.right - parentRect.left
			top = lastCharRect.top - parentRect.top
			height = lastCharRect.height
		} else {
			const charRect = chars[relativeIndex].getBoundingClientRect()
			const parentRect = containerRef.current.getBoundingClientRect()
			left = charRect.left - parentRect.left
			top = charRect.top - parentRect.top
			height = charRect.height
		}

		caretRef.current.style.left = `${left}px`
		caretRef.current.style.top = `${top}px`
		caretRef.current.style.height = `${height}px`
	}, [currentCharIndex, visibleLines, currentLineTyping, charCountByLine])

	useEffect(() => {
		if (mode !== 'words' || isFinished) return

		if (wordCountTyped >= settings.wordCount) {
			setIsTypingStarted(false)
			setIsFinished(true)
		}
	}, [wordCountTyped, isFinished, mode, settings.wordCount])

	const handleBackspace = typedArr => {
		if (typedArr.length === 0) return typedArr
		const lastChar = typedArr[typedArr.length - 1]
		if (lastChar === ' ' && wordCountTyped > 0) {
			setWordCountTyped(wordCountTyped - 1)
		}
		const newTyped = [...typedArr]
		newTyped.pop()
		setCurrentCharIndex(newTyped.length)
		const lineStartIndex = charCountByLine
			.slice(0, currentLineTyping)
			.reduce((a, b) => a + b, 0)
		if (newTyped.length < lineStartIndex && currentLineTyping > 0) {
			setCurrentLineTyping(currentLineTyping - 1)
		}
		return newTyped
	}

	const handleChar = (typedArr, char) => {
		if (currentCharIndex >= limitedText.length) return typedArr
		const newTyped = [...typedArr, char]

		if (mode === 'words') {
			const nextSpaceIndex = limitedText.indexOf(' ', currentCharIndex + 1)
			const wordEndIndex =
				nextSpaceIndex === -1 ? limitedText.length - 1 : nextSpaceIndex - 1
			if (currentCharIndex === wordEndIndex) {
				setWordCountTyped(prev => prev + 1)
			}
		}

		const lineStartIndex = charCountByLine
			.slice(0, currentLineTyping + 1)
			.reduce((a, b) => a + b, 0)
		if (newTyped.length > lineStartIndex) {
			setCurrentLineTyping(currentLineTyping + 1)
		}

		setCurrentCharIndex(newTyped.length)
		return newTyped
	}

	const handleKeyDown = e => {
		if (isFinished) return

		if (!isTypingStarted) {
			setIsTypingStarted(true)
			onStartTyping && onStartTyping()
		}

		if (e.key === 'Backspace') {
			e.preventDefault()
			setTyped(prev => handleBackspace(prev))
			return
		}

		if (e.key.length === 1) {
			e.preventDefault()
			setTyped(prev => handleChar(prev, e.key))
		}
	}

	// Статистика после завершения
	const correctChars = typed.filter((c, idx) => c === limitedText[idx]).length
	const totalTypedChars = typed.length
	const errors = totalTypedChars - correctChars
	const cpm = Math.round((correctChars / (elapsedTime || 1)) * 60)

	return (
		<div className='typing-box'>
			<div
				className='text-container'
				onKeyDown={handleKeyDown}
				tabIndex={0}
				ref={containerRef}
			>
				{/* Текст и каретка */}
				{!isFinished && (
					<>
						{visibleLines.map(renderLine)}
						<div className='caret' ref={caretRef}></div>
					</>
				)}

				{/* Скрытый элемент для измерения */}
				<div
					aria-hidden='true'
					ref={measureRef}
					className='measure-element'
				></div>

				{/* Статистика */}
				{mode === 'time' && !isFinished && (
					<div className='status-bar'>
						<span>Time left: {timeLeft}s</span>
					</div>
				)}
				{mode === 'words' && !isFinished && (
					<div className='status-bar'>
						<span>
							Words typed: {wordCountTyped} / {settings.wordCount}
						</span>
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
