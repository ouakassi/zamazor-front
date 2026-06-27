import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { SidebarNav } from "@/shared/components/ui/dashboard-sidebar";
import { Menu, Home, LayoutDashboard, FolderKanban, Inbox } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { authService } from "@/features/auth/services/authService";
import { useAuthStore } from "@/features/auth/stores/authStore";
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
			toast.success("Successfully logged out.");
			navigate(APP_ROUTES.HOME);
		} catch (e) {
			console.error("Logout failed:", e);
			useAuthStore.setState({ user: null, status: 3 });
			toast.success("Logged out.");
			navigate(APP_ROUTES.HOME);
		}
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
						} else {
							navigate(id === "overview" ? "/dashboard" : `/dashboard/${id}`);
						}
						setIsMobileSidebarOpen(false);
					}}
				/>
			</div>

			{/* Main Content Pane */}
			<div className="flex-1 flex flex-col overflow-y-auto">
				{/* Top Navbar */}
				<header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-3">
						<button
							onClick={() => setIsMobileSidebarOpen(true)}
							className="md:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
						>
							<Menu className="size-5" />
						</button>
						<div className="flex items-center gap-2 text-emerald-800">
							{activeTab === "overview" && <LayoutDashboard className="size-5" />}
							{activeTab === "products" && <FolderKanban className="size-5" />}
							{activeTab === "orders" && <Inbox className="size-5" />}
							<h1 className="text-lg font-bold text-slate-900 capitalize">
								{activeTab} Management
							</h1>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<Button
							variant="outline"
							onClick={() => navigate(APP_ROUTES.HOME)}
							className="cursor-pointer rounded-xl h-10 px-4 text-xs font-bold border-emerald-900/10 hover:bg-slate-50"
						>
							<Home className="size-3.5 mr-1.5" />
							Storefront
						</Button>
					</div>
				</header>

				<main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
					<Outlet />
				</main>
			</div>
		</div>
	);
};
