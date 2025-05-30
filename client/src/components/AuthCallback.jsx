import { useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AuthCallback() {
	const navigate = useNavigate()

	useEffect(() => {
		const handleAuth = async () => {
			const fullHash = window.location.hash.substring(1)
			const [pathWithQuery, tokenPart] = fullHash.split('#')

			const query = new URLSearchParams(pathWithQuery.split('?')[1])
			const username = query.get('username') || 'noname'

			const params = new URLSearchParams(tokenPart || '')
			const access_token = params.get('access_token')
			const refresh_token = params.get('refresh_token')

			const setSessionIfNeeded = async () => {
				if (access_token && refresh_token) {
					const { error } = await supabase.auth.setSession({
						access_token,
						refresh_token,
					})
					if (error) {
						console.error('Ошибка установки сессии:', error)
						return false
					}
				}
				return true
			}

			const sessionReady = await setSessionIfNeeded()
			if (!sessionReady) return

			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser()

			if (userError || !user) {
				console.error('Ошибка получения пользователя:', userError)
				return
			}

			let avatar_url = supabase.storage
				.from('avatars')
				.getPublicUrl('default_avatar.jpg').data.publicUrl

			const pendingAvatar = localStorage.getItem('pendingAvatar')
			if (pendingAvatar) {
				try {
					const base64Response = await fetch(pendingAvatar)
					const blob = await base64Response.blob()
					const ext = blob.type.split('/')[1] || 'jpg'
					const safeUsername = username.replace(/[^a-zA-Z0-9_-]/g, '_')
					const path = `${safeUsername}.${ext}` // ← исправили путь

					const { error: uploadError } = await supabase.storage
						.from('avatars')
						.upload(path, blob, { upsert: true })

					if (uploadError) {
						console.error('Ошибка загрузки аватара:', uploadError)
					} else {
						const { data } = supabase.storage.from('avatars').getPublicUrl(path)
						avatar_url = data.publicUrl
						localStorage.removeItem('pendingAvatar')
					}
				} catch (err) {
					console.error('Ошибка при загрузке временного аватара:', err)
				}
			}

			await supabase.from('users').upsert({
				id: user.id,
				email: user.email,
				username,
				avatar_url,
				typing_stats: {},
			})

			navigate('/login')
		}

		handleAuth()
	}, [navigate])

	return <p>Account confirmation...</p>
}
