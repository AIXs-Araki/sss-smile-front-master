<template>
	<div id="dialogCalendar" class="partsCalendar">
		<div class="flex main">
			<div class="headerItem flex center">
				<div class="arrow box flex center"
					@click="shift('back')">
					<font-awesome-icon class="box" :icon="['fas', 'caret-left']" fixed-width />
					<MaterialRipple
						:center="true" :size="36">
					</MaterialRipple>
				</div>
				<div class="box grow"
					@click="$emit('hideCalendarFn')">
					{{ year }}/{{ month | padLeftFilter }}
				</div>
				<div class="arrow box flex center"
					@click="shift('forward')">
					<font-awesome-icon class="box" :icon="['fas', 'caret-right']" fixed-width />
					<MaterialRipple
						:center="true" :size="36">
					</MaterialRipple>
				</div>
			</div>
		</div>
		<div class="flex main">
			<div class="weekList"
				v-for="date in weekList">
				<div class="dateItem">
					<p>
						{{ date }}
					</p>
				</div>
			</div>
		</div>
		<div class="flex main"
			v-if="this.list !== null">
			<!-- 日付 -->
			<div class="list" v-for="item in list">
				<transition
					name="fade"
					mode="out-in">
					<div class="point"
						v-if="item.isToday && !item.selected"
						:class="{
							today: item.isToday
						}">
					</div>
				</transition>
				<div class="dateItem"
					@click="selectDate(item)"
					:class="{
						notThisMonth: item.isNotThisMonth,
						today: item.isToday,
						selected: item.selected
					}">
					<p class="date">
						{{ item.date }}
					</p>
				</div>
			</div>
		</div>
		<div class="flex main">
			<div class="footerItem flex center">
				<div class="box"
					@click="selectYesterday">
					<div class="selectYesterday">
						前日を選択
					</div>
				</div>
				<div class="box grow">
				</div>
				<div class="box"
					@click="selectToday">
					<div class="selectToday">
						今日に戻る
					</div>
				</div>
				<MaterialRipple></MaterialRipple>
			</div>
		</div>
	</div>
</template>

<script>
import _ from 'lodash'
import Hammer from 'hammerjs'
import moment from 'moment'
import { mapState, mapGetters, mapActions } from 'vuex'
import Mixins from '../../services/vue.mixins'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import MaterialRipple from './material.ripple.vue'

