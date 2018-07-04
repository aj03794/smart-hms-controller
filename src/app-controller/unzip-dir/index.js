export const unzipDir = ({
	remove,
	ensureDir,
	createReadStream,
	unzip
}) => ({
	zip,
	appFolder
}) => new Promise((resolve, reject) => {
	console.log(`unzipping ${zip}`)
	ensureDir(appFolder)
	.then(() => new Promise((resolve, reject) => {
		createReadStream(zip)
		.pipe(unzip.Extract({ path: appFolder }))
		.on('close', () => {
			console.log('Finished unzipping directory')
			resolve()
		})
	}))
	.then(() => remove(zip))
	.then(resolve)
	.catch(err => {
		console.log('unzipDir error', err)
	})
})