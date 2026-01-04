import type { WorkerEnv } from "./types";

export type AppConfig = {
	jwtSecret: string;
	githubClientId: string | null;
	githubClientSecret: string | null;
	loginUrl: string | null;
	emailRelayUrl: string | null;
};

export function getConfig(env: WorkerEnv): AppConfig {
	return {
		jwtSecret: env.JWT_SECRET || "dev-secret",
		githubClientId: env.GITHUB_CLIENT_ID ?? null,
		githubClientSecret: env.GITHUB_CLIENT_SECRET ?? null,
		loginUrl: env.LOGIN_URL ?? null,
		emailRelayUrl: env.EMAIL_RELAY_URL ?? "http://email-relay:3001",
	};
}
