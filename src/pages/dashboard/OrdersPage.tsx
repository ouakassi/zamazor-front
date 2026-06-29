import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";
import CONFIG from "@/core/config/constants";
import { orderService, type BackendOrder } from "@/features/orders/services/orderService";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { Tooltip } from "@/shared/components/ui/tooltip";
import { isSystemError } from "@/shared/types";
import { ORDER_STATUS_OPTIONS, getOrderStatusMeta, isFinalOrderStatus } from "@/features/orders/constants/orderStatus";
import { parseShippingAddressFallback } from "@/features/addresses/utils/addressHelpers";
import { formatMadCompact } from "@/shared/utils/price";
import { ORDER_STATUSES } from "@/features/orders/constants/orderStatus";
import {
	AlertTriangle,
	BadgeDollarSign,
	CheckCircle2,
	Eye,
	Folder,
	Clock3,
	RefreshCw,
	Search,
	X,
} from "lucide-react";

const ORDERS_PER_PAGE = 8;

const cardMotion = {
	initial: { opacity: 0, y: 16 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.35 },
};

const formatMoney = (value: number) => formatMadCompact(value);

const getOrderItemUnitPrice = (item: BackendOrder["items"][number]) =>
	item.unitPrice ?? item.product?.price ?? 0;

const normalizeOrderStatus = (status: string) => {
	const upper = status?.toUpperCase?.() || "";
	return ORDER_STATUSES.includes(upper as (typeof ORDER_STATUSES)[number]) ? upper : "PENDING";
};

const getOrderSortParam = (sortBy: string) => {
	if (sortBy === "oldest") return ["createdAt,asc", "id,asc"];
	if (sortBy === "total-asc") return ["total,asc", "createdAt,desc"];
	if (sortBy === "total-desc") return ["total,desc", "createdAt,desc"];
	if (sortBy === "status") return ["status,asc", "createdAt,desc"];
	return ["createdAt,desc", "id,asc"];
};

const ADMIN_ORDER_STATUS_OPTIONS = ORDER_STATUS_OPTIONS.filter((option) => option.value !== "CANCELED");

const formatShippingDetails = (order: BackendOrder | null | undefined) => {
	const parsed = parseShippingAddressFallback(order?.shippingAddress);
	const street = (order?.shippingStreet || parsed.street || "").trim();
	const city = (order?.shippingCity || parsed.city || "").trim();
	const country = (order?.shippingCountry || parsed.country || "Morocco").trim();
	const phone = (order?.phone || parsed.phone || "").trim();
	const phoneLabel = phone ? `${country.toLowerCase() === "morocco" ? "🇲🇦 " : ""}${phone}` : "";

	return {
		street,
		city,
		country,
		phone,
		fullAddress: [street, city, country].filter(Boolean).join(", "),
		phoneLabel,
		tooltipLabel: [street, city, country, phone ? `Phone: ${phoneLabel}` : ""].filter(Boolean).join(" • "),
	};
};

