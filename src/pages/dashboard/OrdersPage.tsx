import React, { useEffect, useState } from "react";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";
import CONFIG from "@/core/config/constants";
import { orderService } from "@/features/orders/services/orderService";
import type { BackendOrder } from "@/features/orders/services/orderService";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { Tooltip } from "@/shared/components/ui/tooltip";
import { Eye, X, Folder, AlertTriangle } from "lucide-react";

export const OrdersPage = () => {
	useDocumentTitle(`Orders Management | ${CONFIG.APP_NAME}`);

	// Data states
	const [orders, setOrders] = useState<BackendOrder[]>([]);
	const [loading, setLoading] = useState(true);

	// Modal state
	const [selectedOrder, setSelectedOrder] = useState<BackendOrder | null>(null);

	// Confirm dialog state
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirmTitle, setConfirmTitle] = useState("");
	const [confirmDesc, setConfirmDesc] = useState("");
	const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
	const [confirmDestructive, setConfirmDestructive] = useState(false);
	const [confirmText, setConfirmText] = useState("Continue");

	// Pagination
	const [orderPage, setOrderPage] = useState(1);
	const ordersPerPage = 5;

	const loadData = async () => {
		setLoading(true);
		try {
			const data = await orderService.getAllOrders();
			setOrders(data);
		} catch (error) {
			console.error("Failed to load dashboard orders:", error);
			toast.error("Failed to refresh orders list.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	const showConfirm = (title: string, desc: string, action: () => void, isDestructive = false, confirmText = "Continue") => {
		setConfirmTitle(title);
		setConfirmDesc(desc);
		setConfirmAction(() => action);
		setConfirmDestructive(isDestructive);
		setConfirmText(confirmText);
		setConfirmOpen(true);
	};

	const handleCancelOrder = (orderId: string) => {
		const order = orders.find((o) => o.id === orderId);
		const orderLabel = order ? order.id.slice(0, 8).toUpperCase() : "this order";

		showConfirm(
			"Cancel Order",
			`Are you sure you want to cancel order ${orderLabel}? This action cannot be undone and will permanently update the status.`,
			async () => {
				try {
					const success = await orderService.cancelOrder(orderId);
					if (success) {
						toast.success("Order cancelled successfully.");
						await loadData();
						// Refresh selected order details modal if currently open
						if (selectedOrder && selectedOrder.id === orderId) {
							const updated = await orderService.getOrderById(orderId);
							setSelectedOrder(updated);
						}
					} else {
						toast.error("Failed to cancel order.");
					}
				} catch (error) {
					console.error("Order cancellation failed:", error);
					toast.error("An error occurred while cancelling.");
				}
			},
			true,
			"Cancel Order"
		);
	};

	if (loading && orders.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-950"></div>
				<p className="text-xs text-slate-500 font-semibold">Loading orders registry...</p>
			</div>
		);
	}

	const totalOrderPages = Math.ceil(orders.length / ordersPerPage) || 1;
	const paginatedOrders = orders.slice(
		(orderPage - 1) * ordersPerPage,
		orderPage * ordersPerPage
	);

	return (
		<div className="space-y-6">
			{/* Sub-header controls */}
			<div className="space-y-0.5">
				<h2 className="text-base font-semibold text-slate-900">Purchase Orders</h2>
				<p className="text-xs text-slate-500">Track user checkout items, shipping destination details, payment statuses, and processing options.</p>
			</div>

			<div className="bg-white rounded-3xl border border-emerald-900/5 shadow-md overflow-hidden animate-in fade-in duration-200">
				{/* Toolbar with count + mini pagination */}
				<div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between gap-3">
					<div className="text-xs text-slate-500 font-bold font-sans">
						{orders.length === 0
							? "No orders found"
							: `Showing ${((orderPage - 1) * ordersPerPage) + 1}-${Math.min(orderPage * ordersPerPage, orders.length)} of ${orders.length} orders`
						}
					</div>
					{totalOrderPages > 1 && (
						<div className="flex items-center gap-1 border border-slate-100 rounded-lg p-0.5 bg-slate-50/50 select-none">
							<Button
								variant="outline"
								size="icon"
								disabled={orderPage === 1}
								onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
								className="h-7 w-7 rounded-md border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center justify-center active:scale-95 transition-all"
								title="Previous Page"
							>
								&larr;
							</Button>
							<span className="text-[10px] font-bold text-slate-500 px-1.5 min-w-[55px] text-center">
								{orderPage} / {totalOrderPages}
							</span>
							<Button
								variant="outline"
								size="icon"
								disabled={orderPage === totalOrderPages}
								onClick={() => setOrderPage((p) => Math.min(totalOrderPages, p + 1))}
								className="h-7 w-7 rounded-md border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center justify-center active:scale-95 transition-all"
								title="Next Page"
							>
								&rarr;
							</Button>
						</div>
					)}
				</div>
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm border-collapse">
						<thead>
							<tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/50">
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
									<td colSpan={7} className="px-6 py-10 text-center text-slate-400">
										No orders found.
									</td>
								</tr>
							) : (
								paginatedOrders.map((order) => (
									<tr key={order.id} className="hover:bg-slate-50/40">
										<td className="px-6 py-4">
											<Tooltip content={order.id}>
												<span className="text-[10px] font-mono font-bold text-slate-500 cursor-help select-all">
													{order.id.slice(0, 8).toUpperCase()}
												</span>
											</Tooltip>
										</td>
										<td className="px-6 py-4">
											<div className="flex flex-col gap-0.5">
												{order.items.slice(0, 2).map((item) => (
													<span key={item.id} className="text-xs text-slate-700 font-semibold truncate max-w-[180px]">
														{item.product?.name || "Unknown"} <span className="text-slate-400">x{item.quantity}</span>
													</span>
												))}
												{order.items.length > 2 && (
													<span className="text-[10px] text-slate-400 font-semibold">+{order.items.length - 2} more</span>
												)}
											</div>
										</td>
										<td className="px-6 py-4 text-slate-500 text-xs">
											{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
										</td>
										<td className="px-6 py-4 font-semibold text-slate-950 text-xs">
											{(order.total || 0).toFixed(2)} MAD
										</td>
										<td className="px-6 py-4">
											<Tooltip content={order.shippingAddress || "No address"}>
												<span className="text-xs text-slate-500 truncate max-w-[140px] block cursor-help">
													{order.shippingAddress || "—"}
												</span>
											</Tooltip>
										</td>
										<td className="px-6 py-4">
											<span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
												order.status === "PENDING"
													? "bg-amber-50 text-amber-800 border border-amber-200/50"
													: order.status === "COMPLETED" || order.status === "PAID"
													? "bg-emerald-50 text-emerald-800 border border-emerald-200/50"
													: "bg-slate-100 text-slate-500 border border-slate-200"
											}`}>
												{order.status}
											</span>
										</td>
										<td className="px-6 py-4 text-right">
											<div className="flex items-center justify-end gap-2">
												<Tooltip content="View Details">
													<button
														onClick={() => setSelectedOrder(order)}
														className="p-1.5 hover:bg-emerald-50 hover:text-emerald-950 rounded-lg text-slate-400 transition-colors cursor-pointer"
													>
														<Eye className="size-4" />
													</button>
												</Tooltip>
												{order.status !== "CANCELED" && (
													<Tooltip content="Cancel Order">
														<button
															onClick={() => handleCancelOrder(order.id)}
															className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors cursor-pointer"
														>
															<X className="size-4" />
														</button>
													</Tooltip>
												)}
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Bottom pagination */}
				{totalOrderPages > 1 && (
					<div className="p-4 border-t border-slate-100 bg-white flex items-center justify-center gap-2 select-none">
						<Button
							variant="outline"
							size="icon"
							disabled={orderPage === 1}
							onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
							className="h-8 w-8 rounded-lg border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center justify-center"
						>
							&larr;
						</Button>
						
						{Array.from({ length: totalOrderPages }).map((_, i) => {
							const pageNum = i + 1;
							return (
								<Button
									key={pageNum}
									variant={orderPage === pageNum ? "default" : "outline"}
									onClick={() => setOrderPage(pageNum)}
									className={`h-8 w-8 rounded-lg font-bold cursor-pointer transition-all text-xs flex items-center justify-center ${
										orderPage === pageNum
											? "bg-emerald-900 hover:bg-emerald-950 text-white border-emerald-900 shadow-sm"
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
							disabled={orderPage === totalOrderPages}
							onClick={() => setOrderPage((p) => Math.min(totalOrderPages, p + 1))}
							className="h-8 w-8 rounded-lg border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center justify-center"
						>
							&rarr;
						</Button>
					</div>
				)}
			</div>

			{/* MODAL: ORDER DETAILS */}
			{selectedOrder && (
				<div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
					<div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
						<button
							onClick={() => setSelectedOrder(null)}
							className="absolute top-4 right-4 size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
						>
							<X className="size-4" />
						</button>

						<div className="flex flex-wrap items-baseline gap-3 mb-6">
							<h3 className="font-sans text-xl font-semibold text-slate-950">
								Order <span className="font-mono text-base">{selectedOrder.id.slice(0, 8).toUpperCase()}</span>
							</h3>
							<span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
								selectedOrder.status === "PENDING"
									? "bg-amber-50 text-amber-800 border border-amber-200/50"
									: selectedOrder.status === "COMPLETED" || selectedOrder.status === "PAID"
									? "bg-emerald-50 text-emerald-800 border border-emerald-200/50"
									: "bg-slate-100 text-slate-500 border border-slate-200"
							}`}>
								{selectedOrder.status}
							</span>
						</div>

						<div className="grid gap-6 sm:grid-cols-2 text-sm mb-6 border-b border-slate-100 pb-5">
							<div>
								<span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Shipping Details</span>
								<p className="font-bold text-slate-900 leading-relaxed whitespace-pre-line">{selectedOrder.shippingAddress || "No shipping address provided."}</p>
							</div>
							<div>
								<span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Order Date & Metadata</span>
								<p className="text-slate-800">
									Date: <strong className="text-slate-950 font-sans">{new Date(selectedOrder.createdAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}</strong>
								</p>
								<p className="text-slate-800 mt-1">
									Total Amount: <strong className="text-slate-950 font-sans">{(selectedOrder.total || 0).toFixed(2)} MAD</strong>
								</p>
							</div>
						</div>

						<div className="space-y-4">
							<span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Ordered Stacks</span>
							<div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 overflow-hidden bg-slate-50/30">
								{selectedOrder.items.map((item) => (
									<div key={item.id} className="flex justify-between items-center p-4 text-sm">
										<div className="flex items-center gap-2">
											<Folder className="size-4 text-emerald-800/60" />
											<span className="font-bold text-slate-900">{item.product?.name || "Unknown Product"}</span>
											<span className="text-xs text-slate-400 font-bold">x{item.quantity}</span>
										</div>
										<span className="font-semibold text-slate-950">{((item.unitPrice || 0) * (item.quantity || 0)).toFixed(2)} MAD</span>
									</div>
								))}
							</div>
						</div>

						<div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-8">
							{selectedOrder.status !== "CANCELED" && (
								<Button
									variant="outline"
									onClick={() => handleCancelOrder(selectedOrder.id)}
									className="h-10 px-5 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer font-semibold flex items-center gap-1.5 text-xs"
								>
									<AlertTriangle className="size-4" />
									Cancel Order
								</Button>
							)}
							<Button
								onClick={() => setSelectedOrder(null)}
								className="h-10 px-5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl font-bold cursor-pointer text-xs"
							>
								Close
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Confirm Dialog */}
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
