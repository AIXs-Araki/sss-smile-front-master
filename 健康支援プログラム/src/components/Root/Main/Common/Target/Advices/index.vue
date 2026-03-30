<template>
	<div id="advices">
		<div class="swiper-scroller"
			v-loading="advices.loading">
			<div id="advicesSlider" class="swiper-container">
				<div class="swiper-wrapper">
					<div class="swiper-slide v-slide"
						:class="{
							hs100: advices.data.length === 0 && !advices.loading
						}">
						<div class="noAdvices flex center"
							v-if="advices.data.length === 0 && !advices.loading">
							<div class="box">
								<font-awesome-icon class="box icon adjust3" :icon="['fas', 'comment-alt-smile']" fixed-width size="4x" /><br>
								no advices
							</div>
						</div>
						<div
							v-else>
							<div class="spacer">
							</div>
							<div class="advices">
								<div class="advice"
									v-for="advice in advices.data">
									<div class="date flex center">
										<!-- <font-awesome-icon :icon="['fas', 'dot-circle']" fixed-width /> -->
										<div class="box">
											<span class="point">
												&bull;
											</span>
										</div>
										<div class="box grow">
											{{ new Date(advice.updated_at) | dateFormat }}
										</div>
									</div>
									<div class="message"
										v-html="advice.body">
									</div>
								</div>
							</div>
							<div class="more"
								v-if="!advices.page.last">
								<el-button id="moreBtn"
									@click="moreAdvices()">
									{{ advices.page.current }}ページ目を表示
								</el-button>
							</div>
							<div class="spacer">
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
import MaterialRipple from '../../../../../_Parts/material.ripple.vue'
import Mixins from '../../../../../../services/vue.mixins'

export default {
	mixins: [
		Mixins.common
	],
	components: {
		FontAwesomeIcon,
		MaterialRipple
	},
	data () {
		return {
			advices: {
				data: [],
				loading: true,
				page: {
					total: 0,
					last: true,
					current: 1,
					per: 10
				}
			}
		}
	},
	watch: {
	},
	beforeDestroy () {
		this.$emit('swiperDestroyFn')
	},
	mounted () {
		this.set()
	},
	methods: {
		// 初期化
		// ==================
		set () {
			const values = {}
			values.target = `#advicesSlider.swiper-container`
			values.key = `advicesSlider`
			this.$emit('swiperFn', values)
			this.$emit('swiperUpdateFn')
			this.getAdvices()
		},
		// 表示関連
		// ========================
		setAdvices (d) {
			_.forEach(d.advices, _advice => {
				this.advices.data.push(_advice)
			})
			return d
		},
		setPageState (d) {
			this.advices.page.total = d.total
			this.advices.page.last = d.page_last
			this.advices.page.current += 1
		},
		moreAdvices () {
			const btn = document.getElementById('moreBtn')
			const cood = btn.getBoundingClientRect()
			const position = this.$parent.swiper.main.advicesSlider.getTranslate()
			const translate = Number('-' + cood.top) + position + 60
			const values = {}
			values.target = 'advicesSlider'
			values.translate = translate
			values.duration = 250
			this.getAdvices(values)
		},
		// 表示関連 > リクエスト
		// ========================
		getAdvices (values) {
			Promise.resolve()
			.then(() => {
				return this.getAdvicesRequest()
			})
			.then(d => {
				this.setAdvices(d.data)
				this.setPageState(d.data)
			})
			.then(() => {
				_.defer(() => {
					this.advices.loading = false
					this.$emit('swiperUpdateFn')
					if (values)
						this.$emit('swiperSetTranslateFn', values)
				})
			})
			.catch(err => {
				this.advices.loading = false
				this.reject(err)
			})
		},
		getAdvicesRequest () {
			const deferred = new Promise((resolve, reject) => {
				const params = `?page=${ this.advices.page.current }&per_page=${ this.advices.page.per }`
				const apiName = `organizations/${ this.$route.params.organization_id }/targets/${ this.$route.params.target_id  }/advices${ params }`
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
		// $emit関連
		// ========================
	}
}
</script>

<style lang="stylus">
/* -------------------------------------
 *	mixins css
 * ------------------------------------- */
@import "../../../../../../themes/styles/mixins.styl"

/* -------------------------------------
 *	style css
 * ------------------------------------- */
#advices
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
				&.hs100
					height 100%
	.el-loading-mask
		background-color brgba(.75)
		z-index 250
		.el-loading-spinner
			.path
				stroke pre-color

/* -------------------------------------
 *	style css
 * ------------------------------------- */
#advices
	.spacer
		height 60px
	.noAdvices
		height 100%
		opacity .333
		text-align center
		svg
			margin-bottom 10px
	.advices
		padding 5px 15px 0
		position relative
		.advice
			width 100%
			border-radius 10px
			box-shadow 0 1px 3px rgba(0,0,0,.15)
			background-color text-deep
			margin-bottom 15px
			@extend .noto-serif-i
			overflow hidden
			.date
				background-color text-deep//text-color
				border-bottom 1px solid brgba(1)
				padding 5px 0px
				font-size 14.5px
				line-height 1.03
				color gray-color
				.point
					display inline-block
					width 30px
					font-size 24px
					text-align center
				svg
					margin-right 5px
					transform scale(.875)
			.message
				padding 20px 30px
	.more
		margin 0 15px 15px
		.el-button
			height 46px
			width 100%
			border-radius 10px
			border-color text-color
			background-color text-color
			color pre-color
</style>
