type FormSubmissionRow = Record<string, unknown>;

const formulaPrefixes = ['=', '+', '-', '@'];

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
	{ key: 'subject', label: 'Subject' },
	{ key: 'notes', label: 'Notes' }
];

const allColumns = [...commonColumns, ...typeSpecificColumns];

function coerceToString(value: unknown): string {
	if (value == null) return '';
	if (Array.isArray(value)) return value.join('; ');
	return String(value);
}

function sanitizeFormulaInjection(value: string): string {
	if (value.length > 0 && formulaPrefixes.includes(value[0])) {
		return `'${value}`;
	}
	return value;
}

function escapeCsvField(value: string): string {
	const sanitized = sanitizeFormulaInjection(value);
	if (
		sanitized.includes(',') ||
		sanitized.includes('"') ||
		sanitized.includes('\n') ||
		sanitized.includes('\r')
	) {
		return `"${sanitized.replace(/"/g, '""')}"`;
	}
	return sanitized;
}

function formatDate(isoDate: string): string {
	const date = new Date(isoDate);

	if (isNaN(date.getTime())) {
		return isoDate;
	}

	return date.toLocaleString('en-AU', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function serializeToCsv(rows: FormSubmissionRow[]): string {
	const header = allColumns.map((col) => col.label).join(',');

	const dataRows = rows.map((row) => {
		return allColumns
			.map((col) => {
				const raw = coerceToString(row[col.key]);
				const formatted = col.key === 'submittedAt' && raw ? formatDate(raw) : raw;
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
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
