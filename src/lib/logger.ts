import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const level = process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug');

const logger = pino({
	level,
	...(isProduction
		? {}
		: {
				transport: {
					target: 'pino-pretty',
					options: { colorize: true }
				}
			})
});

export default logger;
