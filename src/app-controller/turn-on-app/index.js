export const turnOnApp = ({
    resolvePath,
    pm2Start
}) => ({
	appName,
	appLocation
}) => new Promise((resolve, reject) => {
	console.log('Turning on new app')
	// TODO: Can make a function to return the base index.js from a folder
	const script = 'index.js'
	const app = resolvePath(appLocation, appName)
	console.log('script', script)
	const options = {
		name: appName,
		cwd: app
	}
	pm2Start({ script, options })
	.then(resolve)
	.catch(err => {
		console.log('turnOnApp error', err)
	})
})