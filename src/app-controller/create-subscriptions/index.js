export const createSubscriptions = ({
    subscribe
}) => new Promise((resolve, reject) => {
    subscribe({
        channel: 'continuous delivery'
    })
    .then(({ allMsgs, filterMsgs }) => {
        const subscription = filterMsgs(msg => {
            if (msg.data) {
                console.log('----->', msg.data[1])
                const {
                    server,
                    appName,
                    appLocation,
                    appVersion
                } = JSON.parse(msg.data[1])
                if (server && appName && appLocation && appVersion) {
                    console.log('properties exist')
                    return true
                }
              return false
            }
            return false
        })
        resolve({
            subscription
        })
    })
})