import { redis } from './redis'
import { initAppController } from './app-controller'

const { publish, subscribe } = redis()

initAppController({
	publish,
	subscribe
})
