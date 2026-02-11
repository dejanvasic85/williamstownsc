type FormSubmissionRow = Record<string, string | undefined>;

const commonColumns = [
	{ key: 'submittedAt', label: 'Submitted At' },
	{ key: 'contactType', label: 'Contact Type' },
	{ key: 'status', label: 'Status' },
	{ key: 'name', label: 'Name' },
	{ key: 'email', label: 'Email' },
	{ key: 'phone', label: 'Phone' },
	{ key: 'message', label: 'Message' }
];

const typeSpecificColumns = [
	{ key: 'ageGroup', label: 'Age Group' },
	{ key: 'experience', label: 'Experience' },
	{ key: 'position', label: 'Position' },
	{ key: 'qualifications', label: 'Qualifications' },
	{ key: 'coachExperience', label: 'Coaching Experience' },
	{ key: 'ageGroupsInterest', label: 'Age Groups Interest' },
	{ key: 'organization', label: 'Organization' },
	{ key: 'sponsorshipTier', label: 'Sponsorship Tier' },
	{ key: 'programId', label: 'Program ID' },
	{ key: 'subject', label: 'Subject' }
];

const allColumns = [...commonColumns, ...typeSpecificColumns];

function escapeCsvField(value: string): string {
	if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

function formatDate(isoDate: string): string {
	try {
		return new Date(isoDate).toLocaleString('en-AU', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	} catch {
		return isoDate;
	}
}

export function serializeToCsv(rows: FormSubmissionRow[]): string {
	const header = allColumns.map((col) => col.label).join(',');

	const dataRows = rows.map((row) => {
		return allColumns
			.map((col) => {
				const value = row[col.key] ?? '';
				const formatted = col.key === 'submittedAt' && value ? formatDate(value) : value;
				return escapeCsvField(formatted);
			})
			.join(',');
	});

	return [header, ...dataRows].join('\n');
}

export function downloadCsv(csvContent: string, filename: string): void {
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}
