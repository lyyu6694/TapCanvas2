/**
 * Password hashing utilities
 * 使用 Web Crypto API（Cloudflare Workers 支持）
 */

export async function hashPassword(password: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	return hashHex;
}

export async function verifyPassword(
	password: string,
	hash: string,
): Promise<boolean> {
	const hashedPassword = await hashPassword(password);
	return hashedPassword === hash;
}

/**
 * Generate a random verification code
 */
export function generateVerificationCode(): string {
	const digits = "0123456789";
	let code = "";
	for (let i = 0; i < 6; i++) {
		code += digits.charAt(Math.floor(Math.random() * digits.length));
	}
	return code;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
