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
	const handleKeyDown = (event: React.KeyboardEvent, currentIndex: number) => {
		let newIndex = currentIndex;

		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				newIndex = currentIndex > 0 ? currentIndex - 1 : contactTypes.length - 1;
				break;
			case 'ArrowRight':
				event.preventDefault();
				newIndex = currentIndex < contactTypes.length - 1 ? currentIndex + 1 : 0;
				break;
			case 'Home':
				event.preventDefault();
				newIndex = 0;
				break;
			case 'End':
				event.preventDefault();
				newIndex = contactTypes.length - 1;
				break;
			default:
				return;
		}

		onChange(contactTypes[newIndex].value);
	};

	return (
		<>
			{/* Mobile select dropdown */}
			<div className="mb-8 md:hidden">
				<label htmlFor="enquiry-type-select" className="label">
					<span className="label-text">Select enquiry type</span>
				</label>
				<select
					id="enquiry-type-select"
					className="select select-bordered w-full"
					value={activeType}
					onChange={(e) => onChange(e.target.value as ContactType)}
				>
					{contactTypes.map((type) => (
						<option key={type.value} value={type.value}>
							{type.label}
						</option>
					))}
				</select>
			</div>

			{/* Desktop tabs */}
			<div role="tablist" className="tabs tabs-border mb-8 hidden gap-2 md:flex">
				{contactTypes.map((type, index) => (
					<button
						key={type.value}
						id={`tab-${type.value}`}
						role="tab"
						type="button"
						tabIndex={activeType === type.value ? 0 : -1}
						className={`tab text-sm font-semibold transition-colors lg:text-lg ${
							activeType === type.value ? 'tab-active' : ''
						}`}
						onClick={() => onChange(type.value)}
						onKeyDown={(e) => handleKeyDown(e, index)}
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