export default {
	props: [
		'date'
	],
	mixins: [
		Mixins.common
	],
	components: {
		FontAwesomeIcon,
		MaterialRipple
	},
	data () {
		return {
			startDate: null,
			today: new Date(),
			year: 1900,
			month: 1,
			weekList: ['日','月','火','水','木','金','土'],
			list: null,
			calendar: {
				dates: [],
				selected: this.date
			},
		}
	},
	filters: {
		padLeftFilter: _val => {
			return ('00' + _val).slice(-2)
		}
	},
	watch: {
		'date' () {
			this.calendar.selected = this.date
		},
		'calendar.selected' () {
			_.forEach(this.list, _item => {
				if (_item.format === this.calendar.selected)
					_item.selected = true
				else
					_item.selected = false
			})
		},
		'dateslength' () {
			this.list = this.updateRow(this.year, this.month)
		}
	},
	mounted () {
		this.set()
	},
	methods: {
		set () {
			this.year = this.today.getFullYear()
			this.month = this.today.getMonth() + 1
			this.startDate = this.getStartDate(this.year, this.month)
			this.list = this.createRow(this.startDate, this.month)
			this.setTouchEvent('dialogCalendar')
		},
		// タッチイベント関連
		// ========================
		setTouchEvent (target) {
			const el = document.getElementById(target)
			const options = {
				preventDefault: false
			}
			const mc = new Hammer(el, options)
			let pos = 0
			mc.get('pan').set({
				enable: true,
				direction: Hammer.DIRECTION_ALL,
				threshold: 80
			})
			mc.on('panstart', ev => {
				pos = 0
			})
			mc.on('panleft panright', ev => {
				const dx = Number((ev.deltaX / 80).toFixed(0))
				if (ev.type === 'panleft' && dx < pos)
					this.shift('forward')
				else if (ev.type === 'panright' && dx > pos)
					this.shift('back')
				pos = dx
			})
		},
		shift (type) {
			if (type === 'back') {
				this.month = (this.month === 1) ? 12 : this.month - 1
				this.year = (this.month === 12) ? this.year - 1 : this.year
			} else {
				this.month = (this.month === 12) ? 1 : this.month + 1
				this.year = (this.month === 1) ? this.year + 1 : this.year
			}
			this.list = this.updateRow(this.year, this.month)
		},
		getStartDate (year, month) {
			//月の開始日を取得
			const date = new Date(year + '/' + month + '/' + '01')
			//曜日を取得
			const day = date.getDay();
			//カレンダーの開始日が日曜日になるようにするため、
			//月の開始日から曜日値を引く
			date.setDate(date.getDate() - day)
			return date
		},
		createRow (date, targetMonth) {
			const row = []
			let selectedMonth = false
			for (let i = 0; i < 42; i++) {
				row.push({
					date: date.getDate(),
					format: moment(Number(date)).format('YYYY/MM/DD'),
					isToday: this.checkToday(date),
					isNotThisMonth: date.getMonth() + 1 !== targetMonth,
					hasReports: this.checkHasReports(date),
					selected: this.checkSelected(date)
				})
				if (date.getMonth() + 1 === targetMonth)
					selectedMonth = true
				date.setDate(date.getDate() + 1)
			}
			return row
		},
		checkToday (date) {
			const today = moment(this.today).format('YYYY/MM/DD')
			date = moment(Number(date)).format('YYYY/MM/DD')
			return today === date ? true : false
		},
		checkSelected (date) {
			date = moment(Number(date)).format('YYYY/MM/DD')
			return this.calendar.selected === date ? true : false
		},
		checkHasReports (date) {
			date = moment(Number(date)).format('YYYY/MM/DD')
			const check = _.find(this.calendar.dates, _date => { return date === _date })
			return check ? true : false
		},
		updateRow (year, month) {
			//カレンダーの開始日を取得
			const startDate = this.getStartDate(year, this.padLeft(month))
			const row = this.createRow(startDate,month)
			return row
		},
		padLeft (val) {
			return ('00' + val).slice(-2)
		},
		selectDate (item) {
			this.$emit('changeDateFn', item.format)
			_.delay(() => {
				this.$emit('hideCalendarFn')
			}, 150)
		},
		selectToday () {
			const today = moment(new Date()).format('YYYY/MM/DD')
			this.year = Number(moment(new Date()).format('YYYY'))
			this.month = Number(moment(new Date()).format('M'))
			this.list = this.updateRow(this.year, this.month)
			this.$emit('changeDateFn', today)
			_.delay(() => {
				this.$emit('hideCalendarFn')
			}, 150)
		},
		selectYesterday () {
			const yesterday = moment(new Date()).add(-1, 'days').format('YYYY/MM/DD')
			this.year = Number(moment(new Date()).add(-1, 'days').format('YYYY'))
			this.month = Number(moment(new Date()).add(-1, 'days').format('M'))
			this.list = this.updateRow(this.year, this.month)
			this.$emit('changeDateFn', yesterday)
			_.delay(() => {
				this.$emit('hideCalendarFn')
			}, 150)
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
.partsCalendar
	height 100%
	color text-color
	.flex
		display flex
		flex-wrap wrap
		justify-content stretch
		margin 0 auto
	.headerItem
		height 48px
		width 100%
		margin-bottom 15px
		border-bottom 1px solid line-color
		@extend .open-serif
		text-align center
		.arrow
			height 48px
			width 48px
			position relative
	.footerItem
		height 48px
		width 100%
		position relative
		margin-top 15px
		border-top 1px solid line-color
		@extend .open-serif
		font-size 13px
		text-align center
		overflow hidden
		.selectToday
		.selectYesterday
			padding 0 20px
	.shiftButton
		position relative
		flex-basis 14.28%
		text-align center
		.material-ripple__component
			left 5px !important
			z-index 1 !important
		.button
			height 30px
			width 30px
			margin 0 auto
			position relative
			border-radius 100px
			// background-color brgba(.04)
			z-index 2
			overflow hidden
			cursor pointer
		.adjustToLeft
			display inline-block
			transform translate3d(-1px, 0, 0)
		.adjustToRight
			display inline-block
			transform translate3d(1px, 0, 0)
	.monthYear
		flex-grow 1
		span
			font-size 18px
			text-indent 15px
	.main
		width 100%
	.dateItem
		height 100%
		margin 0px
		&.notThisMonth
			opacity 1
			color #ccc
		&.selected
			.date
				border 1px solid main-color !important
				background-color main-color !important
				color white !important
		&.today
			.date
				background-color transparent
				border-color transparent
				font-weight 600
				color main-color
			&.selected
				.date
					margin 5px auto !important
					border 4px solid main-color !important
					border-color wrgba(.4) !important
	.table
		display table
		width 100%
		height 100%
	.middle
		display table-cell
		vertical-align middle
	.arrow
		font-size 1.5em
	.weekList
		height 36px
		width 14.28%
		flex-grow 1
		font-weight 600
		@extend .open-serif
		text-align center
		p
			margin-top 0px
			margin-bottom 0px
			font-size 11.5px
	.list
		display inline-block
		height 48px
		width 14.28%
		position relative
		flex-grow 1
		text-align center
		@extend .open-serif
		line-height 48px
		cursor pointer
		.point
			height 3px
			width 18px
			position absolute
			left 50%
			margin 39px 0 0px -9px
			border-radius 100px
			background-color line-color
			&.today
				background-color main-color
		p
			margin-top 0px
			margin-bottom 0px
			font-size 1em
			&.date
				height 32px
				width 32px
				margin 8px auto
				border 1px solid transparent
				transition(.2s)
				border-radius 100px
				line-height 32px
				font-size 1em
</style>
