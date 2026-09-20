import type { Tenant } from '../schema/tenantSchema';

export type TenantSecretName =
	keyof Tenant['secrets'] | keyof NonNullable<Tenant['socialPublishing']>;

type SecretSource = NonNullable<Tenant['secrets'][keyof Tenant['secrets']]>;

function findSecretSource(tenant: Tenant, name: TenantSecretName): SecretSource | null {
	const requiredSource = tenant.secrets[name as keyof Tenant['secrets']];
	if (requiredSource) {
		return requiredSource;
	}
	return tenant.socialPublishing?.[name as keyof NonNullable<Tenant['socialPublishing']>] ?? null;
}

function readSecretValue(source: SecretSource): string | null {
	switch (source.from) {
		case 'env': {
			return process.env[source.key] ?? null;
		}
	}
}

/**
 * Read a club secret declared in that club's manifest. The only way anything may read a
 * club secret, so the backing store can change per club without touching call sites.
 */
export function getTenantSecret(name: TenantSecretName, tenant: Tenant): string {
	const source = findSecretSource(tenant, name);
	if (!source) {
		throw new Error(`Tenant "${tenant.slug}" does not configure the secret "${name}"`);
	}
	const value = readSecretValue(source);
	if (value === null) {
		throw new Error(
			`Missing secret "${name}" for tenant "${tenant.slug}": set the ${source.from} variable ${source.key}`
		);
	}
	return value;
}

/** Read a club secret that may not be set, for a feature the club turns on and off. */
export function getOptionalTenantSecret(name: TenantSecretName, tenant: Tenant): string | null {
	const source = findSecretSource(tenant, name);
	return source ? readSecretValue(source) : null;
}
