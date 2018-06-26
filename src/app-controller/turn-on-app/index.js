export const turnOnApp = ({
    resolvePath,
    pm2
}) => ({
	appName,
	appLocation
}) => new Promise((resolve, reject) => {
	console.log('Turning on new app')
	const script = 'index.js'
	const app = resolvePath(appLocation, appName)
	console.log('APPLOCATION', appLocation)
	console.log('script', script)
	const options = {
		name: appName,
		cwd: app
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