import moment from 'moment'

// for numbers
export const toFixedX = (val, decimal) => {
	return parseFloat(val.toFixed(decimal))
}
export const floatFormat = (val, n) => {
	const _pow = Math.pow(10, n)
	return Math.round(val * _pow) / _pow
}

// for user
export const getAge = val => {
	return moment(new Date()).format('YYYY') - moment(new Date(val)).format('YYYY')
}

// for Date
export const dateFormat = val => {
	return moment(val).format('YYYY年MM月DD日(ddd) HH:mm:ss')
}
export const calcFromNow = val => {
	return moment(val).fromNow()
}

// for data
export const reverseData = val => {
	return val.reverse()
}
