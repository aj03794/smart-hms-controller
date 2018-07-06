import { exec } from 'process'

export const pm2Functions = ({
    pm2
}) => new Promise((resolve, reject) => {

    const pm2Start = ({ script, options }) => new Promise((resolve, reject) => {
        pm2.start(script, options, (err) => {
            if (err) {
                console.log(`Problem starting app - err: `, err)
                reject()
            }
            console.log('Successfully turned on app')
            resolve()
        })
    })

    const pm2Save = () => new Promise((resolve, reject) => {
        exec(`pm2 save`, (err, stdout, stderr) => {
            if (err) {
                console.log('Error occurred when saving apps', err)
                return reject()
            }
            console.log('Pm2 apps saved')
            return resolve()
        })
    })

    const pm2Delete = ({ process }) => new Promise((resolve, reject) => {
        pm2.delete(process, (err) => {
            if (err) {
                console.log('Something went wrong pm2 app')
                return reject()
            }
        })
        return resolve()
    })

    const pm2List = () => new Promise((resolve, reject) => {
        pm2.list((err, processDescriptionList) => {
            // const exists = processDescriptionList.find(element => {
            //     return element.name === appName
            // }) ? true : false
            // console.log('App exists:', exists)
            if (err) {
                console.log('Error occurred in pm2List', err)
                return reject(err)
            }
            // resolve({ appExists: exists })
            resolve(processDescriptionList)
        })
    })

    return resolve({
        pm2Start,
        pm2Save,
        pm2Delete,
        pm2List
    })

})