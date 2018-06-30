import { queue as asyncQueue} from 'async'

export const q = () => new Promise((resolve, reject) => {

    const queue = asyncQueue((func, cb) => {
        func()
        .then(cb)
    })

    return resolve({
        enqueue: (func) => queue.push(func)
    })

})