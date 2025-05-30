import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { Link, useNavigate } from 'react-router-dom' // <== добавлено useNavigate
import '../styles/Register.css'

export function LogIn() {
	const [identifier, setIdentifier] = useState('')
	const [password, setPassword] = useState('')
	const [message, setMessage] = useState('')
	const navigate = useNavigate() // <== инициализация

	useEffect(() => {
		if (message) {
			const timer = setTimeout(() => setMessage(''), 3000)
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

		if (error) {
			setMessage(error.message)
		} else {
			navigate('/') // <== переход на главную
		}
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
