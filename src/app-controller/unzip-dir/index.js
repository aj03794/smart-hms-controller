export const unzipDir = ({
	removeSync,
	ensureDir,
	createReadStream,
	unzip
}) => ({
	zip,
	appFolder
}) => new Promise((resolve, reject) => {
	console.log(`unzipping ${zip}`)
	ensureDir(appFolder)
	.then(() => remove(location))
	.then(() => {
		return createReadStream(zip)
		.pipe(unzip.Extract({ path: appFolder }))
		.on('close', () => {
			Promise.resolve()
		})
	})
	.then(resolve)
	.catch(err => {
		console.log('unzipDir error', err)
	})
})