import RPI from 'rpi-info'

import { redis } from './redis'
import { slack as slackCreator } from './slack'
import { initAppController } from './app-controller'


const { publisherCreator, subscriberCreator } = redis()

// console.log('asdfas', rpi.getRevision())


Promise.all([
	publisherCreator(),
	subscriberCreator()
])
.then(([
	{ publish },
	{ subscribe }
]) => {
	const slack = slackCreator({ publish })

	let revision

	try {
		const rpi = new RPI()
		revision = rpi.getModel()
	}
	catch (e) {
		if (e.code === 'ENOENT' && e.path === '/proc/cpuinfo') {
			console.log('This is dev')
			revision = 'development'
		}
	}
	return initAppController({
		publish,
		subscribe,
		revision
	})
})
