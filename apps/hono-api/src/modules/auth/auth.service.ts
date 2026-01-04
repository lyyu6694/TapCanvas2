import { getConfig } from "../../config";
import type { AppContext } from "../../types";
import { signJwtHS256 } from "../../jwt";
import { fetchWithHttpDebugLog } from "../../httpDebugLog";
import { sendVerificationCode } from "../email/email.service";
import {
	hashPassword,
	verifyPassword,
	generateVerificationCode,
	generateId,
} from "./password.utils";
import type { UserPayload } from "./auth.schemas";

/**
 * Email authentication functions
 */

/**
 * 发送邮箱验证码
 */
async function sendEmailVerificationCodeInternal(
	c: AppContext,
	email: string,
	purpose: "signup" | "reset" | "verify",
) {
	const normalizedEmail = email.toLowerCase().trim();

	// 检查邮箱是否已注册（仅对 signup）
	if (purpose === "signup") {
		try {
			const existing = await c.env.DB.prepare(
				`SELECT id FROM users WHERE email = ? LIMIT 1`,
			)
				.bind(normalizedEmail)
				.first<any>();
			if (existing) {
				return { success: false, error: "Email already registered" };
			}
		} catch (err) {
			console.error("[auth/email] Error checking existing email", err);
		}
	}

	const code = generateVerificationCode();
	const nowIso = new Date().toISOString();
	const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

	try {
		await c.env.DB.prepare(
			`
      INSERT INTO email_verification_codes (id, email, code, purpose, verified, attempts, created_at, expires_at)
      VALUES (?, ?, ?, ?, 0, 0, ?, ?)
      ON CONFLICT(email, purpose) DO UPDATE SET
        code = excluded.code,
        verified = 0,
        attempts = 0,
        created_at = excluded.created_at,
        expires_at = excluded.expires_at
    `,
		)
			.bind(
				generateId(),
				normalizedEmail,
				code,
				purpose,
				nowIso,
				expiresAt,
			)
			.run();
	} catch (err) {
		console.error("[auth/email] Failed to save verification code", err);
		return { success: false, error: "Failed to generate verification code" };
	}

	// 发送邮件
	const result = await sendVerificationCode(c, normalizedEmail, code, purpose);
	if (!result.success) {
		return {
			success: false,
			error: result.error || "Failed to send verification code",
		};
	}

	return {
		success: true,
		message: `Verification code sent to ${normalizedEmail}`,
	};
}

/**
 * 验证邮箱验证码
 */
async function verifyEmailCodeInternal(
	c: AppContext,
	email: string,
	code: string,
	purpose: "signup" | "reset" | "verify",
) {
	const normalizedEmail = email.toLowerCase().trim();

	try {
		const record = await c.env.DB.prepare(
			`
      SELECT id, code, verified, attempts, expires_at FROM email_verification_codes
      WHERE email = ? AND purpose = ? LIMIT 1
    `,
		)
			.bind(normalizedEmail, purpose)
			.first<any>();

		if (!record) {
			return { success: false, error: "No verification code found" };
		}

		// 检查过期
		if (new Date(record.expires_at) < new Date()) {
			return { success: false, error: "Verification code expired" };
		}

		// 检查尝试次数
		if (record.attempts >= 5) {
			return { success: false, error: "Too many failed attempts" };
		}

		// 验证码错误
		if (record.code !== code) {
			await c.env.DB.prepare(
				`UPDATE email_verification_codes SET attempts = attempts + 1 WHERE id = ?`,
			)
				.bind(record.id)
				.run();
			return { success: false, error: "Invalid verification code" };
		}

		// 标记为已验证
		const nowIso = new Date().toISOString();
		await c.env.DB.prepare(
			`UPDATE email_verification_codes SET verified = 1, verified_at = ? WHERE id = ?`,
		)
			.bind(nowIso, record.id)
			.run();

		return { success: true };
	} catch (err) {
		console.error("[auth/email] Error verifying code", err);
		return { success: false, error: "Database error" };
	}
}

