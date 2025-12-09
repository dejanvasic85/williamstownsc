'use client';

import { ContactType } from '@/lib/contact/contactEmail';

type ContactTypeTabsProps = {
	activeType: ContactType;
	onChange: (type: ContactType) => void;
};

const contactTypes: { value: ContactType; label: string }[] = [
	{ value: 'general', label: 'General' },
	{ value: 'player', label: 'Player' },
	{ value: 'coach', label: 'Coach' },
	{ value: 'sponsor', label: 'Sponsor' },
	{ value: 'program', label: 'Program' }
];

export function ContactTypeTabs({ activeType, onChange }: ContactTypeTabsProps) {
	return (
		<>
			{/* Mobile select dropdown */}
			<select
				className="select select-bordered mb-8 w-full md:hidden"
				value={activeType}
				onChange={(e) => onChange(e.target.value as ContactType)}
				aria-label="Select enquiry type"
			>
				{contactTypes.map((type) => (
					<option key={type.value} value={type.value}>
						{type.label}
					</option>
				))}
			</select>

			{/* Desktop tabs */}
			<div role="tablist" className="tabs tabs-border mb-8 hidden gap-2 md:flex">
				{contactTypes.map((type) => (
					<button
						key={type.value}
						id={`tab-${type.value}`}
						role="tab"
						type="button"
						className={`tab text-sm font-semibold transition-colors lg:text-lg ${
							activeType === type.value ? 'tab-active' : ''
						}`}
						onClick={() => onChange(type.value)}
						aria-selected={activeType === type.value}
						aria-controls={`tabpanel-${type.value}`}
					>
						{type.label}
					</button>
				))}
			</div>
		</>
	);
}
