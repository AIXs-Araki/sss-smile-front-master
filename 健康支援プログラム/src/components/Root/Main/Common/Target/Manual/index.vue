<template>
	<div id="comonManual">
		<transition
			name="fade"
			mode="out-in">
			<div id="calendarContainer"
				@click.self="calendar.show = false"
				v-if="calendar.show">
				<div id="calendar"
					:style="calendar.cood">
					<manual-calendar
						:date="calendar.date"
						@changeDateFn="changeDateFn"
						@hideCalendarFn="hideCalendarFn">
					</manual-calendar>
				</div>
			</div>
		</transition>
		<div id="manualConfirmContainer" class="flex center column asBtn"
			v-loading="confirm.loading"
			:class="{
				asConfirm: confirm.asConfirm
			}">
			<transition
				name="fade"
				mode="out-in">
				<div class="closeBtn flex center"
					v-if="confirm.asConfirm && !confirm.loading"
					@click="confirm.asConfirm = false">
					<div class="box">
						<font-awesome-icon :icon="['fal', 'angle-down']" fixed-width />
					</div>
					<MaterialRipple>
					</MaterialRipple>
				</div>
			</transition>
			<div id="manualConfirmHeader" class="header box flex center"
				:class="{
					active: confirm.asConfirm
				}">
				<div class="box">
					入力を確認
				</div>
				<MaterialRipple>
				</MaterialRipple>
			</div>
			<div class="swiper-scroller box grow">
				<div id="manualConfirmSlider" class="swiper-container">
					<div class="swiper-wrapper">
						<div class="swiper-slide v-slide">
							<div class="items">
								<div class="item">
									<div class="info">
										<div class="label">
											日時
										</div>
										<div class="value">
											{{ calendar.date }}
										</div>
									</div>
								</div>
								<div class="item"
									v-for="(item, index) in manuals">
									<div class="info">
										<div class="label">
											{{ item.label }}
										</div>
										<div class="value"
											v-if="item.id === 'date'">
											<span class="tommorow"
												v-if="item.value >= 16">
												翌日
											</span>
											{{ item.value | getHour }}:00
										</div>
										<div class="value"
											v-else-if="item.id === 'weight'">
											{{ item.value | getWeight }}<small>{{ item.unit }}</small>
										</div>
										<div class="value"
											v-else-if="item.id === 'muscle_amount'">
											{{ item.value | getWeight }}<small>{{ item.unit }}</small>
										</div>
										<div class="value"
											v-else-if="item.id === 'steps'">
											{{ item.value | getSteps }}<small>{{ item.unit }}</small>
										</div>
										<div class="value"
											v-else>
											{{ item.value }}<small>{{ item.unit }}</small>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="footer box">
				<el-button class="submitBtn"
					@click="onSubmit">
					送　信
				</el-button>
				<MaterialRipple>
				</MaterialRipple>
			</div>
		</div>
		<div id="manualContainer" class="container flex center column">
			<div class="ws100 box">
				<div class="header box flex center column">
					<div class="box grow flex center">
						<div class="box">
						</div>
					</div>
					<div class="calendarBox box grow flex center">
						<div id="calendarBtn" class="calendar box top flex center"
							:class="{
								active: calendar.show
							}"
							@click="showCalendar">
							<div class="box grow">
								{{ calendar.date }}
								<small class="today"
									v-if="calendar.today === calendar.date">
									today
								</small>
							</div>
							<div class="calendarIcon box right">
								<font-awesome-icon :icon="['fal', 'calendar-edit']" fixed-width />
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="swiper-scroller box grow">
				<div id="manualSlider" class="swiper-container">
					<div class="swiper-wrapper">
						<div class="swiper-slide v-slide">
							<div class="items">
								<div class="item"
									v-for="(item, index) in manuals">
									<div class="info">
										<div class="label">
											{{ item.label }}
											<span class="unit"
												v-if="item.id !== 'weight' && item.id !== 'muscle_amount' && item.id !== 'steps' && item.unit">
												<br>
												<small>{{ item.unit }}</small>
											</span>
										</div>
										<div class="value"
											v-if="item.id === 'date'">
											<span class="tommorow"
												v-if="item.value >= 16">
												翌日
											</span>
											{{ item.value | getHour }}:00
										</div>
										<div class="value"
											v-else-if="item.id === 'weight'">
											{{ item.value | getWeight }}<small>{{ item.unit }}</small>
										</div>
										<div class="value"
											v-else-if="item.id === 'muscle_amount'">
											{{ item.value | getWeight }}<small>{{ item.unit }}</small>
										</div>
										<div class="value"
											v-else-if="item.id === 'steps'">
											{{ item.value | getSteps }}<small>{{ item.unit }}</small>
										</div>
										<div class="value"
											v-else>
											{{ item.value }}
										</div>
									</div>
									<div class="sliderWrapper flex center gaps">
										<div class="box">
											<div class="adjustBtn"
												@click="adjustValue('decrease', index)">
												<div>
													-
												</div>
												<MaterialRipple
													:center="true" :size="36">
												</MaterialRipple>
											</div>
										</div>
										<div class="box grow">
											<div :id="`input${ index }Slider`"></div>
										</div>
										<div class="box">
											<div class="adjustBtn"
												@click="adjustValue('increase', index)">
												<div>
													+
												</div>
												<MaterialRipple
													:center="true" :size="36">
												</MaterialRipple>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="spacer x2">
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
import noUiSlider from 'nouislider'
import { mapState, mapGetters, mapActions } from 'vuex'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import ManualCalendar from '../../../../../_Parts/dialogs.calendar.vue'
import MaterialRipple from '../../../../../_Parts/material.ripple.vue'
import Mixins from '../../../../../../services/vue.mixins'

