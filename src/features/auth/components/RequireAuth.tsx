import { Navigate, Outlet, useLocation } from "react-router";
import { Spinner } from "@/shared/components/ui/spinner";
import { useAuthStore } from "../stores/authStore";
import { AuthStatus } from "../types";
import { notify } from "@/lib/notify";
import { APP_ROUTES } from "@/core/routes/paths";

const LoadingScreen = () => (
	<div
		className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80"
		role="status"
		aria-live="polite"
	>
		<Spinner size="medium">
			<span className="mt-5 text-xs">Loading your account…</span>
		</Spinner>
	</div>
);

export const RequireAuth = () => {
	const status = useAuthStore((state) => state.status);
	const location = useLocation();

	if (status === AuthStatus.Loading) return <LoadingScreen />;
	if (status === AuthStatus.Unauthenticated) {
		notify.error("Access Denied", {
			id: "auth-denied",
			description: "You must be logged in to view this page.",
		});
		return (
			<Navigate to={APP_ROUTES.AUTH.LOGIN} state={{ from: location }} replace />
		);
	}
	return <Outlet />;
};
