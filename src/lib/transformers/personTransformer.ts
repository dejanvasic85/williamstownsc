import type { PersonPhoto } from '@/types/team';

export function resolvePersonPhoto(
	rolePhoto: PersonPhoto | undefined,
	personPhoto: PersonPhoto
): PersonPhoto {
	return rolePhoto ?? personPhoto;
}

export function splitPersonName(fullName: string): { firstName: string; lastName: string } {
	const parts = fullName.trim().split(' ');
	if (parts.length === 1) {
		return { firstName: '', lastName: parts[0] };
	}
	const lastName = parts[parts.length - 1];
	const firstName = parts.slice(0, -1).join(' ');
	return { firstName, lastName };
}
