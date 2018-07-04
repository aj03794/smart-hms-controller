export const retrieveApp = ({
    resolvePath,
    cwd,
    createWriteStream,
    ensureDir,
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
    const zip = resolvePath(cwd(), 'apps', `${appName}.zip`)
    ensureDir(resolvePath(cwd(), 'apps'))
        .then(()=> {
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
                Promise.reject(err)
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
        .catch(err => {
            console.log('Retrieve App err: ', err)
            return Process.exit(1)
        }) 
})