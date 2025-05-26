import wordsData from '../data/words.json'

const wordList = wordsData.words

export function generateText({
	punctuation = false,
	numbers = false,
	wordCount = 50,
}) {
	const punctuationEnd = ['.', '!', '?']
	const punctuationOther = [',']
	const numberList = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

	let result = ''
	let capitalizeNext = true

	for (let i = 0; i < wordCount; i++) {
		let word = wordList[Math.floor(Math.random() * wordList.length)]

		if (!word) {
			word = 'word' // fallback
		}

		if (capitalizeNext) {
			word = word.charAt(0).toUpperCase() + word.slice(1)
			capitalizeNext = false
		}

		if (numbers && Math.random() < 0.2) {
			const number = numberList[Math.floor(Math.random() * numberList.length)]
			word += ' ' + number
		}

		if (punctuation && Math.random() < 0.2) {
			const isEndPunct = Math.random() < 0.5
			let punct
			if (isEndPunct) {
				punct =
					punctuationEnd[Math.floor(Math.random() * punctuationEnd.length)]
				capitalizeNext = true
			} else {
				punct =
					punctuationOther[Math.floor(Math.random() * punctuationOther.length)]
			}
			word += punct
		}

		if (i > 0) result += ' '
		result += word
	}

	if (punctuation && !punctuationEnd.includes(result.slice(-1))) {
		result += '.'
	}

	return result
}
