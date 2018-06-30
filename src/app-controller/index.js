import { exec } from 'child_process'
import { queue } from 'async'
import request from 'request'
import pm2 from 'pm2'
import {
	createReadStream,
	createWriteStream,
	ensureDirSync,
	removeSync,
	existsSync
} from 'fs-extra'
import { cwd } from 'process'
import unzip from 'unzip'

import { resolve as resolvePath } from 'path'
import { unzipDir as unzipDirCreator } from './unzip-dir'
import { createSubscriptions } from './create-subscriptions'
import { turnOnApp as turnOnAppCreator } from './turn-on-app'
import { checkForApp as checkForAppCreator } from './check-for-app'
import { deleteApp as deleteAppCreator } from './delete-app'
import { saveApps as saveAppsCreator } from './save-apps'
import { retrieveApp as retrieveAppCreator } from './retrieve-app'
import { handleApp as handleAppCreator } from './handle-app'

export const initAppController = ({
	publish,
	subscribe,
	model,
	enqueue
}) => new Promise((resolve, reject) => {

	const turnOnApp = turnOnAppCreator({ resolvePath, pm2 })
	const unzipDir = unzipDirCreator({
		removeSync,
		ensureDirSync,
		createReadStream,
		unzip
	})
	const checkForApp = checkForAppCreator({ pm2 })
	const deleteApp = deleteAppCreator({ pm2, removeSync, existsSync })
	const saveApps = saveAppsCreator({ exec })
	const retrieveApp = retrieveAppCreator({
		resolvePath,
		cwd,
		createWriteStream,
		ensureDirSync,
		request
	})

	createSubscriptions({
		subscribe,
		enqueue
	})
	.then(({
		subscription
	}) => {
		subscription.subscribe(msg => {

			const {
				appName,
			} = msg.data[1]


			const handleApp = handleAppCreator({
				checkForApp,
				deleteApp,
				retrieveApp,
				unzipDir,
				turnOnApp,
				saveApps,
				resolvePath,
				cwd
			})(JSON.parse(msg.data[1]))

			if(model === 'Zero W') {
				switch(appName) {
					case 'raspberry-pi-camera':
					case 'smart-hms-controller':
					case 'storage-service':
					case 'slack-service':
						return enqueue(handleApp)
					default:
						console.log('This service does not belong on zero w')
						return
				}
			}
			return enqueue(handleApp)
		})
	})
})