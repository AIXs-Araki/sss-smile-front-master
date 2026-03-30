<template>
	<div id="signout" class="flex center">
		<div class="box">
		</div>
	</div>
</template>

<script>
import _ from 'lodash'
import { mapState, mapGetters, mapActions } from 'vuex'
import Mixins from '../../../services/vue.mixins'
import MaterialRipple from '../../_Parts/material.ripple.vue'

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
			version: state => state.api.version,
			endpoint: state => state.api.endpoint
		})
	},
	mounted () {
		this.set()
	},
	methods: {
		// dispatch > account
		...mapActions([
			'accountSignOut'
		]),
		// 初期化
		set () {
			const organization_id = this.$route.params.organization_id

			this.setLoading()
			.then(() => {
				return this.accountSignOut(organization_id)
			})
			.then(res => {
				this.resetMember(organization_id)
				_.delay(() => {
					this.showNotification()
					this.$router.push({ name: 'signin' })
				}, 1 * 1000 )
			})
			.catch(res => {
				this.resetMember(organization_id)
				_.delay(() => {
					this.showNotification()
					this.$router.push({ name: 'signin' })
				}, .5 * 1000 )
				this.setLoaded()
			})
		},
		showNotification () {
			this.$notify({
				title: 'Sign out',
				message: 'サインアウトしました',
				duration: 4 * 1000
			})
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
 *	container css
 * ------------------------------------- */
#signin
	height 100%
	width 100%
	margin 0
	position relative
	overflow auto

</style>
