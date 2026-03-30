import state from '../store/state'
import axios from 'axios'

const _endpoint = {
	sign_in: [state.config.api.endpoint, 'member/login'].join('/'),
	sign_out: [state.config.api.endpoint, 'member/logout'].join('/'),
}
const axiosInstance = axios.create({
	headers: {
		'accept': 'application/json'
	}
})

export default {
	// サインイン
	// ==================
	signIn (d, cb, errorCb) {
		return axios.post(_endpoint.sign_in, d)
		.then(res => {
			cb(res.data)
		})
		.catch(err => {
			errorCb(err)
		})
	},
	// サインアウト
	// ==================
	signOut (d, cb, errorCb) {
		return axios.post(_endpoint.sign_out, {}, d)
		.then(res => {
			cb(res.data)
		})
		.catch(err => {
			errorCb(err)
		})
	}
}
