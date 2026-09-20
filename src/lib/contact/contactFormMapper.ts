import type { ContactFormData } from './contactFormSchema';

function compact(fields: Record<string, string | undefined>): Record<string, string> {
	const present: Record<string, string> = {};
	for (const [key, value] of Object.entries(fields)) {
		if (value !== undefined && value !== '') {
			present[key] = value;
		}
	}
	return present;
}

/** The extra answers a club's form asks for, keyed as the form names them, blanks dropped. */
export function toEnquiryDetails(data: ContactFormData): Record<string, string> {
	switch (data.contactType) {
		case 'player':
			return compact({
				ageGroup: data.ageGroup,
				experience: data.experience,
				position: data.position
			});
		case 'coach':
			return compact({
				qualifications: data.qualifications,
				experience: data.experience,
				ageGroupsInterest: data.ageGroupsInterest
			});
		case 'sponsor':
			return compact({ organization: data.organization, sponsorshipTier: data.sponsorshipTier });
		case 'program':
			return compact({ programId: data.programId, programName: data.programName });
		case 'general':
			return compact({ subject: data.subject });
	}
}
