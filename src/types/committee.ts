import type { Person } from './team';

export type CommitteeMember = {
	person: Person;
	title: string;
	order: number;
};
