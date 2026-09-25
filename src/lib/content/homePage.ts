import { groq } from 'next-sanity';
import { getSanityClient } from '@/sanity/lib/client';
import { HomePage } from '@/sanity/sanity.types';
import type { Tenant } from '@/tenants/schema/tenantSchema';

export async function getHomePageData(tenant: Tenant): Promise<HomePage | null> {
	const data = await getSanityClient(tenant).fetch<HomePage>(
		groq`*[_type == "homePage" && _id == "homePage"][0]{
	  keyDatesSection
	}`,
		{},
		{ next: { tags: ['page', 'homePage'] } }
	);

	return data;
}
