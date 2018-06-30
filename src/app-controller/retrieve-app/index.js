export const retrieveApp = ({
    resolvePath,
    cwd,
    createWriteStream,
    ensureDirSync,
    request
}) => ({
	appName,
	appLocation,
	port,
	address,
	appVersion,
	folder
}) => new Promise((resolve, reject) => {
	const file = resolvePath(appLocation, `${appName}-${appVersion}.zip`)
	console.log('FOLDER', folder)
	ensureDirSync(resolvePath(cwd(), 'apps'))
	const zip = resolvePath(cwd(), 'apps', `${appName}.zip`)
    const options = {
        method: 'GET',
        url: `http://${address}:${port}/${file}`,
        headers: {
            appLocation
        },
        encoding: null
    }
    request(options)
    .on('error', err => {
        console.log('Error occurred retrieving file', err)
        reject(err)
    })
    .on('response', response => {
        console.log('status code', response.statusCode)
    })
    .pipe(createWriteStream(zip))
    .on('close', () => {
        console.log('Finished writing file')
        resolve({ zip }) 
    })
})