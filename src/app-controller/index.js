import { spawn } from 'child_process'
import { queue } from 'async'
import request from 'request'
import path from 'path'
import pm2 from 'pm2'
import { ensureDirSync, appendFile, readdir } from 'fs-extra'
import { cwd } from 'process'
import { resolve as resolvePath } from 'path'

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
					server: { port, address },
					appName,
					appLocation
				} = JSON.parse(msg.data[1])
				if (appName && appLocation && port && address) {
					console.log('properties exist')
					return true
				}
			  return false
			}
			return false
			// return  msg
		}).subscribe(msg => {
			console.log('MSG', msg)
			const {
				server: {
					port,
					address
				},
				appName,
				appLocation
			} = JSON.parse(msg.data[1])
			enqueue({
				data:{
					port,
					address,
					appName,
					appLocation
				},
				queue
			})
		})
	})
})

const retrieveApp = ({
	appName,
	appLocation,
	port,
	address,
	files
}) => new Promise((resolve, reject) => {
	console.log('FILES', files)
	const options = {
		method: 'GET',
		url: `http://0.0.0.0:4200/js/bundle.js`,
		headers: {
			appLocation
		}
	}
	const requestPromises = files.map(file => {
		request(options, (error, response, body) => {
			if (error) {
				console.log('request error', error)
				return reject()
			}
			console.log('RESPONSE', response.statusCode)
			// console.log('BODY', body)
			if (response.statusCode === 200) {
				const appsFolder = resolvePath(cwd(), 'apps', appName)
				ensureDirSync(appsFolder)
				appendFile(resolvePath(appsFolder, file), body, err => {
					if (err) {
						console.log('error appending file', err)
						return reject()
					}
					
					return resolve()
				})
				// return resolve()
			}
			else {
				console.log('Something went wrong')
				reject()
			}
			reject()
		})
		resolve()
	})
	console.log('request promises', requestPromises)
	return Promise.all(requestPromises).then(() => resolve())
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
	appLocation,
	port,
	address
}) => new Promise((resolve, reject) => {
	checkForExistenceOfApp({ appName })
	// .then(({ appExists }) => deleteOldApp({ appExists, appName }))
	.then(() => readDir({ location: appLocation }))
	.then(({ location, files }) => retrieveApp({ appName, appLocation, port, address, files }))
	// .then(() => turnOnApp({ appName, appLocation }))
	.then(() => resolve())
})

export const q = ({ publish }) => queue(({ data }, cb) => {
	const {
		port,
		address,
		appName,
		appLocation
	} = data
	console.log('------------------------')
  handleApps(data)
  .then(cb)
})

export const enqueue = ({ data, queue }) => new Promise((resolve, reject) => {
  console.log('Queueing message - camera: ', data)
  queue.push({ data })
  return resolve()
})

const readDir = ({
	location
}) => new Promise((resolve, reject) => {
	console.log('LOCATION', location)
	return readdir(location, (err, files) => {
		if (err) {
			console.log('error reading dir', error)
			return reject()
		}
		return resolve({ location, files })
	})
})
