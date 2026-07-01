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
import { dashboardService, type DashboardOverviewResponse } from "@/features/dashboard/services/dashboardService";

const cardMotion = {
	initial: { opacity: 0, y: 18 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.45 },
};

type OverviewRecentOrder = {
	id: string;
	status: string;
	total: number;
	createdAt: string;
	shippingAddress: string;
};

type OverviewTopProduct = {
	id: string;
	name: string;
	category: string;
	quantity: number;
	revenue: number;
};

type OverviewCategorySummary = {
	category: string;
	count: number;
};

type OverviewLowStock = {
	id: string;
	name: string;
	category: string;
	stock: number;
};

type OverviewModel = {
	totalSales: number;
	averageOrderValue: number;
	totalOrders: number;
	pendingOrders: number;
	paidOrders: number;
	confirmedOrders: number;
	processingOrders: number;
	shippedOrders: number;
	deliveredOrders: number;
	canceledOrders: number;
	refundedOrders: number;
	inFlightOrders: number;
	recentOrders: OverviewRecentOrder[];
	topProducts: OverviewTopProduct[];
	categorySummary: OverviewCategorySummary[];
	lowStockProducts: OverviewLowStock[];
};

const formatMoney = (value: number) => formatMadCompact(value);

type OrderAddressSource = {
	shippingCountry?: string;
	shippingCity?: string;
	shippingStreet?: string;
	phone?: string;
	shippingAddress?: string;
};

const getOrderShippingAddress = (order: OrderAddressSource) => {
	const parts = [order.shippingCountry, order.shippingCity, order.shippingStreet].filter(
		(part): part is string => typeof part === "string" && part.trim().length > 0,
	);

	const address = parts.join(", ");
	const phone = typeof order.phone === "string" && order.phone.trim() ? `Phone: ${order.phone}` : "";

	if (address && phone) {
		return `${address} - ${phone}`;
	}

	return address || phone || order.shippingAddress || "No shipping address provided.";
};

const toNumber = (value: unknown, fallback = 0) => (typeof value === "number" && Number.isFinite(value) ? value : fallback);

const normalizeOverview = (overview: DashboardOverviewResponse): OverviewModel => {
	const metrics = overview.metrics ?? {};

	const recentOrders = (overview.recentOrders ?? []).flatMap((order) => {
		if (!order || typeof order !== "object") return [];

		const id = typeof order.id === "string" ? order.id : "";
		if (!id) return [];

		return [
			{
				id,
				status: typeof order.status === "string" ? order.status : "PENDING",
				total: toNumber(order.total),
				createdAt: typeof order.createdAt === "string" ? order.createdAt : new Date().toISOString(),
				shippingAddress:
					typeof order.shippingAddress === "string" && order.shippingAddress.trim().length > 0
						? order.shippingAddress
						: getOrderShippingAddress(order),
			},
		];
	});

	const topProductsSource = overview.topSellingItems ?? overview.topProducts ?? [];
	const topProducts = topProductsSource.flatMap((item) => {
		if (!item || typeof item !== "object") return [];

		const id = typeof item.id === "string" ? item.id : typeof item.productId === "string" ? item.productId : "";
		if (!id) return [];

		return [
			{
				id,
				name: typeof item.name === "string" && item.name.trim().length > 0 ? item.name : "Unknown product",
				category:
					typeof item.category === "string" && item.category.trim().length > 0 ? item.category : "Uncategorized",
				quantity: toNumber(item.quantitySold ?? item.quantity),
				revenue: toNumber(item.revenue),
			},
		];
	});

	const categorySource = overview.categorySummaries ?? overview.categorySummary ?? [];
	const categorySummary = categorySource.flatMap((entry) => {
		if (!entry || typeof entry !== "object") return [];

		const category =
			typeof entry.category === "string" && entry.category.trim().length > 0
				? entry.category
				: typeof entry.label === "string" && entry.label.trim().length > 0
					? entry.label
					: "Uncategorized";

		return [
			{
				category,
				count: toNumber(entry.count ?? entry.total),
			},
		];
	});

	const lowStockSource = overview.lowStockWarnings ?? overview.lowStockProducts ?? [];
	const lowStockProducts = lowStockSource.flatMap((item) => {
		if (!item || typeof item !== "object") return [];

		const id = typeof item.id === "string" ? item.id : "";
		if (!id) return [];

		return [
			{
				id,
				name: typeof item.name === "string" && item.name.trim().length > 0 ? item.name : "Unknown product",
				category:
					typeof item.category === "string" && item.category.trim().length > 0 ? item.category : "Uncategorized",
				stock: toNumber(item.stock ?? item.quantity),
			},
		];
	});

	const totalSales = toNumber(overview.totalSales ?? metrics.totalSales);
	const averageOrderValue = toNumber(overview.averageOrderValue ?? metrics.averageOrderValue);
	const totalOrders = toNumber(overview.totalOrders ?? metrics.totalOrders ?? recentOrders.length);
	const pendingOrders = toNumber(overview.pendingOrders ?? metrics.pendingOrders);
	const paidOrders = toNumber(overview.paidOrders ?? metrics.paidOrders);
	const confirmedOrders = toNumber(overview.confirmedOrders ?? metrics.confirmedOrders);
	const processingOrders = toNumber(overview.processingOrders ?? metrics.processingOrders);
	const shippedOrders = toNumber(overview.shippedOrders ?? metrics.shippedOrders);
	const deliveredOrders = toNumber(overview.deliveredOrders ?? metrics.deliveredOrders);
	const canceledOrders = toNumber(overview.canceledOrders ?? metrics.canceledOrders);
	const refundedOrders = toNumber(overview.refundedOrders ?? metrics.refundedOrders);
	const inFlightOrders = pendingOrders + paidOrders + confirmedOrders + processingOrders + shippedOrders;

	return {
		totalSales,
		averageOrderValue,
		totalOrders,
		pendingOrders,
		paidOrders,
		confirmedOrders,
		processingOrders,
		shippedOrders,
		deliveredOrders,
		canceledOrders,
		refundedOrders,
		inFlightOrders,
		recentOrders,
		topProducts,
		categorySummary,
		lowStockProducts,
	};
};

