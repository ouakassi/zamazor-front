import React, { useEffect, useState } from "react";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";
import CONFIG from "@/core/config/constants";
import { orderService } from "@/features/orders/services/orderService";
import type { BackendOrder } from "@/features/orders/services/orderService";
import { productService } from "@/features/products/services/productService";
import type { Product } from "@/core/config/productsData";
import { ShoppingCart, Box, ClipboardList } from "lucide-react";
import { useProductStore } from "@/features/products/stores/productStore";

export const OverviewPage = () => {
	useDocumentTitle(`Dashboard Overview | ${CONFIG.APP_NAME}`);
	const fetchStoreProducts = useProductStore((state) => state.fetchProducts);

	const [products, setProducts] = useState<Product[]>([]);
	const [orders, setOrders] = useState<BackendOrder[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadData = async () => {
			try {
				const [prodsData, ordersData] = await Promise.all([
					fetchStoreProducts(true),
					orderService.getAllOrders(),
				]);
				setProducts(prodsData);
				setOrders(ordersData);
			} catch (error) {
				console.error("Failed to load dashboard overview data:", error);
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, [fetchStoreProducts]);

	const totalSales = orders
		.filter((o) => o.status !== "CANCELLED")
		.reduce((sum, o) => sum + o.totalAmount, 0);

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-950"></div>
				<p className="text-xs text-slate-500 font-semibold">Loading overview analytics...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Metric widgets */}
			<div className="grid gap-4 sm:grid-cols-3">
				<div className="bg-white p-6 rounded-3xl border border-emerald-900/5 shadow-md flex items-center justify-between animate-in fade-in duration-200">
					<div>
						<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Revenue</span>
						<h3 className="text-2xl font-bold tracking-tight mt-1 text-slate-950">{(totalSales || 0).toFixed(2)} MAD</h3>
					</div>
					<div className="p-3 bg-emerald-50 rounded-2xl text-emerald-800">
						<ShoppingCart className="size-6" />
					</div>
				</div>

				<div className="bg-white p-6 rounded-3xl border border-emerald-900/5 shadow-md flex items-center justify-between animate-in fade-in duration-200 delay-75">
					<div>
						<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">All Products</span>
						<h3 className="text-2xl font-bold tracking-tight mt-1 text-slate-950">{products.length} Items</h3>
					</div>
					<div className="p-3 bg-lime-50 rounded-2xl text-emerald-900">
						<Box className="size-6" />
					</div>
				</div>

				<div className="bg-white p-6 rounded-3xl border border-emerald-900/5 shadow-md flex items-center justify-between animate-in fade-in duration-200 delay-150">
					<div>
						<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Orders</span>
						<h3 className="text-2xl font-bold tracking-tight mt-1 text-slate-950">{orders.length}</h3>
					</div>
					<div className="p-3 bg-teal-50 rounded-2xl text-teal-800">
						<ClipboardList className="size-6" />
					</div>
				</div>
			</div>

			{/* Sales overview chart container */}
			<div className="bg-white p-6 rounded-3xl border border-emerald-900/5 shadow-md animate-in fade-in duration-300 delay-200">
				<h3 className="font-sans font-semibold text-base text-slate-950 mb-6">Recent Sales Dynamics</h3>
				{orders.length === 0 ? (
					<div className="h-64 border border-dashed border-slate-200 rounded-2xl bg-slate-50 flex items-center justify-center text-sm text-slate-400">
						No sales recorded. Create test orders to visualize data.
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex items-end justify-between gap-2 h-48 pt-4">
							{orders.slice(-7).map((order) => {
								const maxAmount = Math.max(...orders.map((o) => o.totalAmount)) || 1;
								const heightPercentage = Math.max(10, (order.totalAmount / maxAmount) * 100);
								return (
									<div key={order.id} className="flex-1 flex flex-col items-center gap-2 group">
										<div className="text-[10px] font-bold text-slate-950 opacity-0 group-hover:opacity-100 transition-opacity">
											{(order.totalAmount || 0).toFixed(0)} MAD
										</div>
										<div
											className="w-full bg-emerald-900 group-hover:bg-emerald-950 rounded-lg transition-all duration-200"
											style={{ height: `${heightPercentage}%` }}
										/>
										<span className="text-[10px] font-sans text-slate-400 truncate w-full text-center">
											{order.orderNumber}
										</span>
									</div>
								);
							})}
						</div>
						<div className="border-t border-slate-100 pt-4 text-center">
							<p className="text-xs text-slate-500">Displaying revenue for the last 7 orders placed.</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
