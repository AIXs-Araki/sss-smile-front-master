<template>
	<div id="common">
		<div id="commonContainer" class="container flex center column">
			<div class="header box flex center column">
				<div class="box grow flex left">
					<div class="box center">
						<h3 class="title"
							@click="$emit('returnFn')">
							一般ユーザ
						</h3>
					</div>
				</div>
				<div class="searchBox box grow flex center">
					<div class="search box top">
						<transition
							name="fade"
							mode="out-in">
							<div class="clearBtn flex center"
								v-if="input"
								@click="input =''">
								<div class="box">
									<font-awesome-icon :icon="['fal', 'times']" fixed-width />
								</div>
							</div>
						</transition>
						<el-input
							placeholder="ユーザ検索"
							v-model="input">
						</el-input>
					</div>
				</div>
			</div>
			<div class="body box grow">
				<div class="swiper-scroller">
					<div id="targetSlider" class="swiper-container">
						<div class="swiper-wrapper">
							<div class="swiper-slide v-slide">
								<div class="targetCount flex center">
									<div class="box left">
										<transition
											name="slide-top"
											mode="out-in">
											<font-awesome-icon :icon="['fal', 'spinner']" fixed-width spin
												v-if="targets.loading" />
										</transition>
									</div>
									<div class="box right">
										<transition
											name="slide-top"
											mode="out-in">
											<div
												v-if="!targets.loading">
												<small>対象ユーザ:</small>
												{{ targets.data.length }}<small>人</small>
											</div>
										</transition>
									</div>
								</div>
								<div class="users">
									<transition-group
										name="slide-left"
										mode="out-in">
										<div class="user flex center gaps"
											@click="showTargetDetail(target)"
											v-for="(target, index) in targets.data"
											:key="index"
											v-if="target.show">
											<div class="icon box top">
												<svg class="iconSVG" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="48px" height="48px" viewBox="0 0 48 48">
													<defs>
														<linearGradient :id="`SVGGradient${ index }`" x1="0" x2="1" y1="0" y2="1">
															<stop offset="50%" stop-color="#e9eaeb"/>
															<stop offset="100%" stop-color="#aaa"/>
														</linearGradient>
													</defs>
													<g transform="translate(0, 0)"
														v-if="target.gender === 'male'">
														<path fill="rgba(51,51,51,1)" d="M43,47H5c-2.2091391,0-4-1.7908592-4-4V5c0-2.2091391,1.7908609-4,4-4h38c2.2091408,0,4,1.7908609,4,4v38 C47,45.2091408,45.2091408,47,43,47z"></path>
														<rect x="19" y="23.73913" fill-rule="evenodd" clip-rule="evenodd" fill="#DAC2A7" width="10" height="11.4130402"></rect>
														<path fill-rule="evenodd" clip-rule="evenodd" fill="#F1D9C5" d="M24,29c-4.4182796,0-8-3.5817204-8-8v-3 c0-4.4182816,3.5817204-8,8-8s8,3.5817184,8,8v3C32,25.4182796,28.4182796,29,24,29z"></path>
														<path fill-rule="evenodd" clip-rule="evenodd" :fill="`url(#SVGGradient${ index })`" d="M38.2770386,35.2519531L29,31c0,0-2,2-5,2s-5-2-5-2 l-9.2769775,4.2519531C8.2166748,35.9423218,7,37.8392944,7,39.4914551v7.5081177L7.000061,47H40.999939L41,46.9995728v-7.5081177 C41,37.8416748,39.7808838,35.9412231,38.2770386,35.2519531z"></path>
														<path fill-rule="evenodd" clip-rule="evenodd" fill="#888" d="M28,14c2.2091408,0,4,1.7908592,4,4v-5.000061 C32,10.7996483,30.2085896,9,27.9987698,9H27.5l-1.0499496-2.0998993c-0.2539501-0.5079002-0.8632202-0.7348289-1.3729-0.5309601 l-6.2915897,2.5166397C17.2462902,9.5014801,16,11.3438911,16,13.0016708V18c0-2.2091408,1.7908592-4,4-4H28z"></path>
													</g>
													<g transform="translate(0, 0)"
														v-else>
														<path fill="rgba(51,51,51,1)" d="M43,47H5c-2.2091391,0-4-1.7908592-4-4V5c0-2.2091391,1.7908609-4,4-4h38c2.2091408,0,4,1.7908609,4,4v38 C47,45.2091408,45.2091408,47,43,47z"></path>
														<path fill-rule="evenodd" clip-rule="evenodd" fill="#888" d="M14,18c0-5.52285,4.47715-10,10-10s10,4.47715,10,10v7.9934998 C34,28.2062302,32.2075272,30,30.0007706,30H17.9992294C15.7905197,30,14,28.2060509,14,25.9934998V18z"></path>
														<rect x="19" y="24" fill-rule="evenodd" clip-rule="evenodd" fill="#DAC2A7" width="10" height="11.4130402"></rect>
														<path fill-rule="evenodd" clip-rule="evenodd" :fill="`url(#SVGGradient${ index })`" d="M37.3091431,35.154541L29,31c0,0-2,2-5,2s-5-2-5-2 l-8.309082,4.154541C9.1981201,35.9009399,8,37.8392944,8,39.4914551v7.5081177L8.000061,47H39.999939L40,46.9995728v-7.5081177 C40,37.8416748,38.7952271,35.897583,37.3091431,35.154541z"></path>
														<path fill-rule="evenodd" clip-rule="evenodd" fill="#EAD8C5" d="M16,19.5454483V21c0,4.4109097,3.5890903,8,8,8s8-3.5890903,8-8 v-1.4545517c0-1.2049789-0.9768295-2.1818199-2.1818199-2.1818199c-2.533041,0-4.730011-1.4388599-5.8181801-3.5438499 c-1.0881691,2.10499-3.2851391,3.5438499-5.8181801,3.5438499C16.9768295,17.3636284,16,18.3404694,16,19.5454483z"></path>
														<path fill-rule="evenodd" clip-rule="evenodd" fill="#888" d="M32.9998398,17.9450893C32.6715622,17.9813709,32.3379517,18,32,18 c-3.4829292,0-6.5037708-1.9784393-8-4.8727989C22.5037708,16.0215607,19.4829292,18,16,18 c-0.3379498,0-0.6715603-0.0186291-0.9998398-0.0549107C15.0297098,12.9998016,19.0477505,9,24,9 S32.9702911,12.9998016,32.9998398,17.9450893z"></path>
													</g>
												</svg>
											</div>
											<div class="info box grow">
												{{ target.name }}
												<small>({{ target.birthday | getAge }}歳)</small>
												<div class="border"></div>
												<small class="birthday">生年月日: {{ target.birthday }}</small>
											</div>
										</div>
									</transition-group>
								</div>
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
import axios from 'axios'
import moment from 'moment'
import Hammer from 'hammerjs'
import Swiper from 'swiper'
import { mapState, mapGetters, mapActions } from 'vuex'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import MaterialRipple from '../../../_Parts/material.ripple.vue'
import Mixins from '../../../../services/vue.mixins'

