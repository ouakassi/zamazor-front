import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";
import { APP_ROUTES } from "@/core/routes/paths";
import CONFIG from "@/core/config/constants";
import { useProductStore } from "@/features/products/stores/productStore";
import { productService } from "@/features/products/services/productService";
import type { BackendCategory } from "@/features/products/services/productService";
import { orderService } from "@/features/orders/services/orderService";
import type { BackendOrder } from "@/features/orders/services/orderService";
import { authService } from "@/features/auth/services/authService";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { type Product } from "@/core/config/productsData";
import { toast } from "sonner";
import { SidebarNav } from "@/shared/components/ui/dashboard-sidebar";
import {
	BarChart3,
	Box,
	ClipboardList,
	ShoppingCart,
	Users,
	Plus,
	Trash2,
	Edit,
	LogOut,
	Eye,
	X,
	Folder,
	Home,
	AlertTriangle,
	Menu,
	ShoppingBag,
	Search
} from "lucide-react";

type Tab = "overview" | "products" | "orders";

export const DashboardPage = () => {
	useDocumentTitle(`Dashboard | ${CONFIG.APP_NAME}`);
	const navigate = useNavigate();
	const user = useAuthStore((state) => state.user);
	const fetchStoreProducts = useProductStore((state) => state.fetchProducts);

	// Tabs & Sidebar state
	const [activeTab, setActiveTab] = useState<Tab>("overview");
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

	// Data states
	const [products, setProducts] = useState<Product[]>([]);
	const [orders, setOrders] = useState<BackendOrder[]>([]);
	const [categories, setCategories] = useState<BackendCategory[]>([]);
	const [loading, setLoading] = useState(true);

	// Modals states
	const [isProductModalOpen, setIsProductModalOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [selectedOrder, setSelectedOrder] = useState<BackendOrder | null>(null);

	// Product Form state
	const [prodName, setProdName] = useState("");
	const [prodDesc, setProdDesc] = useState("");
	const [prodPrice, setProdPrice] = useState("");
	const [prodStock, setProdStock] = useState("");
	const [prodCategory, setProdCategory] = useState("");
	const [prodImage, setProdImage] = useState<File | null>(null);
	const [prodImagePreview, setProdImagePreview] = useState<string | null>(null);
	const [prodSubmitting, setProdSubmitting] = useState(false);

	// Search and Pagination for Products
	const [productSearch, setProductSearch] = useState("");
	const [productPage, setProductPage] = useState(1);
	const productsPerPage = 10;

	const handleSearchChange = (value: string) => {
		setProductSearch(value);
		setProductPage(1);
	};

	const loadData = async () => {
		setLoading(true);
		try {
			const [prodsData, ordersData, catsData] = await Promise.all([
				fetchStoreProducts(true),
				orderService.getAllOrders(),
				productService.getCategories(),
			]);
			setProducts(prodsData);
			setOrders(ordersData);
			setCategories(catsData);
		} catch (error) {
			console.error("Failed to load dashboard data:", error);
			toast.error("Error loading dashboard data.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	// Reset product form fields
	const resetProductForm = () => {
		setProdName("");
		setProdDesc("");
		setProdPrice("");
		setProdStock("");
		setProdCategory(categories[0]?.id || "");
		setProdImage(null);
		setProdImagePreview(null);
		setEditingProduct(null);
	};

	const openNewProductModal = () => {
		resetProductForm();
		if (categories.length > 0) {
			setProdCategory(categories[0].id);
		}
		setIsProductModalOpen(true);
	};

	const openEditProductModal = (product: Product) => {
		setEditingProduct(product);
		setProdName(product.name);
		setProdDesc(product.flavor || ""); // Mapped to flavor / desc
		setProdPrice(product.price.replace(/[^0-9.]/g, ""));
		setProdStock("100"); // Default fallback stock

		// Try matching category label with category IDs
		const matchCat = categories.find(c => c.label.toLowerCase() === product.category.toLowerCase());
		setProdCategory(matchCat ? matchCat.id : categories[0]?.id || "");
		setProdImage(null);
		setProdImagePreview(product.image);
		setIsProductModalOpen(true);
	};

	const handleProductSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!prodName || !prodPrice || !prodCategory) {
			toast.error("Please fill in all required fields.");
			return;
		}

		setProdSubmitting(true);
		try {
			const formData = new FormData();
			formData.append("name", prodName.trim());
			formData.append("description", prodDesc.trim());
			formData.append("price", parseFloat(prodPrice).toFixed(2));
			formData.append("stockQuantity", String(parseInt(prodStock) || 0));
			formData.append("categoryId", prodCategory);
			if (prodImage) {
				formData.append("image", prodImage);
			}

			let result;
			if (editingProduct) {
				result = await productService.updateProduct(editingProduct.id, formData);
				if (result) toast.success("Product updated successfully!");
			} else {
				result = await productService.createProduct(formData);
				if (result) toast.success("Product created successfully!");
			}

			if (result) {
				setIsProductModalOpen(false);
				resetProductForm();
				await loadData();
			} else {
				toast.error("Failed to save product.");
			}
		} catch (error) {
			console.error("Product submission failed:", error);
			toast.error("An error occurred during submission.");
		} finally {
			setProdSubmitting(false);
		}
	};

	const handleDeleteProduct = async (id: string) => {
		if (!window.confirm("Are you sure you want to delete this product?")) return;

		try {
			const success = await productService.deleteProduct(id);
			if (success) {
				toast.success("Product deleted successfully.");
				await loadData();
			} else {
				toast.error("Failed to delete product.");
			}
		} catch (error) {
			console.error("Product deletion failed:", error);
			toast.error("An error occurred while deleting.");
		}
	};

	const handleCancelOrder = async (orderId: string) => {
		if (!window.confirm("Are you sure you want to cancel this order?")) return;

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
	};

	const handleLogout = async () => {
		try {
			await authService.logout();
			toast.success("Successfully logged out.");
			navigate(APP_ROUTES.HOME);
		} catch (e) {
			console.error("Logout API call failed, clearing auth locally:", e);
			useAuthStore.setState({ user: null, status: 3 }); // AuthStatus.Unauthenticated
			toast.success("Logged out.");
			navigate(APP_ROUTES.HOME);
		}
	};

	// Overview Metrics
	const totalSales = orders
		.filter((o) => o.status !== "CANCELLED")
		.reduce((sum, o) => sum + o.totalAmount, 0);

	// Products filtering and pagination
	const filteredProducts = products.filter((p) => {
		const searchLower = productSearch.toLowerCase();
		return (
			p.name.toLowerCase().includes(searchLower) ||
			p.category.toLowerCase().includes(searchLower)
		);
	});

	const totalProductPages = Math.ceil(filteredProducts.length / productsPerPage) || 1;
	const paginatedProducts = filteredProducts.slice(
		(productPage - 1) * productsPerPage,
		productPage * productsPerPage
	);

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
						setActiveTab(id as Tab);
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
							setActiveTab(id as Tab);
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
						<h1 className="text-lg font-bold text-slate-900 capitalize">
							{activeTab} Management
						</h1>
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

						{activeTab === "products" && (
							<Button
								onClick={openNewProductModal}
								className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold rounded-xl h-10 px-4 text-xs cursor-pointer shadow-sm flex items-center gap-1.5"
							>
								<Plus className="size-4" />
								New Product
							</Button>
						)}
					</div>
				</header>

				{/* Tab content body */}
				<main className="p-4 sm:p-6 lg:p-8 flex-1">
					{loading ? (
						<div className="flex items-center justify-center h-64">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-900"></div>
						</div>
					) : (
						<>
							{/* TAB 1: OVERVIEW */}
							{activeTab === "overview" && (
								<div className="space-y-8 animate-in fade-in duration-200">
									{/* Metric widgets */}
									<div className="grid gap-4 sm:grid-cols-3">
										<div className="bg-white p-6 rounded-3xl border border-emerald-900/5 shadow-md flex items-center justify-between">
											<div>
												<span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Revenue</span>
												<h3 className="text-2xl font-black mt-1 text-slate-950">{(totalSales || 0).toFixed(2)} MAD</h3>
											</div>
											<div className="p-3 bg-emerald-50 rounded-2xl text-emerald-800">
												<ShoppingCart className="size-6" />
											</div>
										</div>

										<div className="bg-white p-6 rounded-3xl border border-emerald-900/5 shadow-md flex items-center justify-between">
											<div>
												<span className="text-xs font-black uppercase tracking-wider text-slate-400">All Products</span>
												<h3 className="text-2xl font-black mt-1 text-slate-950">{products.length} Items</h3>
											</div>
											<div className="p-3 bg-lime-50 rounded-2xl text-emerald-900">
												<Box className="size-6" />
											</div>
										</div>

										<div className="bg-white p-6 rounded-3xl border border-emerald-900/5 shadow-md flex items-center justify-between">
											<div>
												<span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Orders</span>
												<h3 className="text-2xl font-black mt-1 text-slate-950">{orders.length}</h3>
											</div>
											<div className="p-3 bg-teal-50 rounded-2xl text-teal-800">
												<ClipboardList className="size-6" />
											</div>
										</div>
									</div>

									{/* Sales overview chart container */}
									<div className="bg-white p-6 rounded-3xl border border-emerald-900/5 shadow-md">
										<h3 className="font-playfair font-bold text-lg text-slate-950 mb-6">Recent Sales Dynamics</h3>
										{orders.length === 0 ? (
											<div className="h-64 border border-dashed border-slate-200 rounded-2xl bg-slate-50 flex items-center justify-center text-sm text-slate-400">
												No sales recorded. Create test orders to visualize data.
											</div>
										) : (
											<div className="space-y-4">
												<div className="flex items-end justify-between gap-2 h-48 pt-4">
													{orders.slice(-7).map((order, idx) => {
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
																<span className="text-[10px] font-mono text-slate-400 truncate w-full text-center">
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
							)}

							{/* TAB 2: PRODUCTS */}
							{activeTab === "products" && (
								<div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
									{/* Search bar & info */}
									<div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
										<div className="relative w-full sm:max-w-xs">
											<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" strokeWidth={1.7} />
											<Input
												value={productSearch}
												onChange={(e) => handleSearchChange(e.target.value)}
												placeholder="Search products by name or category..."
												className="pl-9 rounded-xl border-slate-200 focus-visible:ring-emerald-800 text-xs h-9 bg-slate-50/30"
											/>
										</div>
										<div className="text-xs text-slate-500 font-bold font-sans">
											{filteredProducts.length === 0 
												? "No items match search" 
												: `Showing ${((productPage - 1) * productsPerPage) + 1}-${Math.min(productPage * productsPerPage, filteredProducts.length)} of ${filteredProducts.length} items`
											}
										</div>
									</div>

									<div className="overflow-x-auto min-h-[580px]">
										<table className="w-full text-left text-sm border-collapse">
											<thead>
												<tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
													<th className="px-6 py-4">Product</th>
													<th className="px-6 py-4">Category</th>
													<th className="px-6 py-4">Price</th>
													<th className="px-6 py-4 text-right">Actions</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-slate-100">
												{paginatedProducts.length === 0 ? (
													<tr>
														<td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-xs font-semibold">
															No products match your filter.
														</td>
													</tr>
												) : (
													paginatedProducts.map((product) => (
														<tr key={product.id} className="hover:bg-slate-50/40 transition-colors duration-150 group">
															<td className="px-6 py-4">
																<div className="flex items-center gap-3">
																	<div className="size-11 shrink-0 bg-slate-50 rounded-xl p-1.5 flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform duration-200">
																		<img src={product.image} alt={product.name} className="h-full object-contain" />
																	</div>
																	<div>
																		<p className="font-bold text-slate-900 text-xs leading-normal">{product.name}</p>
																		<p className="text-[10px] text-slate-400 mt-0.5 max-w-[220px] truncate">{product.flavor}</p>
																	</div>
																</div>
															</td>
															<td className="px-6 py-4">
																<span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 border border-slate-200/50 text-slate-700 px-2 py-0.5 rounded-md inline-block">
																	{product.category}
																</span>
															</td>
															<td className="px-6 py-4 font-black text-slate-900 text-xs">
																{product.price}
															</td>
															<td className="px-6 py-4 text-right">
																<div className="flex items-center justify-end gap-1.5">
																	<button
																		onClick={() => openEditProductModal(product)}
																		className="p-1.5 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-slate-400 transition-colors cursor-pointer active:scale-95"
																		title="Edit Product"
																	>
																		<Edit className="size-3.5" />
																	</button>
																	<button
																		onClick={() => handleDeleteProduct(product.id)}
																		className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors cursor-pointer active:scale-95"
																		title="Delete Product"
																	>
																		<Trash2 className="size-3.5" />
																	</button>
																</div>
															</td>
														</tr>
													))
												)}
											</tbody>
										</table>
									</div>

									{/* Pagination footer */}
									{totalProductPages > 1 && (
										<div className="p-4 border-t border-slate-100 bg-white flex items-center justify-center gap-2 select-none">
											<Button
												variant="outline"
												size="icon"
												disabled={productPage === 1}
												onClick={() => setProductPage((p) => Math.max(1, p - 1))}
												className="h-8 w-8 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center justify-center"
											>
												&larr;
											</Button>
											
											{Array.from({ length: totalProductPages }).map((_, i) => {
												const pageNum = i + 1;
												return (
													<Button
														key={pageNum}
														variant={productPage === pageNum ? "default" : "outline"}
														onClick={() => setProductPage(pageNum)}
														className={`h-8 w-8 rounded-lg font-bold cursor-pointer transition-all text-[11px] flex items-center justify-center ${
															productPage === pageNum
																? "bg-slate-900 hover:bg-slate-950 text-white border-slate-900 shadow-sm"
																: "border-slate-200 text-slate-600 hover:bg-slate-50"
														}`}
													>
														{pageNum}
													</Button>
												);
											})}

											<Button
												variant="outline"
												size="icon"
												disabled={productPage === totalProductPages}
												onClick={() => setProductPage((p) => Math.min(totalProductPages, p + 1))}
												className="h-8 w-8 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center justify-center"
											>
												&rarr;
											</Button>
										</div>
									)}
								</div>
							)}

							{/* TAB 3: ORDERS */}
							{activeTab === "orders" && (
								<div className="bg-white rounded-3xl border border-emerald-900/5 shadow-md overflow-hidden animate-in fade-in duration-200">
									<div className="overflow-x-auto">
										<table className="w-full text-left text-sm border-collapse">
											<thead>
												<tr className="border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-50/50">
													<th className="px-6 py-4">Order Number</th>
													<th className="px-6 py-4">Date</th>
													<th className="px-6 py-4">Total Amount</th>
													<th className="px-6 py-4">Status</th>
													<th className="px-6 py-4 text-right">Actions</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-slate-100">
												{orders.length === 0 ? (
													<tr>
														<td colSpan={5} className="px-6 py-10 text-center text-slate-400">
															No orders found.
														</td>
													</tr>
												) : (
													orders.map((order) => (
														<tr key={order.id} className="hover:bg-slate-50/40">
															<td className="px-6 py-4 font-mono font-bold text-slate-900">
																{order.orderNumber}
															</td>
															<td className="px-6 py-4 text-slate-500">
																{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
															</td>
															<td className="px-6 py-4 font-black text-slate-950">
																{(order.totalAmount || 0).toFixed(2)} MAD
															</td>
															<td className="px-6 py-4">
																<span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
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
																	<button
																		onClick={() => setSelectedOrder(order)}
																		className="p-1.5 hover:bg-emerald-50 hover:text-emerald-950 rounded-lg text-slate-400 transition-colors cursor-pointer"
																		title="View Details"
																	>
																		<Eye className="size-4" />
																	</button>
																	{order.status !== "CANCELLED" && (
																		<button
																			onClick={() => handleCancelOrder(order.id)}
																			className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors cursor-pointer"
																			title="Cancel Order"
																		>
																			<X className="size-4" />
																		</button>
																	)}
																</div>
															</td>
														</tr>
													))
												)}
											</tbody>
										</table>
									</div>
								</div>
							)}
						</>
					)}
				</main>
			</div>

			{/* MODAL: CREATE OR UPDATE PRODUCT */}
			{isProductModalOpen && (
				<div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
					<div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
						<button
							onClick={() => setIsProductModalOpen(false)}
							className="absolute top-4 right-4 size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
						>
							<X className="size-4" />
						</button>

						<h3 className="font-playfair text-2xl font-bold text-slate-950 mb-6">
							{editingProduct ? "Edit Product" : "New Supplement Product"}
						</h3>

						<form onSubmit={handleProductSubmit} className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-1.5">
									<label className="text-xs font-bold text-slate-600">Product Name *</label>
									<Input
										value={prodName}
										onChange={(e) => setProdName(e.target.value)}
										placeholder="e.g. Organic Greens Powder"
										required
										className="rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800"
									/>
								</div>
								<div className="space-y-1.5">
									<label className="text-xs font-bold text-slate-600">Category *</label>
									<select
										value={prodCategory}
										onChange={(e) => setProdCategory(e.target.value)}
										required
										className="flex h-10 w-full rounded-xl border border-emerald-900/10 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800"
									>
										{categories.map((cat) => (
											<option key={cat.id} value={cat.id}>
												{cat.label}
											</option>
										))}
									</select>
								</div>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-1.5">
									<label className="text-xs font-bold text-slate-600">Price (MAD) *</label>
									<Input
										type="number"
										step="0.01"
										value={prodPrice}
										onChange={(e) => setProdPrice(e.target.value)}
										placeholder="e.g. 29.99"
										required
										className="rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800"
									/>
								</div>
								<div className="space-y-1.5">
									<label className="text-xs font-bold text-slate-600">Stock Quantity</label>
									<Input
										type="number"
										value={prodStock}
										onChange={(e) => setProdStock(e.target.value)}
										placeholder="e.g. 100"
										className="rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800"
									/>
								</div>
							</div>

							<div className="space-y-1.5">
								<label className="text-xs font-bold text-slate-600">Description / Flavor Details</label>
								<textarea
									value={prodDesc}
									onChange={(e) => setProdDesc(e.target.value)}
									placeholder="Describe the product formula, flavor profiles, and wellness benefits..."
									rows={3}
									className="flex min-h-[80px] w-full rounded-xl border border-emerald-900/10 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-xs font-bold text-slate-600">Product Thumbnail</label>
								{prodImagePreview && (
									<div className="size-24 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-1 mb-2">
										<img src={prodImagePreview} alt="Preview" className="h-full w-full object-contain" />
									</div>
								)}
								<input
									type="file"
									accept="image/*"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) {
											setProdImage(file);
											setProdImagePreview(URL.createObjectURL(file));
										}
									}}
									className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
								/>
							</div>

							<div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
								<Button
									type="button"
									variant="ghost"
									onClick={() => setIsProductModalOpen(false)}
									className="rounded-xl cursor-pointer"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={prodSubmitting}
									className="bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl font-bold cursor-pointer"
								>
									{prodSubmitting ? "Saving..." : "Save Product"}
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* MODAL: ORDER DETAILS */}
			{selectedOrder && (
				<div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
					<div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
						<button
							onClick={() => setSelectedOrder(null)}
							className="absolute top-4 right-4 size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
						>
							<X className="size-4" />
						</button>

						<div className="flex flex-wrap items-baseline gap-3 mb-6">
							<h3 className="font-playfair text-2xl font-bold text-slate-950">
								Order {selectedOrder.orderNumber}
							</h3>
							<span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
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
								<span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1">Shipping Details</span>
								<p className="font-bold text-slate-900 leading-relaxed whitespace-pre-line">{selectedOrder.shippingAddress}</p>
							</div>
							<div>
								<span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1">Order Date & Metadata</span>
								<p className="text-slate-800">
									Date: <strong className="text-slate-950 font-sans">{new Date(selectedOrder.createdAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}</strong>
								</p>
								<p className="text-slate-800 mt-1">
									Total Amount: <strong className="text-slate-950 font-sans">{(selectedOrder.totalAmount || 0).toFixed(2)} MAD</strong>
								</p>
							</div>
						</div>

						<div className="space-y-4">
							<span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Ordered Stacks</span>
							<div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 overflow-hidden bg-slate-50/30">
								{selectedOrder.items.map((item) => (
									<div key={item.id} className="flex justify-between items-center p-4 text-sm">
										<div className="flex items-center gap-2">
											<Folder className="size-4 text-emerald-800/60" />
											<span className="font-bold text-slate-900">{item.productName}</span>
											<span className="text-xs text-slate-400 font-bold">x{item.quantity}</span>
										</div>
										<span className="font-black text-slate-950">{((item.price || 0) * (item.quantity || 0)).toFixed(2)} MAD</span>
									</div>
								))}
							</div>
						</div>

						<div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-8">
							{selectedOrder.status !== "CANCELLED" && (
								<Button
									variant="outline"
									onClick={() => handleCancelOrder(selectedOrder.id)}
									className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer font-semibold flex items-center gap-1.5"
								>
									<AlertTriangle className="size-4" />
									Cancel Order
								</Button>
							)}
							<Button
								onClick={() => setSelectedOrder(null)}
								className="bg-slate-900 hover:bg-slate-950 text-white rounded-xl font-bold cursor-pointer"
							>
								Close
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
