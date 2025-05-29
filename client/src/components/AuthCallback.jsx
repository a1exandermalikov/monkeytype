import { useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AuthCallback() {
	const navigate = useNavigate()

	useEffect(() => {
		const handleAuth = async () => {
			const hash = window.location.hash.substring(1)
			const queryString = hash.includes('?') ? hash.split('?')[1] : ''
			const params = new URLSearchParams(queryString)

			const access_token = params.get('access_token')
			const refresh_token = params.get('refresh_token')
			const username = params.get('username') || 'noname'

			if (access_token && refresh_token) {
				const { error } = await supabase.auth.setSession({
					access_token,
					refresh_token,
				})

				if (error) {
					console.error('Ошибка установки сессии:', error)
					return
				}

				// Получаем пользователя из сессии после установки
				const {
					data: { user },
				} = await supabase.auth.getUser()

				if (user) {
					await supabase.from('users').upsert({
						id: user.id,
						email: user.email,
						username,
						typing_stats: {},
					})
				}

				navigate('/login')
			} else {
				// fallback - если токенов нет, получить сессию как обычно
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession()

				if (error) {
					console.error('Ошибка получения сессии:', error)
					return
				}

				if (session?.user) {
					await supabase.from('users').upsert({
						id: session.user.id,
						email: session.user.email,
						username,
						typing_stats: {},
					})

					navigate('/login')
				} else {
					console.warn('Пользователь не авторизован')
				}
			}
		}

		handleAuth()
	}, [navigate])

	return <p>Account confirmation...</p>
}