/**
 * 邮箱注册
 */
export async function emailSignupInternal(
	c: AppContext,
	email: string,
	password: string,
	code: string,
	name?: string,
) {
	const config = getConfig(c.env);
	const normalizedEmail = email.toLowerCase().trim();

	// 验证码验证
	const verifyResult = await verifyEmailCodeInternal(c, email, code, "signup");
	if (!verifyResult.success) {
		return {
			success: false,
			error: verifyResult.error,
		};
	}

	// 检查邮箱是否已存在
	try {
		const existing = await c.env.DB.prepare(
			`SELECT id FROM users WHERE email = ? LIMIT 1`,
		)
			.bind(normalizedEmail)
			.first<any>();
		if (existing) {
			return {
				success: false,
				error: "Email already registered",
			};
		}
	} catch (err) {
		console.error("[auth/email] Error checking existing email", err);
	}

	// 密码加密
	const passwordHash = await hashPassword(password);
	const userId = generateId();
	const username = name || normalizedEmail.split("@")[0];
	const nowIso = new Date().toISOString();

	try {
		await c.env.DB.prepare(
			`
      INSERT INTO users (id, login, name, email, password_hash, guest, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?)
    `,
		)
			.bind(
				userId,
				username,
				name || username,
				normalizedEmail,
				passwordHash,
				nowIso,
				nowIso,
			)
			.run();
	} catch (err) {
		console.error("[auth/email] Error creating user", err);
		return { success: false, error: "Failed to create user" };
	}

	// 生成 JWT token
	const payload: UserPayload = {
		sub: userId,
		login: username,
		name: name || username,
		email: normalizedEmail,
		role: null,
		guest: false,
	};

	const token = await signJwtHS256(
		payload,
		config.jwtSecret,
		7 * 24 * 60 * 60,
	);

	return { success: true, token, user: payload };
}

/**
 * 邮箱登录
 */
export async function emailLoginInternal(
	c: AppContext,
	email: string,
	password: string,
) {
	const config = getConfig(c.env);
	const normalizedEmail = email.toLowerCase().trim();

	try {
		const user = await c.env.DB.prepare(
			`SELECT id, login, name, password_hash, email, role FROM users WHERE email = ? LIMIT 1`,
		)
			.bind(normalizedEmail)
			.first<any>();

		if (!user) {
			return {
				success: false,
				error: "Invalid email or password",
			};
		}

		// 验证密码
		const isValid = await verifyPassword(
			password,
			user.password_hash || "",
		);
		if (!isValid) {
			return {
				success: false,
				error: "Invalid email or password",
			};
		}

		// 生成 JWT token
		const payload: UserPayload = {
			sub: user.id,
			login: user.login,
			name: user.name,
			email: user.email,
			role:
				user.role && typeof user.role === "string"
					? user.role.trim() || null
					: null,
			guest: false,
		};

		const token = await signJwtHS256(
			payload,
			config.jwtSecret,
			7 * 24 * 60 * 60,
		);

		return {
			success: true,
			token,
			user: payload,
		};
	} catch (err) {
		console.error("[auth/email] Error during login", err);
		return { success: false, error: "Authentication failed" };
	}
}

/**
 * 重置密码
 */
export async function resetPasswordInternal(
	c: AppContext,
	email: string,
	code: string,
	newPassword: string,
) {
	const normalizedEmail = email.toLowerCase().trim();

	// 验证码验证
	const verifyResult = await verifyEmailCodeInternal(c, email, code, "reset");
	if (!verifyResult.success) {
		return { success: false, error: verifyResult.error };
	}

	try {
		const user = await c.env.DB.prepare(
			`SELECT id FROM users WHERE email = ? LIMIT 1`,
		)
			.bind(normalizedEmail)
			.first<any>();

		if (!user) {
			return { success: false, error: "User not found" };
		}

		// 加密新密码
		const passwordHash = await hashPassword(newPassword);
		const nowIso = new Date().toISOString();

		await c.env.DB.prepare(
			`UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?`,
		)
			.bind(passwordHash, nowIso, user.id)
			.run();

		return { success: true, message: "Password reset successfully" };
	} catch (err) {
		console.error("[auth/email] Error resetting password", err);
		return { success: false, error: "Failed to reset password" };
	}
}

