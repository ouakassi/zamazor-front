import { create } from "zustand";
import { type User } from "../schemas/userSchema";
import { AuthStatus } from "../types";
import { tokenManager } from "../globals/tokenManager";

type AuthState =
	| {
			readonly user: null;
			readonly status: Exclude<AuthStatus, typeof AuthStatus.Authenticated>;
	  }
	| {
			readonly user: Readonly<User>;
			readonly status: typeof AuthStatus.Authenticated;
	  };

export const useAuthStore = create<AuthState>(() => ({
	user: null,
	status: AuthStatus.Loading,
}));

export function useAuthenticatedUser() {
	const auth = useAuthStore();
	if (auth.status !== AuthStatus.Authenticated) {
		throw new Error("Must be authenticated");
	}
	return auth.user;
}

export const clearAuth = () => {
	useAuthStore.setState({ user: null, status: AuthStatus.Unauthenticated });
	tokenManager.clear();
};
