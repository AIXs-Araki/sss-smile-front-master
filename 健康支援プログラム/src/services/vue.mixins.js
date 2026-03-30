import _ from 'lodash'
import moment from 'moment'
import Swiper from 'swiper'
import TWEEN from 'tween.js'
import { mapState, mapGetters, mapActions } from 'vuex'
import Fetch from './utils/fetch'

// mixins for init
// ==================================================
const init = {
	computed: {
		...mapState({
			env: state => state.config.env
		}),
		...mapGetters({
			transitionType: 'getTransitionType'
		})
	},
	created () {
		this.userAgentFunc()
	},
	methods: {
		// dispatch > loading
		// ==================
		...mapActions([
			'setNavigator'
		]),
		// UA関連
		// ========================
		userAgentFunc () {
			const values = {}
			if (navigator.userAgent.indexOf('Android') > 0) {
				// アンドロイドのバックボタン禁止
				document.addEventListener('backbutton', e => {
					e.preventDefault()
				}, false)
				values.userAgent = 'Android'
			} else if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
					values.userAgent = 'iOS'
			} else {
				values.userAgent = 'Other'
			}
			this.setNavigator(values)
		}
	}
}

// mixins for common
// ==================================================
const common = {
	computed: {
		// state > debug
		// ==================
		...mapState({
			debug: state => state.config.debug,
			api: state => state.config.api
		}),
		// state > loading
		// ==================
		...mapGetters({
			loading: 'getIsLoading',
			navigator: 'gatNavigator',
			dialogs: 'getDialogs',
			accessToken: 'getAccessToken',
			member: 'getMember'
		})
	},
	methods: {
		// dispatch > loading
		// ==================
		...mapActions([
			'setLoading',
			'setLoaded',
			'toggleLoad'
		]),
		// format
		// ==================
		valueFormat (val) {
			return val / 100
		},
		toFixedX (val, decimal) {
			return parseFloat(val.toFixed(decimal))
		},
		floatFormat (val, n) {
			const _pow = Math.pow(10, n)
			return Math.round(val * _pow) / _pow
		},
		validateName (val) {
			const validValues = /^[a-z && A-Z && 0-9 && _]+$/
			const whiteSpaces = /\s/
			console.log(validValues.test(val),!whiteSpaces.test(val))
			if (validValues.test(val) && !whiteSpaces.test(val))
				return true
			else
				return false
		},
		// failure
		// ==================
		error (errors) {
			_.forEach(errors, _error => {
				if (this.debug.console)
					console.log(_error)
				this.$notify.error({
					title: `Error Code ${ _error.Code }`,
					message: _error.Description
				})
				if (_error.Message === 'INVALID_ACCESS_TOKEN_ERROR')
					this.$router.push({ name: 'signout' })
			})
		},
		reject (d) {
			this.error(d.response.data.errors)
		}
	}
}

// mixins for storage
// ==================================================
const storage = {
	computed: {
		// state
		// ==================
		...mapState({
			localStorageKey: state => state.config.localStorage.key
		}),
		// state > storage, token
		// ==================
		...mapGetters({
			storage: 'getStorage',
			token: 'getToken'
		})
	},
	methods: {
		// dispatch > user
		// ==================
		...mapActions([
			'setMember',
			'resetMember'
		]),
		checkStorage () {
			const storage = this.getStorage()
			if (storage !== null && storage !== undefined) {
				const values = {}
				values.storage = storage
				values.organization_id = this.$route.params.organization_id
				this.setMember(values)
			}
		},
		getStorage () {
			const key = [this.localStorageKey, this.$route.params.organization_id].join('_')
			return localStorage.getItem(key)
		}
	}
}

