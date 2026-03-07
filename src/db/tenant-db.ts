import "server-only";
import { db, withOrganization } from "./index";
import { getOrgSlug } from "@/lib/session";

/**
 * Executes a DB operation within the current user's organization schema.
 * If no organization is found in the session, it defaults to the 'public' schema.
 */
export async function tenantDb<T>(callback: (tx: typeof db) => Promise<T>): Promise<T> {
	const orgSlug = await getOrgSlug();

	if (!orgSlug) {
		// Fallback to public schema for non-org users (though most learning data should be scoped)
		return await callback(db);
	}

	return await withOrganization(orgSlug, () => callback(db));
}
