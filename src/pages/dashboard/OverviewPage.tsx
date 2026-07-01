import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";
import CONFIG from "@/core/config/constants";
import { APP_ROUTES } from "@/core/routes/paths";
import { getOrderStatusMeta } from "@/features/orders/constants/orderStatus";
import { formatMadCompact } from "@/shared/utils/price";
import { Button } from "@/shared/components/ui/button";
import {
	AlertTriangle,
	ArrowRight,
	BadgeDollarSign,
	ClipboardList,
	Clock3,
	Package,
	ShoppingCart,
	TrendingUp,
} from "lucide-react";
import type { DashboardOverview } from "@/features/dashboard/schemas/dashboardSchema";
import { dashboardService } from "@/features/dashboard/services/dashboardService";
import { buildShippingAddressString } from "@/features/addresses/utils/addressHelpers";

const cardMotion = {
	initial: { opacity: 0, y: 18 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.45 },
};

const formatMoney = (value: number) => formatMadCompact(value);

export const OverviewPage = () => {
	useDocumentTitle(`Dashboard Overview | ${CONFIG.APP_NAME}`);

	const [data, setData] = useState<DashboardOverview | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadDashboardData = async () => {
			try {
				const responseData = await dashboardService.getOverview();
				setData(responseData);
			} catch (error) {
				console.error("Failed to load dashboard overview data:", error);
			} finally {
				setLoading(false);
			}
		};

		loadDashboardData();
	}, []);

	const recentSales = useMemo(() => {
		const orders = data?.recentOrders;
		if (!orders) return [];
		return [...orders].reverse();
	}, [data?.recentOrders]);

	const maxAmount = useMemo(() => {
		if (recentSales.length === 0) return 1;
		return Math.max(...recentSales.map((order) => order.total));
	}, [recentSales]);

	if (loading) {
		return (
			<div className="flex min-h-105x-col items-center justify-center gap-3">
				<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-950" />
				<p className="text-xs font-semibold text-slate-500">
					Loading overview analytics...
				</p>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
				<div className="grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-700 shadow-sm">
					<AlertTriangle className="size-6" />
				</div>
				<h3 className="mt-4 text-base font-semibold text-slate-950">
					Failed to Sync Analytics
				</h3>
				<p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
					Analytics data is temporarily unavailable right now.
				</p>
			</div>
		);
	}

	const totalProductsCount = data.categorySummary.reduce(
		(sum, item) => sum + item.count,
		0,
	);

	return (
		<div className="space-y-6">
			<motion.section
				{...cardMotion}
				className="overflow-hidden rounded-[28px] border border-emerald-900/5 bg-linear-to-br from-emerald-950 via-emerald-900 to-lime-900 p-6 sm:p-7 text-white shadow-[0_20px_60px_-24px_rgba(5,46,22,0.55)]"
			>
				<div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
					<div className="space-y-4">
						<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-50">
							<BadgeDollarSign className="size-3.5" />
							Store overview
						</div>
						<div className="space-y-2">
							<h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
								Store overview
							</h2>
							<p className="max-w-2xl text-sm leading-6 text-emerald-50/80">
								A quick view of sales, stock, and orders.
							</p>
						</div>
						<div className="flex flex-wrap gap-2 pt-1">
							<Button
								asChild
								className="h-10 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50"
							>
								<Link to={APP_ROUTES.DASHBOARD + "/orders"}>
									View Orders
									<ArrowRight className="ml-1.5 size-4" />
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								className="h-10 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10"
							>
								<Link to={APP_ROUTES.DASHBOARD + "/products"}>
									Manage Products
									<Package className="ml-1.5 size-4" />
								</Link>
							</Button>
						</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
							<p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-50/70">
								Orders in motion
							</p>
							<div className="mt-3 flex items-end justify-between">
								<div>
									<p className="text-3xl font-semibold">
										{data.inFlightOrders}
									</p>
									<p className="mt-1 text-xs text-emerald-50/70">
										Pending + completed
									</p>
								</div>
								<ShoppingCart className="size-8 text-emerald-200" />
							</div>
						</div>

						<div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
							<p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-50/70">
								Low stock items
							</p>
							<div className="mt-3 flex items-end justify-between">
								<div>
									<p className="text-3xl font-semibold">
										{data.lowStockProducts.length}
									</p>
									<p className="mt-1 text-xs text-emerald-50/70">
										Needs attention now
									</p>
								</div>
								<AlertTriangle className="size-8 text-lime-200" />
							</div>
						</div>

						<div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
							<p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-50/70">
								Revenue
							</p>
							<div className="mt-3 flex items-end justify-between">
								<div>
									<p className="text-3xl font-semibold">
										{formatMoney(data.totalSales)}
									</p>
									<p className="mt-1 text-xs text-emerald-50/70">
										From settled orders
									</p>
								</div>
								<TrendingUp className="size-8 text-emerald-200" />
							</div>
						</div>

						<div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
							<p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-50/70">
								Average order
							</p>
							<div className="mt-3 flex items-end justify-between">
								<div>
									<p className="text-3xl font-semibold">
										{formatMoney(data.averageOrderValue)}
									</p>
									<p className="mt-1 text-xs text-emerald-50/70">
										Basket value
									</p>
								</div>
								<ClipboardList className="size-8 text-emerald-200" />
							</div>
						</div>
					</div>
				</div>
			</motion.section>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{[
					{
						label: "Total Revenue",
						value: formatMoney(data.totalSales),
						icon: BadgeDollarSign,
						accent: "bg-emerald-50 text-emerald-800",
					},
					{
						label: "Total Orders",
						value: String(data.totalOrders),
						icon: ClipboardList,
						accent: "bg-teal-50 text-teal-800",
					},
					{
						label: "Average Order",
						value: formatMoney(data.averageOrderValue),
						icon: TrendingUp,
						accent: "bg-lime-50 text-lime-800",
					},
					{
						label: "Low Stock",
						value: `${data.lowStockProducts.length} items`,
						icon: AlertTriangle,
						accent: "bg-amber-50 text-amber-700",
					},
				].map((metric, index) => {
					const Icon = metric.icon;

					return (
						<motion.div
							key={metric.label}
							{...cardMotion}
							transition={{ duration: 0.4, delay: index * 0.05 }}
							className="relative overflow-hidden rounded-3xl border border-emerald-900/5 bg-white p-5 shadow-[0_12px_30px_-18px_rgba(5,46,22,0.35)]"
						>
							<div className="flex items-start justify-between gap-4">
								<div className="min-w-0">
									<p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
										{metric.label}
									</p>
									<h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
										{metric.value}
									</h3>
								</div>
								<div
									className={`grid size-11 shrink-0 place-items-center rounded-2xl ${metric.accent}`}
								>
									<Icon className="size-5" />
								</div>
							</div>
						</motion.div>
					);
				})}
			</div>

			<div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
				<motion.section
					{...cardMotion}
					className="rounded-3xl border border-emerald-900/5 bg-white p-6 shadow-md"
				>
					<div className="mb-6 flex items-center justify-between gap-3">
						<div>
							<h3 className="text-base font-semibold text-slate-950">
								Recent Sales Momentum
							</h3>
							<p className="mt-1 text-xs text-slate-500">
								Latest orders visualized as a simple revenue run.
							</p>
						</div>
						<span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
							<Clock3 className="size-3.5 text-slate-400" />
							Last 6 orders
						</span>
					</div>

					{recentSales.length === 0 ? (
						<div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
							No sales recorded yet. Orders will appear here once customers
							start checking out.
						</div>
					) : (
						<div className="space-y-4">
							<div className="flex h-52 items-end gap-3 pt-2">
								{recentSales.map((order) => {
									const barHeight = Math.max(
										12,
										(order.total / maxAmount) * 100,
									);

									return (
										<div
											key={order.id}
											className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
										>
											<div className="text-[10px] font-semibold text-emerald-950 opacity-0 transition-opacity group-hover:opacity-100">
												{formatMoney(order.total)}
											</div>
											<div
												className="w-full rounded-t-2xl bg-linear-to-t from-emerald-950 via-emerald-800 to-lime-600 transition-all duration-300 group-hover:from-emerald-900 group-hover:to-lime-500"
												style={{ height: `${barHeight}%` }}
											/>
											<span className="w-full truncate text-center font-mono text-[10px] text-slate-400">
												{order.id.slice(0, 8).toUpperCase()}
											</span>
										</div>
									);
								})}
							</div>

							<div className="grid gap-2 sm:grid-cols-3">
								{[
									{ label: "Pending", value: data.pendingOrders },
									{ label: "Completed", value: data.completedOrders },
									{ label: "Canceled", value: data.canceledOrders },
								].map((item) => (
									<div key={item.label} className="rounded-2xl bg-slate-50 p-3">
										<p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
											{item.label}
										</p>
										<p className="mt-1 text-lg font-semibold text-slate-950">
											{item.value}
										</p>
									</div>
								))}
							</div>
						</div>
					)}
				</motion.section>

				<div className="space-y-6">
					<motion.section
						{...cardMotion}
						className="rounded-3xl border border-emerald-900/5 bg-white p-6 shadow-md"
					>
						<div className="mb-4 flex items-center justify-between">
							<h3 className="text-base font-semibold text-slate-950">
								Category Mix
							</h3>
							<span className="text-xs text-slate-400">
								{totalProductsCount} products
							</span>
						</div>

						{data.categorySummary.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-400">
								Categories will appear here once products are loaded.
							</div>
						) : (
							<div className="space-y-3">
								{data.categorySummary.map((entry) => {
									const width =
										totalProductsCount > 0
											? Math.max(18, (entry.count / totalProductsCount) * 100)
											: 18;

									return (
										<div key={entry.category} className="space-y-1.5">
											<div className="flex items-center justify-between gap-3">
												<p className="text-sm font-semibold text-slate-950">
													{entry.category}
												</p>
												<p className="text-xs font-semibold text-slate-500">
													{entry.count} products
												</p>
											</div>
											<div className="h-2 rounded-full bg-slate-100">
												<div
													className="h-2 rounded-full bg-linear-to-r from-emerald-900 to-lime-600"
													style={{ width: `${width}%` }}
												/>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</motion.section>

					<motion.section
						{...cardMotion}
						className="rounded-3xl border border-emerald-900/5 bg-white p-6 shadow-md"
					>
						<h3 className="mb-4 text-base font-semibold text-slate-950">
							Low Stock Alerts
						</h3>
						{data.lowStockProducts.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-400">
								No products are close to running out.
							</div>
						) : (
							<div className="space-y-3">
								{data.lowStockProducts.slice(0, 5).map((product) => (
									<div
										key={product.id}
										className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 p-3"
									>
										<div className="min-w-0">
											<p className="truncate text-sm font-semibold text-slate-950">
												{product.name}
											</p>
											<p className="text-[11px] text-slate-500">
												{product.category}
											</p>
										</div>
										<span
											className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
												(product.stockQuantity || 0) === 0
													? "bg-rose-50 text-rose-700"
													: "bg-amber-50 text-amber-700"
											}`}
										>
											{product.stockQuantity || 0} left
										</span>
									</div>
								))}
							</div>
						)}
					</motion.section>
				</div>
			</div>

			<div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
				<motion.section
					{...cardMotion}
					className="rounded-3xl border border-emerald-900/5 bg-white p-6 shadow-md"
				>
					<div className="mb-4 flex items-center justify-between gap-3">
						<div>
							<h3 className="text-base font-semibold text-slate-950">
								Top Products
							</h3>
							<p className="mt-1 text-xs text-slate-500">
								Best sellers based on ordered quantity.
							</p>
						</div>
					</div>

					{data.topProducts.length === 0 ? (
						<div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-400">
							Product performance will show up here once orders start coming in.
						</div>
					) : (
						<div className="space-y-3">
							{data.topProducts.map((product, index) => (
								<div
									key={product.id}
									className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 p-3"
								>
									<div className="flex min-w-0 items-center gap-3">
										<span className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-xs font-black text-emerald-800">
											{index + 1}
										</span>
										<div className="min-w-0">
											<p className="truncate text-sm font-semibold text-slate-950">
												{product.name}
											</p>
											<p className="text-[11px] text-slate-500">
												{product.category}
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-xs font-bold text-slate-950">
											{product.quantity} sold
										</p>
										<p className="text-[11px] text-slate-500">
											{formatMoney(product.revenue)}
										</p>
									</div>
								</div>
							))}
						</div>
					)}
				</motion.section>

				<motion.section
					{...cardMotion}
					className="rounded-3xl border border-emerald-900/5 bg-white p-6 shadow-md"
				>
					<div className="mb-5 flex items-center justify-between gap-3">
						<div>
							<h3 className="text-base font-semibold text-slate-950">
								Recent Orders
							</h3>
							<p className="mt-1 text-xs text-slate-500">
								Latest activity across the store.
							</p>
						</div>
						<p className="text-xs text-slate-500">
							{data.totalOrders} total orders
						</p>
					</div>

					{data.recentOrders.length === 0 ? (
						<div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-400">
							No recent orders yet.
						</div>
					) : (
						<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
							{data.recentOrders.map((order) => {
								const shippingAddress = buildShippingAddressString({
									country: order.shippingCountry,
									street: order.shippingStreet,
									city: order.shippingCity,
									phone: order.phone,
								});

								return (
									<div
										key={order.id}
										className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4"
									>
										<div className="flex items-start justify-between gap-3">
											<div>
												<p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
													Order
												</p>
												<p className="font-mono text-sm font-bold text-slate-950">
													{order.id.slice(0, 8).toUpperCase()}
												</p>
											</div>
											<span
												className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getOrderStatusMeta(order.status).badgeClass}`}
											>
												{getOrderStatusMeta(order.status).label}
											</span>
										</div>
										<div className="mt-3 flex items-center justify-between text-xs text-slate-500">
											<span>
												{new Date(order.createdAt).toLocaleDateString(
													undefined,
													{
														dateStyle: "medium",
													},
												)}
											</span>
											<span className="font-semibold text-slate-950">
												{formatMoney(order.total)}
											</span>
										</div>
										<p className="mt-3 line-clamp-2 text-xs text-slate-500">
											{shippingAddress || "No shipping address provided."}
										</p>
									</div>
								);
							})}
						</div>
					)}
				</motion.section>
			</div>
		</div>
	);
};
