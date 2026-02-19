'use client';

import { useState } from 'react';

export default function ClientError() {
	const [thrown, setThrown] = useState(false);

	if (thrown) {
		throw new Error('Sentry client-side test error');
	}

	return (
		<button type="button" className="btn btn-error btn-outline" onClick={() => setThrown(true)}>
			Throw client error
		</button>
	);
}
