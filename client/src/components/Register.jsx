import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { Link } from 'react-router-dom'
import '../styles/Register.css'

const emailProviders = {
	'gmail.com': 'https://mail.google.com',
	'yandex.ru': 'https://mail.yandex.ru',
	'yahoo.com': 'https://mail.yahoo.com',
	'outlook.com': 'https://outlook.live.com',
	'hotmail.com': 'https://outlook.live.com',
	// Добавь другие, если нужно
}

export function Register() {
	const basePath = '/monkeytype' // базовый путь для роутов и редиректов

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [username, setUsername] = useState('')
	const [message, setMessage] = useState('')

	useEffect(() => {
		if (
			message === 'Verification email sent. Please confirm your registration.'
		) {
			const domain = email.split('@')[1]
			const redirectUrl = emailProviders[domain]

			if (redirectUrl) {
				const timer = setTimeout(() => {
					window.location.href = redirectUrl
				}, 3000) // редирект через 3 секунды

				return () => clearTimeout(timer)
			}
		}
	}, [message, email])

	const handleRegister = async e => {
		e.preventDefault()
		setMessage('')

		// Проверяем, существует ли пользователь с таким email или username
		const { data: existingUsers, error: checkError } = await supabase
			.from('users')
			.select('id')
			.or(`email.eq.${email},username.eq.${username}`)

		if (checkError) {
			setMessage('Error checking user existence.')
			return
		}

		if (existingUsers.length > 0) {
			setMessage('A user with this email or username already exists.')
			return
		}

		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${
					window.location.origin
				}${basePath}/auth/callback?username=${encodeURIComponent(username)}`,
			},
		})

		if (error) {
			setMessage(error.message)
		} else {
			setMessage('Verification email sent. Please confirm your registration.')
		}
	}

	return (
		<div className='registration-field'>
			<form onSubmit={handleRegister}>
				<input
					placeholder='Username'
					value={username}
					onChange={e => setUsername(e.target.value)}
					required
				/>
				<input
					type='email'
					placeholder='Email'
					value={email}
					onChange={e => setEmail(e.target.value)}
					required
				/>
				<input
					type='password'
					placeholder='Password'
					value={password}
					onChange={e => setPassword(e.target.value)}
					required
				/>
				<button type='submit'>Register</button>
				<Link to={`${basePath}/login`}>
					Already have an account? <span>Log in</span>
				</Link>
				{message && <p className='message'>{message}</p>}
			</form>
		</div>
	)
}
