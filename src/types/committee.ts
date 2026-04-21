import type { Person, PersonPhoto } from './team';

export type CommitteeMember = {
	person: Person;
	photo?: PersonPhoto;
	title: string;
	order: number;
};
