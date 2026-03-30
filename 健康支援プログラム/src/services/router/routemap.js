// const Home = r => require.ensure([], () => r(require('../../components/Home/home.vue')), 'home')

// ルート
const Root = r => require.ensure([], () => r(require('../../components/Root/index.vue')), 'root')

// サインイン・サインアウト
const SignIn = r => require.ensure([], () => r(require('../../components/Root/Sign/sign.in.vue')), 'sign.in')
const SignOut = r => require.ensure([], () => r(require('../../components/Root/Sign/sign.out.vue')), 'sign.out')

// メイン
const Main = r => require.ensure([], () => r(require('../../components/Root/Main/index.vue')), 'root.main')

// メイン > 利用者
const Common = r => require.ensure([], () => r(require('../../components/Root/Main/Common/index.vue')), 'main.common')
const CommonTarget = r => require.ensure([], () => r(require('../../components/Root/Main/Common/Target/index.vue')), 'main.common.target')
const CommonTargetSummary = r => require.ensure([], () => r(require('../../components/Root/Main/Common/Target/Summary/index.vue')), 'main.common.target.summary')
const CommonTargetManual = r => require.ensure([], () => r(require('../../components/Root/Main/Common/Target/Manual/index.vue')), 'main.common.target.manual')
const CommonTargetAdvices = r => require.ensure([], () => r(require('../../components/Root/Main/Common/Target/Advices/index.vue')), 'main.common.target.advices')

// メイン > スタッフ
const Staff = r => require.ensure([], () => r(require('../../components/Root/Main/Staff/index.vue')), 'main.staff')

// その他
const Page404 = r => require.ensure([], () => r(require('../../components/Page/page.404.vue')), 'page.404')

// ルートマップ
// ==================================================
const routes = [
	// ルート
	// ====================
	{
		path: '/org/:organization_id',
		name: 'root',
		component: Root,
		redirect: { name: 'signin' },
		children: [
			// サインイン
			// ====================
			{
				path: 'signin',
				name: 'signin',
				component: SignIn
			},
			// サインアウト
			// ====================
			{
				path: 'signout',
				name: 'signout',
				component: SignOut
			},
			// その他
			// ====================
			{
				path: '404',
				name: 'org404',
				component: Page404
			}
		]
	},
	// メイン
	// ====================
	{
		path: '/org/:organization_id/main',
		name: 'main',
		component: Main,
		// redirect: { name: 'list' },
		children: [
			// メイン > 利用者
			// ====================
			{
				path: 'common',
				name: 'common',
				components: {
					default: Common,
					targetDetail: Page404
				}
			},
			{
				path: 'common/:target_id',
				name: 'target',
				components: {
					targetDetail: CommonTarget
				},
				redirect: { name: 'summary' },
				children: [
					{
						path: 'summary',
						name: 'summary',
						components: {
							detail: CommonTargetSummary
						}
					},
					{
						path: 'manual',
						name: 'manual',
						components: {
							detail: CommonTargetManual
						}
					},
					{
						path: 'advices',
						name: 'advices',
						components: {
							detail: CommonTargetAdvices
						}
					}
				]
			},
			// メイン > スタッフ
			// ====================
			{
				path: 'staff',
				name: 'staff',
				components: {
					targetDetail: Staff
				},
			}
		]
	},
	// その他
	// ====================
	{
		path: '/404',
		name: 'page404',
		component: Page404
	},
	// リダイレクト設定
	// ====================
	{
		path: '/404/*',
		redirect: { name: 'page404' }
	},
	{
		path: '*',
		redirect: { name: 'page404' }
	}
]

export default { routes }
