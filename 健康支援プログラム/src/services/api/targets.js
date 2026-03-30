import state from '../store/state'
import axios from 'axios'

const _endpoint = {
	targets: [state.config.api.endpoint, 'member/targets'].join('/'),
}
const axiosInstance = axios.create({
	headers: {
		'accept': 'application/json'
	}
})

export default {
	// ターゲット取得
	// ==================
	fetch (d, cb, errorCb) {
		return axios.get(_endpoint.targets, d)
		.then(res => {
			cb(res.data)
		})
		.catch(err => {
			errorCb(err)
		})
	}
}
