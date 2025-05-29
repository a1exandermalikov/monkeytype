import { useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AuthCallback() {
	const navigate = useNavigate()

	useEffect(() => {
		const handleAuth = async () => {
			const fullHash = window.location.hash.substring(1) // убираем первый #

			// Разбиваем по второму #, например:
			// fullHash = "/auth/callback?username=malikov#access_token=...&refresh_token=..."
			const [pathWithQuery, tokenPart] = fullHash.split('#')

			// Парсим username из pathWithQuery после ?
			const query = new URLSearchParams(pathWithQuery.split('?')[1])
			const username = query.get('username') || 'noname'

			// Парсим токены из tokenPart
			const params = new URLSearchParams(tokenPart || '')

			const access_token = params.get('access_token')
			const refresh_token = params.get('refresh_token')

			if (access_token && refresh_token) {
				const { error } = await supabase.auth.setSession({
					access_token,
					refresh_token,
				})

				if (error) {
					console.error('Ошибка установки сессии:', error)
					return
				}

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
