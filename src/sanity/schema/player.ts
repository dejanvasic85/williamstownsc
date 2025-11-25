import { defineField, defineType } from 'sanity';

const areaOfPitchOptions = [
	{ title: 'Goalkeeper', value: 'goalkeeper' },
	{ title: 'Defender', value: 'defender' },
	{ title: 'Midfielder', value: 'midfielder' },
	{ title: 'Forward', value: 'forward' }
];

export const player = defineType({
	name: 'player',
	title: 'Player',
	type: 'object',
	fields: [
		defineField({
			name: 'person',
			title: 'Person',
			type: 'reference',
			to: [{ type: 'person' }],
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'shirtNumber',
			title: 'Shirt Number',
			type: 'number',
			validation: (Rule) => Rule.required().min(1).max(99)
		}),
		defineField({
			name: 'position',
			title: 'Position',
			type: 'string',
			description: 'Specific position e.g. Centre Back, Striker, Left Winger',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'areaOfPitch',
			title: 'Area of Pitch',
			type: 'string',
			description: 'Used for grouping players when displaying the squad',
			options: {
				list: areaOfPitchOptions,
				layout: 'radio'
			},
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'isCaptain',
			title: 'Is Captain',
			type: 'boolean',
			initialValue: false
		}),
		defineField({
			name: 'isViceCaptain',
			title: 'Is Vice Captain',
			type: 'boolean',
			initialValue: false
		}),
		defineField({
			name: 'intro',
			title: 'Player Introduction',
			type: 'array',
			of: [{ type: 'block' }],
			description: 'Promote the player, their abilities or commitment to the team'
		})
	],
	preview: {
		select: {
			personName: 'person.name',
			shirtNumber: 'shirtNumber',
			position: 'position',
			isCaptain: 'isCaptain'
		},
		prepare({ personName, shirtNumber, position, isCaptain }) {
			const captainBadge = isCaptain ? '(C)' : '';
			return {
				title: `${shirtNumber}. ${personName || 'Unknown Player'} ${captainBadge}`,
				subtitle: position
			};
		}
	}
});
