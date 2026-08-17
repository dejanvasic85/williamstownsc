export const fixtureStatusValue = {
	complete: 'complete',
	postponed: 'postponed',
	postponedWashout: 'washout reschedule',
	cancelled: 'cancelled'
} as const;

export function isFixtureComplete(status: string | undefined): boolean {
	return status === fixtureStatusValue.complete;
}

export function isFixturePostponed(status: string | undefined): boolean {
	return status === fixtureStatusValue.postponed || status === fixtureStatusValue.postponedWashout;
}

export function isFixtureCancelled(status: string | undefined): boolean {
	return status === fixtureStatusValue.cancelled;
}
