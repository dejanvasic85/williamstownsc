import 'server-only';
import logger from '@/lib/logger';
import type { Tenant } from '@/tenants/schema/tenantSchema';
import { getOptionalTenantSecret } from '@/tenants/secrets/tenantSecrets';
import { toEnquiryDetails } from './contactFormMapper';
import type { ContactFormData } from './contactFormSchema';

const log = logger.child({ module: 'stadly-enquiry' });

const sourceValue = 'website';
const requestTimeoutMs = 5000;

type StadlyEnquiry = {
	kind: ContactFormData['contactType'];
	contactName: string;
	contactEmail: string;
	contactPhone: string | undefined;
	message: string;
	source: string;
	details: Record<string, string>;
};

function toStadlyEnquiry(data: ContactFormData): StadlyEnquiry {
	return {
		kind: data.contactType,
		contactName: data.name,
		contactEmail: data.email,
		contactPhone: data.phone,
		message: data.message,
		source: sourceValue,
		details: toEnquiryDetails(data)
	};
}

/**
 * Forward an enquiry to the club's stadly intake endpoint. A club with no endpoint set is
 * skipped, and any failure is logged, never thrown, so the visitor's submission still lands.
 */
export async function sendEnquiryToStadly(data: ContactFormData, tenant: Tenant): Promise<void> {
	const endpoint = getOptionalTenantSecret('enquiryIntakeUrl', tenant);
	if (!endpoint) {
		return;
	}

	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(toStadlyEnquiry(data)),
			signal: AbortSignal.timeout(requestTimeoutMs)
		});

		if (!response.ok) {
			log.error({ status: response.status, tenant: tenant.slug }, 'stadly rejected the enquiry');
		}
	} catch (error) {
		log.error({ err: error, tenant: tenant.slug }, 'failed to send the enquiry to stadly');
	}
}
