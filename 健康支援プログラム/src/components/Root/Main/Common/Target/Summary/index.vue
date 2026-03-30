<template>
	<div id="summary">
		<transition
			name="fade"
			mode="out-in">
			<div id="calendarContainer"
				@click.self="calendar.show = false"
				v-if="calendar.show">
				<div id="calendar"
					:style="calendar.cood">
					<summary-calendar
						:date="calendar.date"
						@changeDateFn="changeDateFn"
						@hideCalendarFn="hideCalendarFn">
					</summary-calendar>
				</div>
			</div>
		</transition>
		<div id="summaryContainer" class="container flex center column"
			v-loading="summary.loading">
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
								<font-awesome-icon :icon="['fal', 'spinner']" fixed-width spin
									v-if="summary.loading" />
							</div>
							<div class="calendarIcon box right">
								<font-awesome-icon :icon="['fal', 'calendar-edit']" fixed-width />
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="swiper-scroller box grow">
				<div id="summarySlider" class="swiper-container">
					<div class="swiper-wrapper">
						<div class="swiper-slide v-slide">
							<div class="chart">
								<canvas id="dayChart"
									height="100%">
								</canvas>
							</div>
							<div class="items">
								<div class="item"
									v-for="(item, index) in summary.list.data"
									v-if="index < 3">
									<div class="info"
										:class="{
											nullValue: !item.value
										}">
										<div class="label">
											{{ item.label }}
										</div>
										<div class="value"
											v-if="!item.value">
											--
										</div>
										<div class="value"
											v-else>
											{{ item.value }}<small v-if="item.unit">{{ item.unit }}</small>
										</div>
									</div>
								</div>
							</div>
							<div class="items">
								<div class="item"
									v-for="(item, index) in summary.list.data"
									v-if="index >= 3">
									<div class="info"
										:class="{
											nullValue: !item.value
										}">
										<div class="label">
											{{ item.label }}
											<span class="unit"
												v-if="item.id !== 'weight' && item.id !== 'muscle_amount' && item.id !== 'steps' && item.unit">
												<br>
												<small>{{ item.unit }}</small>
											</span>
										</div>
										<div class="value"
											v-if="!item.value">
											--
										</div>
										<div class="value"
											v-else-if="item.id === 'weight' || item.id === 'muscle_amount' || item.id === 'steps'">
											{{ item.value }}<small v-if="item.unit">{{ item.unit }}</small>
										</div>
										<div class="value"
											v-else>
											{{ item.value }}
										</div>
									</div>
								</div>
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
import Chart from 'chart.js'
import { mapState, mapGetters, mapActions } from 'vuex'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import SummaryCalendar from '../../../../../_Parts/dialogs.calendar.vue'
import MaterialRipple from '../../../../../_Parts/material.ripple.vue'
import Mixins from '../../../../../../services/vue.mixins'

