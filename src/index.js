import RPI from 'rpi-info'
import pm2 from 'pm2'

import { pm2Functions as pm2FunctionsCreator } from './pm2'
import { q as queueCreator } from './queue'
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
	getModel({ RPI }),
	queueCreator(),
	pm2FunctionsCreator({ pm2 })
])
.then(([
	{ publish },
	{ subscribe },
	{ model },
	{ enqueue },
	{ 
		pm2Start,
		pm2Delete,
		pm2Save,
		pm2List
	}
]) => {
	const slack = slackCreator({ publish })
	console.log('Raspberry pi model', model)
	return initAppController({
		publish,
		subscribe,
		model,
		enqueue,
		pm2Start,
		pm2Delete,
		pm2Save,
		pm2List
	})
})
