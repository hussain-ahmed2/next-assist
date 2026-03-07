import "server-only";
import { db, withOrganization, TxType } from "./index";
import { getOrgSlug } from "@/lib/session";

/**
 * Executes a DB callback within the current user's org schema.
 * If no org slug is found, falls back to the public schema using the base db.
 */
export async function tenantDb<T>(callback: (tx: TxType | typeof db) => Promise<T>): Promise<T> {
	const orgSlug = await getOrgSlug();

	if (!orgSlug) {
		return await callback(db);
	}

	return await withOrganization(orgSlug, (tx) => callback(tx));
}
