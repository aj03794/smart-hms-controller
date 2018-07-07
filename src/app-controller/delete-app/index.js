export const deleteApp = ({
    pm2Delete,
	removeSync,
	existsSync,
	resolvePath
}) => ({
	appExists,
	appName,
	folder
}) => new Promise((resolve, reject) => {
	const app = resolvePath(folder, appName)
	if (appExists) {
		return pm2Delete({ process: appName })
		.then(() => {
			if (existsSync(app)) {
				console.log('Deleting', app)
				removeSync(app)
				return resolve()
			}
			// If pm2 is running app but the folder of the app doesn't exist
			// Should still resolve here
			return resolve()
		})
		.catch(reject)
	}
	console.log('App does not exist')
	return resolve()
})

