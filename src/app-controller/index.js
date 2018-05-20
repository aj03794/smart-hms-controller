import { spawn } from 'child_process'
import { queue } from 'async'
import path from 'path'
import pm2 from 'pm2'

export const initAppController = ({
	publish,
	subscribe
}) => new Promise((resolve, reject) => {
	const queue = q({ publish })
	subscribe({
		channel: 'continuous delivery'
	})
	.then(({ connect }) => connect())
	.then(({ allMsgs, filterMsgs }) => {
		filterMsgs(msg => {
			if (msg.data) {
				const {
					appName,
					appLocation
				} = JSON.parse(msg.data[1])
				if (appName && appLocation) {
					console.log('repo and applocation exist')
					return true
				}
			  return false
			}
			return false
			// return  msg
		}).subscribe(msg => {
			console.log('MSG', msg)
			const {
				appName,
				appLocation
			} = JSON.parse(msg.data[1])
			enqueue({ msg: { appName, appLocation }, queue })
		})
	})
})

const checkForExistenceOfApp = ({
	appName
}) => new Promise((resolve, reject) => {

	pm2.list((err, processDescriptionList) => {
		// console.log('processDescriptionList', processDescriptionList)
		const exists = processDescriptionList.find(element => {
			return element.name === appName
		}) ? true : false
		console.log('App exists:', exists)
		resolve({ appExists: exists })
	})
})

const deleteOldApp = ({
	appExists,
	appName,
}) => new Promise((resolve, reject) => {
	if (appExists) {
		console.log('App exists')
		pm2.delete(appName, (err) => {
			if (err) {
				console.log('Something went wrong deleting old app')
				return reject()
			}
		})
		return resolve()
	}
	else {
		console.log('App does not exist')
		return resolve()
	}
})

const turnOnApp = ({
	appName,
	appLocation
}) => new Promise((resolve, reject) => {
	console.log('Turning on new app')
	// const script = `${appLocation}/index.js`
	const script = 'index.js'
	console.log('script', script)
	const options = {
		name: appName,
		cwd: appLocation
	}
	pm2.start(script, options, (err) => {
		if (err) {
			console.log('PROBLEM STARTING APP', err)
			reject()
		}
		console.log('Successfully turned on app')
		resolve()
	})
})

const handleApps = ({
	appName,
	appLocation
}) => new Promise((resolve, reject) => {
	console.log('appName', appName)
	console.log('appLocation', appLocation)
	checkForExistenceOfApp({ appName })
	.then(({ appExists }) => deleteOldApp({ appExists, appName }))
	.then(() => turnOnApp({ appName, appLocation }))
	.then(() => resolve())
	// return resolve()
})

export const q = ({ publish }) => queue(({ msg }, cb) => {
	const { appName, appLocation } = msg
	console.log('------------------------')
  handleApps({ appName, appLocation })
  .then(cb)
})

export const enqueue = ({ msg, queue }) => new Promise((resolve, reject) => {
  console.log('Queueing message - camera: ', msg)
  queue.push({ msg })
  return resolve()
})
