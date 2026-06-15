export type Token = string | null;

export const AuthStatus = {
	Loading: "loading",
	Authenticated: "authenticated",
	Unauthenticated: "unauthenticated",
} as const;
export type AuthStatus = (typeof AuthStatus)[keyof typeof AuthStatus];
