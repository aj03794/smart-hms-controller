export const checkForApp = ({
    pm2List
}) => ({
	appName
}) => new Promise((resolve, reject) => {
	pm2List()
	.then(processes => {
		console.log('App name', appName)
		const match = processes.find(process => {
			console.log('process.name', process.name)
			return process.name === appName
		}) ? true : false
		console.log('Match', match)
		return resolve({ appExists: match})
	})
})