// 共通 > 定数
// ====================
const API_ENDPOINT = 'https://sample.com/'
const API_VERSION = process.env.VERSION ? process.env.VERSION : '2.0.0'
const APP_ENV = process.env.NODE_ENV
const APP_LOGGER = process.env.LOGGER
const LOCAL_STORAGE_KEY = '__nji_mobile'

// 共通 > 設定
// ====================
const state = {
	config: {
		localStorage: {
			key: LOCAL_STORAGE_KEY
		},
		api: {
			'endpoint': API_ENDPOINT,
			'version': API_VERSION
		},
		debug: {
			console: APP_ENV === 'production' ? false : true,
			alert: APP_ENV === 'production' ? false : true,
			logger: APP_LOGGER === 'undefined' || APP_LOGGER === undefined ? false : true
		},
		env: APP_ENV !== undefined && APP_ENV !== 'undefined' ? APP_ENV : 'develop'
	}
}
export default state
