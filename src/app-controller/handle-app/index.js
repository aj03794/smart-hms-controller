export const handleApp = ({
	checkForApp,
	deleteApp,
	retrieveApp,
	unzipDir,
	turnOnApp,
    saveApps,
    resolvePath,
    cwd
}) => ({
	appName,
	appLocation,
	server: {
		address,
		port
	},
	appVersion
}) => () => new Promise((resolve, reject) => {
	console.log('appName', appName)
	const folder = resolvePath(cwd(), 'apps')
	console.log('folder', folder)
	checkForApp({ appName })
	.then(({ appExists }) => {
		if (appExists) deleteApp({ appExists, appName, folder })
		return Promise.resolve()
	})
	.then(() => retrieveApp({ appName, appLocation, port, address, folder, appVersion }))
	.then(({ zip }) => {
		return unzipDir({
			zip,
			appFolder: resolvePath(folder, appName)
		})
	})
	.then(() => turnOnApp({ appName, appLocation: folder }))
	.then(() => saveApps())
	.then(() => {
		console.log('Finished')
		resolve()
	})
})