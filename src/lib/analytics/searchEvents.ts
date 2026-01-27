'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { isLocal } from '@/lib/config';

type TrackSearchParams = {
	searchTerm: string;
	resultCount: number;
};

type TrackSearchResultClickParams = {
	searchTerm: string;
	index: number;
	contentType: string;
	itemId: string;
};

function shouldTrack(): boolean {
	return !isLocal();
}

export function trackSearch({ searchTerm, resultCount }: TrackSearchParams): void {
	if (!shouldTrack()) return;

	if (resultCount === 0) {
		sendGTMEvent({
			event: 'search_no_results',
			search_term: searchTerm
		});
	} else {
		sendGTMEvent({
			event: 'search',
			search_term: searchTerm,
			result_count: resultCount
		});
	}
}

export function trackSearchResultClick({
	searchTerm,
	index,
	contentType,
	itemId
}: TrackSearchResultClickParams): void {
	if (!shouldTrack()) return;

	sendGTMEvent({
		event: 'select_content',
		content_type: contentType,
		item_id: itemId,
		search_term: searchTerm,
		index
	});
}

export function trackSearchModalOpen(): void {
	if (!shouldTrack()) return;

	sendGTMEvent({
		event: 'search_modal_open'
	});
}

export function trackSearchModalClose(): void {
	if (!shouldTrack()) return;

	sendGTMEvent({
		event: 'search_modal_close'
	});
}
