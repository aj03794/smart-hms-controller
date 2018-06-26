export const checkForApp = ({
    pm2
}) => ({
	appName
}) => new Promise((resolve, reject) => {
	pm2.list((err, processDescriptionList) => {
		const exists = processDescriptionList.find(element => {
			return element.name === appName
		}) ? true : false
		console.log('App exists:', exists)
		resolve({ appExists: exists })
	})
})