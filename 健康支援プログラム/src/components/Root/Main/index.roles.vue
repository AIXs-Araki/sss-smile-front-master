<template>
	<div id="roles" class="flex column"
		:class="{
			inactive: inactive
		}">
		<div class="header box flex center">
			<div class="box">
				<h3 class="title"
					v-if="member.name">
					{{ member.organization.name }}
				</h3>
			</div>
		</div>
		<div class="items box grow">
			<div class="swiper-scroller">
				<div id="rolesSlider" class="swiper-container">
					<div class="swiper-wrapper">
						<div class="swiper-slide v-slide flex"
							:class="{
								column: navigator.screen === 'sp'
							}">
							<div class="item box grow flex center"
								:class="{
									rumble: rumble.common
								}"
								@click="changeView('common')">
								<!-- v-if="roles.common"> -->
								<div class="box"
									:class="{
										disabled: !roles.common
									}">
									<h1>一般ユーザ</h1>
									<p>家族の健康をあたり用の<br>サンプルテキストです！</p>
									<el-button>
										{{ roles.common ? 'ご利用できます' : 'ご利用できません' }}
									</el-button>
								</div>
								<material-ripple>
								</material-ripple>
							</div>
							<div class="item box grow flex center"
								:class="{
									rumble: rumble.staff
								}"
								@click="changeView('staff')">
								<!-- v-if="roles.staff"> -->
								<div class="box"
									:class="{
										disabled: !roles.staff
									}">
									<h1>スタッフ</h1>
									<p>対象の患者の健康状態を<br>管理するのはこちらから！</p>
									<el-button>
										{{ roles.staff ? 'ご利用できます' : 'ご利用できません' }}
									</el-button>
								</div>
								<material-ripple>
								</material-ripple>
							</div>
						</div>
					</div>
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
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import MaterialRipple from '../../_Parts/material.ripple.vue'
import Mixins from '../../../services/vue.mixins'

export default {
	props: [
		'roles',
		'inactive'
	],
	mixins: [
		Mixins.common,
		Mixins.vscroller
	],
	components: {
		FontAwesomeIcon,
		MaterialRipple
	},
	data () {
		return {
			swiper: {
				main: {}
			},
			rumble: {
				common: false,
				staff: false
			}
		}
	},
	watch: {
	},
	beforeDestroy () {
	},
	created () {
	},
	mounted () {
		this.set()
	},
	methods: {
		set () {
			const values = {}
			values.target = `#rolesSlider.swiper-container`
			values.key = `rolesSlider`
			this.swiperFn(values)
		},
		// 表示関連
		changeView (target) {
			if (!this.roles[target])
				return this.unauthorized(target)
			this.$emit('viewFn', target)
		},
		unauthorized (target) {
			this.$notify({
				title: 'エラー',
				message: `権限がないためご利用いただけません`,
				duration: 2 * 1000,
			})
			this.rumble[target] = true
			_.delay(() => {
				this.rumble[target] = false
			}, 333)
		},
		// $emit関連 > swiper
		// ========================
		slideToTopFn (target) {
			this.swiper.main[target].slideTo(0)
		},
		swiperFn (values) {
			this.setSwiper(values.target, values.key)
		},
		swiperUpdateFn () {
			_.defer(() => {
				this.resizeSwiper()
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
 *	style css
 * ------------------------------------- */
#roles
	height 100%
	width 100%
	transition(.3s)
	position relative
	&.inactive
		transform translate3d(-60px, 0, 0)
		opacity 0
	.swiper-scroller
		height 100%
		width 100%
		position relative
		.swiper-container
			height 100%
			.v-slide
				height 100%
				-webkit-box-sizing border-box
				box-sizing border-box

/* -------------------------------------
 *	style css
 * ------------------------------------- */
#roles
	.header
		height 60px
		width 100%
		border-bottom 1px solid text-deep
		font-weight 500
		font-size 20px
		.title
			margin 0
			font-size 18px
	.items
		position relative
		overflow hidden
		.item
			position relative
			box-sizing border-box
			text-align center
			overflow hidden
			&.rumble
				animation anim-rumble 0.12s linear infinite
			&:last-child
				border none
			.disabled
				.el-button
					background-color brgba(1)
			h1
				margin 0
			p
				margin 0 0 15px
				padding 0 15px
			.el-button
				height 46px
				min-width 144px
				border-radius 10px
				border-color text-color
				background-color text-color
				font-size 16px
				color pre-color
@media screen and (max-width 992px)
	#roles
		.item
			height 50%
			width 100%
			border-bottom 1px solid text-deep
@media screen and (min-width 992px)
	#roles
		.item
			height 100%
			width 50%
			border-right 1px solid text-deep
</style>
