#!/usr/bin/env tsx

import { faker } from '@faker-js/faker';
import { createClient } from '@sanity/client';
import { Command } from 'commander';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
	projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1ougwkz1',
	dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
	token: process.env.SANITY_API_TOKEN,
	useCdn: false,
	apiVersion: '2024-01-01'
});

const areaOfPitchValues = ['goalkeeper', 'defender', 'midfielder', 'forward'];

const positionsByArea = {
	goalkeeper: ['Goalkeeper'],
	defender: ['Centre Back', 'Left Back', 'Right Back', 'Sweeper'],
	midfielder: [
		'Central Midfielder',
		'Defensive Midfielder',
		'Attacking Midfielder',
		'Left Midfielder',
		'Right Midfielder'
	],
	forward: ['Striker', 'Centre Forward', 'Left Winger', 'Right Winger', 'Second Striker']
};

const coachingTitles = ['Head Coach', 'Assistant Coach', 'Goalkeeper Coach', 'Fitness Coach'];

async function uploadImageFromUrl(imageUrl: string, altText: string) {
	try {
		const response = await fetch(imageUrl);
		const buffer = await response.arrayBuffer();
		const asset = await client.assets.upload('image', Buffer.from(buffer), {
			filename: `mock-${Date.now()}.jpg`
		});

		return {
			_type: 'image',
			asset: {
				_type: 'reference',
				_ref: asset._id
			},
			alt: altText
		};
	} catch (error) {
		console.error('Error uploading image:', error);
		throw error;
	}
}

async function createPerson() {
	const firstName = faker.person.firstName();
	const lastName = faker.person.lastName();
	const name = `${firstName} ${lastName}`;

	const photo = await uploadImageFromUrl(
		`https://i.pravatar.cc/300?u=${encodeURIComponent(name)}`,
		`Photo of ${name}`
	);

	const person = {
		_type: 'person',
		name,
		photo,
		dateOfBirth: faker.date.birthdate({ min: 15, max: 45, mode: 'age' }).toISOString().split('T')[0]
	};

	const result = await client.create(person);
	console.log(`✓ Created person: ${name}`);
	return result;
}

async function createCoach(personRef: { _type: string; _ref: string }) {
	return {
		_type: 'coach',
		_key: faker.string.uuid(),
		person: personRef,
		title: faker.helpers.arrayElement(coachingTitles)
	};
}

async function createPlayer(personRef: { _type: string; _ref: string }, shirtNumber: number) {
	const areaOfPitch = faker.helpers.arrayElement(areaOfPitchValues) as keyof typeof positionsByArea;
	const position = faker.helpers.arrayElement(positionsByArea[areaOfPitch]);

	return {
		_type: 'player',
		_key: faker.string.uuid(),
		person: personRef,
		shirtNumber,
		position,
		areaOfPitch,
		isCaptain: shirtNumber === 1,
		isViceCaptain: shirtNumber === 2,
		intro: [
			{
				_type: 'block',
				_key: faker.string.uuid(),
				style: 'normal',
				children: [
					{
						_type: 'span',
						_key: faker.string.uuid(),
						text: faker.lorem.paragraph()
					}
				]
			}
		]
	};
}

async function generateTeam() {
	console.log('\n🏆 Generating team...');

	const teamName = `${faker.location.city()} ${faker.helpers.arrayElement(['FC', 'United', 'City', 'Rovers', 'Wanderers'])}`;
	const teamPhoto = await uploadImageFromUrl(
		`https://picsum.photos/seed/${encodeURIComponent(teamName)}/800/600`,
		`${teamName} team photo`
	);

	const coachingStaff = [];
	for (let i = 0; i < 3; i++) {
		const person = await createPerson();
		const coach = await createCoach({ _type: 'reference', _ref: person._id });
		coachingStaff.push(coach);
	}

	const players = [];
	const playerCount = faker.number.int({ min: 15, max: 25 });
	for (let i = 1; i <= playerCount; i++) {
		const person = await createPerson();
		const player = await createPlayer({ _type: 'reference', _ref: person._id }, i);
		players.push(player);
	}

	const team = {
		_type: 'team',
		name: teamName,
		photo: teamPhoto,
		order: faker.number.int({ min: 1, max: 10 }),
		description: [
			{
				_type: 'block',
				_key: faker.string.uuid(),
				style: 'normal',
				children: [
					{
						_type: 'span',
						_key: faker.string.uuid(),
						text: faker.lorem.paragraphs(2)
					}
				]
			}
		],
		coachingStaff,
		players
	};

	const result = await client.create(team);
	console.log(
		`✓ Created team: ${teamName} with ${playerCount} players and ${coachingStaff.length} coaches`
	);
	return result;
}

