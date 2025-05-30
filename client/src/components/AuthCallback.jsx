import { useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useNavigate } from 'react-router-dom'

function base64ToBlob(base64Data, contentType = '') {
	const sliceSize = 512
	const byteCharacters = atob(base64Data.split(',')[1])
	const byteArrays = []

	for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		const slice = byteCharacters.slice(offset, offset + sliceSize)

		const byteNumbers = new Array(slice.length)
		for (let i = 0; i < slice.length; i++) {
			byteNumbers[i] = slice.charCodeAt(i)
		}

		const byteArray = new Uint8Array(byteNumbers)
		byteArrays.push(byteArray)
	}

	return new Blob(byteArrays, { type: contentType })
}

export default function AuthCallback() {
	const navigate = useNavigate()

	useEffect(() => {
		const handleAuth = async () => {
			const fullHash = window.location.hash.substring(1)
			const [pathWithQuery, tokenPart] = fullHash.split('#')

			const query = new URLSearchParams(pathWithQuery.split('?')[1])
			const username = (query.get('username') || 'noname').trim().toLowerCase()

			const params = new URLSearchParams(tokenPart || '')
			const access_token = params.get('access_token')
			const refresh_token = params.get('refresh_token')

			// Устанавливаем сессию вручную, если токены есть
			if (access_token && refresh_token) {
				const { error } = await supabase.auth.setSession({
					access_token,
					refresh_token,
				})
				if (error) {
					console.error('Ошибка установки сессии:', error)
					return
				}
			}

			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser()

			if (userError || !user) {
				console.error('Ошибка получения пользователя:', userError)
				return
			}

			// Значение по умолчанию — дефолтный аватар
			let avatar_url = supabase.storage
				.from('avatars')
				.getPublicUrl('default_avatar.jpg').data.publicUrl

			const pendingAvatar = localStorage.getItem('pendingAvatar')
			if (pendingAvatar) {
				try {
					console.log('PENDING AVATAR:', pendingAvatar)

					const mimeMatch = pendingAvatar.match(/^data:(.*?);base64,/)
					const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg'
					const blob = base64ToBlob(pendingAvatar, mimeType)

					if (blob.size > 0) {
						const ext = mimeType.split('/')[1] || 'jpg'
						const safeUsername = username.replace(/[^a-zA-Z0-9_-]/g, '_')
						const path = `${safeUsername}.${ext}`

						const { error: uploadError } = await supabase.storage
							.from('avatars')
							.upload(path, blob, {
								upsert: true,
								contentType: mimeType,
								cacheControl: '3600',
							})

						if (uploadError) {
							console.error('Ошибка загрузки аватара:', uploadError)
						} else {
							const { data } = supabase.storage
								.from('avatars')
								.getPublicUrl(path)
							if (data?.publicUrl) {
								avatar_url = data.publicUrl
								localStorage.removeItem('pendingAvatar')
							} else {
								console.warn('Не удалось получить публичный URL для аватара')
							}
						}
					} else {
						console.warn('Пустой blob — не загружаю')
					}
				} catch (err) {
					console.error('Ошибка при обработке pendingAvatar:', err)
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
