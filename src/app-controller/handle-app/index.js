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
	const folder = resolvePath(cwd(), 'apps')
	checkForApp({ appName })
	.then(({ appExists }) =>  deleteApp({ appExists, appName, folder }))
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