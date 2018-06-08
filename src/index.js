import { redis } from './redis'
import { slack as slackCreator } from './slack'
import { initAppController } from './app-controller'

const { publisherCreator, subscriberCreator } = redis()

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
