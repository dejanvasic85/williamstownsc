'use client';

import { useCallback, useMemo } from 'react';
import { Button, Card, Flex, Spinner, Stack, Text } from '@sanity/ui';
import { Autocomplete } from '@sanity/ui/autocomplete';
import { useQuery } from '@tanstack/react-query';
import { set, unset } from 'sanity';
import type { StringInputProps } from 'sanity';
import { getStudioConfig } from '@/lib/config';
import type { LeagueOption } from '@/types/matchday';

type AutocompleteOption = LeagueOption & { value: string };

const leaguesQueryKey = ['studio-leagues'];

async function fetchLeagueOptions(): Promise<LeagueOption[]> {
	const { siteUrl } = getStudioConfig();
	const leaguesEndpoint = `${siteUrl}/api/studio/leagues`;
	const response = await fetch(leaguesEndpoint);
	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}
	const body: { options: LeagueOption[] } = await response.json();
	return body.options;
}

function toAutocompleteOptions(options: LeagueOption[]): AutocompleteOption[] {
	return options.map((option) => ({ ...option, value: option.leagueId }));
}

export function LeagueIdInput(props: StringInputProps) {
	const { value, onChange } = props;
	const {
		data: options = [],
		isLoading,
		isError,
		refetch
	} = useQuery({ queryKey: leaguesQueryKey, queryFn: fetchLeagueOptions });

	const autocompleteOptions = useMemo(() => toAutocompleteOptions(options), [options]);
	const selectedOption = useMemo(
		() => options.find((option) => option.leagueId === value),
		[options, value]
	);
	const isStale = !isLoading && !isError && Boolean(value) && !selectedOption;

	const handleSelect = useCallback((leagueId: string) => onChange(set(leagueId)), [onChange]);
	const handleClear = useCallback(() => onChange(unset()), [onChange]);

	if (isLoading) {
		return (
			<Stack gap={3}>
				<Flex align="center" gap={2} padding={2}>
					<Spinner muted />
					<Text muted size={1}>
						Loading leagues…
					</Text>
				</Flex>
				{value && (
					<Text size={1} muted>
						Current value: {value}
					</Text>
				)}
			</Stack>
		);
	}

	if (isError) {
		return (
			<Card padding={3} radius={2} tone="critical">
				<Stack gap={3}>
					<Text size={1}>Couldn&apos;t load leagues — try again.</Text>
					{value && (
						<Text size={1} muted>
							Current value: {value}
						</Text>
					)}
					<Button text="Retry" mode="ghost" tone="critical" onClick={() => refetch()} />
				</Stack>
			</Card>
		);
	}

	return (
		<Stack gap={3}>
			{isStale && (
				<Card padding={3} radius={2} tone="caution">
					<Flex align="center" justify="space-between" gap={3}>
						<Stack gap={2}>
							<Text size={1} weight="semibold">
								Saved league not found in the current list
							</Text>
							<Text size={1} muted>
								{value}
							</Text>
						</Stack>
						<Button text="Clear" mode="ghost" tone="caution" onClick={handleClear} />
					</Flex>
				</Card>
			)}

			{options.length === 0 ? (
				<Text muted size={1}>
					No leagues found for this club yet.
				</Text>
			) : (
				<Autocomplete
					id="matchday-league-id"
					options={autocompleteOptions}
					value={isStale ? undefined : value}
					placeholder="Search leagues…"
					renderOption={(option: AutocompleteOption) => (
						<Card as="button" padding={3} radius={2}>
							<Text size={1}>{option.label}</Text>
						</Card>
					)}
					renderValue={(optionValue: string, option?: AutocompleteOption) =>
						option?.label ?? optionValue
					}
					filterOption={(query: string, option: AutocompleteOption) =>
						option.label.toLowerCase().includes(query.toLowerCase())
					}
					onSelect={handleSelect}
				/>
			)}

			{value && !isStale && selectedOption && (
				<Flex align="center" justify="space-between" gap={3}>
					<Text size={1} muted>
						{value}
					</Text>
					<Button text="Clear" mode="ghost" onClick={handleClear} />
				</Flex>
			)}
		</Stack>
	);
}