// Export public functions for routes
export { sendEmailVerificationCodeInternal as sendEmailVerificationCode };
export { verifyEmailCodeInternal as verifyEmailCode };

export async function exchangeGithubCode(c: AppContext, code: string) {
	const config = getConfig(c.env);

	if (!config.githubClientId || !config.githubClientSecret) {
		return c.json(
			{
				success: false,
				error: "GitHub OAuth is not configured",
				code: "github_oauth_not_configured",
				missing: {
					GITHUB_CLIENT_ID: !config.githubClientId,
					GITHUB_CLIENT_SECRET: !config.githubClientSecret,
				},
			},
			501,
		);
	}

	const tokenResp = await fetchWithHttpDebugLog(
		c,
		"https://github.com/login/oauth/access_token",
		{
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"User-Agent": "TapCanvas/1.0",
			},
			body: JSON.stringify({
				client_id: config.githubClientId,
				client_secret: config.githubClientSecret,
				code,
			}),
		},
		{ tag: "github:oauth" },
	);

	if (!tokenResp.ok) {
		const text = await tokenResp.text().catch(() => "");
		console.error("[auth/github] token exchange failed", {
			status: tokenResp.status,
			statusText: tokenResp.statusText,
			bodySnippet: text.slice(0, 500),
		});
		return c.json(
			{
				success: false,
				error:
					"Failed to exchange GitHub code: " +
					(tokenResp.statusText || text),
			},
			502,
		);
	}

	const tokenJson = (await tokenResp.json()) as {
		access_token?: string;
	};
	const accessToken = tokenJson.access_token;

	if (!accessToken) {
		return c.json(
			{
				success: false,
				error: "No access token from GitHub",
			},
			502,
		);
	}

	const userResp = await fetchWithHttpDebugLog(
		c,
		"https://api.github.com/user",
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github+json",
				"User-Agent": "TapCanvas/1.0",
			},
		},
		{ tag: "github:user" },
	);

	if (!userResp.ok) {
		const text = await userResp.text().catch(() => "");
		console.error("[auth/github] fetch user failed", {
			status: userResp.status,
			statusText: userResp.statusText,
			bodySnippet: text.slice(0, 500),
		});
		return c.json(
			{
				success: false,
				error:
					"Failed to fetch GitHub user: " +
					(userResp.statusText || text),
			},
			502,
		);
	}

	const user = (await userResp.json()) as {
		id: number | string;
		login: string;
		name?: string | null;
		avatar_url?: string | null;
	};

	let primaryEmail: string | undefined;
	try {
		const emailResp = await fetchWithHttpDebugLog(
			c,
			"https://api.github.com/user/emails",
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: "application/vnd.github+json",
					"User-Agent": "TapCanvas/1.0",
				},
			},
			{ tag: "github:emails" },
		);
		if (emailResp.ok) {
			const emailData = (await emailResp.json()) as any[];
			if (Array.isArray(emailData) && emailData.length > 0) {
				const primary =
					emailData.find((e: any) => e.primary) ?? emailData[0];
				if (primary?.email && typeof primary.email === "string") {
					primaryEmail = primary.email;
				}
			}
		}
	} catch {
		// ignore email errors, keep primaryEmail undefined
	}

	const payload: UserPayload = {
		sub: String(user.id),
		login: user.login,
		name: user.name || user.login,
		avatarUrl: user.avatar_url ?? null,
		email: primaryEmail ?? null,
		role: null,
		guest: false,
	};

	const nowIso = new Date().toISOString();

	try {
		await c.env.DB.prepare(
			`
        INSERT INTO users (id, login, name, avatar_url, email, guest, last_seen_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          login = excluded.login,
          name = excluded.name,
          avatar_url = excluded.avatar_url,
          email = excluded.email,
          guest = 0,
          last_seen_at = excluded.last_seen_at,
          updated_at = excluded.updated_at
      `,
		)
			.bind(
				payload.sub,
				payload.login,
				payload.name,
				payload.avatarUrl,
				payload.email,
				nowIso,
				nowIso,
				nowIso,
			)
			.run();
	} catch (err: any) {
		// Backward-compatible: local DB might not be migrated yet (no last_seen_at/role columns).
		const msg = String(err?.message || "");
		if (msg.includes("no such column") || msg.includes("SQLITE_ERROR")) {
			await c.env.DB.prepare(
				`
          INSERT INTO users (id, login, name, avatar_url, email, guest, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 0, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            login = excluded.login,
            name = excluded.name,
            avatar_url = excluded.avatar_url,
            email = excluded.email,
            guest = 0,
            updated_at = excluded.updated_at
        `,
			)
				.bind(
					payload.sub,
					payload.login,
					payload.name,
					payload.avatarUrl,
					payload.email,
					nowIso,
					nowIso,
				)
				.run();
		} else {
			throw err;
		}
	}

	try {
		const row = await c.env.DB.prepare(
			`SELECT role FROM users WHERE id = ? LIMIT 1`,
		)
			.bind(payload.sub)
			.first<any>();
		payload.role =
			row && typeof row.role === "string" && row.role.trim().length
				? row.role.trim()
				: null;
	} catch {
		payload.role = null;
	}

	const token = await signJwtHS256(
		payload,
		config.jwtSecret,
		7 * 24 * 60 * 60,
	);

	return {
		token,
		user: payload,
	};
}