async function generateNewsArticle() {
	console.log('\n📰 Generating news article...');

	const title = faker.lorem.sentence({ min: 5, max: 10 }).replace(/\.$/, '');
	const featuredImage = await uploadImageFromUrl(
		`https://picsum.photos/seed/${encodeURIComponent(title)}/1200/800`,
		`Featured image for ${title}`
	);

	const article = {
		_type: 'newsArticle',
		title,
		slug: {
			_type: 'slug',
			current: faker.helpers.slugify(title).toLowerCase()
		},
		publishedAt: faker.date.recent({ days: 30 }).toISOString(),
		featuredImage,
		excerpt: faker.lorem.paragraph().substring(0, 200),
		content: [
			{
				_type: 'block',
				_key: faker.string.uuid(),
				style: 'normal',
				children: [
					{
						_type: 'span',
						_key: faker.string.uuid(),
						text: faker.lorem.paragraphs(3)
					}
				]
			}
		],
		featured: faker.datatype.boolean()
	};

	const result = await client.create(article);
	console.log(`✓ Created news article: ${title}`);
	return result;
}

async function generateProgram() {
	console.log('\n⚽ Generating football program...');

	const programName = `${faker.helpers.arrayElement(['Junior', 'Youth', 'Senior', 'Development'])} ${faker.helpers.arrayElement(['Skills', 'Training', 'Academy', 'Program'])}`;
	const startDate = faker.date.soon({ days: 30 });
	const endDate = faker.date.future({ years: 1, refDate: startDate });

	const programImage = await uploadImageFromUrl(
		`https://picsum.photos/seed/${encodeURIComponent(programName)}/800/600`,
		`${programName} image`
	);

	const minAge = faker.number.int({ min: 5, max: 12 });
	const maxAge = minAge + faker.number.int({ min: 2, max: 10 });

	const program = {
		_type: 'program',
		name: programName,
		slug: {
			_type: 'slug',
			current: faker.helpers.slugify(programName).toLowerCase()
		},
		startDate: startDate.toISOString().split('T')[0],
		endDate: endDate.toISOString().split('T')[0],
		minAge,
		maxAge,
		image: programImage,
		description: faker.lorem.paragraph(),
		active: true
	};

	const result = await client.create(program);
	console.log(`✓ Created program: ${programName} (Ages ${minAge}-${maxAge})`);
	return result;
}

async function generateSponsor() {
	console.log('\n💼 Generating sponsor...');

	const companyName = faker.company.name();
	const logo = await uploadImageFromUrl(
		`https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&size=400&background=random`,
		`${companyName} logo`
	);

	const sponsor = {
		_type: 'sponsor',
		name: companyName,
		logo,
		type: faker.helpers.arrayElement(['Principal', 'Major', 'Community Partner']),
		description: faker.company.catchPhrase(),
		website: faker.internet.url(),
		order: faker.number.int({ min: 1, max: 100 })
	};

	const result = await client.create(sponsor);
	console.log(`✓ Created sponsor: ${companyName}`);
	return result;
}

const program = new Command();

program
	.name('generate-mock-data')
	.description('Generate mock data for Sanity CMS')
	.version('1.0.0');

program
	.option('--team', 'Generate a mock team with players and coaches')
	.option('--news', 'Generate a mock news article')
	.option('--program', 'Generate a mock football program')
	.option('--sponsor', 'Generate a mock sponsor')
	.option('--all', 'Generate all mock data types')
	.parse(process.argv);

const options = program.opts();

async function main() {
	if (!process.env.SANITY_API_TOKEN) {
		console.error(
			'❌ Error: SANITY_API_TOKEN environment variable is not set. Please add it to your .env file.'
		);
		process.exit(1);
	}

	console.log('🚀 Starting mock data generation...\n');

	try {
		if (options.all) {
			await generateTeam();
			await generateNewsArticle();
			await generateProgram();
			await generateSponsor();
		} else {
			if (options.team) await generateTeam();
			if (options.news) await generateNewsArticle();
			if (options.program) await generateProgram();
			if (options.sponsor) await generateSponsor();
		}

		if (!options.team && !options.news && !options.program && !options.sponsor && !options.all) {
			console.log('⚠️  No options specified. Use --help to see available options.');
			program.help();
		}

		console.log('\n✅ Mock data generation completed!\n');
	} catch (error) {
		console.error('\n❌ Error generating mock data:', error);
		process.exit(1);
	}
}

main();
