export default () => {
	return store => {
		console.log(store.state)
		store.subscribe((mutation, state) => {
			console.log('subscribe:', mutation.type)
			console.log(mutation.payload)
		})
		store.subscribeAction((action, state) => {
			console.log('subscribeAction:', action.type)
			console.log(action.payload)
		})
	}
}
