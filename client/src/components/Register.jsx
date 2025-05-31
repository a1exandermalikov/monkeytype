import { useState, useEffect, useRef } from 'react'
import { supabase } from '../utils/supabaseClient'
import { Link } from 'react-router-dom'
import defaultAvatar from '/assets/content/default_avatar.jpg'
import '../styles/Register.css'

const emailProviders = {
	'gmail.com': 'https://mail.google.com',
	'yandex.ru': 'https://mail.yandex.ru',
	'yahoo.com': 'https://mail.yahoo.com',
	'outlook.com': 'https://outlook.live.com',
	'hotmail.com': 'https://outlook.live.com',
}

export function Register() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [username, setUsername] = useState('')
	const [message, setMessage] = useState('')
	const [avatarPreview, setAvatarPreview] = useState(defaultAvatar)

	const fileInputRef = useRef(null)

	useEffect(() => {
		const savedAvatar = localStorage.getItem('pendingAvatar')
		if (savedAvatar) {
			setAvatarPreview(savedAvatar)
		}
	}, [])

	useEffect(() => {
		if (
			message === 'Verification email sent. Please confirm your registration.'
		) {
			const domain = email.split('@')[1]
			const redirectUrl = emailProviders[domain]
			if (redirectUrl) {
				const timer = setTimeout(() => {
					window.location.href = redirectUrl
				}, 3000)
				return () => clearTimeout(timer)
			}
		}
	}, [message, email])

	const handleAvatarChange = e => {
		const file = e.target.files[0]
		if (!file) return

		const reader = new FileReader()
		reader.onloadend = () => {
			localStorage.setItem('pendingAvatar', reader.result)
			setAvatarPreview(reader.result)
		}
		reader.readAsDataURL(file)
	}

	const handleAvatarClick = () => {
		fileInputRef.current.click()
	}

	const handleRegister = async e => {
		e.preventDefault()
		setMessage('')

		const normalizedEmail = email.trim().toLowerCase()
		const normalizedUsername = username.trim().toLowerCase()
		const normalizedPassword = password.trim()

		const { data: existingUsers, error: checkError } = await supabase
			.from('users')
			.select('id')
			.or(`email.eq.${normalizedEmail},username.eq.${normalizedUsername}`)

		if (checkError) {
			setMessage('Error checking user existence.')
			return
		}

		if (existingUsers.length > 0) {
			setMessage('A user with this email or username already exists.')
			return
		}

		const { data: signUpData, error } = await supabase.auth.signUp({
			email: normalizedEmail,
			password: normalizedPassword,
			options: {
				emailRedirectTo: `${
					window.location.origin
				}/monkeytype/#/auth/callback?username=${encodeURIComponent(
					normalizedUsername
				)}`,
			},
		})

		if (error) {
			setMessage(error.message)
			return
		}

		setMessage('Verification email sent. Please confirm your registration.')
	}

	return (
		<div className='registration-field'>
			<form onSubmit={handleRegister}>
				<div className='avatar-upload' onClick={handleAvatarClick}>
					<img src={avatarPreview} alt='Avatar preview' />
				</div>
				<input
					type='file'
					accept='image/*'
					onChange={handleAvatarChange}
					ref={fileInputRef}
					style={{ display: 'none' }}
				/>

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
				<Link to='/login'>
					Already have an account? <span>Log in</span>
				</Link>
				{message && <p className='message'>{message}</p>}
			</form>
		</div>
	)
}
