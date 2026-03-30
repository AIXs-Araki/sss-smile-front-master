import { polyfill } from 'es6-promise'
import 'isomorphic-fetch'

// Utils for fetch (or xhr)
// ==================================================
const request = (method, uri, body, type) => {
	return new Promise((resolve, reject) => {
		// fetch を使用した際のコード
		// ※ iOS9.x では対応していないため polyfill(whatwg-fetch) をかませる必要あり
		// ※ fatch から axios へ変更したため現在使わない
		// =================================
		const values = new Object()
		values.method = method
		if (body !== undefined && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
			values.body = type === undefined ? JSON.stringify(body) : body
			values.headers = {
				'Content-Type': type === undefined ? 'application/json' : type
			}
			values.mode = 'cors'
		} else {
			values.mode = 'cors'
		}

		// null body の時の処理追加
		// =================================
		fetch(uri, values)
		.then(response => response.text()
		.then(data => ({
			status: response.status,
			data: data ? data : ''
		})))
		.then(res => {
			if (res.status !== 200)
				reject(res.data)
			else
				resolve(res.data)
		})
	})
}

export default { request }
