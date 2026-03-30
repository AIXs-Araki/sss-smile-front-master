import samplePlugin from './plugins/sample-plugin'
import createLogger from 'vuex/dist/logger'

// const plugins = [ samplePlugin() ]
const plugins = []
const debug = process.env.NODE_ENV !== 'production'
const logger = process.env.LOGGER !== 'undefined' && process.env.LOGGER !== undefined ? 1 : 0
if (debug && logger)
	plugins.push(createLogger())

export default plugins
