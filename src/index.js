import { redis } from './redis'
import { slack as slackCreator } from './slack'
import { initAppController } from './app-controller'

const { publisherCreator, subscriberCreator } = redis({
	host: process.env[2] === 'dev' ? '127.0.0.1' : 'main.local'
})

Promise.all([
	publisherCreator(),
	subscriberCreator()
])
.then(([
	{ publish },
	{ subscribe }
]) => {
	const slack = slackCreator({ publish })
	return initAppController({
		publish,
		subscribe
	})
})
