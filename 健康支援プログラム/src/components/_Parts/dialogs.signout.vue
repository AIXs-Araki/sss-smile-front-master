<template>
	<div id="confirmSignOut" class="flex center"
		@click.self="closeDialog">
		<div class="dialog box flex center column">
			<div class="box ws100">
				<h2>
					サインアウトしますか？
				</h2>
			</div>
			<div class="box ws100 flex center">
				<div class="box grow">
					<el-button
						@click="closeDialog">
						いいえ
					</el-button>
				</div>
				<div class="box grow">
					<el-button
						@click="confirmedSignOut">
						はい
					</el-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import _ from 'lodash'
import moment from 'moment'
import Hammer from 'hammerjs'
import { mapState, mapGetters, mapActions } from 'vuex'
import MaterialRipple from './material.ripple.vue'
import Mixins from '../../services/vue.mixins'

export default {
	mixins: [
		Mixins.common,
		Mixins.storage
	],
	components: {
		MaterialRipple
	},
	data () {
		return {
		}
	},
	watch: {
		'$route' (to, from) {
			const values = {}
			values.target = 'targetDetail'
			this.inactive = to.name === 'main' ? false : true

			if (to.name === 'target' || to.name === 'summary' || to.name === 'manual' || to.name === 'advices')
				values.show = true
			else
				values.show = false
			this.setDialogs(values)
		}
	},
	beforeDestroy () {
	},
	created () {
	},
	mounted () {
		this.set()
	},
	methods: {
		// 初期化
		// ========================
		set () {
		},
		closeDialog () {
			const values = {}
			values.target = 'confirmSignOut'
			values.show = false
			this.$emit('dialogFn', values)
		},
		confirmedSignOut () {
			this.closeDialog()
			this.$emit('signoutFn')
		}
	}
}
</script>

<style lang="stylus">
/* -------------------------------------
 *	mixins css
 * ------------------------------------- */
@import "../../themes/styles/mixins.styl"

/* -------------------------------------
 *	style css
 * ------------------------------------- */
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
		background-color white
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
				border-top 1px solid line-color
</style>
