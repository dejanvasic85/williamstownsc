import { GoogleTagManager as NextGTM } from '@next/third-parties/google';

type GoogleTagManagerProps = {
	gtmId: string;
};

/**
 * Google Tag Manager component for Next.js App Router
 * Wrapper around @next/third-parties/google GoogleTagManager
 *
 * Usage:
 * <GoogleTagManager gtmId="GTM-XXXXXXX" />
 */
export function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
	if (!gtmId) {
		return null;
	}

	return <NextGTM gtmId={gtmId} />;
}
