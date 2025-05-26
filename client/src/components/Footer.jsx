import '../styles/Footer.css'

function Footer() {
	const iconPath = './assets/icons/'
	return (
		<footer>
			<a href='https://t.me/alexander_malikov'>
				<img className='sIcon' src={`${iconPath}static/telegram.png`} alt='#' />
				contact
			</a>
			<a href='https://github.com/a1exandermalikov/monkeytype'>
				<img className='sIcon' src={`${iconPath}static/github.png`} alt='#' />
				github
			</a>
			<p>
				<img className='sIcon' src={`${iconPath}static/wow.png`} alt='#' />
				<span>
					This site is not affiliated with Monkeytype. It is an independent
					project.
				</span>
			</p>
		</footer>
	)
}

export { Footer }
