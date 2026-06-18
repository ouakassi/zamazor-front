import type { Token } from "../types";

type TokenListener = (accessToken: Token, resetToken: Token) => void;

class TokenManager {
	private accessToken: Token = null;
	private resetToken: Token = null;
	private listeners = new Set<TokenListener>();

	public setAccessToken(token: Token) {
		this.accessToken = token;
		this.notify();
	}

	public getAccessToken(): Readonly<Token> {
		return this.accessToken;
	}

	public clear() {
		this.accessToken = null;
		this.resetToken = null;
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
