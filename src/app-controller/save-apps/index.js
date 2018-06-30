export const saveApps = ({
    exec
}) => () => new Promise((resolve, reject) => {
	exec(`pm2 save`, (err, stdout, stderr) => {
		if (err) {
			console.log('Error occurred when saving apps', app)
			return reject()
		}
		console.log('Pm2 apps saved')
		return resolve()
	})
})