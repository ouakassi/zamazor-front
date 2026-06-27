import CONFIG from "@/core/config/constants";
import { Button } from "@/shared/components/ui/button";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";
import { useNavigate } from "react-router";
import { APP_ROUTES } from "@/core/routes/paths";
import {
	BarChart3Icon,
	BoxIcon,
	ClipboardListIcon,
	ShoppingCartIcon,
	UsersIcon,
} from "lucide-react";

const stats = [
	{ label: "Orders", value: "0", icon: ShoppingCartIcon },
	{ label: "Products", value: "0", icon: BoxIcon },
	{ label: "Customers", value: "0", icon: UsersIcon },
];

export const DashboardPage = () => {
	useDocumentTitle(`Dashboard | ${CONFIG.APP_NAME}`);
	const navigate = useNavigate();

	return (
		<main className="min-h-screen bg-slate-50 text-slate-950">
			<header className="border-b border-slate-200 bg-white">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<div>
						<p className="text-sm font-medium text-slate-500">Admin</p>
						<h1 className="text-xl font-bold">Dashboard</h1>
					</div>
					<div className="flex items-center gap-2.5">
						<Button variant="outline" onClick={() => navigate(APP_ROUTES.HOME)} className="cursor-pointer rounded-xl">
							View Storefront
						</Button>
						<Button className="bg-emerald-900 hover:bg-emerald-950 text-white font-semibold rounded-xl cursor-pointer">
							New product
						</Button>
					</div>
				</div>
			</header>

			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<section className="grid gap-4 md:grid-cols-3">
					{stats.map(({ label, value, icon: Icon }) => (
						<div
							key={label}
							className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
						>
							<div className="flex items-center justify-between">
								<p className="text-sm font-medium text-slate-500">{label}</p>
								<Icon className="size-5 text-slate-400" aria-hidden="true" />
							</div>
							<p className="mt-4 text-3xl font-bold">{value}</p>
						</div>
					))}
				</section>

				<section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
					<div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
						<div className="flex items-center gap-3">
							<BarChart3Icon className="size-5 text-slate-500" aria-hidden="true" />
							<h2 className="font-bold">Sales overview</h2>
						</div>
						<div className="mt-6 grid h-64 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
							Analytics will appear here when orders are connected.
						</div>
					</div>

					<div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
						<div className="flex items-center gap-3">
							<ClipboardListIcon
								className="size-5 text-slate-500"
								aria-hidden="true"
							/>
							<h2 className="font-bold">Next setup steps</h2>
						</div>
						<ul className="mt-5 space-y-3 text-sm text-slate-600">
							<li className="rounded-lg bg-slate-50 p-3">Connect product API</li>
							<li className="rounded-lg bg-slate-50 p-3">Add order management</li>
							<li className="rounded-lg bg-slate-50 p-3">Add customer list</li>
						</ul>
					</div>
				</section>
			</div>
		</main>
	);
};
