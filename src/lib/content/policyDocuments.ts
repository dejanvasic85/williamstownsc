import { groq } from 'next-sanity';
import { getSanityClient } from '@/sanity/lib/client';
import type { Tenant } from '@/tenants/schema/tenantSchema';

export type PolicyDocument = {
	_id: string;
	title: string;
	category: string;
	file: {
		url: string;
		size?: number;
		extension?: string;
	};
	description?: string;
	effectiveDate?: string;
	order: number;
};

export type PolicyDocumentsByCategory = {
	category: string;
	documents: PolicyDocument[];
};

type RawPolicyDocument = {
	_id: string;
	title: string;
	category: string;
	file: {
		asset: {
			url: string;
			size?: number;
			extension?: string;
		} | null;
	} | null;
	description?: string;
	effectiveDate?: string;
	order?: number | null;
};

function transformPolicyDocument(doc: RawPolicyDocument): PolicyDocument | null {
	if (!doc.file?.asset?.url) {
		return null;
	}

	return {
		_id: doc._id,
		title: doc.title,
		category: doc.category,
		file: {
			url: doc.file.asset.url,
			size: doc.file.asset.size,
			extension: doc.file.asset.extension
		},
		description: doc.description,
		effectiveDate: doc.effectiveDate,
		order: doc.order ?? 0
	};
}

function groupByCategory(documents: PolicyDocument[]): PolicyDocumentsByCategory[] {
	const groups = documents.reduce(
		(acc, doc) => {
			if (!acc[doc.category]) {
				acc[doc.category] = [];
			}
			acc[doc.category].push(doc);
			return acc;
		},
		{} as Record<string, PolicyDocument[]>
	);

	return Object.entries(groups).map(([category, docs]) => ({
		category,
		documents: docs.sort((a, b) => a.order - b.order)
	}));
}

export async function getPolicyDocuments(tenant: Tenant): Promise<PolicyDocumentsByCategory[]> {
	const policyDocumentsQuery = groq`*[_type == "policyDocument" && published == true] | order(category asc, order asc) {
		_id,
		title,
		category,
		file {
			asset-> {
				url,
				size,
				extension
			}
		},
		description,
		effectiveDate,
		order
	}`;

	const rawDocuments = await getSanityClient(tenant).fetch<RawPolicyDocument[]>(
		policyDocumentsQuery,
		{},
		{ next: { tags: ['policyDocument'] } }
	);

	const documents = rawDocuments
		.map(transformPolicyDocument)
		.filter((doc): doc is PolicyDocument => doc !== null);
	return groupByCategory(documents);
}