export async function createGuestUser(c: AppContext, nickname?: string) {
	const config = getConfig(c.env);

	const id = crypto.randomUUID();
	const trimmed =
		typeof nickname === "string" ? nickname.trim().slice(0, 32) : "";
	const normalizedLogin = trimmed
		? trimmed.replace(/[^\w-]/g, "").toLowerCase()
		: "";
	const login = normalizedLogin || `guest_${id.slice(0, 8)}`;
	const name = trimmed || `Guest ${id.slice(0, 4).toUpperCase()}`;

	const nowIso = new Date().toISOString();

	try {
		await c.env.DB.prepare(
			`
        INSERT INTO users (id, login, name, avatar_url, email, guest, last_seen_at, created_at, updated_at)
        VALUES (?, ?, ?, NULL, NULL, 1, ?, ?, ?)
      `,
		)
			.bind(id, login, name, nowIso, nowIso, nowIso)
			.run();
	} catch (err: any) {
		const msg = String(err?.message || "");
		if (msg.includes("no such column") || msg.includes("SQLITE_ERROR")) {
			await c.env.DB.prepare(
				`
          INSERT INTO users (id, login, name, avatar_url, email, guest, created_at, updated_at)
          VALUES (?, ?, ?, NULL, NULL, 1, ?, ?)
        `,
			)
				.bind(id, login, name, nowIso, nowIso)
				.run();
		} else {
			throw err;
		}
	}

	const payload: UserPayload = {
		sub: id,
		login,
		name,
		role: null,
		guest: true,
	};

	try {
		const row = await c.env.DB.prepare(
			`SELECT role FROM users WHERE id = ? LIMIT 1`,
		)
			.bind(payload.sub)
			.first<any>();
		payload.role =
			row && typeof row.role === "string" && row.role.trim().length
				? row.role.trim()
				: null;
	} catch {
		payload.role = null;
	}

	const token = await signJwtHS256(
		payload,
		config.jwtSecret,
		7 * 24 * 60 * 60,
	);

	return {
		token,
		user: payload,
	};
}