export default {
	props: [
		'date'
	],
	mixins: [
		Mixins.common,
		Mixins.chart
	],
	components: {
		SummaryCalendar,
		FontAwesomeIcon,
		MaterialRipple
	},
	data () {
		return {
			mc: null,
			input: '',
			calendar: {
				show: false,
				cood: `{ top: 100px }`,
				date: this.date,
				today: moment(new Date()).format('YYYY/MM/DD')
			},
			summary: {
				loading: true,
				charts: {
					main: {},
					data: {
						heart_rates: [],
						respiratory_rates: [],
					}
				},
				list: {
					data: [
						{
							id: `leaving_beds_num_night`,
							label: `夜間の離床回数`,
							value: null,
							unit: `回`
						},
						{
							id: `recumbency_time_daytime`,
							label: `昼間の臥床時間`,
							value: null,
							unit: `時間`
						},
						{
							id: `recumbency_time_night`,
							label: `夜間の臥床時間`,
							value: null,
							unit: `時間`
						},
						{
							id: `highest_blood_pressure`,
							label: `最高血圧`,
							value: null,
							unit: `mmHg`
						},
						{
							id: `lowest_blood_pressure`,
							label: `最低血圧`,
							value: null,
							unit: `mmHg`
						},
						{
							id: `blood_sugar_level`,
							label: `血糖値`,
							value: null,
							unit: `mg/dL`
						},
						{
							id: `weight`,
							label: `体重`,
							value: null,
							unit: `kg`
						},
						{
							id: `muscle_amount`,
							label: `筋肉量`,
							value: null,
							unit: `%`
						},
						{
							id: `steps`,
							label: `歩数`,
							value: null,
							unit: `歩`
						}
					]
				}
			}
		}
	},
	filters: {
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
			this.changeDate()
		}
	},
	beforeDestroy () {
		if (this.mc !== null)
			this.mc.destroy()
		this.$emit('swiperDestroyFn')
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
			values.target = `#summarySlider.swiper-container`
			values.key = `summarySlider`
			this.$emit('swiperFn', values)
			this.$emit('swiperUpdateFn')
			this.setChart('dayChart')
			this.setTouchEvent('summaryContainer')
			this.getSummary()
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
			let type = 'current'
			this.mc.on('panup panleft panright panend tap', ev => {
				if (ev.type === 'panright')
					type = 'yesterday'
				else if (ev.type === 'panleft')
					type = 'tommorow'
				else if (ev.type === 'panend') {
					if (type === 'yesterday' || type === 'tommorow') {
						const day = type === 'yesterday'
							? moment(new Date(this.calendar.date)).add(-1,'day').format('YYYY/MM/DD')
							: moment(new Date(this.calendar.date)).add(1,'day').format('YYYY/MM/DD')
						this.$emit('changeDateFn', day)
					}
					type = 'current'
				}
			})
		},
		// 表示関連
		// ========================
		setSummary (d) {
			_.forEach(d.summary, (_d, _key) => {
				if (_key === 'heart_rates' || _key === 'respiratory_rates')
					this.setChartData(_d, _key)
				else
					this.setListItem(_d, _key)
			})
		},
		setChartData (d, key) {
			this.summary.charts.data[key].length = 0
			_.forEach(d, _value => {
				const y = _value === null ? 0 : _value
				this.summary.charts.data[key].push(y)
			})
		},
		setListItem (d, key) {
			const target =_.find(this.summary.list.data, _param => {
				return _param.id === key
			})
			target.value = d
		},
		changeDate () {
			const values = {}
			values.target = 'summarySlider'
			values.translate = 0
			values.duration = 250
			this.getSummary(values)
		},
		// 表示関連 > リクエスト
		// ========================
		getSummary (values) {
			Promise.resolve()
			.then(() => {
				this.summary.loading = true
				if (values)
					this.$emit('swiperSetTranslateFn', values)
				return this.getSummaryRequest()
			})
			.then(d => {
				this.setSummary(d.data)
			})
			.then(() => {
				_.defer(() => {
					this.summary.loading = false
					this.$emit('swiperUpdateFn')
					this.updateChart('dayChart')
				})
			})
			.catch(err => {
				this.summary.loading = false
				this.reject(err)
			})
		},
		getSummaryRequest () {
			const deferred = new Promise((resolve, reject) => {
				const params = `?target_id=${ this.$route.params.target_id }&date=${ this.calendar.date }`
				const apiName = `healths/summary${ params }`
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
		// 表示関連 > チャート
		// ========================
		setChart (target) {
			const ctx = document.getElementById(target).getContext('2d')
			ctx.canvas.width = '100%'
			ctx.canvas.height = 300

			const options = this.getChartOptions()
			this.summary.charts.main[target] = new Chart(ctx, {
				type: 'line',
				data: {
					labels: [],
					datasets: []
				},
				options: options
			})
		},
		updateChart (target) {
			const labels = this.getChartLabels()
			const datasets = []
			datasets.push(this.getChartDataSet('hearts', this.summary.charts.data['heart_rates'], 'rgb(254,119,61)'))
			datasets.push(this.getChartDataSet('breaths', this.summary.charts.data['respiratory_rates'], 'rgb(26,187,153)'))

			this.summary.charts.main[target].data.labels.length = 0
			this.summary.charts.main[target].data.datasets.length = 0
			_.forEach(labels, _label => {
				this.summary.charts.main[target].data.labels.push(_label)
			})
			_.forEach(datasets, _dataset => {
				this.summary.charts.main[target].data.datasets.push(_dataset)
			})
			this.summary.charts.main[target].update()
		},
		getChartLabels () {
			const selectedDay = moment(new Date(this.calendar.date)).format('YYYY/MM/DD')
			const tommorow = moment(new Date(this.calendar.date)).add(1,'day').format('YYYY/MM/DD')
			const labels = []
			let hour = 8
			while (labels.length < 25) {
				const day = hour <= 8 && labels.length > 12 ? tommorow : selectedDay
				const label = `${ day } ${ hour }:00`
				labels.push(new Date(label))
				hour = (hour + 1) % 24
			}
			return labels
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
#summary
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
		z-index 250
		.el-loading-spinner
			.path
				stroke pre-color

/* -------------------------------------
 *	style css
 * ------------------------------------- */
#summary
	.spacer
		height 60px
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
	.summary
		height calc(100vh - 180px)
		width 100%
		@extend .lob-serif-i
		font-size 46px
		color text-color
	.chart
		margin-top 15px
	.items
		padding 0px 15px 0
		position relative
		&:last-child
			padding-top 100px
		.item
			width 100%
			// border-radius 10px
			box-shadow 0 1px 3px rgba(0,0,0,.15)
			background-color wrgba(.14)
			margin-bottom 1px
			@extend .noto-serif-i
			overflow hidden
			&:first-child
				border-top-right-radius 10px
				border-top-left-radius 10px
			&:last-child
				border-bottom-right-radius 10px
				border-bottom-left-radius 10px
				margin-bottom 15px
			.info
				height 80px
				position relative
				&.nullValue
					color text-light
					font-weight normal !important
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
					padding 15px
					font-size 46px
					line-height 1.03
					small
						display inline-block
						margin-left 5px
						font-size 15px
	#calendarContainer
		height 100%
		width 100%
		position absolute
		top 0
		left 0
		z-index 108
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