export default {
	props: [
		'roles'
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
			mc: null,
			swiper: {
				main: {}
			},
			targets: {
				loading: true,
				data: [],
				row: []
			},
			input: ''
		}
	},
	computed: {
		...mapGetters({
			targetsRow: 'getAllTargets'
		})
	},
	watch: {
		'input' () {
			this.targets.data = _.filter(this.targetsRow, _target => {
				return _target.name.indexOf(this.input) >= 0
			})
			_.defer(() => {
				this.swiperUpdateFn()
				this.slideToTopFn('targetSlider')
			})
		}
	},
	beforeDestroy () {
		if (this.mc !== null)
			this.mc.destroy()
	},
	created () {
		if (!this.roles.common)
			this.$emit('returnFn')
	},
	mounted () {
		if (this.roles.common)
			this.set()
	},
	methods: {
		// dispatch > member targets
		// ==================
		...mapActions([
			'fetchMemberTargets'
		]),
		// 初期化
		// ==================
		set () {
			const values = {}
			values.target = `#targetSlider.swiper-container`
			values.key = `targetSlider`
			this.swiperFn(values)
			this.setTouchEvent('commonContainer')

			Promise.resolve()
			.then(() => {
				return this.fetchMemberTargets(this.accessToken)
			})
			.then(() => {
				return this.setTargets()
			})
			.then(d => {
				this.targets.loading = false
				_.delay(() => {
					this.swiperUpdateFn()
				}, d)
			})
			.catch(err => {
				this.reject(err)
			})
		},
		getRequest () {
		},
		setTargets (res) {
			const duration = (this.targetsRow.length + 1) * 100
			this.targets.data = this.targetsRow

			return duration
		},
		// タッチイベント関連
		// ========================
		setTouchEvent (target) {
			const el = document.getElementById(target)
			const options = {
				preventDefault: false
			}
			this.mc = new Hammer(el, options)
			this.mc.get('pan').set({
				enable: true,
				direction: Hammer.DIRECTION_ALL,
				threshold: 90
			})
			this.mc.on('panup panleft panright pandown tap', ev => {
				if (ev.type === 'panright')
					this.$emit('returnFn')
			})
		},
		// 表示関連
		// ========================
		showTargetDetail (target) {
			this.$router.push({ name: 'target', params: { target_id: target.id } })
		},
		// $emit関連 > swiper
		// ========================
		slideToTopFn (target) {
			this.swiper.main[target].slideTo(0)
		},
		swiperFn (values) {
			this.setSwiper(values.target, values.key)
		},
		swiperTranslateFn (target) {
			const date = new Date()
			this.swiper.main[target].on('setTranslate', () => {
				const translate = this.swiper.main[target].translate
			})
		},
		swiperUpdateFn () {
			_.defer(() => {
				this.resizeSwiper()
			})
		},
		// swiperDestroyFn () {
		// 	this.destroySwiper()
		// }
	}
}
</script>

