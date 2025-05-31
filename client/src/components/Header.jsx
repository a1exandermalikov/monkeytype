import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import '../styles/Header.css'

export function Header() {
	const iconPath = './assets/icons/static'
	const [avatarUrl, setAvatarUrl] = useState(null)
	const [username, setUsername] = useState(null)

	useEffect(() => {
		const fetchUserData = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser()

			if (user) {
				const { data, error } = await supabase
					.from('users')
					.select('avatar_url, username')
					.eq('id', user.id)
					.single()

				if (!error && data) {
					if (data.avatar_url) setAvatarUrl(data.avatar_url)
					if (data.username) setUsername(data.username)
				}
			}
		}

		fetchUserData()
	}, [])

	// Класс добавляем, если есть username или avatarUrl
	const avatarClassName = avatarUrl || username ? 'icon avatar' : 'icon'

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
					<div className='user-avatar'>
						{username && <span className='username'>{username}</span>}
						<img
							className={avatarClassName}
							src={avatarUrl ? avatarUrl : `${iconPath}/user.png`}
							alt='user avatar'
						/>
					</div>
				</Link>
			</div>
		</header>
	)
}
