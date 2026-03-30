// JavaScript Document
// (c)TheDesignum

// ====================
//	インポート > ライブラリ関連
// ====================
import FastClick from 'fastclick'
import moment from 'moment'
import axios from 'axios'
import fontawesome from '@fortawesome/fontawesome'
import 'nouislider/distribute/nouislider.min.css'
import 'swiper/dist/css/swiper.min.css'
import 'flex.box/src/flexbox.css'

// ====================
//	インポート > vue関連
// ====================
import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import VueConfig from './services/vue.config'
import App from './components/app.vue'

// ====================
//	共通関数 > 初期化
// ====================
class Common {
	domInit () {
		this.set()
		new Frame().set()
	}
	set () {
		new FastClick(document.body)
		// axios > set default config
		axios.defaults.headers.get['Accept'] = 'application/json'
		axios.defaults.headers.get['Content-Type'] = 'application/json'
		axios.defaults.headers.post['Accept'] = 'application/json'
		axios.defaults.headers.post['Content-Type'] = 'application/json'
		// moment > set locale
		moment.locale('ja', {
			weekdays: ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],
			weekdaysShort: ['日','月','火','水','木','金','土'],
		})
		Common.setSize()
	}
	static setSize() {
	}
}
//
// ====================
//	フレーム設定
// ====================
class Frame {
	set () {
		this.setVue()
		this.setSW()
	}
	setVue () {
		const router = VueConfig.router
		const store = VueConfig.store
		sync(store, router)
		const VueApp = new Vue({
			el: '#app',
			components: {
				App
			},
			router,
			store,
			render: h => h('App')
		})
	}
	setSW () {
		if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator)
			navigator.serviceWorker.register('/sw.js')
			.then(reg => {
				console.log('Registration succeeded. Scope is ' + reg.scope)
				reg.addEventListener('updatefound', _e => {
					console.log('Registration update found:', _e)
				}, false)
				reg.update()
			})
			.catch(err => {
				console.error('Registration failed with ' + err)
			})
	}
}

// ====================
//  変数とイベント
// ====================
// window.addEventListener('resize', () => {}, false)
// window.addEventListener('orientationchange', () => {}, false)
// window.addEventListener('WebComponentsReady', () => {
new Common().domInit()
// }, false)
