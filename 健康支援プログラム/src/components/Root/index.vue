<template>
	<div id="root">
		<router-view>
		</router-view>
	</div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import Mixins from '../../services/vue.mixins'
import MaterialRipple from '../_Parts/material.ripple.vue'

export default {
	name: 'root',
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
	},
	mounted () {
		this.set()
	},
	methods: {
		// 初期化
		set () {
			const org_id = this.$route.params.org_id
			if (org_id === '404')
				this.$router.push({ name: 'page404' })
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
#root
	height 100%
	width 100%
	margin 0
	position relative
	overflow auto

</style>
