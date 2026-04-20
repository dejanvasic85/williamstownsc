import { promises as fs } from 'fs';
import path from 'path';
import { cache } from 'react';
import { tableDataSchema } from '@/types/table';
import type { TableData } from '@/types/table';

const tableDirectory = path.join(process.cwd(), 'data', 'table');

const loadTable = cache(async function loadTable(slug: string): Promise<TableData | null> {
	if (!/^[a-z0-9-]+$/.test(slug)) {
		return null;
	}

	const filePath = path.resolve(tableDirectory, `${slug}.json`);
	const relativePath = path.relative(tableDirectory, filePath);
	if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
		return null;
	}

	try {
		const fileContents = await fs.readFile(filePath, 'utf-8');
		return tableDataSchema.parse(JSON.parse(fileContents));
	} catch {
		return null;
	}
});

export async function getTableForTeam(slug: string): Promise<TableData | null> {
	return loadTable(slug);
}
