export const getModel = ({
    RPI
}) => new Promise((resolve, reject) => {
    try {
        const rpi = new RPI()
        const model = rpi.getModel()
        return resolve({ model })
    }
    catch (e) {
        if (e.code === 'ENOENT' && e.path === '/proc/cpuinfo') {
            console.log('This is dev')
            const model = 'development'
            return resolve({ model })
        }
        return reject(e)
    }
})