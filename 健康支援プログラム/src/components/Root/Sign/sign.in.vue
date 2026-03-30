<template>
	<div id="signin" class="flex center">
		<div id="version">
			version {{ version }}
		</div>
		<div class="box">
			<transition
				name="slide-bottom">
				<div id="inputs"
					v-if="!loading">
					<form id="form"
						@submit.prevent="onSubmit"
						class="vertical layout">
						<div class="inputs">
							<div class="form-group">
								<el-input class="form-control"
									type="email"
									placeholder="メールアドレス"
									v-model="email">
								</el-input>
							</div>
							<div class="form-group">
								<el-input class="form-control"
									placeholder="パスワード"
									v-model="password"
									type="password">
								</el-input>
							</div>
						</div>
						<el-button
							@click="onSubmit">
							サインイン
							<MaterialRipple>
							</MaterialRipple>
						</el-button>
						<input type="submit" class="none" value="Submit" />
					</form>
				</div>
			</transition>
		</div>
	</div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import Mixins from '../../../services/vue.mixins'
import MaterialRipple from '../../_Parts/material.ripple.vue'

export default {
	name: 'sign-in',
	mixins: [
		Mixins.common,
		Mixins.storage
	],
	components: {
		MaterialRipple
	},
	data () {
		return {
			email: '',
			password: ''
		}
	},
	computed: {
		...mapState({
			version: state => state.config.api.version,
			endpoint: state => state.config.api.endpoint
		})
	},
	created () {
		this.checkStorage()
	},
	mounted () {
		this.set()
	},
	methods: {
		// dispatch > account
		...mapActions([
			'accountSignIn'
		]),
		// 初期化
		set () {
			if (this.accessToken)
				this.$router.push({ name: 'main' })
			else
				this.setLoaded()
		},
		// 送信
		// ========================
		onSubmit () {
			this.setLoading()
			.then(() => {
				return this.getValues()
			})
			.then(d => {
				return this.accountSignIn(d)
			})
			.then(res => {
				this.$router.push({ name: 'main' })
			})
			.catch(err => {
				this.setLoaded()
				this.reject(err)
			})
		},
		// 入力情報取得
		// ========================
		getValues () {
			const values = {}
			values.email = this.email
			values.password = this.password
			values.organization_id = this.$route.params.organization_id
			return values
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
	background-color brgba(1)
	position relative
	overflow auto
	color pre-color

/* -------------------------------------
 *	signin css
 * ------------------------------------- */
#signin
	#inputs
		width 75vw
		max-width 300px
		margin 24px auto 48px
		#form
			// padding 20px 30px 30px
			// border-radius 20px
			// border 1px solid line-color
			// background-color white
		.inputs
			width 100%
			h2
				display block
				position relative
				margin 0 auto 20px
				text-align center
				svg
					height auto
					width 72vw
					max-height 360px
					max-width 320px
					opacity .75
					&#moon
						heigth 128px
						width 128px
						position absolute
						right 64px
			.form-group
				margin 0px
				.form-control
					height 56px
					width 100%
					margin 0px 0px 0px 0px
					// border-radius 50px
					color text-color
					/*text-indent 12px*/
					font-size 18px
					text-align center
					box-shadow none
					-webkit-appearance none
					.el-input__inner
						height 56px
						width 100%
						position relative
						padding 1px 0 1px
						margin 0px 0px 20px 0px
						border 1px solid text-color
						background-color brgba(1)
						border-radius 0
						border-top-left-radius 10px
						border-top-right-radius 10px
						transition(.6s)
						@extend .open-serif-i
						font-size 18px
						text-align center
						color pre-color
						-webkit-appearance none
						&:active
						&:hover
							border 1px solid text-light
							color wrgba(1)
							z-index 1
			.form-group+.form-group
				.form-control
					margin-top -1px
					border 1 red
					.el-input__inner
						border-radius 0
						border-bottom-left-radius 10px
						border-bottom-right-radius 10px
		.el-button
			display block
			position relative
			width 100%
			padding 20px
			margin 20px 0 20px
			border-radius 10px
			border 1px solid brgba(1)
			background-color text-color
			font-size 18px
			color pre-color
			transition(.3s)
			overflow hidden
			span
				display inline-block
				height 100%
				width 100%
				position relative
			&:hover
			&:active
				color pre-color
		:placeholder-shown
			line-height 56px
			color wrgba(.365) !important
		::-webkit-input-placeholder
			line-height 56px
			color wrgba(.365) !important

/* -------------------------------------
 *	signin > version css
 * ------------------------------------- */
#signin
	#version
		width 100%
		position fixed
		bottom 0
		margin-top 15px
		margin-bottom 30px
		text-align center
		@extend .source-serif-i
		font-size 16px
		color pre-color
</style>
