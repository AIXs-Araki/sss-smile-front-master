<template>
	<transition
		name="fade"
		mode="out-in">
		<div id="loading"
			v-if="loading">
			<span class="loading flex center">
				<svg viewBox="25 25 50 50" class="circularLoading box">
					<circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
				</svg>
			</span>
		</div>
	</transition>
</template>

<script>
export default {
	name: 'app-loading',
	props: [
		'loading'
	],
	data () {
		return {
		}
	},
	mounted () {
	},
	methods: {
	}
}
</script>

<style lang="stylus">
@import "../themes/styles/mixins.styl"

/* -------------------------------------
 *	app > loading css
 * ------------------------------------- */
#app
	#loading
		height 100%
		width 100%
		position fixed
		top 0
		left 0
		background-color bgrgba(0)
		z-index 6666
		.loading
			display flex !important
			position relative !important
			margin 0 auto !important
</style>
