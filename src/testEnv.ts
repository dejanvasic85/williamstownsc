import { beforeEach } from 'vitest';

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
