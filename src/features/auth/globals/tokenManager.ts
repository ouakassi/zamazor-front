import type { Token } from "../types";

type TokenListener = (accessToken: Token, resetToken: Token) => void;

const ACCESS_TOKEN_STORAGE_KEY = "zamazor.accessToken";

class TokenManager {
	private accessToken: Token = this.readAccessToken();
	private resetToken: Token = null;
	private listeners = new Set<TokenListener>();

	private readAccessToken(): Token {
		if (typeof window === "undefined") {
			return null;
		}

		const stored = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
		return stored && stored.trim() !== "" ? stored : null;
	}

	public setAccessToken(token: Token) {
		this.accessToken = token;
		if (typeof window !== "undefined") {
			if (token) {
				window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
			} else {
				window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
			}
		}
		this.notify();
	}

	public getAccessToken(): Readonly<Token> {
		return this.accessToken;
	}

	public clear() {
		this.accessToken = null;
		this.resetToken = null;
		if (typeof window !== "undefined") {
			window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
		}
		this.notify();
	}

	public subscribe(listener: TokenListener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener); // unsubscribe
	}

	private notify() {
		this.listeners.forEach((cb) => cb(this.accessToken, this.resetToken));
	}
}

export const tokenManager = new TokenManager();
