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
	enqueue,
	pm2Start,
	pm2Delete,
	pm2List,
	pm2Save
}) => new Promise((resolve, reject) => {

	const turnOnApp = turnOnAppCreator({ resolvePath, pm2Start })
	const unzipDir = unzipDirCreator({
		removeSync,
		ensureDir,
		createReadStream,
		unzip
	})
	const checkForApp = checkForAppCreator({ pm2List })
	const deleteApp = deleteAppCreator({ pm2Delete, removeSync, existsSync })
	const saveApps = saveAppsCreator({ pm2Save })
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

			// Only want certain apps on the raspberry pi zero w
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
			// Want all apps on the raspberry pi model 3B
			return enqueue(handleApp)
		})
	})
})