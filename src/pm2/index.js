// Option 1
// Import pm2 into the file directly
import pm2 from 'pm2'

export const pm2Start = ({ script, options }) => pm2.start(script, options, (err) => {
    if (err) {
        console.log(`Problem starting ${appName} - err: `, err)
        reject()
    }
    console.log('Successfully turned on app')
    resolve()
})

// Other pm2 functions


// Option two
// Inject pm2
export const pm2Functions = ({
    pm2
}) => new Promise((resolve, reject) => {

    const pm2Start = ({ script, options }) => new Promise((resolve, reject) => {
        pm2.start(script, options, (err) => {
            if (err) {
                console.log(`Problem starting ${appName} - err: `, err)
                reject()
            }
            console.log('Successfully turned on app')
            resolve()
        })
    })

    const pm2Save = ({}) => new Promise((resolve, reject) => {
        exec(`pm2 save`, (err, stdout, stderr) => {
            if (err) {
                console.log('Error occurred when saving apps', app)
                return reject()
            }
            console.log('Pm2 apps saved')
            return resolve()
        })
    })

    return resolve({
        pm2Start,
        // Other pm2 functions
    })

})