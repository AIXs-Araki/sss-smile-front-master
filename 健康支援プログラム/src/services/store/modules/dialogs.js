import _ from 'lodash'
import * as types from '../types'

// initial state
const state = {
	dialogs: {
		targetDetail: false,
		confirmSignOut: false
	}
}

// getters
const getters = {
	getDialogs: state => state.dialogs
}

// actions
const actions = {
	// スライド関連
	// ========================
	setDialogs ({ commit }, values) {
		commit(types.SET_DIALOGS, values)
	}
}

// mutations
const mutations = {
	// スライド関連
	// ========================
	[types.SET_DIALOGS] (state, values) {
		state.dialogs[values.target] = values.show
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}
