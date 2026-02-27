import * as Sentry from '@sentry/nextjs';
import { isSentryEnabled } from '@/lib/config';

Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
	tracesSampleRate: 1,
	debug: false,
	enabled: isSentryEnabled()
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