export const OverviewPage = () => {
	useDocumentTitle(`Dashboard Overview | ${CONFIG.APP_NAME}`);

	const [overview, setOverview] = useState<OverviewModel | null>(null);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState(false);

	useEffect(() => {
		let isMounted = true;

		const loadData = async () => {
			setLoading(true);
			setLoadError(false);

			const apiOverview = await dashboardService.getOverview();
			if (!isMounted) return;

			if (apiOverview) {
				setOverview(normalizeOverview(apiOverview));
				setLoading(false);
				return;
			}

			setOverview(null);
			setLoadError(true);
			setLoading(false);
		};

		void loadData();

		return () => {
			isMounted = false;
		};
	}, []);

	const recentSales = useMemo(() => {
		if (!overview) return [];
		return [...overview.recentOrders].reverse();
	}, [overview]);

	const maxAmount = recentSales.length > 0 ? Math.max(...recentSales.map((order) => order.total)) : 1;

	if (loading || !overview) {
		if (loadError) {
			return (
				<div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
					<AlertTriangle className="size-8 text-amber-600" />
					<h2 className="text-base font-semibold text-slate-950">Dashboard overview unavailable</h2>
					<p className="max-w-md text-sm text-slate-500">
						The dashboard metrics must come from the backend overview endpoint. Try refreshing once the API is available.
					</p>
					<Button onClick={() => window.location.reload()} className="mt-2 h-10 rounded-xl bg-emerald-900 px-4 text-xs font-semibold text-white hover:bg-emerald-950">
						Refresh
					</Button>
				</div>
			);
		}

		return (
			<div className="flex min-h-[420px] flex-col items-center justify-center gap-3">
				<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-950" />
				<p className="text-xs font-semibold text-slate-500">Loading overview analytics...</p>
			</div>
		);
	}

	const {
		totalSales,
		averageOrderValue,
		totalOrders,
		pendingOrders,
		paidOrders,
		confirmedOrders,
		processingOrders,
		shippedOrders,
		deliveredOrders,
		canceledOrders,
		refundedOrders,
		inFlightOrders,
		recentOrders,
		topProducts,
		categorySummary,
		lowStockProducts,
	} = overview;

	const categoryTotal = categorySummary.reduce((sum, entry) => sum + entry.count, 0);

	return (
		<div className="space-y-6">
			<motion.section
				{...cardMotion}
				className="overflow-hidden rounded-[28px] border border-emerald-900/5 bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 p-6 text-white shadow-[0_20px_60px_-24px_rgba(5,46,22,0.55)] sm:p-7"
			>
				<div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
					<div className="space-y-4">
						<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-50">
							<BadgeDollarSign className="size-3.5" />
							Store overview
						</div>
						<div className="space-y-2">
							<h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">Store overview</h2>
							<p className="max-w-2xl text-sm leading-6 text-emerald-50/80">A quick view of sales, stock, and orders.</p>
						</div>
						<div className="flex flex-wrap gap-2 pt-1">
							<Button asChild className="h-10 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50">
								<Link to={APP_ROUTES.DASHBOARD + "/orders"}>
									View Orders
									<ArrowRight className="ml-1.5 size-4" />
								</Link>
							</Button>
							<Button asChild variant="outline" className="h-10 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10">
								<Link to={APP_ROUTES.DASHBOARD + "/products"}>
									Manage Products
									<Package className="ml-1.5 size-4" />
								</Link>
							</Button>
						</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
							<p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-50/70">Orders in motion</p>
							<div className="mt-3 flex items-end justify-between">
								<div>
									<p className="text-3xl font-semibold">{inFlightOrders}</p>
									<p className="mt-1 text-xs text-emerald-50/70">Pending through shipped</p>
								</div>
								<ShoppingCart className="size-8 text-emerald-200" />
							</div>
						</div>

						<div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
							<p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-50/70">Low stock items</p>
							<div className="mt-3 flex items-end justify-between">
								<div>
									<p className="text-3xl font-semibold">{lowStockProducts.length}</p>
									<p className="mt-1 text-xs text-emerald-50/70">Needs attention now</p>
								</div>
								<AlertTriangle className="size-8 text-lime-200" />
							</div>
						</div>

						<div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
							<p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-50/70">Revenue</p>
							<div className="mt-3 flex items-end justify-between">
								<div>
									<p className="text-3xl font-semibold">{formatMoney(totalSales)}</p>
									<p className="mt-1 text-xs text-emerald-50/70">From settled orders</p>
								</div>
								<TrendingUp className="size-8 text-emerald-200" />
							</div>
						</div>

						<div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
							<p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-50/70">Average order</p>
							<div className="mt-3 flex items-end justify-between">
								<div>
									<p className="text-3xl font-semibold">{formatMoney(averageOrderValue)}</p>
									<p className="mt-1 text-xs text-emerald-50/70">Basket value</p>
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
						value: formatMoney(totalSales),
						icon: BadgeDollarSign,
						accent: "bg-emerald-50 text-emerald-800",
					},
					{
						label: "Total Orders",
						value: String(totalOrders),
						icon: ClipboardList,
						accent: "bg-teal-50 text-teal-800",
					},
					{
						label: "Average Order",
						value: formatMoney(averageOrderValue),
						icon: TrendingUp,
						accent: "bg-lime-50 text-lime-800",
					},
					{
						label: "Low Stock",
						value: `${lowStockProducts.length} items`,
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
									<p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{metric.label}</p>
									<h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{metric.value}</h3>
								</div>
								<div className={`grid size-11 shrink-0 place-items-center rounded-2xl ${metric.accent}`}>
									<Icon className="size-5" />
								</div>
							</div>
						</motion.div>
					);
				})}
			</div>

			<div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
				<motion.section {...cardMotion} className="rounded-3xl border border-emerald-900/5 bg-white p-6 shadow-md">
					<div className="mb-6 flex items-center justify-between gap-3">
						<div>
							<h3 className="text-base font-semibold text-slate-950">Recent Sales Momentum</h3>
							<p className="mt-1 text-xs text-slate-500">Latest orders visualized as a simple revenue run.</p>
						</div>
						<span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
							<Clock3 className="size-3.5 text-slate-400" />
							Last 6 orders
						</span>
					</div>

					{recentSales.length === 0 ? (
						<div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
							No sales recorded yet. Orders will appear here once customers start checking out.
						</div>
					) : (
						<div className="space-y-4">
							<div className="flex h-52 items-end gap-3 pt-2">
								{recentSales.map((order) => {
									const barHeight = Math.max(12, (order.total / maxAmount) * 100);

									return (
										<div key={order.id} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
											<div className="text-[10px] font-semibold text-emerald-950 opacity-0 transition-opacity group-hover:opacity-100">
												{formatMoney(order.total)}
											</div>
											<div
												className="w-full rounded-t-2xl bg-gradient-to-t from-emerald-950 via-emerald-800 to-lime-600 transition-all duration-300 group-hover:from-emerald-900 group-hover:to-lime-500"
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
									{ label: "Pending", value: pendingOrders },
									{ label: "Paid", value: paidOrders },
									{ label: "Completed", value: confirmedOrders + processingOrders + shippedOrders + deliveredOrders },
									{ label: "Canceled", value: canceledOrders + refundedOrders },
								].map((item) => (
									<div key={item.label} className="rounded-2xl bg-slate-50 p-3">
										<p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
										<p className="mt-1 text-lg font-semibold text-slate-950">{item.value}</p>
									</div>
								))}
							</div>
						</div>
					)}
				</motion.section>

				<div className="space-y-6">
					<motion.section {...cardMotion} className="rounded-3xl border border-emerald-900/5 bg-white p-6 shadow-md">
						<div className="mb-4 flex items-center justify-between">
							<h3 className="text-base font-semibold text-slate-950">Category Mix</h3>
							<span className="text-xs text-slate-400">{categoryTotal} products</span>
						</div>

						{categorySummary.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-400">
								Categories will appear here once products are loaded.
							</div>
						) : (
							<div className="space-y-3">
								{categorySummary.map((entry) => {
									const width = Math.max(18, (entry.count / Math.max(1, categorySummary[0]?.count ?? 1)) * 100);

									return (
										<div key={entry.category} className="space-y-1.5">
											<div className="flex items-center justify-between gap-3">
												<p className="text-sm font-semibold text-slate-950">{entry.category}</p>
												<p className="text-xs font-semibold text-slate-500">{entry.count} products</p>
											</div>
											<div className="h-2 rounded-full bg-slate-100">
												<div
													className="h-2 rounded-full bg-gradient-to-r from-emerald-900 to-lime-600"
													style={{ width: `${width}%` }}
												/>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</motion.section>

					<motion.section {...cardMotion} className="rounded-3xl border border-emerald-900/5 bg-white p-6 shadow-md">
						<h3 className="mb-4 text-base font-semibold text-slate-950">Low Stock Alerts</h3>
						{lowStockProducts.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-400">
								No products are close to running out.
							</div>
						) : (
							<div className="space-y-3">
								{lowStockProducts.slice(0, 5).map((product) => (
									<div key={product.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 p-3">
										<div className="min-w-0">
											<p className="truncate text-sm font-semibold text-slate-950">{product.name}</p>
											<p className="text-[11px] text-slate-500">{product.category}</p>
										</div>
										<span
											className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
												product.stock === 0 ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
											}`}
										>
											{product.stock} left
										</span>
									</div>
								))}
							</div>
						)}
					</motion.section>
				</div>
			</div>

			<div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
				<motion.section {...cardMotion} className="rounded-3xl border border-emerald-900/5 bg-white p-6 shadow-md">
					<div className="mb-4 flex items-center justify-between gap-3">
						<div>
							<h3 className="text-base font-semibold text-slate-950">Top Products</h3>
							<p className="mt-1 text-xs text-slate-500">Best sellers based on ordered quantity.</p>
						</div>
					</div>

					{topProducts.length === 0 ? (
						<div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-400">
							Product performance will show up here once orders start coming in.
						</div>
					) : (
						<div className="space-y-3">
							{topProducts.map((product, index) => (
								<div key={product.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 p-3">
									<div className="flex min-w-0 items-center gap-3">
										<span className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-xs font-black text-emerald-800">
											{index + 1}
										</span>
										<div className="min-w-0">
											<p className="truncate text-sm font-semibold text-slate-950">{product.name}</p>
											<p className="text-[11px] text-slate-500">{product.category}</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-xs font-bold text-slate-950">{product.quantity} sold</p>
										<p className="text-[11px] text-slate-500">{formatMoney(product.revenue)}</p>
									</div>
								</div>
							))}
						</div>
					)}
				</motion.section>

				<motion.section {...cardMotion} className="rounded-3xl border border-emerald-900/5 bg-white p-6 shadow-md">
					<div className="mb-5 flex items-center justify-between gap-3">
						<div>
							<h3 className="text-base font-semibold text-slate-950">Recent Orders</h3>
							<p className="mt-1 text-xs text-slate-500">Latest activity across the store.</p>
						</div>
						<p className="text-xs text-slate-500">{totalOrders} total orders</p>
					</div>

					{recentOrders.length === 0 ? (
						<div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-400">
							No recent orders yet.
						</div>
					) : (
						<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
							{recentOrders.map((order) => (
								<div key={order.id} className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Order</p>
											<p className="font-mono text-sm font-bold text-slate-950">{order.id.slice(0, 8).toUpperCase()}</p>
										</div>
										<span
											className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getOrderStatusMeta(order.status).badgeClass}`}
										>
											{getOrderStatusMeta(order.status).label}
										</span>
									</div>
									<div className="mt-3 flex items-center justify-between text-xs text-slate-500">
										<span>{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
										<span className="font-semibold text-slate-950">{formatMoney(order.total)}</span>
									</div>
									<p className="mt-3 line-clamp-2 text-xs text-slate-500">{order.shippingAddress}</p>
								</div>
							))}
						</div>
					)}
				</motion.section>
			</div>
		</div>
	);
};
