export const saveApps = ({
	pm2Save
}) => () => new Promise((resolve, reject) => {
	pm2Save()
	.then(resolve)
	.catch(err => {
		console.log('saveApps failed')
	})
})