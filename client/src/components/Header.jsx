import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/Header.css'

export function Header() {
	const iconPath = './assets/icons/static'
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
						<img className='icon' src={`${iconPath}/user.png`} alt='#' />
					</div>
				</Link>
			</div>
		</header>
	)
}
