import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import '../styles/Header.css'

export function Header() {
	const iconPath = './assets/icons/static'
	const [avatarUrl, setAvatarUrl] = useState(null)

	useEffect(() => {
		const fetchAvatar = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser()

			if (user) {
				const { data, error } = await supabase
					.from('users')
					.select('avatar_url')
					.eq('id', user.id)
					.single()

				if (!error && data?.avatar_url) {
					setAvatarUrl(data.avatar_url)
				}
			}
		}

		fetchAvatar()
	}, [])

	return (
		<header>
			<div>
				<div className='logo'>
					<img src={`${iconPath}/logo.png`} alt='logo' />
					<h1>MonkeyType</h1>
				</div>
				<div className='start-test btn'>
					<img className='icon' src={`${iconPath}/keyboard.png`} alt='#' />
				</div>
				<div className='leader-board btn'>
					<img className='icon' src={`${iconPath}/crown.png`} alt='#' />
				</div>
				<div className='about btn'>
					<img className='icon' src={`${iconPath}/info.png`} alt='#' />
				</div>
				<div className='settings btn'>
					<img className='icon' src={`${iconPath}/settings.png`} alt='#' />
				</div>
			</div>
			<div className='account-area'>
				<div className='notifications btn'>
					<img className='icon' src={`${iconPath}/notifications.png`} alt='#' />
				</div>

				<Link to='/register'>
					<div className='user-avatar btn'>
						<img
							className='icon avatar'
							src={avatarUrl ? avatarUrl : `${iconPath}/user.png`}
							alt='user avatar'
						/>
					</div>
				</Link>
			</div>
		</header>
	)
}
