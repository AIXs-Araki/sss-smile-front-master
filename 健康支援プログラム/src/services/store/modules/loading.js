import _ from 'lodash'
import * as types from '../types'

// initial state
const state = {
	isLoading: true
}

// getters
const getters = {
	getIsLoading: state => state.isLoading
}

// actions
const actions = {
	// ローディング関連
	// ========================
	setLoading ({ commit }, values) {
		commit(types.SET_LOADING)
	},
	setLoaded ({ commit }, values) {
		commit(types.SET_LOADED)
	},
	toggleLoad ({ commit }, values) {
		commit(types.SET_TOGGLE_LOAD)
	}
}

// mutations
const mutations = {
	// ローディング関連 > 読み込み中
	// ========================
	[types.SET_LOADING] (state) {
		state.isLoading = true
	},
	// ローディング関連 > 読み込み完了
	// ========================
	[types.SET_LOADED] (state) {
		state.isLoading = false
	},
	// ローディング関連 > 状態切り替え
	// ========================
	[types.SET_TOGGLE_LOAD] (state, values) {
		state.isLoading = !state.isLoading
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}
