import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { SidebarNav } from "@/shared/components/ui/dashboard-sidebar";
import { Menu } from "lucide-react";
import { authService } from "@/features/auth/services/authService";
import { clearAuth } from "@/features/auth/stores/authStore";
import { toast } from "sonner";
import { APP_ROUTES } from "@/core/routes/paths";

export const DashboardLayout = () => {
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	// Determine active route based on path
	const getActiveTab = () => {
		const path = location.pathname;
		if (path.endsWith("/products")) return "products";
		if (path.endsWith("/orders")) return "orders";
		return "overview";
	};

	const activeTab = getActiveTab();

	const handleLogout = async () => {
		try {
			await authService.logout();
			clearAuth();
			toast.success("Successfully logged out.");
		} catch (e) {
			console.error("Logout failed:", e);
			clearAuth();
			toast.success("Logged out.");
		}

		navigate(APP_ROUTES.HOME);
	};

	return (
		<div className="flex h-screen bg-slate-50 font-sans overflow-hidden text-slate-900">
			{/* Desktop Sidebar */}
			<SidebarNav
				className="hidden md:flex"
				activeId={activeTab}
				onSelect={(id) => {
					if (id === "logout") {
						handleLogout();
					} else if (id === "store") {
						navigate(APP_ROUTES.HOME);
					} else {
						navigate(id === "overview" ? "/dashboard" : `/dashboard/${id}`);
					}
				}}
			/>

			{/* Mobile Sidebar overlay */}
			{isMobileSidebarOpen && (
				<div
					onClick={() => setIsMobileSidebarOpen(false)}
					className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs"
				/>
			)}

			{/* Mobile Sidebar drawer */}
			<div
				className={`fixed inset-y-0 left-0 z-50 flex transition-transform duration-300 md:hidden ${
					isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<SidebarNav
					activeId={activeTab}
					onSelect={(id) => {
						if (id === "logout") {
							handleLogout();
						} else if (id === "store") {
							navigate(APP_ROUTES.HOME);
						} else {
							navigate(id === "overview" ? "/dashboard" : `/dashboard/${id}`);
						}
						setIsMobileSidebarOpen(false);
					}}
				/>
			</div>

			{/* Main Content Pane */}
			<div className="relative flex-1 flex flex-col overflow-y-auto">
				<button
					onClick={() => setIsMobileSidebarOpen(true)}
					className="md:hidden fixed left-4 top-4 z-40 rounded-xl border border-slate-200 bg-white/95 p-2.5 text-slate-600 shadow-sm backdrop-blur-sm hover:bg-white hover:text-slate-900"
					aria-label="Open dashboard menu"
				>
					<Menu className="size-5" />
				</button>

				<main className="flex-1 p-4 pt-16 sm:p-6 sm:pt-8 lg:p-8 max-w-7xl w-full mx-auto">
					<Outlet />
				</main>
			</div>
		</div>
	);
};
