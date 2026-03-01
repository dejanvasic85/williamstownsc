const facilityTypeLabelValue: Record<string, string> = {
	home: 'Home Ground',
	training: 'Training Ground',
	other: 'Other Facility'
};

export function facilityTypeLabel(facilityType: string | undefined): string | null {
	if (!facilityType) return null;
	return facilityTypeLabelValue[facilityType] ?? null;
}
