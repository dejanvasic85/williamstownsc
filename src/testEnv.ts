import { beforeEach } from 'vitest';

// Sanity client config, needed because the module-level client parses it on import.
process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??= 'test-sanity-project';
process.env.NEXT_PUBLIC_SANITY_DATASET ??= 'production';
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
