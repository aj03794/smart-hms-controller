import RPI from 'rpi-info'

import { redis } from './redis'
import { slack as slackCreator } from './slack'
import { initAppController } from './app-controller'
import { getModel } from './raspberry-pi'

const { publisherCreator, subscriberCreator } = redis()

Promise.all([
	publisherCreator(),
	subscriberCreator(),
	getModel({ RPI })
])
.then(([
	{ publish },
	{ subscribe },
	{ model }
]) => {
	const slack = slackCreator({ publish })
	return initAppController({
		publish,
		subscribe,
		model
	})
})
