import _ from 'lodash'
import * as types from '../types'

// initial state
const state = {
	navigator: {
		screen: 'sp',
		userAgent: 'iOS',
		offline: false
	}
}

// getters
const getters = {
	gatNavigator: state => state.navigator
}

// actions
const actions = {
	// スライド関連
	// ========================
	setNavigator ({ commit }, values) {
		commit(types.SET_NAVIGATOR, values)
	}
}

// mutations
const mutations = {
	// スライド関連
	// ========================
	[types.SET_NAVIGATOR] (state, values) {
		_.forEach(values, (_value, _key) => {
			state.navigator[_key] = values[_key]
		})
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}
