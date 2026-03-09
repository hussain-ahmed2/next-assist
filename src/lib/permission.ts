import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc, userAc } from "better-auth/plugins/admin/access";

const statement = {
	...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

export const super_admin = ac.newRole({
	...adminAc.statements,
});

export const org_admin = ac.newRole({
	...adminAc.statements,
});

export const program_manager = ac.newRole({
	...adminAc.statements,
});

export const expert = ac.newRole({
	...userAc.statements,
});

export const member = ac.newRole({
	...userAc.statements,
});

export const user = ac.newRole({
	...userAc.statements,
});
