import _ from 'lodash'
import Targets from '../../api/targets'
import * as types from '../types'

// initial state
const state = {
	all: []
}

// getters
const getters = {
	getAllTargets: state => state.all
}

// actions
const actions = {
	// メンバー > ターゲット関連
	// ========================
	fetchMemberTargets ({ commit }, value) {
		const option = {}
		option.headers = {
			Authorization: value
		}
		const deferred = new Promise((resolve, reject) => {
			Targets.fetch(
				option,
				res => {
					const values = _.forEach(res.targets, (_target, _index) => {
						const duration = (_index + 1) * 100
						_target.show = false
						_.delay(() => {
							commit(types.SHOW_MEMBER_TARGET, _index)
						}, duration)
					})
					commit(types.SET_MEMBER_TARGETS, res.targets)
					return resolve()
				},
				err => {
					return reject(err)
				}
			)
		})
		return deferred
	}
}

// mutations
const mutations = {
	// メンバー > ターゲット関連
	// ========================
	[types.SET_MEMBER_TARGETS] (state, values) {
		state.all = values
	},
	[types.SHOW_MEMBER_TARGET] (state, value) {
		state.all[value].show = true
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}
