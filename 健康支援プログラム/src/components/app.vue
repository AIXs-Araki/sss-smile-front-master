<template>
	<div id="app">
		<div id="content">
			<transition
				name="fade"
				mode="out-in">
				<router-view></router-view>
			</transition>
		</div>
		<app-loading
			:loading="loading">
		</app-loading>
	</div>
</template>

<script>
import _ from 'lodash'
import { mapState, mapGetters, mapActions } from 'vuex'
import Mixins from '../services/vue.mixins'
import AppLoading from './app.loading.vue'

export default {
	name: 'App',
	mixins: [
		Mixins.init,
		Mixins.common,
		Mixins.storage
	],
	components: {
		AppLoading
	},
	data () {
		return {
		}
	},
	watch: {
		'$route' (to, from) {
		}
	},
	beforeDestroy () {
		window.removeEventListener('resize', this.reflow, false)
	},
	created () {
		if (this.debug.console)
			console.log('NODE_ENV:', `'${ this.env }'`, ', CONSOLE:', this.debug.console, ', ALERT:', this.debug.alert, ', ROGGER:', this.debug.logger)
		this.set()
	},
	methods: {
		...mapActions([
			'setNavigator'
		]),
		set () {
			this.setReflow()
		},
		setReflow () {
			window.addEventListener('resize', this.reflow, false)
			this.reflow()
		},
		reflow () {
			const values = {}
			const el = document.getElementById("app")
			const elWidth = el.clientWidth
			values.screen = elWidth > 992 ? 'tablet' : 'sp'
			this.setNavigator(values)
		}
	}
}
</script>

<style lang="stylus">
@import "../themes/styles/common.styl"
@import "../themes/styles/mixins.styl"

/* -------------------------------------
 *	app css
 * ------------------------------------- */
#app
	height 100%
	width 100vw
	#content
		height 100%
		.container
			position relative
		[v-cloak]
			display none
	.loading
		display block
		height 100%
		width 100%
		// margin 60px auto
		margin-top 120px
		position fixed
		text-align center
		font-size 48px
		.circularLoading
			display inline-block
			width 48px
			height 48px
			animation loading-rotate 2s linear infinite
			.path
				animation loading-dash 1.5s ease-in-out infinite
				stroke-width 2
				stroke pre-color
</style>
