import moment from 'moment';

export function log(...args: unknown[]) {
	console.log(moment().format('YYYY-MM-DD HH:MM:ss:SSS'),'\t',...args)
}