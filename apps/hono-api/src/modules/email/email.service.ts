import type { AppContext } from "../../types";

/**
 * 调用独立的邮件中转服务发送验证码
 * 使用 nodemailer + 163 SMTP 的独立 Node.js 服务
 */
export async function sendVerificationCode(
	c: AppContext,
	email: string,
	code: string,
	purpose: "signup" | "reset" | "verify",
): Promise<{ success: boolean; error?: string }> {
	try {
		const emailRelayUrl = c.env.EMAIL_RELAY_URL || 'http://email-relay:3001';

		const response = await fetch(`${emailRelayUrl}/send-code`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				to: email,
				code,
				purpose,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.error || `HTTP ${response.status}`);
		}

		const data = await response.json();
		console.log(`[email] Verification code sent to ${email} (${purpose}):`, data);

		return {
			success: true,
		};
	} catch (err) {
		const errorMsg = err instanceof Error ? err.message : String(err);
		console.error("[email] Failed to send verification code:", errorMsg);
		return {
			success: false,
			error: "Failed to send verification code",
		};
	}
}
