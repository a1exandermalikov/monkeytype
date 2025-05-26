import React, { useEffect } from 'react'
import '../styles/GlobalRipple.css'

const GlobalRipple = () => {
	useEffect(() => {
		const handleClick = e => {
			const x = e.clientX
			const y = e.clientY

			// основная волна
			const ripple = document.createElement('div')
			ripple.className = 'global-ripple'
			ripple.style.left = `${x}px`
			ripple.style.top = `${y}px`

			requestAnimationFrame(() => {
				document.body.appendChild(ripple)
			})
			setTimeout(() => ripple.remove(), 800)

			// брызги
			for (let i = 0; i < 6; i++) {
				const splash = document.createElement('div')
				splash.className = 'ripple-splash'
				splash.style.left = `${x}px`
				splash.style.top = `${y}px`

				const angle = Math.random() * 2 * Math.PI
				const distance = Math.random() * 3 + 2 // svw
				const dx = `${Math.cos(angle) * distance}svw`
				const dy = `${Math.sin(angle) * distance}svw`

				splash.style.setProperty('--dx', dx)
				splash.style.setProperty('--dy', dy)

				requestAnimationFrame(() => {
					document.body.appendChild(splash)
				})
				setTimeout(() => splash.remove(), 800)
			}
		}

		window.addEventListener('click', handleClick)
		return () => window.removeEventListener('click', handleClick)
	}, [])

	return null
}

export { GlobalRipple }