<style lang="stylus">
/* -------------------------------------
 *	mixins css
 * ------------------------------------- */
@import "../../../../themes/styles/mixins.styl"

/* -------------------------------------
 *	style css
 * ------------------------------------- */
#common
	height 100%
	width 100%
	position absolute
	top 0
	left 0
	background-color brgba(1)
	color pre-color
	overflow hidden
	.swiper-scroller
		height 100%
		width 100%
		position relative
		.swiper-container
			height 100%
			.v-slide
				height auto
				-webkit-box-sizing border-box
				box-sizing border-box

/* -------------------------------------
 *	style css
 * ------------------------------------- */
#common
	.container
		height 100%
		width 100%
		position relative
	.header
		height 120px
		width 100%
		position relative
		border-bottom 1px solid text-deep
		font-weight 500
		font-size 20px
		.title
			margin 0
			text-indent 48px
			font-size 18px
		.searchBox
			width 100%
			.search
				height 48px
				position relative
				width calc(100% - 24px)
				.clearBtn
					height 48px
					width 48px
					position absolute
					right 0px
					top 0px
					line-height 48px
					color gray-light
					z-index 50
				.el-input
					.el-input__inner
						height 48px
						border-radius 10px
						border-color text-color
						background-color text-color
						font-size 18px
						color pre-color
						// box-shadow 0 1px 3px rgba(0,0,0,.15)
				:placeholder-shown
					line-height 56px
					color wrgba(.3) !important
				::-webkit-input-placeholder
					line-height 56px
					color wrgba(.3) !important
	.body
		width 100%
		position relative
		overflow hidden
		.targetCount
			margin 15px 15px 0px 15px
			color gray-color
		.users
			padding 10px 0 10px 10px
			.user
				margin-bottom 10px
				padding 5px 0 5px 5px
				.info
					padding-bottom 5px
					line-height 1.333
					.border
						height 1px
						width 100%
						margin 5px 0
						background-color text-deep
						overflow hidden
					.birthday
						color gray-color
</style>
