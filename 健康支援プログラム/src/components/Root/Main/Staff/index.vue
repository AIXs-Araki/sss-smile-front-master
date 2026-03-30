<template>
	<div id="staffDetail">
		<div id="detailHeader" class="flex center">
			<div class="box grow">
				<div class="userName">
					スタッフ
				</div>
			</div>
			<div class="closeBtn box flex center"
				@click="$router.push({ name: 'main' })">
				<font-awesome-icon class="box" :icon="['fal', 'angle-down']" fixed-width />
			</div>
		</div>
		<transition
			:name="detailTransiton"
			mode="out-in">
			<staff-manual name="detail"
				:date="date"
				@changeDateFn="changeDateFn"
				@slideToTopFn="slideToTopFn"
				@swiperFn="swiperFn"
				@swiperUpdateFn="swiperUpdateFn"
				@swiperSetTranslateFn="swiperSetTranslateFn"
				@swiperDestroyFn="swiperDestroyFn">
			</staff-manual>
		</transition>
	</div>
</template>

<script>
import _ from 'lodash'
import moment from 'moment'
import Hammer from 'hammerjs'
import Swiper from 'swiper'
import TWEEN from 'tween.js'
import { mapState, mapGetters, mapActions } from 'vuex'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import StaffManual from './Manual/index.vue'
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
		StaffManual,
		MaterialRipple
	},
	data () {
		return {
			mc: null,
			swiper: {
				main: {}
			},
			target: {
				data: null,
				loading: false
			},
			date: moment(new Date()).format('YYYY/MM/DD'),
			footer: {
				show: false
			},
			detailTransiton: 'slide-bottom',
			role: null
		}
	},
	computed: {
		...mapGetters({
			targetsRow: 'getAllTargets'
		})
	},
	watch: {
	},
	beforeDestroy () {
		if (this.mc !== null)
			this.mc.destroy()
	},
	created () {
		if (!this.roles.staff)
			this.$emit('returnFn')
	},
	mounted () {
		if (this.roles.staff)
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
			this.setTouchEvent('detailHeader')
		},
		// 表示関連
		// ========================
		showTargetDetail () {
			this.$router.push({ name: 'target' })
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
				if (ev.type === 'pandown' || ev.type === 'tap')
					this.$router.push({ name: 'main' })
			})
		},
		// $emit関連 > calendar
		// ========================
		changeDateFn (val) {
			this.date = val
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
		swiperSetTranslateFn (values) {
			const scrollPos = time => {
				TWEEN.update(time)
			}
			const coords = {
				y: this.swiper.main[values.target].getTranslate()
			}
			const tween = new TWEEN.Tween(coords)
			.to({ y: values.translate }, values.duration)
			.onUpdate(() => {
				requestAnimationFrame(scrollPos)
				this.swiper.main[values.target].setTranslate(coords.y)
			})
			.start()

			_.defer(() => {
				requestAnimationFrame(scrollPos)
			})
		},
		swiperUpdateFn () {
			_.defer(() => {
				this.resizeSwiper()
			})
		},
		swiperDestroyFn () {
			this.destroySwiper()
		}
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
#staffDetail
	height 100%
	width 100%
	position absolute
	top 0
	left 0
	background-color brgba(1)
	color pre-color
	overflow hidden
	z-index 1000
	#detailHeader
		height 60px
		width 100%
		position absolute
		top 0
		left 0
		z-index 251
		svg
		.userName
			padding 0 20px
		.closeBtn
			height 60px
			width 60px
			font-size 27px
	#detailFooter
		height 61px
		width 100%
		position absolute
		bottom 0
		left 0
		box-sizing border-box
		border-top 1px solid text-deep
		background-color text-color//brgba(1)
		transform translate3d(0, 61px, 0)
		transition(.3s)
		color pre-color
		z-index 251
		opacity 0
		&.show
			transform translate3d(0, 0, 0)
			opacity 1
		.box
			height 60px
			width 33.333%
		.menu
			transition(.3s)
			color text-light
			&.active
				color pre-color
			.icon
				transform scale(.80)
				&.adjust
					transform scale(.76)
				&.adjust2
					transform scale(.65)
				&.adjust3
					transform scale(.72)
</style>
