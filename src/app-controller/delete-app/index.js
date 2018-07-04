export const deleteApp = ({
    pm2Delete,
	removeSync,
	existsSync
}) => ({
	appExists,
	appName,
	folder
}) => new Promise((resolve, reject) => {
	// existsSync(folder) === true ? removeSync(folder) : null
	console.log('Deleting old app: ', appName)
	if (appExists) {
		console.log(`${appName} exists`)
		console.log('Folder to delete: ', folder)
		return pm2Delete({ process: appName })
		.then(() => {
			if (existsSync(folder)) {
				removeSync(folder)
				Promise.resolve()
			}
			// If pm2 is running app but the folder of the app doesn't exist
			// Should still resolve here
			Promise.resolve()
		})
		.then(resolve)
		.catch(reject)
	}
	console.log('App does not exist')
	return resolve()
})

