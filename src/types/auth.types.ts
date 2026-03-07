import { auth } from "@/lib/auth";

export type SessionUser = typeof auth.$Infer.Session.user;