export const OrdersPage = () => {
	useDocumentTitle(`Orders Management | ${CONFIG.APP_NAME}`);

	const [orders, setOrders] = useState<BackendOrder[]>([]);
	const [tableOrders, setTableOrders] = useState<BackendOrder[]>([]);
	const [tableTotalElements, setTableTotalElements] = useState(0);
	const [tableTotalPages, setTableTotalPages] = useState(1);
	const [loading, setLoading] = useState(true);
	const [selectedOrder, setSelectedOrder] = useState<BackendOrder | null>(null);
	const [updatingStatusOrderId, setUpdatingStatusOrderId] = useState<string | null>(null);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirmTitle, setConfirmTitle] = useState("");
	const [confirmDesc, setConfirmDesc] = useState("");
	const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
	const [confirmDestructive, setConfirmDestructive] = useState(false);
	const [confirmText, setConfirmText] = useState("Continue");

	const [orderSearch, setOrderSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [sortBy, setSortBy] = useState("newest");
	const [orderPage, setOrderPage] = useState(1);

	const loadTableData = useCallback(async () => {
		try {
			const result = await orderService.getAllOrdersPage({
				page: orderPage,
				size: ORDERS_PER_PAGE,
				status: statusFilter !== "all" ? statusFilter : undefined,
				sort: getOrderSortParam(sortBy),
			});

			setTableOrders(result.items);
			setTableTotalElements(result.totalElements);
			setTableTotalPages(Math.max(1, result.totalPages));
		} catch (error) {
			console.error("Failed to load dashboard orders table:", error);
			setTableOrders([]);
			setTableTotalElements(0);
			setTableTotalPages(1);
		}
	}, [orderPage, sortBy, statusFilter]);

	const loadData = useCallback(async () => {
		setLoading(true);
		try {
			const data = await orderService.getAllOrders();
			setOrders(data);
			await loadTableData();
		} catch (error) {
			console.error("Failed to load dashboard orders:", error);
			toast.error("Failed to refresh orders list.");
		} finally {
			setLoading(false);
		}
	}, [loadTableData]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		void loadData();
	}, [loadData]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		void loadTableData();
	}, [loadTableData]);

	const showConfirm = (
		title: string,
		desc: string,
		action: () => void,
		isDestructive = false,
		confirmLabel = "Continue",
	) => {
		setConfirmTitle(title);
		setConfirmDesc(desc);
		setConfirmAction(() => action);
		setConfirmDestructive(isDestructive);
		setConfirmText(confirmLabel);
		setConfirmOpen(true);
	};

	const handleChangeOrderStatus = useCallback(
		(orderId: string, nextStatus: string) => {
			const order = orders.find((entry) => entry.id === orderId);
			if (!order || order.status === nextStatus) {
				return;
			}

			const currentStatus = getOrderStatusMeta(order.status).label;
			const targetStatus = getOrderStatusMeta(nextStatus).label;
			const isIrreversible = isFinalOrderStatus(nextStatus);

			showConfirm(
				isIrreversible ? "Confirm Final Status" : "Update Order Status",
				isIrreversible
					? `Change order ${order.id.slice(0, 8).toUpperCase()} from ${currentStatus} to ${targetStatus}? This is a final status and cannot be undone.`
					: `Change order ${order.id.slice(0, 8).toUpperCase()} from ${currentStatus} to ${targetStatus}?`,
				async () => {
					setUpdatingStatusOrderId(orderId);
					try {
						const result = await orderService.changeOrderStatus(orderId, nextStatus);
						if (!result) {
							toast.error("Failed to update order status.");
							return;
						}

						if (isSystemError(result)) {
							toast.error(result.title, {
								description: result.detail || result.description || "The backend rejected this status change.",
							});
							return;
						}

						toast.success(`Order moved to ${targetStatus}.`);
						await loadData();

						if (selectedOrder?.id === orderId) {
							setSelectedOrder(result);
						}
					} catch (error) {
						console.error("Order status update failed:", error);
						toast.error("Could not update this order.");
					} finally {
						setUpdatingStatusOrderId(null);
					}
				},
				isIrreversible,
				isIrreversible ? "Confirm" : "Update Status",
			);
		},
		[loadData, orders, selectedOrder?.id],
	);

	const handleCancelOrder = (orderId: string) => {
		const order = orders.find((o) => o.id === orderId);
		const orderLabel = order ? order.id.slice(0, 8).toUpperCase() : "this order";

		showConfirm(
			"Cancel Order",
			`Are you sure you want to cancel order ${orderLabel}? This action updates the status permanently.`,
			async () => {
				try {
					const success = await orderService.cancelOrder(orderId);
					if (!success) {
						toast.error("Failed to cancel order.");
						return;
					}

					toast.success("Order cancelled successfully.");
					await loadData();

					if (selectedOrder?.id === orderId) {
						const updated = await orderService.getOrderById(orderId);
						setSelectedOrder(updated);
					}
				} catch (error) {
					console.error("Order cancellation failed:", error);
					toast.error("An error occurred while cancelling.");
				}
			},
			true,
			"Cancel Order",
		);
	};

	const normalizedSearch = orderSearch.trim().toLowerCase();

	const filteredOrders = useMemo(() => {
		return tableOrders.filter((order) => {
			if (!normalizedSearch) return true;

			const itemMatch = order.items.some((item) =>
				(item.product?.name || "").toLowerCase().includes(normalizedSearch),
			);

			return (
				order.id.toLowerCase().includes(normalizedSearch) ||
				(order.shippingAddress || "").toLowerCase().includes(normalizedSearch) ||
				order.status.toLowerCase().includes(normalizedSearch) ||
				itemMatch
			);
		});
	}, [normalizedSearch, tableOrders]);

	const totalOrderPages = tableTotalPages;
	const safeOrderPage = Math.min(orderPage, totalOrderPages);
	const paginatedOrders = filteredOrders;

	const isFilterActive = orderSearch !== "" || statusFilter !== "all" || sortBy !== "newest";

	const resetFilters = () => {
		setOrderSearch("");
		setStatusFilter("all");
		setSortBy("newest");
		setOrderPage(1);
	};

	const statusCounts = useMemo(
		() =>
			orders.reduce<Record<string, number>>((acc, order) => {
				acc[order.status] = (acc[order.status] || 0) + 1;
				return acc;
			}, {}),
		[orders],
	);

	const pendingOrders = statusCounts.PENDING || 0;
	const confirmedOrders = statusCounts.CONFIRMED || 0;
	const processingOrders = statusCounts.PROCESSING || 0;
	const shippedOrders = statusCounts.SHIPPED || 0;
	const inProgressOrders = confirmedOrders + processingOrders + shippedOrders;
	const settledOrders = orders.filter((order) => ["PAID", "COMPLETED", "DELIVERED"].includes(order.status));
	const totalSales = settledOrders.reduce((sum, order) => sum + (order.total || 0), 0);
	const canChangeStatus = (status: string) => !isFinalOrderStatus(normalizeOrderStatus(status));

	if (loading && orders.length === 0) {
		return (
			<div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
				<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-950" />
				<p className="text-xs font-semibold text-slate-500">Loading orders registry...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div className="space-y-1">
					<p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-800">Orders</p>
					<h2 className="text-2xl font-playfair text-slate-950 sm:text-3xl">Order list</h2>
					<p className="max-w-2xl text-sm text-slate-500">Filter, sort, and review checkout activity.</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						onClick={() => void loadData()}
						className="h-10 rounded-xl border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold"
					>
						<RefreshCw className="mr-1.5 size-4" />
						Refresh
					</Button>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{[
					{
						label: "Total Orders",
						value: orders.length.toString(),
						subtitle: "Across the registry",
						accent: "bg-slate-50 text-slate-700",
						icon: Folder,
					},
					{
						label: "Pending",
						value: pendingOrders.toString(),
						subtitle: "Waiting for action",
						accent: "bg-amber-50 text-amber-700",
						icon: Clock3,
					},
					{
						label: "In Progress",
						value: inProgressOrders.toString(),
						subtitle: "Confirmed, processing, shipped",
						accent: "bg-sky-50 text-sky-700",
						icon: CheckCircle2,
					},
					{
						label: "Revenue",
						value: formatMoney(totalSales),
						subtitle: "From settled orders",
						accent: "bg-lime-50 text-lime-700",
						icon: BadgeDollarSign,
					},
				].map((metric, index) => {
					const Icon = metric.icon;

					return (
						<motion.div
							key={metric.label}
							{...cardMotion}
							transition={{ duration: 0.35, delay: index * 0.05 }}
							className="relative overflow-hidden rounded-3xl border border-white bg-white p-5 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.42)] ring-1 ring-slate-100 transition-shadow hover:shadow-[0_20px_50px_-30px_rgba(15,23,42,0.5)]"
						>
							<div className="flex items-start justify-between gap-4">
								<div className="min-w-0">
									<p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{metric.label}</p>
									<h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{metric.value}</h3>
									<p className="mt-1 text-xs text-slate-500">{metric.subtitle}</p>
								</div>
								<div className={`grid size-12 shrink-0 place-items-center rounded-2xl ring-1 ring-inset ring-slate-200/70 ${metric.accent}`}>
									<Icon className="size-5" />
								</div>
							</div>
						</motion.div>
					);
				})}
			</div>

			<div className="rounded-3xl border border-emerald-900/5 bg-white shadow-md overflow-hidden">
				<div className="border-b border-slate-100 bg-white p-4">
					<div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
						<div className="flex flex-col gap-2.5 sm:flex-row sm:items-center flex-1 max-w-3xl">
							<div className="relative flex-1 min-w-0">
								<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
								<Input
									value={orderSearch}
									onChange={(e) => {
										setOrderSearch(e.target.value);
										setOrderPage(1);
									}}
									placeholder="Search order ID, address, item, or status..."
									className="h-10 rounded-xl border-slate-200 bg-slate-50/40 pl-9 text-xs focus-visible:ring-emerald-800"
								/>
							</div>

							{isFilterActive && (
								<Button
									variant="outline"
									onClick={resetFilters}
									className="h-10 shrink-0 rounded-xl border border-dashed border-red-200 bg-red-50/25 px-3 text-xs font-semibold text-red-600 transition-all duration-150 hover:bg-red-50 hover:text-red-700"
								>
									Reset
									<X className="ml-1.5 size-3.5" />
								</Button>
							)}

							<select
								value={statusFilter}
								onChange={(e) => {
									setStatusFilter(e.target.value);
									setOrderPage(1);
								}}
								className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-emerald-800"
							>
								<option value="all">All Statuses</option>
								{ADMIN_ORDER_STATUS_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>

							<select
								value={sortBy}
								onChange={(e) => {
									setSortBy(e.target.value);
									setOrderPage(1);
								}}
								className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-emerald-800"
								>
									<option value="newest">Newest first</option>
									<option value="oldest">Oldest first</option>
									<option value="total-desc">Highest total</option>
									<option value="total-asc">Lowest total</option>
									<option value="status">Status</option>
								</select>
						</div>

						<div className="flex items-center gap-2">
							<div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs font-bold text-slate-500">
								{tableTotalElements === 0
									? "No orders found"
									: `Showing ${Math.min(tableTotalElements, (safeOrderPage - 1) * ORDERS_PER_PAGE + 1)}-${Math.min(
											safeOrderPage * ORDERS_PER_PAGE,
											tableTotalElements,
									  )} of ${tableTotalElements}`}
							</div>
							{totalOrderPages > 1 && (
								<div className="flex items-center gap-1 rounded-lg border border-slate-100 bg-slate-50/50 p-0.5 select-none">
									<Button
										variant="outline"
										size="icon"
										disabled={safeOrderPage === 1}
										onClick={() => setOrderPage((page) => Math.max(1, page - 1))}
										className="h-7 w-7 rounded-md border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
										title="Previous page"
									>
										&larr;
									</Button>
									<span className="min-w-[55px] px-1.5 text-center text-[10px] font-bold text-slate-500">
										{safeOrderPage} / {totalOrderPages}
									</span>
									<Button
										variant="outline"
										size="icon"
										disabled={safeOrderPage === totalOrderPages}
										onClick={() => setOrderPage((page) => Math.min(totalOrderPages, page + 1))}
										className="h-7 w-7 rounded-md border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
										title="Next page"
									>
										&rarr;
									</Button>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3">
					<div className="text-xs font-bold font-sans text-slate-500">
						{tableTotalElements === 0
							? "No orders found"
							: `Showing ${Math.min(tableTotalElements, (safeOrderPage - 1) * ORDERS_PER_PAGE + 1)}-${Math.min(
									safeOrderPage * ORDERS_PER_PAGE,
									tableTotalElements,
							  )} of ${tableTotalElements} orders`}
					</div>

					<div className="flex items-center gap-1 rounded-lg border border-slate-100 bg-slate-50/50 p-0.5 select-none">
						<Button
							variant="outline"
							size="icon"
							disabled={safeOrderPage === 1}
							onClick={() => setOrderPage((page) => Math.max(1, page - 1))}
							className="h-7 w-7 rounded-md border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
							title="Previous page"
						>
							&larr;
						</Button>
						<span className="min-w-[55px] px-1.5 text-center text-[10px] font-bold text-slate-500">
							{safeOrderPage} / {totalOrderPages}
						</span>
						<Button
							variant="outline"
							size="icon"
							disabled={safeOrderPage === totalOrderPages}
							onClick={() => setOrderPage((page) => Math.min(totalOrderPages, page + 1))}
							className="h-7 w-7 rounded-md border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
							title="Next page"
						>
							&rarr;
						</Button>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full border-collapse text-left text-sm">
						<thead>
							<tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
								<th className="px-6 py-4">Order ID</th>
								<th className="px-6 py-4">Items</th>
								<th className="px-6 py-4">Date</th>
								<th className="px-6 py-4">Total</th>
								<th className="px-6 py-4">Shipping</th>
								<th className="px-6 py-4">Status</th>
								<th className="px-6 py-4 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{paginatedOrders.length === 0 ? (
								<tr>
									<td colSpan={7} className="px-6 py-14 text-center text-slate-400">
										<div className="flex flex-col items-center gap-2">
											<div className="grid size-12 place-items-center rounded-2xl bg-slate-50 text-slate-300">
												<AlertTriangle className="size-5" />
											</div>
											<div>
												<p className="text-sm font-semibold text-slate-600">No orders match the current filters.</p>
												<p className="mt-1 text-xs text-slate-400">Try a different search term or reset the filters.</p>
											</div>
										</div>
									</td>
								</tr>
							) : (
								paginatedOrders.map((order) => (
									<tr key={order.id} className="hover:bg-slate-50/40">
										<td className="px-6 py-4">
											<Tooltip content={order.id}>
												<span className="cursor-help select-all font-mono text-[10px] font-bold text-slate-500">
													{order.id.slice(0, 8).toUpperCase()}
												</span>
											</Tooltip>
										</td>
										<td className="px-6 py-4">
											<div className="flex flex-col gap-0.5">
												{order.items.slice(0, 2).map((item) => (
													<span key={item.id} className="max-w-[200px] truncate text-xs font-semibold text-slate-700">
														{item.product?.name || "Unknown"} <span className="text-slate-400">x{item.quantity}</span>
													</span>
												))}
												{order.items.length > 2 && (
													<span className="text-[10px] font-semibold text-slate-400">+{order.items.length - 2} more</span>
												)}
											</div>
										</td>
										<td className="px-6 py-4 text-xs text-slate-500">
											{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
										</td>
										<td className="px-6 py-4 text-xs font-semibold text-slate-950">
											{formatMoney(order.total || 0)}
										</td>
										<td className="px-6 py-4">
											<Tooltip content={formatShippingDetails(order).tooltipLabel || "No address"}>
												<div className="max-w-[240px] space-y-0.5">
													{formatShippingDetails(order).fullAddress ? (
														<>
															<p className="truncate text-xs font-semibold text-slate-700">
																{formatShippingDetails(order).fullAddress}
															</p>
															{formatShippingDetails(order).phoneLabel ? (
																<p className="truncate text-xs text-slate-500">
																	Phone: {formatShippingDetails(order).phoneLabel}
																</p>
															) : null}
														</>
													) : (
														<p className="text-xs text-slate-400">No shipping address</p>
													)}
												</div>
											</Tooltip>
										</td>
										<td className="px-6 py-4">
											<span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getOrderStatusMeta(order.status).badgeClass}`}>
												{getOrderStatusMeta(order.status).label}
											</span>
										</td>
										<td className="px-6 py-4 text-right">
											<div className="flex items-center justify-end gap-2">
												<Tooltip content="View Details">
													<button
														onClick={() => setSelectedOrder(order)}
														className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-950"
													>
														<Eye className="size-4" />
													</button>
												</Tooltip>
												{canChangeStatus(order.status) && (
													<Tooltip content="Cancel Order">
														<button
															onClick={() => handleCancelOrder(order.id)}
															className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
														>
															<X className="size-4" />
														</button>
													</Tooltip>
												)}
												<select
								value={normalizeOrderStatus(order.status)}
								disabled={updatingStatusOrderId === order.id || !canChangeStatus(order.status)}
								onChange={(e) => handleChangeOrderStatus(order.id, e.target.value)}
													className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600 outline-none transition-colors hover:border-emerald-200 focus-visible:ring-2 focus-visible:ring-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
													title="Change order status"
												>
													{ADMIN_ORDER_STATUS_OPTIONS.map((option) => (
														<option key={option.value} value={option.value}>
															{option.label}
														</option>
													))}
												</select>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				<div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-white p-4 select-none">
					<div className="flex items-center gap-1 rounded-lg border border-slate-100 bg-slate-50/50 p-0.5">
						<Button
							variant="outline"
							size="icon"
							disabled={safeOrderPage === 1}
							onClick={() => setOrderPage((page) => Math.max(1, page - 1))}
							className="h-7 w-7 rounded-md border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
							title="Previous Page"
						>
							&larr;
						</Button>

						{Array.from({ length: totalOrderPages }).map((_, index) => {
							const pageNum = index + 1;
							return (
								<Button
									key={pageNum}
									variant={safeOrderPage === pageNum ? "default" : "outline"}
									onClick={() => setOrderPage(pageNum)}
									className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
										safeOrderPage === pageNum
											? "border-emerald-900 bg-emerald-900 text-white hover:bg-emerald-950"
											: "border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
									}`}
								>
									{pageNum}
								</Button>
							);
						})}

						<Button
							variant="outline"
							size="icon"
							disabled={safeOrderPage === totalOrderPages}
							onClick={() => setOrderPage((page) => Math.min(totalOrderPages, page + 1))}
							className="h-7 w-7 rounded-md border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
							title="Next Page"
						>
							&rarr;
						</Button>
					</div>
				</div>
			</div>

			{selectedOrder && (
				<div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
					<div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
						<button
							onClick={() => setSelectedOrder(null)}
							className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
						>
							<X className="size-4" />
						</button>

						<div className="mb-6 flex flex-wrap items-baseline gap-3">
							<h3 className="font-sans text-xl font-semibold text-slate-950">
								Order <span className="font-mono text-base">{selectedOrder.id.slice(0, 8).toUpperCase()}</span>
							</h3>
							<span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getOrderStatusMeta(selectedOrder.status).badgeClass}`}>
								{getOrderStatusMeta(selectedOrder.status).label}
							</span>
						</div>

						<div className="mb-6 grid gap-6 border-b border-slate-100 pb-5 text-sm sm:grid-cols-2">
							<div>
								<span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Shipping Details</span>
								<div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
									{formatShippingDetails(selectedOrder).fullAddress ? (
										<>
											<div className="space-y-1.5">
												<p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Street</p>
												<p className="font-semibold text-slate-950">{formatShippingDetails(selectedOrder).street || "-"}</p>
											</div>
											<div className="space-y-1.5">
												<p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">City</p>
												<p className="font-semibold text-slate-950">{formatShippingDetails(selectedOrder).city || "-"}</p>
											</div>
											<div className="space-y-1.5">
												<p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Country</p>
												<p className="font-semibold text-slate-950">{formatShippingDetails(selectedOrder).country || "-"}</p>
											</div>
											<div className="space-y-1.5">
												<p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Phone</p>
												<p className="font-semibold text-slate-950">{formatShippingDetails(selectedOrder).phoneLabel || "-"}</p>
											</div>
											<div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
												<p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Full Address</p>
												<p className="mt-1 font-semibold text-slate-950">{formatShippingDetails(selectedOrder).fullAddress}</p>
											</div>
										</>
									) : (
										<p className="text-sm font-medium text-slate-500">No shipping address provided.</p>
									)}
								</div>
							</div>
							<div>
								<span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Order Date & Metadata</span>
								<p className="text-slate-800">
									Date:{" "}
									<strong className="font-sans text-slate-950">
										{new Date(selectedOrder.createdAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}
									</strong>
								</p>
								<p className="mt-1 text-slate-800">
									Total Amount: <strong className="font-sans text-slate-950">{formatMoney(selectedOrder.total || 0)}</strong>
								</p>
							</div>
						</div>

						<div className="space-y-4">
							<span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Ordered Items</span>
							<div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/30">
								{selectedOrder.items.map((item) => (
									<div key={item.id} className="flex items-center justify-between p-4 text-sm">
										<div className="flex items-center gap-2">
											<Folder className="size-4 text-emerald-800/60" />
											<span className="font-bold text-slate-900">{item.product?.name || "Unknown Product"}</span>
											<span className="text-xs font-bold text-slate-400">x{item.quantity}</span>
										</div>
										<span className="font-semibold text-slate-950">
											{formatMoney(getOrderItemUnitPrice(item) * (item.quantity || 0))}
										</span>
									</div>
								))}
							</div>
						</div>

						<div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
							<select
								value={normalizeOrderStatus(selectedOrder.status)}
								disabled={updatingStatusOrderId === selectedOrder.id || !canChangeStatus(selectedOrder.status)}
								onChange={(e) => handleChangeOrderStatus(selectedOrder.id, e.target.value)}
								className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold uppercase tracking-wider text-slate-600 outline-none transition-colors hover:border-emerald-200 focus-visible:ring-2 focus-visible:ring-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
								title="Change order status"
							>
								{ADMIN_ORDER_STATUS_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
							{canChangeStatus(selectedOrder.status) && (
								<Button
									variant="outline"
									onClick={() => handleCancelOrder(selectedOrder.id)}
									className="h-10 rounded-xl border-rose-200 px-5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
								>
									<AlertTriangle className="mr-1.5 size-4" />
									Cancel Order
								</Button>
							)}
							<Button
								onClick={() => setSelectedOrder(null)}
								className="h-10 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-slate-950"
							>
								Close
							</Button>
						</div>
					</div>
				</div>
			)}

			<ConfirmDialog
				isOpen={confirmOpen}
				title={confirmTitle}
				description={confirmDesc}
				confirmText={confirmText}
				isDestructive={confirmDestructive}
				onConfirm={confirmAction || (() => {})}
				onClose={() => setConfirmOpen(false)}
			/>
		</div>
	);
};