// mixins for scroll
// ==================================================
const scroll = {
	methods: {
		pagetop () {
			this.pagetween(0)
		},
		pageto (_to) {
			this.pagetween(_to)
		},
		pagetween (_to) {
			const doc = document.documentElement
			const scrollPos = time => {
				TWEEN.update(time)
			}
			const coords = {
				x: (window.pageXOffset || doc.scrollLeft)  - (doc.clientLeft || 0),
				y: (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0)
			}
			const tween = new TWEEN.Tween(coords)
			.to({ x:0, y: _to }, 500)
			.onUpdate(() => {
				requestAnimationFrame(scrollPos)
				window.scrollTo(coords.x, coords.y)
			})
			.start()

			_.defer(() => {
				requestAnimationFrame(scrollPos)
			})
		},
		elto (_el, _to) {
			const scrollPos = time => {
				TWEEN.update(time)
			}
			const coords = {
				x: 0,
				y: _el.scrollTop
			}
			const tween = new TWEEN.Tween(coords)
			.to({ x:0, y: _to }, 500)
			.onUpdate(() => {
				requestAnimationFrame(scrollPos)
				_el.scrollTop = coords.y
			})
			.start()

			_.defer(() => {
				requestAnimationFrame(scrollPos)
			})
		}
	}
}

// mixins for vertical-scroller
// ==================================================
const vscroller = {
	beforeDestroy () {
		this.destroySwiper()
	},
	methods: {
		setSwiper (target, key) {
			const scroller = new Swiper(target, {
				direction: 'vertical',
				slidesPerView: 'auto',
				mousewheel: true,
				animating: true,
				// noSwiping: true,
				// noSwipingClass: 'noSwipe',
				freeMode: true,
				// scrollbar: {
				// 	el: `#${ key } .swiper-scrollbar`,
				// }
			})
			this.swiper.main[key] = scroller
		},
		resizeSwiper () {
			if (Object.keys(this.swiper.main).length)
				_.forEach(this.swiper.main, (_scroller, _key) => {
					if (_scroller !== null && _scroller !== undefined)
						this.swiper.main[_key].update()
				})
		},
		destroySwiper () {
			if (Object.keys(this.swiper.main).length)
				_.forEach(this.swiper.main, (_scroller, _key) => {
					if (_scroller !== null && _scroller !== undefined) {
						this.swiper.main[_key].destroy()
						delete this.swiper.main[_key]
					}
				})
		}
	}
}

// mixins for chart.js
// ==================================================
const chart = {
	methods: {
		getChartDataSet (label, data, color) {
			const dataset = {
				label: label,
				data: data,
				borderWidth: 1,
				fill: false,
				borderColor: color,
				type: 'line',
				lineTension: 0.1
			}
			return dataset
		},
		getChartOptions () {
			const pointStyle = 'circle'
			const color = {
				font: 'rgba(51,51,51,1)',
				gridLines: {
					color: 'rgba(51,51,51,.5)',
					zeroLineColor: 'rgba(255,255,255,.14)'
				}
			}
			const options = {
				legend: {
					display: false
				},
				layout: {
					padding: {
						left: 0,
						right: 0,
						top: 0,
						bottom: 0
					}
				},
				elements: {
					point: {
						radius: 0.1,
						pointStyle: pointStyle
					}
				},
				scales: {
					xAxes: [{
						barPercentage: 0.1,
						// type: 'linear',
						type: 'time',
						time: {
							displayFormats: {
								'hour': 'H:mm'
							},
							unit: 'hour',
							stepSize: 1
						},
						gridLines: {
							display: false
						},
						ticks: {
							// min: 0,
							// max: 23,
							fontSize: 10,
							// fontColor: 'white',
							stepSize: 1,
							// callback: function(value, index, values) {
							// 	// const _value = ( Number(index) + 8 ) % 24
							// 	const _value = moment(new Date(value)).format('HH:mm')
							// 	return _value
							// },
							autoSkip: true
						}
					}],
					yAxes: [{
						ticks: {
							min: 0,
							max: 200,
							stepSize: 20,
							fontColor: color.font,
							// autoSkip: false
						},
						gridLines: color.gridLines
					}]
				}
			}
			return options
		}
	}
}

// mixins for request by fetch
// ==================================================
const request = {
	computed: {
		// state
		// ==================
		...mapState({
			apiPath: state => state.config.api.path
		})
	},
	methods: {
		request (method, uri, body, type) {
			const deferred = new Promise((resolve, reject) => {
				Fetch.request(method, this.getEndpoint(uri), body, type)
				.then(res => {
					return resolve(res)
				})
				.catch(e => {
					return reject(e)
				})
			})
			return deferred
		},
		// get uri with api path
		// ==================================================
		getEndpoint (str) {
			return this.apiPath + str
		}
	}
}

export default { init, common, storage, scroll, vscroller, chart, request }