export default {
	props: [
		'date'
	],
	mixins: [
		Mixins.common
	],
	components: {
		ManualCalendar,
		FontAwesomeIcon,
		MaterialRipple
	},
	data () {
		return {
			mc: null,
			swiper: {
				main: {}
			},
			calendar: {
				show: false,
				cood: `{ top: 100px }`,
				date: this.date,
				today: moment(new Date()).format('YYYY/MM/DD')
			},
			confirm: {
				asConfirm: false,
				loading: false
			},
			manuals: [
				{
					id: `date`,
					label: `入力値の時間`,
					unit: ``,
					value: (Number(moment(new Date).format('H')) - 8) % 24,
					min: 0,
					max: 23,
					slider: null
				},
				{
					id: `heart_rate`,
					label: `平均心拍数`,
					unit: `bpm`,
					value: 0,
					min: 0,
					max: 200,
					slider: null
				},
				{
					id: `respiratory_rate`,
					label: `平均呼吸数`,
					unit: `bpm`,
					value: 0,
					min: 0,
					max: 200,
					slider: null
				},
				{
					id: `highest_blood_pressure`,
					label: `最高血圧`,
					unit: `mmHg`,
					value: 0,
					min: 0,
					max: 200,
					slider: null
				},
				{
					id: `lowest_blood_pressure`,
					label: `最低血圧`,
					unit: `mmHg`,
					value: 0,
					min: 0,
					max: 200,
					slider: null
				},
				{
					id: `blood_sugar_level`,
					label: `血糖値`,
					unit: `mg/dL`,
					value: 0,
					min: 0,
					max: 1000,
					slider: null
				},
				{
					id: `weight`,
					label: `体重`,
					unit: `kg`,
					value: 0,
					min: 0,
					max: 2000,
					slider: null
				},
				{
					id: `muscle_amount`,
					label: `筋肉量`,
					unit: `%`,
					value: 0,
					min: 0,
					max: 1000,
					slider: null
				},
				{
					id: `steps`,
					label: `歩数`,
					unit: `歩`,
					value: 0,
					min: 0,
					max: 500,
					slider: null
				}
			]
		}
	},
	filters: {
		getHour: _val => {
			return (_val + 8) % 24
		},
		getWeight: _val => {
			return (_val / 10).toFixed(1)
		},
		getSteps: _val => {
			return Number(_val + '00')
		}
	},
	watch: {
		'date' () {
			this.calendar.date = this.date
		},
		'confirm.asConfirm' () {
			const values = {}
			values.target = 'manualConfirmSlider'
			values.translate = 0
			values.duration = 250
			this.$emit('swiperSetTranslateFn', values)
		}
	},
	beforeDestroy () {
		if (this.mc !== null)
			this.mc.destroy()
		window.removeEventListener('resize', this.reflow, false)
	},
	mounted () {
		this.set()
	},
	methods: {
		// 初期化
		// ==================
		set () {
			const values = {}
			values.target = `#manualSlider.swiper-container`
			values.key = `manualSlider`
			this.$emit('swiperFn', values)
			values.target = `#manualConfirmSlider.swiper-container`
			values.key = `manualConfirmSlider`
			this.$emit('swiperFn', values)
			this.setTouchEventConfirm('manualConfirmHeader')

			_.forEach(this.manuals, (_input, index) => {
				const target = `input${ index }`
				this.setUiSlider(target, index)
			})

			_.defer(() => {
				this.$emit('swiperUpdateFn')
			})
			// this.setTouchEvent('commonContainer')
			// this.swiper.main.targetSlider.destroy()
		},
		// タッチイベント関連
		// ========================
		setTouchEventConfirm (target) {
			const el = document.getElementById(target)
			const options = {
				preventDefault: false
			}
			this.mc = new Hammer(el, options)
			this.mc.get('pan').set({
				enable: true,
				direction: Hammer.DIRECTION_ALL,
				threshold: 30
			})
			this.mc.on('panup panleft panright pandown tap', ev => {
				if (ev.type === 'panup')
					this.confirm.asConfirm = true
				else if (ev.type === 'pandown')
					this.confirm.asConfirm = false
				else if (ev.type === 'tap')
					this.confirm.asConfirm = !this.confirm.asConfirm
			})
		},
		// 表示関連 > スライダー
		// ========================
		resetValues () {
			_.forEach(this.manuals, _d => {
				if (_d.id !== 'date' && _d.id !== 'heart_rate' && _d.id !== 'respiratory_rate') {
					_d.value = 0
					_d.slider.set(_d.value)
				}
			})
		},
		// スライダー関連
		// ========================
		setUiSlider (target, index) {
			const d = this.manuals[index]
			const id = `${ target }Slider`
			const el = document.getElementById(id)
			d.slider = noUiSlider.create(el, {
				behaviour: 'drag',
				start: [ d.value ],
				range: {
					'min': [ d.min ],
					'max': [ d.max ]
				}
			})
			d.slider.on('slide', () => {
				const cood = el.getBoundingClientRect()
				const position = this.$parent.swiper.main.manualSlider.getTranslate()
				const translate = position
				const values = {}
				values.target = 'manualSlider'
				values.translate = translate
				values.duration = 1
				this.$emit('swiperSetTranslateFn', values)
			})
			d.slider.on('update', () => {
				const _val = Math.round(d.slider.get())
				d.value = _val
			})
			d.slider.on('set', () => {
			})
		},
		adjustValue (type, index) {
			const d = this.manuals[index]
			if (type === 'decrease')
				d.value -= 1
			else if (type === 'increase')
				d.value += 1

			if (d.value < d.min)
				d.value = d.min
			if (d.value > d.max)
				d.value = d.max

			d.slider.set(d.value)
		},
		// 表示関連 > カレンダー
		// ========================
		showCalendar () {
			const styles = this.getStyles()
			this.calendar.cood = styles
			this.calendar.show = true
		},
		hideCalendarFn () {
			this.calendar.show = false
		},
		getStyles () {
			const btn = document.getElementById('calendarBtn')
			const cood = btn.getBoundingClientRect()
			const styles = {}
			styles.top = `${ cood.top }px`
			styles.left = `${ cood.left }px`
			styles.width = `${ cood.width }px`
			return styles
		},
		setReflow () {
			window.addEventListener('resize', this.reflow, false)
		},
		reflow () {
			if (this.calendar.show) {
				this.showCalendar()
			}
		},
		// 送信関連
		// ========================
		onSubmit () {
			this.confirm.loading = true
			Promise.resolve()
			.then(() => {
				return this.getManualValues()
			})
			.then(d => {
				return this.sendManualsRequest(d)
			})
			.then(d => {
				const values = {}
				values.target = 'manualSlider'
				values.translate = 0
				values.duration = 250
				this.$emit('swiperSetTranslateFn', values)
				this.confirm.asConfirm = false
				this.confirm.loading = false
				this.resetValues()
				this.showNotification()
			})
			.catch(err => {
				this.confirm.loading = false
				this.reject(err)
			})
		},
		getManualValues () {
			const values = {}
			const day = this.manuals[0].value < 16 ? this.calendar.date : moment(new Date(this.calendar.date)).add(1, 'day').format('YYYY/MM/DD')
			const hour = (this.manuals[0].value + 8) % 24
			const date = `${ day } ${ hour }:00:00`
			values.target_id = this.$route.params.target_id
			values.data = []
			_.forEach(this.manuals, _d => {
				if (_d.id !== 'date') {
					const o = {}
					o.type = _d.id
					o.date = date
					if (_d.id === 'steps')
						o.value = Number(_d.value + '00')
					else if (_d.id === 'muscle_amount' || _d.id === 'weight')
						o.value = (_d.value / 10).toFixed(1)
					else
						o.value = _d.value
					if (o.value > 0 && o.value !== null)
						values.data.push(o)
				}
			})
			return values
		},
		sendManualsRequest (d) {
			const deferred = new Promise((resolve, reject) => {
				const endpoint = [this.api.endpoint, 'healths/manual'].join('/')
				const option = {}
				option.headers = {
					Authorization: this.accessToken
				}
				axios.post(endpoint, d, option)
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
		// 通知関連
		// ========================
		showNotification () {
			this.$notify({
				title: '送信完了',
				dangerouslyUseHTMLString: true,
				message: '<strong>これはサンプルテキストです</strong>',
				position: 'bottom-right',
				duration: 4 * 1000,
			})
		},
		// $emit関連 > calendar
		// ========================
		changeDateFn (val) {
			this.$emit('changeDateFn', val)
		}
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
#comonManual
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
		overflow hidden
		.swiper-container
			height 100%
			.v-slide
				height auto
				-webkit-box-sizing border-box
				box-sizing border-box
	.el-loading-mask
		background-color brgba(.75)
		.el-loading-spinner
			.path
				stroke pre-color

/* -------------------------------------
 *	style css
 * ------------------------------------- */
#comonManual
	.spacer
		height 60px
		&.x2
			height 120px
	.ws100
		width 100%
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
		.calendarBox
			width 100%
			.calendar
				height 48px
				width calc(100% - 24px)
				padding 0 15px
				border-radius 10px
				transition(.3s)
				box-sizing border-box
				background-color text-color
				@extend .noto-serif-i
				font-size 20px
				&.active
					border-radius 0px
					border-top-left-radius 10px
					border-top-right-radius 10px
				.calendarIcon
					font-size 24px
				.today
					display inline-block
					margin-left 5px
					color text-light
	// .manual
	// 	height calc(100vh - 180px)
	// 	width 100%
	// 	@extend .lob-serif-i
	// 	font-size 46px
	// 	color white
	.items
		padding 15px 15px 0
		position relative
		.item
			width 100%
			border-radius 10px
			box-shadow 0 1px 3px rgba(0,0,0,.15)
			background-color wrgba(.14)
			margin-bottom 15px
			@extend .noto-serif-i
			overflow hidden
			.info
				height 68px
				position relative
				.label
					position absolute
					bottom 0
					padding 15px
					line-height 1.03
					.unit
						opacity .5
				.value
					position absolute
					right 0
					bottom 0
					padding 10px 15px
					font-size 46px
					line-height 1.03
					.tommorow
						font-size 16px
					small
						display inline-block
						margin-left 5px
						font-size 15px
			.sliderWrapper
				height 46px
				padding 0 15px
				border-top 1px solid text-deep
				box-sizing border-box
				background-color text-color
				.adjustBtn
					position relative
					padding 0 5px
				.noUi-target
					margin-top 15px !important
					background-color text-deep !important
					border-radius 4px
					border none
					box-shadow none
				.noUi-horizontal
					height 5px
					position relative
					margin 11px 0px 10px
					padding 0 6px
					.noUi-handle
						height 20px
						width 20px
						// left 0px
						transform translate3d(-8px,0px,0)
						margin-left -8px
						top -8px
						border 3px solid text-deep//text-color
						border-radius 100px
						box-shadow none
						&:before
						&:after
							content none
	.confirm
		margin 0 15px 15px
		.el-button
			height 46px
			width 100%
			border-radius 10px

/* -------------------------------------
 *	style css
 * ------------------------------------- */
#comonManual
	#manualConfirmContainer
		height 100%
		width 100%
		position absolute
		top 0
		bottom 0
		border-top 1px solid text-deep
		background-color brgba(1)
		transition(.3s)
		transform translate3d(0, 100%, 0)
		overflow hidden
		color pre-color
		z-index 200
		&.asBtn
			transform translate3d(0, calc(100% - 120px), 0)
			background-color text-color
		&.asConfirm
			transform translate3d(0, -1px, 0) !important
			background-color brgba(1)
			z-index 1000
		.closeBtn
			height 46px
			width 46px
			position absolute
			top 37px
			right 20px
			border-radius 100px
			background-color text-color //rgba(36,36,36,1)
			box-shadow 0 1px 3px rgba(0,0,0,.15)
			font-size 27px
			z-index 112
			overflow hidden
		.header
			height 60px
			width 100%
			position relative
			border-bottom 1px solid text-color
			cursor pointer
			font-size 18px
			overflow hidden
			&.active
				background-color brgba(1)
		.footer
			width 100%
			// margin 20px
			position relative
			box-sizing border-box
			overflow hidden
			.el-button
				height 60px
				width 100%
				position relative
				border-radius 0px
				border none
				background-color text-color
				font-size 16px
				color pre-color
				overflow hidden
			.material-ripple__component
				background rgba(255, 255, 255, .4) !important
		.items
			margin-top 15px
			margin-bottom 15px
			.item
				width 100%
				margin 0
				border-radius 0px
				box-shadow none
				border-bottom 1px solid text-color
				background-color transparent
				@extend .noto-serif-i
				overflow hidden
				&:last-child
					border-bottom none
				.info
					height 56px
					.label
						padding 10px 0
					.value
						padding 10px 0
						font-size 32px

/* -------------------------------------
 *	style > calendar css
 * ------------------------------------- */
#comonManual
	#calendarContainer
		height 100%
		width 100%
		position absolute
		top 0
		left 0
		z-index 250
		#calendar
			position absolute
			padding 0px
			background-color rgb(237,238,239)
			// border-top 1px solid line-color
			box-sizing border-box
			border-bottom-left-radius 10px
			border-bottom-right-radius 10px
			border-radius 10px
</style>
