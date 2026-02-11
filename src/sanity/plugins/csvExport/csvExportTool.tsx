'use client';

import { useCallback, useState } from 'react';
import { DownloadIcon } from '@sanity/icons';
import { Box, Button, Card, Flex, Heading, Label, Select, Stack, Text } from '@sanity/ui';
import { useClient } from 'sanity';
import { downloadCsv, serializeToCsv } from './csvSerializer';

type ContactTypeFilter = 'all' | 'player' | 'coach' | 'sponsor' | 'program' | 'general';
type StatusFilter = 'all' | 'new' | 'reviewed' | 'archived';

const contactTypeOptions: { value: ContactTypeFilter; label: string }[] = [
	{ value: 'all', label: 'All Types' },
	{ value: 'player', label: 'Player Registration' },
	{ value: 'coach', label: 'Coaching Enquiry' },
	{ value: 'sponsor', label: 'Sponsorship Enquiry' },
	{ value: 'program', label: 'Program Registration' },
	{ value: 'general', label: 'General Enquiry' }
];

const statusOptions: { value: StatusFilter; label: string }[] = [
	{ value: 'all', label: 'All Statuses' },
	{ value: 'new', label: 'New' },
	{ value: 'reviewed', label: 'Reviewed' },
	{ value: 'archived', label: 'Archived' }
];

const groqProjection = `{
  submittedAt,
  contactType,
  status,
  name,
  email,
  phone,
  message,
  ageGroup,
  experience,
  position,
  qualifications,
  coachExperience,
  ageGroupsInterest,
  organization,
  sponsorshipTier,
  programId,
  subject
}`;

function buildQuery(
	contactType: ContactTypeFilter,
	status: StatusFilter,
	dateFrom: string,
	dateTo: string
): string {
	const filters = ['_type == "formSubmission"'];

	if (contactType !== 'all') {
		filters.push(`contactType == "${contactType}"`);
	}
	if (status !== 'all') {
		filters.push(`status == "${status}"`);
	}
	if (dateFrom) {
		filters.push(`submittedAt >= "${dateFrom}T00:00:00Z"`);
	}
	if (dateTo) {
		filters.push(`submittedAt <= "${dateTo}T23:59:59Z"`);
	}

	return `*[${filters.join(' && ')}] | order(submittedAt desc) ${groqProjection}`;
}

function buildFilename(contactType: ContactTypeFilter, status: StatusFilter): string {
	const parts = ['form-submissions'];
	if (contactType !== 'all') parts.push(contactType);
	if (status !== 'all') parts.push(status);
	const date = new Date().toISOString().split('T')[0];
	parts.push(date);
	return `${parts.join('-')}.csv`;
}

export function CsvExportTool() {
	const client = useClient({ apiVersion: '2024-01-01' });
	const [contactType, setContactType] = useState<ContactTypeFilter>('all');
	const [status, setStatus] = useState<StatusFilter>('all');
	const [dateFrom, setDateFrom] = useState('');
	const [dateTo, setDateTo] = useState('');
	const [isExporting, setIsExporting] = useState(false);
	const [resultCount, setResultCount] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleExport = useCallback(async () => {
		setIsExporting(true);
		setError(null);
		setResultCount(null);

		try {
			const query = buildQuery(contactType, status, dateFrom, dateTo);
			const results = await client.fetch(query);

			if (!results || results.length === 0) {
				setError('No submissions found matching the selected filters.');
				return;
			}

			setResultCount(results.length);
			const csv = serializeToCsv(results);
			const filename = buildFilename(contactType, status);
			downloadCsv(csv, filename);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to export submissions');
		} finally {
			setIsExporting(false);
		}
	}, [client, contactType, status, dateFrom, dateTo]);

	return (
		<Card padding={4}>
			<Stack space={5}>
				<Heading as="h1" size={2}>
					Export Form Submissions
				</Heading>

				<Text muted size={1}>
					Export contact form submissions as a CSV file. Data contains personal information — share
					responsibly.
				</Text>

				<Card padding={4} radius={2} shadow={1}>
					<Stack space={4}>
						<Heading as="h2" size={1}>
							Filters
						</Heading>

						<Flex gap={4} wrap="wrap">
							<Box flex={1} style={{ minWidth: 200 }}>
								<Stack space={2}>
									<Label size={1}>Contact Type</Label>
									<Select
										value={contactType}
										onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
											setContactType(e.target.value as ContactTypeFilter)
										}
									>
										{contactTypeOptions.map((opt) => (
											<option key={opt.value} value={opt.value}>
												{opt.label}
											</option>
										))}
									</Select>
								</Stack>
							</Box>

							<Box flex={1} style={{ minWidth: 200 }}>
								<Stack space={2}>
									<Label size={1}>Status</Label>
									<Select
										value={status}
										onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
											setStatus(e.target.value as StatusFilter)
										}
									>
										{statusOptions.map((opt) => (
											<option key={opt.value} value={opt.value}>
												{opt.label}
											</option>
										))}
									</Select>
								</Stack>
							</Box>

							<Box flex={1} style={{ minWidth: 200 }}>
								<Stack space={2}>
									<Label size={1}>From Date</Label>
									<input
										type="date"
										value={dateFrom}
										onChange={(e) => setDateFrom(e.target.value)}
										style={{
											padding: '8px 12px',
											border: '1px solid var(--card-border-color, #ccc)',
											borderRadius: '4px',
											background: 'var(--card-bg-color, #fff)',
											color: 'var(--card-fg-color, #333)',
											fontSize: '14px',
											width: '100%',
											boxSizing: 'border-box'
										}}
									/>
								</Stack>
							</Box>

							<Box flex={1} style={{ minWidth: 200 }}>
								<Stack space={2}>
									<Label size={1}>To Date</Label>
									<input
										type="date"
										value={dateTo}
										onChange={(e) => setDateTo(e.target.value)}
										style={{
											padding: '8px 12px',
											border: '1px solid var(--card-border-color, #ccc)',
											borderRadius: '4px',
											background: 'var(--card-bg-color, #fff)',
											color: 'var(--card-fg-color, #333)',
											fontSize: '14px',
											width: '100%',
											boxSizing: 'border-box'
										}}
									/>
								</Stack>
							</Box>
						</Flex>
					</Stack>
				</Card>

				<Flex gap={3} align="center">
					<Button
						icon={DownloadIcon}
						text={isExporting ? 'Exporting...' : 'Export CSV'}
						tone="primary"
						onClick={handleExport}
						disabled={isExporting}
					/>

					{resultCount !== null && (
						<Text muted size={1}>
							Exported {resultCount} submission{resultCount !== 1 ? 's' : ''}
						</Text>
					)}
				</Flex>

				{error && (
					<Card padding={3} radius={2} tone="critical">
						<Text size={1}>{error}</Text>
					</Card>
				)}
			</Stack>
		</Card>
	);
}
