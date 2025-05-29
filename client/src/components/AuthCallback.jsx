import { useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AuthCallback() {
	const navigate = useNavigate()

	useEffect(() => {
		const handleAuth = async () => {
			// Разбираем параметры из хэша URL (после #)
			const hash = window.location.hash.substring(1) // убираем #
			const params = new URLSearchParams(hash)

			const access_token = params.get('access_token')
			const refresh_token = params.get('refresh_token')

			if (access_token && refresh_token) {
				// Устанавливаем сессию вручную из токенов
				const { error } = await supabase.auth.setSession({
					access_token,
					refresh_token,
				})

				if (error) {
					console.error('Ошибка установки сессии:', error)
					return
				}

				// Далее читаем username из query-параметров (после ? в URL)
				const url = new URL(window.location.href)
				const username = url.searchParams.get('username') || 'noname'

				// Обновляем или создаём пользователя
				const user = supabase.auth.getUser()
				if (user) {
					await supabase.from('users').upsert({
						id: (await user).data.user.id,
						email: (await user).data.user.email,
						username,
						typing_stats: {},
					})
				}

				navigate('/login')
			} else {
				// Если токенов нет, пробуем получить сессию обычным способом
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession()

				if (error) {
					console.error('Ошибка получения сессии:', error)
					return
				}

				if (session?.user) {
					const url = new URL(window.location.href)
					const username = url.searchParams.get('username') || 'noname'

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
