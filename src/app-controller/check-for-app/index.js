export const checkForApp = ({
    pm2List
}) => ({
	appName
}) => new Promise((resolve, reject) => {
	pm2List()
	.then(processes => {
		const match = processes.find(process => {
			process.name === appName
		}) ? true : false
		return Promise.resolve(match)
	})
	.then(match => resolve({ appExists: match}))
})