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

interface RequireAuthProps {
	readonly allowedRoles?: readonly ("ADMIN" | "MERCHANT" | "USER")[];
}

export const RequireAuth = ({ allowedRoles }: RequireAuthProps) => {
	const status = useAuthStore((state) => state.status);
	const user = useAuthStore((state) => state.user);
	const location = useLocation();

	if (status === AuthStatus.Loading) return <LoadingScreen />;
	if (status === AuthStatus.Unauthenticated) {
		notify.error("Access Denied", {
			id: "access-denied",
			description: "You must be logged in to view this page.",
		});
		return (
			<Navigate to={APP_ROUTES.AUTH.LOGIN} state={{ from: location }} replace />
		);
	}

	if (allowedRoles && user && !allowedRoles.includes(user.role)) {
		notify.error("Access Denied", {
			id: "unauthorized-role",
			description: "You do not have permission to view this page.",
		});
		return <Navigate to={APP_ROUTES.HOME} replace />;
	}

	return <Outlet />;
};
