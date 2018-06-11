import { spawn, exec } from 'child_process'
import { queue } from 'async'
import request from 'request'
import path from 'path'
import pm2 from 'pm2'
import { ensureDirSync, appendFileSync, readdir, removeSync, existsSync } from 'fs-extra'
import { cwd } from 'process'
import { resolve as resolvePath } from 'path'

export const initAppController = ({
	publish,
	subscribe,
	revision
}) => new Promise((resolve, reject) => {
	const queue = q({ publish })
	subscribe({
		channel: 'continuous delivery'
	})
	.then(({ allMsgs, filterMsgs }) => {
		filterMsgs(msg => {
			if (msg.data) {
				console.log('----->', msg.data[1])
				const {
					server,
					appName,
					appLocation,
					appVersion
				} = JSON.parse(msg.data[1])
				if (server && appName && appLocation && appVersion) {
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
				appLocation,
				appVersion
			} = JSON.parse(msg.data[1])
			// if (revision === 'development' || 'rpi B') {
				
			// }
			if (revision === 'rpi Zero W') {
				console.log('RASPBERRY PI ZERO W')
				switch (appName) {
					case 'raspberry-pi-camera':
						return enqueue({
							data:{
								port,
								address,
								appName,
								appLocation,
								appVersion
							},
							queue
						})
					case 'smart-hms-controller':
						return enqueue({
							data:{
								port,
								address,
								appName,
								appLocation,
								appVersion
							},
							queue
						})
					default:
						console.log('Something went wrong with switch case in smart hms controller')
				}
			}
			else {
				console.log('MODEL B or DEVELOPMENT')
				return enqueue({
					data:{
						port,
						address,
						appName,
						appLocation,
						appVersion
					},
					queue
				})
			}
		})
	})
})

const retrieveApp = ({
	appName,
	appLocation,
	port,
	address,
	files,
	folder
}) => new Promise((resolve, reject) => {
	console.log('FILES', files)
	
	const requestPromises = files.map(file => new Promise((resolve, reject) => {
		const options = {
			method: 'GET',
			url: `http://0.0.0.0:4200/js/${file}`,
			headers: {
				appLocation
			}
		}
		request(options, (error, response, body) => {
			if (error) {
				console.log('request error', error)
				return reject()
			}
			console.log('RESPONSE', response.statusCode)
			// console.log('BODY', body)
			if (response.statusCode === 200) {
				// const appsFolder = resolvePath(cwd(), 'apps', appName)
				ensureDirSync(folder)
				appendFileSync(resolvePath(folder, file), body)
				resolve()
			}
			else {
				console.log('Something went wrong')
				return reject()
			}
			// reject()
		})
	}))
	// resolve()
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
	folder
}) => new Promise((resolve, reject) => {
	existsSync(folder) === true ? removeSync(folder) : null
	console.log('deleteOldApp')
	if (appExists) {
		console.log('App exists')
		console.log('Folder to delete', folder)
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
	const script = 'bundle.js'
	console.log('APPLOCATION', appLocation)
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

const saveApps = () => new Promise((resolve, reject) => {
	exec(`pm2 save`, (err, stdout, stderr) => {
		if (err) {
			console.log('Error occurred when saving apps', app)
			reject()
		}
		console.log('Pm2 apps saved')
		return resolve()
	})
})

const handleApps = ({
	appName,
	appLocation,
	port,
	address,
	appVersion
}) => new Promise((resolve, reject) => {
	// const folder = resolvePath(cwd(), 'apps', appName, `${appName}-${appVersion}`)
	const folder = resolvePath(cwd(), 'apps', appName)
	console.log('folder', folder)
	checkForExistenceOfApp({ appName })
	.then(({ appExists }) => deleteOldApp({ appExists, appName, folder }))
	.then(() => readDir({ location: appLocation }))
	.then(({ location, files }) => retrieveApp({ appName, appLocation, port, address, files, folder }))
	.then(() => turnOnApp({ appName, appLocation: folder }))
	.then(() => saveApps())
	.then(() => resolve())
})

export const q = ({ publish }) => queue(({ data }, cb) => {
	const {
		port,
		address,
		appName,
		appLocation,
		appVersion
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
			console.log('error reading dir', err)
			return reject()
		}
		return resolve({ location, files })
	})
})
