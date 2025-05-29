import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { Link } from 'react-router-dom'
import '../styles/Register.css'

export function LogIn() {
	const basePath = '/monkeytype' // базовый путь

	const [identifier, setIdentifier] = useState('')
	const [password, setPassword] = useState('')
	const [message, setMessage] = useState('')

	useEffect(() => {
		if (message) {
			const timer = setTimeout(() => setMessage(''), 3000) // скрыть сообщение через 3 секунды
			return () => clearTimeout(timer)
		}
	}, [message])

	const handleLogin = async e => {
		e.preventDefault()
		setMessage('')

		let emailToUse = identifier

		if (!identifier.includes('@')) {
			const { data, error } = await supabase
				.from('users')
				.select('email')
				.eq('username', identifier)
				.single()

			if (error || !data?.email) {
				setMessage('User with this username not found.')
				return
			}
			emailToUse = data.email
		}

		const { error } = await supabase.auth.signInWithPassword({
			email: emailToUse,
			password,
		})

		setMessage(error ? error.message : 'Successfully signed in!')
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
