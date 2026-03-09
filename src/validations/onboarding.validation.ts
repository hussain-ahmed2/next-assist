import { z } from "zod/v3";

export const onboardingSchema = z.object({
	// Step 1: Personal Identity
	name: z.string().min(2, "Full name is required"),
	email: z.string().email("Professional email is required"),
	phone: z.string().min(10, "Valid phone number is required"),
	organizationName: z.string().min(2, "Organization name is required"),
	memberType: z.literal("org_admin"),

	// Step 2: Verification (Internal OTP Handling)
	otp: z.string().length(6, "OTP must be 6 digits").optional(),

	// Step 3: Company Profile
	legalName: z.string().min(2, "Legal name is required").optional(),
	hqAddress: z.string().min(5, "HQ address is required").optional(),
	taxId: z.string().min(4, "VAT/EIN is required").optional(),

	// Step 4: Domain & Gatekeeping
	allowedDomains: z.array(z.string().regex(/^@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Must be a valid domain starting with @")).optional(),
	isIomEnabled: z.boolean().default(true), // IOM ON = Invite Only

	// Step 5: Billing
	planId: z.string().optional().default("Business"),
	billingAdminEmail: z.string().email().optional(),

	// Step 6: Auth
	ssoProvider: z.enum(["okta", "azure", "google", "none"]).default("none"),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
