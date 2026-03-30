<template>
	<div id="main"
		v-if="!loading">
		<transition
			name="slide-bottomLong"
			mode="out-in">
			<router-view name="targetDetail"
				:roles="roles"
				@returnFn="returnFn"
				v-if="dialogs.targetDetail">
			</router-view>
		</transition>
		<transition
			name="fade-scaleIn"
			mode="out-in">
			<div id="container"
				v-if="!dialogs.targetDetail"
				:class="{
					filter: dialogs.confirmSignOut
				}">
				<transition
					name="fade"
					mode="out-in">
					<div id="returnBtn" class="btn flex center"
						v-if="inactive"
						@click="returnFn()">
						<div class="box">
							<font-awesome-icon :icon="['fal', 'angle-left']" fixed-width />
						</div>
						<MaterialRipple
							:center="true" :size="36">
						</MaterialRipple>
					</div>
				</transition>
				<div id="signOutBtn" class="btn flex center"
					@click="showConfirmSignOut()">
					<div class="box">
						<font-awesome-icon :icon="['far', 'power-off']" fixed-width />
					</div>
					<MaterialRipple
						:center="true" :size="36">
					</MaterialRipple>
				</div>
				<div id="border">
				</div>
				<main-roles
					:roles='roles'
					:inactive="inactive"
					@viewFn="viewFn">
				</main-roles>
				<transition
					name="slide-left"
					mode="out-in">
					<router-view
						:roles='roles'
						@returnFn="returnFn"
						@dialogFn="dialogFn">
					</router-view>
				</transition>
			</div>
		</transition>
		<transition
			name="fade-scaleIn"
			mode="out-in">
			<dialogs-signout
				@dialogFn="dialogFn"
				@signoutFn="signoutFn"
				v-if="dialogs.confirmSignOut">
			</dialogs-signout>
		</transition>
	</div>
</template>

<script>
import _ from 'lodash'
import axios from 'axios'
import moment from 'moment'
import Hammer from 'hammerjs'
import { mapState, mapGetters, mapActions } from 'vuex'
import MainRoles from './index.roles.vue'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import DialogsSignout from '../../_Parts/dialogs.signout.vue'
import MaterialRipple from '../../_Parts/material.ripple.vue'
import Mixins from '../../../services/vue.mixins'

