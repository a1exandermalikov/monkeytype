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
	const [avatarFile, setAvatarFile] = useState(null)
	const [avatarPreview, setAvatarPreview] = useState(defaultAvatar)

	const fileInputRef = useRef(null)

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
		setAvatarFile(file)
		setAvatarPreview(file ? URL.createObjectURL(file) : defaultAvatar)
	}

	const handleAvatarClick = () => {
		fileInputRef.current.click()
	}

	const handleRegister = async e => {
		e.preventDefault()
		setMessage('')

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

		const { data: signUpData, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${
					window.location.origin
				}/#/auth/callback?username=${encodeURIComponent(username)}`,
			},
		})

		if (error) {
			setMessage(error.message)
			return
		}

		// Загружаем аватар если выбран
		if (avatarFile && signUpData?.user?.id) {
			const fileExt = avatarFile.name.split('.').pop()
			const filePath = `avatars/${signUpData.user.id}.${fileExt}`

			const { error: uploadError } = await supabase.storage
				.from('avatars')
				.upload(filePath, avatarFile, { upsert: true })

			if (uploadError) {
				console.error('Ошибка загрузки аватара:', uploadError)
			}
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
