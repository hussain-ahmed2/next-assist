"use server";

import { db } from "@/db";
import { organizations } from "@/db/schema/organizations";
import { user } from "@/db/schema/auth";
import { type OnboardingData, onboardingSchema } from "@/validations/onboarding.validation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { auditLogs } from "@/db/schema/logs";
import { tc } from "@/lib/async";

export async function submitOnboarding(data: OnboardingData) {
	return await tc(async () => {
		const validated = onboardingSchema.parse(data);

		const orgSlug = validated.organizationName.toLowerCase().replace(/\s+/g, "-");
		const trialStartDate = new Date();
		const trialEndDate = new Date();
		trialEndDate.setFullYear(trialEndDate.getFullYear() + 1); // 1 Year Trial

		return await db.transaction(async (tx) => {
			await tx.insert(organizations).values({
				name: validated.organizationName,
				slug: orgSlug,
				legalName: validated.legalName,
				hqAddress: validated.hqAddress,
				taxId: validated.taxId,
				allowedDomains: validated.allowedDomains,
				isIomEnabled: validated.isIomEnabled,
				plan: (validated.planId as any) || 'Business',
				trialStartDate,
				trialEndDate,
				isPublished: true,
			});

			const result = await auth.api.signUpEmail({
				body: {
					email: validated.email,
					password: "temporaryPassword123!", 
					name: validated.name,
				},
				headers: await headers(),
			});

			if (!result) {
				throw new Error("Failed to create admin user account");
			}

			const adminId = result.user.id;

			await tx.update(user)
				.set({ 
					phone: validated.phone, 
					org_slug: orgSlug,
					role: "org_admin",
					emailVerified: true
				})
				.where(eq(user.email, validated.email));

			if (validated.billingAdminEmail && validated.billingAdminEmail !== validated.email) {
				const billingId = `billing-${crypto.randomUUID()}`;
				await tx.insert(user).values({
					id: billingId,
					email: validated.billingAdminEmail,
					name: `${validated.organizationName} Billing`,
					org_slug: orgSlug,
					role: "member",
					isBillingAdmin: true,
					emailVerified: true,
				} as any);
				
				await tx.insert(auditLogs).values({
					org_slug: orgSlug,
					actor_id: adminId,
					action: "BILLING_ADMIN_CREATED",
					entity_type: "user",
					entity_id: billingId,
					metadata: { email: validated.billingAdminEmail },
				} as any);
			}

			await tx.insert(auditLogs).values({
				org_slug: orgSlug,
				actor_id: adminId,
				action: "ORG_PROVISIONED",
				entity_type: "organization",
				entity_id: orgSlug,
				metadata: { 
                    plan: validated.planId, 
                    iom: validated.isIomEnabled 
                },
			} as any);

			return { message: "Onboarding completed successfully!" };
		});
	});
}
