<template>
	<div id="page404" class="flex center">
		<div class="box">
			<h1>
				404 Error
			</h1>
			<h2>
				ページが見つかりませんでした
			</h2>
			<el-button v-if="$route.name !== 'page404'"
				@click="backToHome">
				ホームに戻る
			</el-button>
			<div id="version">version {{ version }}</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import Mixins from '../../services/vue.mixins'
import MaterialRipple from '../_Parts/material.ripple.vue'

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
	computed: {
		...mapState({
			version: state => state.config.api.version
		})
	},
	mounted () {
		this.set()
	},
	methods: {
		set () {
			this.setLoaded()
		},
		backToHome () {
			this.setLoading()
			if (this.token)
				this.$router.push({ name: 'main' })
			else
				this.$router.push({ name: 'signin' })
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
 #page404
 	height 100%
 	width 100%
 	margin 0
 	position relative
 	text-align center
 	color pre-color
 	overflow auto
 	h1
 		margin 0 0 0px
 		@extend .open-serif
 		font-size 42px
 	h2
 		font-size 20px
 		margin 0px auto 15px
 	.el-button
 		padding 20px 60px
 		border-radius 100px
 		border-color text-color
 		background-color text-color
 		transition(.3s)
 		font-size 18px
 		color pre-color
 		&:hover
 			border-color text-color
 			background-color text-color
 			color white

 /* -------------------------------------
  *	style > version css
  * ------------------------------------- */
 #page404
 	#version
 		margin-top 15px
 		margin-bottom 15px
 		text-align center
 		@extend .source-serif-i
 		font-size 14px
 		color pre-color
</style>
