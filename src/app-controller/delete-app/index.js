export const deleteApp = ({
    pm2,
	removeSync,
	existsSync
}) => ({
	appExists,
	appName,
	folder
}) => new Promise((resolve, reject) => {
	existsSync(folder) === true ? removeSync(folder) : null
	console.log('Deleting old app: ', appName)
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
	console.log('App does not exist')
	return resolve()
})