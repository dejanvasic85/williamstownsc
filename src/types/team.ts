import type { PortableTextBlock } from '@portabletext/types';

export type TeamBase = {
	_id: string;
	name: string;
	slug: string;
	ageGroup: AgeGroup;
	order: number;
};

export type AgeGroup =
	| 'seniors'
	| 'reserves'
	| 'masters'
	| 'over45'
	| 'metros'
	| '6'
	| '7'
	| '8'
	| '9'
	| '10'
	| '11'
	| '12'
	| '13'
	| '14'
	| '15'
	| '16'
	| '17'
	| '18';

export type TabCategory = 'seniors' | 'reserves' | 'juniors' | 'masters' | 'metros';

export type PersonPhoto = {
	asset: {
		_ref: string;
		url: string;
	};
	alt: string;
	crop?: { top: number; bottom: number; left: number; right: number };
	hotspot?: { x: number; y: number; width: number; height: number };
};

export interface Person {
	_id: string;
	name: string;
	photo: PersonPhoto;
	dateOfBirth?: string;
}

export interface Coach {
	person: Person;
	photo?: PersonPhoto;
	title: string;
}

export interface Player {
	person: Person;
	photo?: PersonPhoto;
	shirtNumber?: number;
	position?: string;
	areaOfPitch?: 'goalkeeper' | 'defender' | 'midfielder' | 'forward';
	isCaptain?: boolean;
	isViceCaptain?: boolean;
	intro?: PortableTextBlock[];
}

export interface Team {
	_id: string;
	name: string;
	slug: string;
	photo?: {
		asset: {
			_ref: string;
			url: string;
		};
		alt?: string;
	};
	gender?: 'male' | 'female' | 'mixed';
	ageGroup: AgeGroup;
	order: number;
	description?: PortableTextBlock[];
	coachingStaff: Coach[];
	players?: Player[];
	fixturesUrl?: string;
	enableFixturesCrawler?: boolean;
	competitionName?: string;
	leagueName?: string;
}

export type TeamsByTab<T extends TeamBase = Team> = {
	seniors: T[];
	reserves: T[];
	juniors: T[];
	masters: T[];
	metros: T[];
};
