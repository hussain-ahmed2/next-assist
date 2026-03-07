/** Base application error — all custom errors extend this */
export class AppError extends Error {
	constructor(
		message: string,
		public readonly code: string = "APP_ERROR",
	) {
		super(message);
		this.name = "AppError";
	}
}

/** Wrong credentials, expired session, etc. */
export class AuthError extends AppError {
	constructor(message = "Incorrect email or password.") {
		super(message, "AUTH_ERROR");
		this.name = "AuthError";
	}
}

/** Resource does not exist */
export class NotFoundError extends AppError {
	constructor(resource = "Resource") {
		super(`${resource} not found.`, "NOT_FOUND");
		this.name = "NotFoundError";
	}
}

/** Email/domain has no registered organization */
export class OrgNotFoundError extends AppError {
	constructor(domain: string) {
		super(
			`No organization is registered for "${domain}". Please contact your administrator.`,
			"ORG_NOT_FOUND",
		);
		this.name = "OrgNotFoundError";
	}
}

/** User is not allowed to perform this action */
export class ForbiddenError extends AppError {
	constructor(message = "You do not have permission to do this.") {
		super(message, "FORBIDDEN");
		this.name = "ForbiddenError";
	}
}

/** Duplicate email, slug conflict, etc. */
export class ConflictError extends AppError {
	constructor(message = "A conflict occurred. Please try again.") {
		super(message, "CONFLICT");
		this.name = "ConflictError";
	}
}
