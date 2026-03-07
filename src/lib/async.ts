import { AppError } from "./errors";

type S<T> = { success: true; data: T };
type F = { success: false; message: string };

export type Result<T> = S<T> | F;

// Map raw Better Auth technical errors → UX-friendly messages
const BETTER_AUTH_ERRORS: Record<string, string> = {
	"Invalid password hash": "Incorrect email or password.",
	"Invalid password": "Incorrect email or password.",
	"Invalid email or password": "Incorrect email or password.",
	"User not found": "No account found with this email.",
	"Email already exists": "An account with this email already exists.",
	"User already exists": "An account with this email already exists.",
	"Invalid credentials": "Incorrect email or password.",
};

function friendlyMessage(raw: string): string {
	for (const [key, friendly] of Object.entries(BETTER_AUTH_ERRORS)) {
		if (raw.toLowerCase().includes(key.toLowerCase())) return friendly;
	}
	return raw;
}

export async function tc<T>(fn: () => Promise<T>): Promise<Result<T>> {
	try {
		const data = await fn();
		return { success: true, data };
	} catch (e: any) {
		// Our own AppError subclasses already have a clean user-facing message
		if (e instanceof AppError) {
			return { success: false, message: e.message };
		}

		// Better Auth wraps the real error inside body or cause
		const raw =
			e?.body?.message ||
			e?.cause?.detail ||
			e?.cause?.message ||
			e?.message ||
			"Something went wrong. Please try again.";

		return { success: false, message: friendlyMessage(raw) };
	}
}
