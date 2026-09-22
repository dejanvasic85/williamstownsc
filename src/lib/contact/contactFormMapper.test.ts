import { describe, expect, it } from 'vitest';
import { toEnquiryDetails } from './contactFormMapper';

const base = {
	name: 'Sam Okafor',
	email: 'sam@example.com',
	message: 'Keen to join the Under 13s.'
};

describe('toEnquiryDetails', () => {
	it('maps a player enquiry and drops blank answers', () => {
		expect(
			toEnquiryDetails({
				...base,
				contactType: 'player',
				ageGroup: 'Under 13',
				position: 'midfield',
				experience: ''
			})
		).toEqual({ ageGroup: 'Under 13', position: 'midfield' });
	});

	it('maps a coach enquiry', () => {
		expect(
			toEnquiryDetails({
				...base,
				contactType: 'coach',
				qualifications: 'Level 2',
				ageGroupsInterest: 'Juniors'
			})
		).toEqual({ qualifications: 'Level 2', ageGroupsInterest: 'Juniors' });
	});

	it('maps a sponsor enquiry', () => {
		expect(
			toEnquiryDetails({
				...base,
				contactType: 'sponsor',
				organization: 'Acme',
				sponsorshipTier: 'Gold'
			})
		).toEqual({ organization: 'Acme', sponsorshipTier: 'Gold' });
	});

	it('maps a program enquiry', () => {
		expect(
			toEnquiryDetails({ ...base, contactType: 'program', programName: 'Holiday clinic' })
		).toEqual({ programName: 'Holiday clinic' });
	});

	it('maps a general enquiry', () => {
		expect(toEnquiryDetails({ ...base, contactType: 'general', subject: 'Kit' })).toEqual({
			subject: 'Kit'
		});
	});
});
