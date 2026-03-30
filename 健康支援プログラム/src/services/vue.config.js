// vue関連読み込み
// ==================================================
import Vue from 'vue'
// router
import VueRouter from 'vue-router'
import Routemap from './router/routemap'
// element-ui
import ElementUI from 'element-ui'
import Lang from 'element-ui/lib/locale/lang/en'
import Locale from 'element-ui/lib/locale'
import '../themes/theme-nji/index.css'
// store
import Vuex from 'vuex'
import * as actions from './store/actions'
import state from './store/state'
import modules from './store/modules'
import plugins from './store/plugins'
// other
import Trend from 'vuetrend';
// filters
import * as filters from './utils/filters'

// vue設定など
// ==================================================
Locale.use(Lang)
Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(ElementUI, { Locale })
Vue.use(Trend)
Vue.filter('toFixedX', filters.toFixedX)
Vue.filter('floatFormat', filters.floatFormat)
Vue.filter('getAge', filters.getAge)
Vue.filter('dateFormat', filters.dateFormat)
Vue.filter('calcFromNow', filters.calcFromNow)
Vue.filter('reverseData', filters.reverseData)

// ルータ設定
// ==================================================
const router = new VueRouter({
	// mode: 'history',
	mode: 'hash',
	base: __dirname,
	linkActiveClass: 'active',
	routes: Routemap.routes
})

// ストア設定
// ==================================================
const debug = process.env.NODE_ENV !== 'production'
const store = new Vuex.Store({
	// actions,
	state: state,
	modules: modules,
	strict: debug,
	plugins: plugins
})

export default { router, store }
