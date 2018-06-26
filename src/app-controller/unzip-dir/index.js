export const unzipDir = ({
	removeSync,
	ensureDirSync,
	createReadStream,
	unzip
}) => ({
	zip,
	appFolder
}) => new Promise((resolve, reject) => {
	console.log(`unzipping ${zip}`)
	ensureDirSync(appFolder)
	createReadStream(zip)
	.pipe(unzip.Extract({ path: appFolder }))
	.on('close', () => {
		deleteFileOrFolder({
			location: zip,
			removeSync
		})
		.then(() => resolve())
	})
})

const deleteFileOrFolder = ({
	location,
	removeSync
}) => new Promise((resolve, reject) => {
	console.log('Deleting file/folder:', location)
	removeSync(location)
	resolve()
})