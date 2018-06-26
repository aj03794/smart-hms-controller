export const deleteApp = ({
    pm2,
    removeSync
}) => ({
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