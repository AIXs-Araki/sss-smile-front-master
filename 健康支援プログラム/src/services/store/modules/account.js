import _ from 'lodash'
import Account from '../../api/account'
import * as types from '../types'

// initial state
const state = {
	accessToken: '',
	member: {
	}
}
const initState = _.cloneDeep(state)

// getters
const getters = {
	getAccessToken: state => state.accessToken,
	getMember: state => state.member
}

// actions
const actions = {
	// ユーザ情報関連
	// ========================
	setMember ({ commit, rootState }, values) {
		const key = [rootState.config.localStorage.key, values.organization_id].join('_')
		const storage = JSON.parse(values.storage)
		commit(types.SET_ACCESS_TOKEN, storage.accessToken)
		commit(types.SET_MEMBER_INFO, storage.member)
		commit(types.SET_LOCAL_STORAGE, { key })
	},
	resetMember ({ commit, rootState }, value) {
		const key = [rootState.config.localStorage.key, value].join('_')
		commit(types.RESET_ACCESS_TOKEN)
		commit(types.RESET_MEMBER_INFO)
		commit(types.REMOVE_LOCAL_STORAGE, { key })
	},
	// サインイン・アウト関連
	// ========================
	accountSignIn ({ commit, rootState }, values) {
		// ここで signin APIを叩いてユーザ情報取得
		const key = [rootState.config.localStorage.key, values.organization_id].join('_')
		const deferred = new Promise((resolve, reject) => {
			Account.signIn(
				values,
				res => {
					commit(types.SET_ACCESS_TOKEN, res.accessToken)
					commit(types.SET_MEMBER_INFO, res.member)
					commit(types.SET_LOCAL_STORAGE, { key })
					return resolve()
				},
				err => {
					commit(types.RESET_ACCESS_TOKEN)
					commit(types.RESET_MEMBER_INFO)
					commit(types.REMOVE_LOCAL_STORAGE, { key })
					return reject(err)
				}
			)
		})
		return deferred
	},
	accountSignOut ({ commit, state, rootState }, value) {
		// ここで signout APIを叩いて使用しているトークンを無効化
		const key = [rootState.config.localStorage.key, value].join('_')
		const option = {
			headers: {
				Authorization: state.accessToken
			}
		}
		const deferred = new Promise((resolve, reject) => {
			Account.signOut(
				option,
				res => {
					commit(types.RESET_MEMBER_INFO)
					commit(types.REMOVE_LOCAL_STORAGE, { key })
					return resolve()
				},
				err => {
					commit(types.RESET_ACCESS_TOKEN)
					commit(types.RESET_MEMBER_INFO)
					commit(types.REMOVE_LOCAL_STORAGE, { key })
					return reject(err)
				}
			)
		})
		return deferred
	},
}

// mutations
const mutations = {
	// アクセストークン関連
	// ========================
	[types.SET_ACCESS_TOKEN] (state, value) {
		state.accessToken = value
	},
	[types.RESET_ACCESS_TOKEN] (state) {
		state.accessToken = ''
	},
	// ユーザ情報関連
	// ========================
	[types.SET_MEMBER_INFO] (state, values) {
		_.forEach(values, (_value, _key) => {
			state.member[_key] = _value
		})
	},
	[types.RESET_MEMBER_INFO] (state) {
		_.forEach(state.member, (_value, _key) => {
			delete state.member[_key]
		})
	},
	// ローカルストレージ関連
	// ========================
	[types.SET_LOCAL_STORAGE] (state, values) {
		const storage = JSON.stringify(state)
		localStorage.setItem(values.key, storage)
	},
	[types.REMOVE_LOCAL_STORAGE] (state, values) {
		localStorage.removeItem(values.key)
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}
