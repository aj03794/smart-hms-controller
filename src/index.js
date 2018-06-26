import RPI from 'rpi-info'

import { redis } from './redis'
import { slack as slackCreator } from './slack'
import { initAppController } from './app-controller'
import { getModel } from './raspberry-pi'

const { publisherCreator, subscriberCreator } = redis({
	host: process.env[2] === 'dev' ? '127.0.0.1' : 'main.local'
})

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