export default {
	mixins: [
		Mixins.common,
		Mixins.storage
	],
	components: {
		MainRoles,
		DialogsSignout,
		FontAwesomeIcon,
		MaterialRipple
	},
	data () {
		return {
			touch: {
				main: null
			},
			roles: {
				common: false,
				staff: false
			},
			notify: {
				line: null
			},
			inactive: false
		}
	},
	watch: {
		'$route' (to, from) {
			const values = {}
			values.target = 'targetDetail'
			this.inactive = to.name === 'main' ? false : true

			if (to.name === 'target' || to.name === 'summary' || to.name === 'manual' || to.name === 'advices' || to.name === 'staff')
				values.show = true
			else
				values.show = false
			this.setDialogs(values)
		}
	},
	beforeDestroy () {
		if (this.touch.main)
			this.touch.main.destroy()
	},
	created () {
		this.checkStorage()
	},
	mounted () {
		this.set()
	},
	methods: {
		// dispatch > loading
		// ==================
		...mapActions([
			'setDialogs'
		]),
		// 初期化
		// ========================
		set () {
			if (!this.accessToken)
				this.$router.push({ name: 'signin' })

			const name = this.$route.name
			this.inactive = name === 'main' ? false : true

			const values = {}
			values.target = 'targetDetail'
			if (name === 'target' || name === 'summary' || name === 'manual' || name === 'advices' || name === 'staff')
				values.show = true
			else
				values.show = false
			this.setDialogs(values)
			this.setTouchEvent('app')

			// ここでrole取得
			this.setLoading()
			.then(() => {
				return this.getAllRequests()
			})
			.then(res => {
				this.setRoles(res[0])
				this.checkLineId(res[1])
				return this.checkRoles()
			})
			.then(d => {
				_.delay(() => {
					this.setLoaded()
				}, d)
			})
			.catch(err => {
				this.reject(err)
				this.setLoaded()
			})
		},
		getAllRequests () {
			const deferred = new Promise((resolve, reject) => {
				const option = {}
				option.headers = {
					Authorization: this.accessToken
				}
				axios.all([this.getMemberRole(option), this.getMemberProfile(option)])
				.then(
					axios.spread((resMemberRoles, resMemberProfile) => {
						const res = [resMemberRoles.data, resMemberProfile.data]
						return resolve(res)
					}),
					err => {
						return reject(err)
					}
				)
			})
			return deferred
		},
		getMemberRole (option) {
			const endpoint = [this.api.endpoint, 'member/roles'].join('/')
			return axios.get(endpoint, option)
		},
		getMemberProfile (option) {
			const endpoint = [this.api.endpoint, 'member/profile'].join('/')
			return axios.get(endpoint, option)
		},
		setRoles (res) {
			_.forEach(res.roles, _role => {
				this.roles[_role.id] = true
			})
		},
		checkLineId (res) {
			if (!res.member.line_id)
				this.showNotification()
		},
		checkRoles () {
			return 0
			if (this.roles.common && !this.roles.staff) {
				this.$router.push({ name: 'common' })
				return 500
			} else if (!this.roles.common && this.roles.staff) {
				this.$router.push({ name: 'staff' })
				return 500
			} else {
				return 0
			}
		},
		// タッチイベント関連
		// ========================
		setTouchEvent (target) {
			const el = document.getElementById(target)
			const options = {
				preventDefault: false
			}
			this.touch.main = new Hammer(el, options)
			this.touch.main.get('pan').set({
				enable: true,
				direction: Hammer.DIRECTION_ALL,
				threshold: 90
			})
		},
		// 表示関連
		// ========================
		showConfirmSignOut () {
			const values = {}
			values.target = 'confirmSignOut'
			values.show = true
			this.dialogFn(values)
		},
		// 表示関連 > 通知
		// ========================
		showNotification () {
			Promise.resolve()
			.then(() => {
				return this.getLINECode()
			})
			.then(d => {
				const url = d.data.url
				this.notify.line = this.$notify({
					title: 'LINEとの連携がされていません',
					dangerouslyUseHTMLString: true,
					onClick: () => { this.urlScheme(url) },
					message: `LINEと連携し健康情報を受け取りましょう`,
					position: 'bottom-right',
					duration: 0,
				})

			})
			.catch(err => {
				this.reject(err)
			})
		},
		getLINECode () {
			const deferred = new Promise((resolve, reject) => {
				const apiName = `member/line/url`
				const endpoint = [this.api.endpoint, apiName].join('/')
				const option = {}
				option.headers = {
					Authorization: this.accessToken
				}
				axios.get(endpoint, option)
				.then(
					res => {
						return resolve(res)
					},
					err => {
						return reject(err)
					}
				)
			})
			return deferred
		},
		urlScheme (uri) {
			window.open(uri)
			this.notify.line.close()
		},
		// $emit関連
		// ========================
		viewFn (target) {
			_.delay(() => {
				this.$router.push({ name: target })
			}, 100)
		},
		returnFn () {
			this.$router.push({ name: 'main' })
		},
		dialogFn (values) {
			this.setDialogs(values)
		},
		signoutFn () {
			this.setLoaded()
			this.$router.push({ name: 'signout' })
		}
	}
}
</script>

<style lang="stylus">
/* -------------------------------------
 *	mixins css
 * ------------------------------------- */
@import "../../../themes/styles/mixins.styl"

/* -------------------------------------
 *	style css
 * ------------------------------------- */
#main
	height 100%
	width 100%
	position relative
	background-color brgba(1)
	color pre-color
	#container
		height 100%
		width 100%
		position absolute
		&.filter
			filter grayscale(100%) blur(1.75px)
			opacity .5
	.btn
		height 60px
		width 60px
		position absolute
		top 0
		font-size 20px
		z-index 100
	#returnBtn
		&.btn
			left 0
			svg
				transform scale(1.5) translate3d(-3px, 0, 0)
	#signOutBtn
		&.btn
			top 0px
			right 0px
	#border
		height 1px
		width 100%
		position absolute
		top 60px
		overflow hidden
	.material-ripple__component
		background rgba(255, 255, 255, .3) !important

/* -------------------------------------
 *	style > dialogs css
 * ------------------------------------- */
#main
	#confirmSignOut
		height 100%
		width 100%
		position absolute
		top 0
		left 0
		background-color brgba(0)
		z-index 300
		.dialog
			width 80vw
			max-width 300px
			border-radius 10px
			background-color text-deep
			box-shadow 0 1px 3px rgba(0,0,0,.15)
			text-align center
			overflow hidden
			z-index 1
			.ws100
				width 100%
				h2
					margin 20px 20px
					font-size 20px
				.el-button
					height 60px
					width 100%
					border none
					border-radius 0
					// border-top 1px solid brgba(1)
					background-color text-color
					color pre-color
</style>
