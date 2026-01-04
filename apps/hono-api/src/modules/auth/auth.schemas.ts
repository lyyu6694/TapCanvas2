import { z } from "zod";

export const UserPayloadSchema = z.object({
	sub: z.string(),
	login: z.string(),
	name: z.string().optional(),
	avatarUrl: z.string().nullable().optional(),
	email: z.string().nullable().optional(),
	role: z.string().nullable().optional(),
	guest: z.boolean().default(false),
});

export type UserPayload = z.infer<typeof UserPayloadSchema>;

// GitHub OAuth
export const GithubExchangeRequestSchema = z.object({
	code: z.string(),
});

// Email signup
export const EmailSignupRequestSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	code: z.string().length(6, "Verification code must be 6 characters"),
	name: z.string().optional(),
});

// Email login
export const EmailLoginRequestSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z.string(),
});

// Send verification code
export const SendVerificationCodeRequestSchema = z.object({
	email: z.string().email("Invalid email format"),
	purpose: z.enum(["signup", "reset", "verify"]),
});

// Verify code
export const VerifyCodeRequestSchema = z.object({
	email: z.string().email("Invalid email format"),
	code: z.string().length(6, "Verification code must be 6 characters"),
	purpose: z.enum(["signup", "reset", "verify"]),
});

// Reset password
export const ResetPasswordRequestSchema = z.object({
	email: z.string().email("Invalid email format"),
	code: z.string().length(6, "Verification code must be 6 characters"),
	newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const AuthResponseSchema = z.object({
	token: z.string(),
	user: UserPayloadSchema,
});

export const VerificationResponseSchema = z.object({
	success: boolean,
	message: z.string().optional(),
});

export const GuestLoginRequestSchema = z.object({
	nickname: z.string().optional(),
});
