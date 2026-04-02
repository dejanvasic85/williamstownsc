import * as Sentry from '@sentry/nextjs';
import { isSentryEnabled } from '@/lib/config';

Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
	tracesSampleRate: 0.05,
	debug: false,
	enabled: isSentryEnabled(),
	enableLogs: true
});
