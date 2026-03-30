<template>
	<div
		class="material-ripple__component"
		:class="computedClasses"
		:style="computedStyles">
	</div>
</template>

<script>
import Offset from 'document-offset'

export default {
	name: 'material-ripple',
	props: {
		center: {
			type: Boolean,
			default: false
		},
		size: {
			type: Number,
			default: null
		}
	},
	data () {
		return {
			isAnimated: false,
			width: 0,
			height: 0,
			top: 0,
			left: 0
		}
	},
	computed: {
		computedClasses () {
			return {
				'ripple--animation': this.isAnimated
			}
		},
		computedStyles () {
			return {
				top: this.top + 'px',
				left: this.left + 'px',
				width: this.width + 'px',
				height: this.height + 'px'
			}
		}
	},
	beforeDestroy () {
		this.container.removeEventListener('click', this.handleClick)
		this.container.removeEventListener('touch', this.handleClick)
	},
	mounted () {
		// container is not reactive:
		this.container = this.$el.parentNode

		// We support both click and touch events:
		this.container.addEventListener('click', this.handleClick)
		this.container.addEventListener('touch', this.handleClick)
	},
	methods: {
		handleClick (event) {
			if (this.isAnimated) {
				// The DOM is not ready yet:
				this.isAnimated = false
				this.$nextTick(() => {
					// But on the next tick it will be ready:
					this.animate(event)
				})
			} else {
				this.animate(event)
			}
		},
		getDocumentOffset () {
			return Offset(this.container) // polyfill
		},
		animate (event) {
			const position = this.getDocumentOffset()

			const size = Math.max( // getting the bigger size
				this.container.offsetWidth,
				this.container.offsetHeight
			)

			let top
			let left
			let finalSize

			if (this.center) {
				// Working in a centered mode: animate from the single point.
				finalSize = this.size || size
				top = left = (size / 2) - (finalSize / 2)
			} else {
				// Working in a normal mode: animate from the clicked point.

				// This method works for both click and touch events:
				const inputX = (event.type === 'click')
				? event.pageX
				: event.originalEvent.touches[0].pageX
				const inputY = (event.type === 'click')
				? event.pageY
				: event.originalEvent.touches[0].pageY

				const center = size / 2

				finalSize = size
				top = inputY - position.top - center
				left = inputX - position.left - center
			}

			this.setInnerStyles(
				finalSize, top, left
			)
		},
		setInnerStyles (size, top, left) {
			// Mutating the inner state:
			this.isAnimated = true
			this.width = this.height = size
			this.top = top
			this.left = left
		}
	}
}
</script>

<style lang="stylus">
.material-ripple__component
	position absolute
	border-radius 50%
	transform scale(0)
	&.ripple--animation
		animation ripple 1s cubic-bezier(0.25, 0.1, 0.2, 1)
// Theme:
.material-ripple__component
	// background rgba(255, 255, 255, .4)
	background rgba(51,51,51,.14)

// Animation:
@keyframes ripple {
	from {
		opacity .5
	}
	to {
		opacity 0
		transform scale(2)
	}
}
</style>
