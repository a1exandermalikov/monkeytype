import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Register.css'

export function LogIn() {
	const [identifier, setIdentifier] = useState('')
	const [password, setPassword] = useState('')
	const [message, setMessage] = useState('')
	const navigate = useNavigate()

	useEffect(() => {
		if (message) {
			const timer = setTimeout(() => setMessage(''), 3000)
			return () => clearTimeout(timer)
		}
	}, [message])

	const base64ToBlob = (base64, contentType = 'image/png') => {
		const byteCharacters = atob(base64)
		const byteArrays = []

		for (let offset = 0; offset < byteCharacters.length; offset += 512) {
			const slice = byteCharacters.slice(offset, offset + 512)
			const byteNumbers = new Array(slice.length)
			for (let i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i)
			}
			const byteArray = new Uint8Array(byteNumbers)
			byteArrays.push(byteArray)
		}

		return new Blob(byteArrays, { type: contentType })
	}

	const handleLogin = async e => {
		e.preventDefault()
		setMessage('')

		let emailToUse = identifier.trim().toLowerCase()

		// Поиск email по username
		if (!emailToUse.includes('@')) {
			const { data, error } = await supabase
				.from('users')
				.select('email')
				.eq('username', emailToUse)
				.single()

			if (error || !data?.email) {
				setMessage('User with this username not found.')
				return
			}

			emailToUse = data.email
		}

		// Логин
		const { data: signInData, error } = await supabase.auth.signInWithPassword({
			email: emailToUse,
			password: password.trim(),
		})

		if (error) {
			setMessage(error.message)
			return
		}

		// Если залогинились и есть pendingAvatar
		const pendingAvatar = localStorage.getItem('pendingAvatar')
		if (signInData.user && pendingAvatar) {
			try {
				const base64Data = pendingAvatar.split(',')[1]
				const blob = base64ToBlob(base64Data)

				const fileName = `avatars/${signInData.user.id}/avatar.png`

				const { error: uploadError } = await supabase.storage
					.from('avatars')
					.upload(fileName, blob, {
						contentType: 'image/png',
						upsert: true,
					})

				if (uploadError) {
					console.error('Ошибка загрузки аватара:', uploadError)
				} else {
					console.log('Аватар успешно загружен')
					localStorage.removeItem('pendingAvatar')
				}
			} catch (uploadErr) {
				console.error('Upload error:', uploadErr)
			}
		}

		navigate('/')
	}

	return (
		<div className='registration-field'>
			<form onSubmit={handleLogin}>
				<input
					type='text'
					placeholder='Email or Username'
					value={identifier}
					onChange={e => setIdentifier(e.target.value)}
					required
				/>
				<input
					type='password'
					placeholder='Password'
					value={password}
					onChange={e => setPassword(e.target.value)}
					required
				/>
				<button type='submit'>Log in</button>
				<Link to='/register'>
					Don't have an account? <span>Sign up</span>
				</Link>
				{message && <p className='message'>{message}</p>}
			</form>
		</div>
	)
}
