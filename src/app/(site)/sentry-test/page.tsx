import ClientError from './ClientError';

export default async function SentryTestPage() {
	const throwServerError = async () => {
		'use server';
		throw new Error('Sentry server-side test error');
	};

	return (
		<div className="mx-auto max-w-xl px-4 py-16">
			<h1 className="mb-2 text-3xl font-bold">Sentry Test</h1>
			<p className="text-base-content/60 mb-8 text-sm">Dev only — returns 404 in production.</p>

			<div className="flex flex-col gap-4">
				<div className="card bg-base-200 p-6">
					<h2 className="mb-1 text-lg font-semibold">Client error</h2>
					<p className="text-base-content/60 mb-4 text-sm">
						Throws inside a React component — caught by the nearest error boundary.
					</p>
					<ClientError />
				</div>

				<div className="card bg-base-200 p-6">
					<h2 className="mb-1 text-lg font-semibold">Server error</h2>
					<p className="text-base-content/60 mb-4 text-sm">
						Throws in a Server Action — captured via <code>onRequestError</code> in{' '}
						<code>instrumentation.ts</code>.
					</p>
					<form action={throwServerError}>
						<button type="submit" className="btn btn-error btn-outline">
							Throw server error
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
