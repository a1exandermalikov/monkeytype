import { useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AuthCallback() {
	const navigate = useNavigate()

	useEffect(() => {
		const handleAuth = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession()

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
			}
		}

		handleAuth()
	}, [navigate])

	return <p>Account confirmation...</p>
}
