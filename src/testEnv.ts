import { beforeEach } from 'vitest';

// Shared Sanity config, needed because the client modules parse it when they build a connection.
process.env.NEXT_PUBLIC_SANITY_API_VERSION ??= '2024-01-01';

// Reset process.env to its state at load time before every test, so a test that sets
// environment variables cannot leak into the next one.
const envBaselineValue = { ...process.env };

beforeEach(() => {
	for (const key of Object.keys(process.env)) {
		if (!(key in envBaselineValue)) {
			delete process.env[key];
		}
	}
	Object.assign(process.env, envBaselineValue);
});
