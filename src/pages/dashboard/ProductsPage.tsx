import { useEffect, useState, useCallback, useMemo, useRef, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";
import CONFIG from "@/core/config/constants";
import { productService } from "@/features/products/services/productService";
import type { BackendCategory } from "@/features/products/services/productService";
import { useProductStore } from "@/features/products/stores/productStore";
import type { Product } from "@/core/config/productsData";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { Tooltip } from "@/shared/components/ui/tooltip";
import { Search, Plus, Trash2, Edit, ExternalLink, X, RefreshCw, Package, Layers, AlertTriangle, BadgeDollarSign } from "lucide-react";

const cardMotion = {
	initial: { opacity: 0, y: 16 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.35 },
};

export const ProductsPage = () => {
	useDocumentTitle(`Products Management | ${CONFIG.APP_NAME}`);
	const fetchStoreProducts = useProductStore((state) => state.fetchProducts);

	// Data states
	const [products, setProducts] = useState<Product[]>([]);
	const [tableProducts, setTableProducts] = useState<Product[]>([]);
	const [tableTotalElements, setTableTotalElements] = useState(0);
	const [tableTotalPages, setTableTotalPages] = useState(1);
	const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
	const [categories, setCategories] = useState<BackendCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const highlightTimeoutRef = useRef<number | null>(null);

	// Modals states
	const [isProductModalOpen, setIsProductModalOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);

	// Confirm dialog state
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirmTitle, setConfirmTitle] = useState("");
	const [confirmDesc, setConfirmDesc] = useState("");
	const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
	const [confirmDestructive, setConfirmDestructive] = useState(false);
	const [confirmText, setConfirmText] = useState("Continue");

	// Product Form state
	const [prodName, setProdName] = useState("");
	const [prodDesc, setProdDesc] = useState("");
	const [prodPrice, setProdPrice] = useState("");
	const [prodStock, setProdStock] = useState("");
	const [prodCategory, setProdCategory] = useState("");
	const [newCategoryName, setNewCategoryName] = useState("");
	const [categoryError, setCategoryError] = useState("");
	const [prodImage, setProdImage] = useState<File | null>(null);
	const [prodImagePreview, setProdImagePreview] = useState<string | null>(null);
	const [prodSubmitting, setProdSubmitting] = useState(false);
	const [categoryCreating, setCategoryCreating] = useState(false);

	// Validation states
	const [nameError, setNameError] = useState("");
	const [priceError, setPriceError] = useState("");
	const [stockError, setStockError] = useState("");
	const [imageError, setImageError] = useState("");

	// Search, Filtering and Pagination
	const [productSearch, setProductSearch] = useState("");
	const [productPage, setProductPage] = useState(1);
	const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
	const [sortBy, setSortBy] = useState("newest");
	const productsPerPage = 10;

	const handleSearchChange = (value: string) => {
		setProductSearch(value);
		setProductPage(1);
	};

	const handleCategoryFilterChange = (value: string) => {
		setSelectedCategoryFilter(value);
		setProductPage(1);
	};

	const handleSortByChange = (value: string) => {
		setSortBy(value);
		setProductPage(1);
	};

	const isFilterActive = productSearch !== "" || selectedCategoryFilter !== "all" || sortBy !== "newest";

	const handleResetFilters = () => {
		setProductSearch("");
		setSelectedCategoryFilter("all");
		setSortBy("newest");
		setProductPage(1);
	};

	const loadTableData = useCallback(async () => {
		try {
			const result = await productService.getProductsPage({
				page: productPage,
				size: productsPerPage,
				query: productSearch.trim() || undefined,
				categoryId: selectedCategoryFilter !== "all" ? selectedCategoryFilter : undefined,
			});

			setTableProducts(result.items);
			setTableTotalElements(result.totalElements);
			setTableTotalPages(Math.max(1, result.totalPages));
		} catch (error) {
			console.error("Failed to load dashboard products table:", error);
			setTableProducts([]);
			setTableTotalElements(0);
			setTableTotalPages(1);
		}
	}, [productPage, productSearch, productsPerPage, selectedCategoryFilter]);

	useEffect(() => {
		return () => {
			if (highlightTimeoutRef.current !== null) {
				window.clearTimeout(highlightTimeoutRef.current);
			}
		};
	}, []);

	const loadData = useCallback(async () => {
		try {
			const [prodsData, catsData] = await Promise.all([
				fetchStoreProducts(true),
				productService.getCategories(),
			]);
			setProducts(prodsData);
			setCategories(catsData);
			setProdCategory((current) => current || catsData[0]?.id || "");
			await loadTableData();
		} catch (error) {
			console.error("Failed to load dashboard products data:", error);
			toast.error("Failed to refresh product data.");
		} finally {
			setLoading(false);
		}
	}, [fetchStoreProducts, loadTableData]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		loadData();
	}, [loadData]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		void loadTableData();
	}, [loadTableData]);

	const showConfirm = (title: string, desc: string, action: () => void, isDestructive = false, confirmText = "Continue") => {
		setConfirmTitle(title);
		setConfirmDesc(desc);
		setConfirmAction(() => action);
		setConfirmDestructive(isDestructive);
		setConfirmText(confirmText);
		setConfirmOpen(true);
	};

	// Reset product form fields
	const resetProductForm = () => {
		setProdName("");
		setProdDesc("");
		setProdPrice("");
		setProdStock("");
		setProdCategory(categories[0]?.id || "");
		setNewCategoryName("");
		setCategoryError("");
		setProdImage(null);
		setProdImagePreview(null);
		setEditingProduct(null);
		setNameError("");
		setPriceError("");
		setStockError("");
		setImageError("");
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
		setProdDesc(product.description || product.flavor || "");
		setProdPrice(product.price.replace(/[^0-9.]/g, ""));
		setProdStock(product.stock !== undefined ? String(product.stock) : "100");

		const matchCat = categories.find(c => c.label.toLowerCase() === product.category.toLowerCase());
		setProdCategory(matchCat ? matchCat.id : categories[0]?.id || "");
		setProdImage(null);
		setProdImagePreview(product.image);
		setIsProductModalOpen(true);
	};

	const appendImageForSubmit = async (formData: FormData) => {
		if (prodImage) {
			formData.append("image", prodImage);
			return;
		}

		if (!editingProduct || !prodImagePreview) {
			return;
		}

		try {
			const response = await fetch(prodImagePreview);
			if (!response.ok) return;

			const blob = await response.blob();
			const extension = blob.type.includes("png")
				? "png"
				: blob.type.includes("webp")
					? "webp"
					: "jpg";
			const file = new File([blob], `product-image.${extension}`, { type: blob.type || "image/jpeg" });
			formData.append("image", file);
		} catch (error) {
			console.warn("Failed to preserve existing product image during update:", error);
		}
	};

	const createCategoryNow = async () => {
		const label = newCategoryName.trim();
		if (!label) {
			setCategoryError("Category name is required.");
			return;
		}

		const duplicate = categories.some((cat) => cat.label.toLowerCase() === label.toLowerCase());
		if (duplicate) {
			setCategoryError("That category already exists.");
			return;
		}

		setCategoryCreating(true);
		try {
			const created = await productService.createCategory(label);
			if (!created) {
				toast.error("Failed to create category.");
				return;
			}

			setCategories((current) => {
				if (current.some((cat) => cat.id === created.id)) {
					return current;
				}
				return [...current, created];
			});
			setProdCategory(created.id);
			setNewCategoryName("");
			setCategoryError("");
			toast.success("Category created successfully.");
		} catch (error) {
			console.error("Category creation failed:", error);
			toast.error("An error occurred while creating the category.");
		} finally {
			setCategoryCreating(false);
		}
	};

	const promptCreateCategory = () => {
		showConfirm(
			"Create Category",
			newCategoryName.trim()
				? `Do you want to create the category "${newCategoryName.trim()}" and assign it to this product?`
				: "Do you want to create this category and assign it to this product?",
			() => {
				void createCategoryNow();
			},
			false,
			"Create Category",
		);
	};

	const handleProductSubmit = async (e: FormEvent) => {
		e.preventDefault();
		
		let hasErrors = false;

		// Validate product name
		if (!prodName.trim()) {
			setNameError("Product name is required.");
			hasErrors = true;
		} else {
			setNameError("");
		}

		// Validate price
		const parsedPrice = parseFloat(prodPrice);
		if (isNaN(parsedPrice) || parsedPrice <= 0) {
			setPriceError("Price must be a positive number.");
			hasErrors = true;
		} else {
			setPriceError("");
		}

		// Validate stock quantity
		const parsedStock = parseInt(prodStock);
		if (isNaN(parsedStock) || parsedStock < 0) {
			setStockError("Stock must be a non-negative integer.");
			hasErrors = true;
		} else {
			setStockError("");
		}

		// Validate image presence for new products
		if (!editingProduct && !prodImage) {
			setImageError("Product thumbnail image is required.");
			hasErrors = true;
		} else {
			setImageError("");
		}

		if (hasErrors) {
			toast.error("Please correct the form errors before submitting.");
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
			await appendImageForSubmit(formData);

			let result: Product | null = null;
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
				if (!editingProduct) {
					setHighlightedProductId(result.id);
					setTableProducts((current) => [result, ...current.filter((product) => product.id !== result.id)].slice(0, productsPerPage));

					if (highlightTimeoutRef.current !== null) {
						window.clearTimeout(highlightTimeoutRef.current);
					}

					highlightTimeoutRef.current = window.setTimeout(() => {
						setHighlightedProductId(null);
						void loadTableData();
					}, 2000);
				}
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

	const handleDeleteProduct = (productId: string) => {
		const product = products.find((p) => p.id === productId);
		const productName = product ? product.name : "this product";

		showConfirm(
			"Delete Product",
			`Are you sure you want to delete "${productName}"? This action cannot be undone and will permanently remove this item from the catalog.`,
			async () => {
				try {
					const success = await productService.deleteProduct(productId);
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
			},
			true,
			"Delete"
		);
	};

	// Products filtering, sorting and pagination
	const filteredProducts = tableProducts;
	const sortedProducts = useMemo(() => {
		const next = [...filteredProducts];

		if (sortBy === "newest") {
			return next.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
		}

		if (sortBy === "oldest") {
			return next.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
		}

		if (sortBy === "name-desc") {
			return next.sort((a, b) => b.name.localeCompare(a.name));
		}

		if (sortBy === "price-asc") {
			return next.sort(
				(a, b) =>
					parseFloat(a.price.replace(/[^0-9.]/g, "")) - parseFloat(b.price.replace(/[^0-9.]/g, "")),
			);
		}

		if (sortBy === "price-desc") {
			return next.sort(
				(a, b) =>
					parseFloat(b.price.replace(/[^0-9.]/g, "")) - parseFloat(a.price.replace(/[^0-9.]/g, "")),
			);
		}

		return next.sort((a, b) => a.name.localeCompare(b.name));
	}, [filteredProducts, sortBy]);
	const totalProductPages = tableTotalPages;
	const paginatedProducts = sortedProducts;

	const totalProducts = products.length;
	const totalCategories = categories.length;
	const lowStockProducts = useMemo(
		() => products.filter((product) => typeof product.stock === "number" && product.stock <= 10),
		[products],
	);
	const averagePrice = useMemo(() => {
		if (products.length === 0) return 0;
		const total = products.reduce((sum, product) => {
			const price = parseFloat((product.price || "").replace(/[^0-9.]/g, "")) || 0;
			return sum + price;
		}, 0);
		return total / products.length;
	}, [products]);

	if (loading && products.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-950"></div>
				<p className="text-xs text-slate-500 font-semibold">Loading catalog list...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div className="space-y-1">
					<p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-800">Products</p>
					<h2 className="text-2xl font-playfair text-slate-950 sm:text-3xl">Product list</h2>
					<p className="max-w-2xl text-sm text-slate-500">Manage catalog, pricing, and stock.</p>
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
					<Button
						onClick={openNewProductModal}
						className="h-10 rounded-xl bg-emerald-900 px-4 text-xs font-semibold text-white hover:bg-emerald-950"
					>
						<Plus className="mr-1.5 size-4" />
						New Product
					</Button>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{[
					{
						label: "Total Products",
						value: totalProducts.toString(),
						subtitle: "Across the catalog",
						accent: "bg-slate-50 text-slate-700",
						icon: Package,
					},
					{
						label: "Categories",
						value: totalCategories.toString(),
						subtitle: "Available product groups",
						accent: "bg-teal-50 text-teal-700",
						icon: Layers,
					},
					{
						label: "Low Stock",
						value: lowStockProducts.length.toString(),
						subtitle: "Needs attention",
						accent: "bg-amber-50 text-amber-700",
						icon: AlertTriangle,
					},
					{
						label: "Avg Price",
						value: `${averagePrice.toFixed(2)} MAD`,
						subtitle: "Catalog average",
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

			<div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
				{/* Search, Filter, Sort Toolbar */}
				<div className="p-4 border-b border-slate-100 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 animate-in fade-in duration-200">
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-2xl">
						{/* Search Input */}
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" strokeWidth={1.7} />
							<Input
								value={productSearch}
								onChange={(e) => handleSearchChange(e.target.value)}
								placeholder="Search products..."
								className="pl-9 rounded-xl border-slate-200 focus-visible:ring-emerald-800 text-xs h-9 bg-slate-50/30 w-full"
							/>
						</div>

						{/* Category Filter Dropdown */}
						<select
							value={selectedCategoryFilter}
							onChange={(e) => handleCategoryFilterChange(e.target.value)}
							className="h-9 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 cursor-pointer min-w-[130px]"
						>
							<option value="all">All Categories</option>
							{categories.map((cat) => (
								<option key={cat.id} value={cat.id}>
									{cat.label}
								</option>
							))}
						</select>

						{/* Sort Dropdown */}
						<select
							value={sortBy}
							onChange={(e) => handleSortByChange(e.target.value)}
							className="h-9 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 cursor-pointer min-w-[150px]"
						>
							<option value="newest">Latest first</option>
							<option value="oldest">Oldest first</option>
							<option value="name-asc">Sort by Name (A-Z)</option>
							<option value="name-desc">Sort by Name (Z-A)</option>
							<option value="price-asc">Price: Low to High</option>
							<option value="price-desc">Price: High to Low</option>
						</select>

						{/* Reset Filters button */}
						{isFilterActive && (
							<Button
								variant="outline"
								onClick={handleResetFilters}
								className="h-9 px-3 rounded-xl border border-dashed border-red-200 text-xs font-semibold text-red-600 bg-red-50/25 hover:bg-red-50 hover:text-red-700 cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all duration-150 animate-in fade-in"
							>
								Reset
								<X className="size-3.5" />
							</Button>
						)}
					</div>

					<div className="flex items-center gap-3 shrink-0 ml-auto md:ml-0 self-end md:self-auto select-none">
						<div className="text-xs text-slate-500 font-bold font-sans">
							{tableTotalElements === 0
								? "No items match criteria"
								: `Showing ${((productPage - 1) * productsPerPage) + 1}-${Math.min(productPage * productsPerPage, tableTotalElements)} of ${tableTotalElements} items`}
						</div>
						{totalProductPages > 1 && (
							<div className="flex items-center gap-1 border border-slate-100 rounded-lg p-0.5 bg-slate-50/50">
								<Button
									variant="outline"
									size="icon"
									disabled={productPage === 1}
									onClick={() => setProductPage((p) => Math.max(1, p - 1))}
									className="h-7 w-7 rounded-md border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center justify-center active:scale-95 transition-all"
									title="Previous Page"
								>
									&larr;
								</Button>
								<span className="text-[10px] font-bold text-slate-500 px-1.5 min-w-[55px] text-center">
									{productPage} / {totalProductPages}
								</span>
								<Button
									variant="outline"
									size="icon"
									disabled={productPage === totalProductPages}
									onClick={() => setProductPage((p) => Math.min(totalProductPages, p + 1))}
									className="h-7 w-7 rounded-md border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center justify-center active:scale-95 transition-all"
									title="Next Page"
								>
									&rarr;
								</Button>
							</div>
						)}
					</div>
				</div>

				<div className="overflow-x-auto min-h-[580px]">
					<table className="w-full text-left text-sm border-collapse">
						<thead>
							<tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
								<th className="px-6 py-4">ID</th>
								<th className="px-6 py-4">Product</th>
								<th className="px-6 py-4">Description</th>
								<th className="px-6 py-4">Category</th>
								<th className="px-6 py-4">Price</th>
								<th className="px-6 py-4">Quantity</th>
								<th className="px-6 py-4 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{paginatedProducts.length === 0 ? (
								<tr>
									<td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-xs font-semibold">
										No products match your filter.
									</td>
								</tr>
								) : (
								paginatedProducts.map((product) => (
									<tr
										key={product.id}
										className={`group transition-colors duration-150 hover:bg-slate-50/40 ${
											highlightedProductId === product.id ? "bg-emerald-50/80" : ""
										}`}
									>
										<td className="px-6 py-4">
											<Tooltip content={product.id}>
												<span className="text-[10px] font-sans text-slate-400 max-w-[70px] truncate select-all block cursor-help">
													{product.id}
												</span>
											</Tooltip>
										</td>
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
										<td className="px-6 py-4 text-slate-500 text-xs max-w-[200px] truncate">
											{product.description || "No description provided."}
										</td>
										<td className="px-6 py-4">
											<span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 border border-slate-200/50 text-slate-700 px-2 py-0.5 rounded-md inline-block">
												{product.category}
											</span>
										</td>
										<td className="px-6 py-4 font-semibold text-slate-900 text-xs">
											{product.price}
										</td>
										<td className="px-6 py-4 font-semibold text-xs">
											<span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md ${
												(product.stock || 0) === 0
													? "bg-rose-50 text-rose-700 border border-rose-100/50"
													: (product.stock || 0) < 10
													? "bg-amber-50 text-amber-700 border border-amber-100/50"
													: "bg-emerald-50 text-emerald-800 border border-emerald-100/50"
											}`}>
												{product.stock !== undefined ? `${product.stock} units` : "0 units"}
											</span>
										</td>
										<td className="px-6 py-4 text-right">
											<div className="flex items-center justify-end gap-1.5">
												<Tooltip content="View in Store">
													<button
														onClick={() => window.open(`/product/${product.id}`, "_blank")}
														className="p-1.5 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-slate-400 transition-colors cursor-pointer active:scale-95"
													>
														<ExternalLink className="size-3.5" />
													</button>
												</Tooltip>
												<Tooltip content="Edit Product">
													<button
														onClick={() => openEditProductModal(product)}
														className="p-1.5 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-slate-400 transition-colors cursor-pointer active:scale-95"
													>
														<Edit className="size-3.5" />
													</button>
												</Tooltip>
												<Tooltip content="Delete Product">
													<button
														onClick={() => handleDeleteProduct(product.id)}
														className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors cursor-pointer active:scale-95"
													>
														<Trash2 className="size-3.5" />
													</button>
												</Tooltip>
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
							className="h-8 w-8 rounded-lg border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center justify-center"
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
									className={`h-8 w-8 rounded-lg font-bold cursor-pointer transition-all text-xs flex items-center justify-center ${
										productPage === pageNum
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
							disabled={productPage === totalProductPages}
							onClick={() => setProductPage((p) => Math.min(totalProductPages, p + 1))}
							className="h-8 w-8 rounded-lg border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center justify-center"
						>
							&rarr;
						</Button>
					</div>
				)}
			</div>

			{/* MODAL: CREATE OR UPDATE PRODUCT */}
			{isProductModalOpen && (
				<div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
					<div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
						<button
							onClick={() => {
								resetProductForm();
								setIsProductModalOpen(false);
							}}
							className="absolute top-4 right-4 size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
						>
							<X className="size-4" />
						</button>

						<h3 className="font-sans text-xl font-semibold text-slate-950 mb-6">
							{editingProduct ? "Edit Product" : "New Supplement Product"}
						</h3>

						<form onSubmit={handleProductSubmit} className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-1.5">
									<label className="text-xs font-bold text-slate-600">Product Name *</label>
									<Input
										value={prodName}
										onChange={(e) => {
											setProdName(e.target.value);
											if (e.target.value.trim()) setNameError("");
										}}
										placeholder="e.g. Organic Greens Powder"
										required
										className={`rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800 ${nameError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
									/>
									{nameError && <p className="text-[10px] font-semibold text-red-500 mt-0.5">{nameError}</p>}
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

							<div className="grid gap-3 sm:grid-cols-[1fr_auto]">
								<div className="space-y-1.5">
									<label className="text-xs font-bold text-slate-600">Add New Category</label>
									<Input
										value={newCategoryName}
										onChange={(e) => {
											setNewCategoryName(e.target.value);
											if (categoryError) setCategoryError("");
										}}
										placeholder="e.g. Immune Support"
										className={`rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800 ${categoryError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
									/>
									{categoryError && <p className="text-[10px] font-semibold text-red-500 mt-0.5">{categoryError}</p>}
								</div>
								<div className="flex items-end">
									<Button
										type="button"
										variant="outline"
										onClick={promptCreateCategory}
										disabled={categoryCreating}
										className="h-10 px-4 rounded-xl border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 font-semibold text-xs cursor-pointer"
									>
										{categoryCreating ? "Creating..." : "Add Category"}
									</Button>
								</div>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-1.5">
									<label className="text-xs font-bold text-slate-600">Price (MAD) *</label>
									<Input
										type="number"
										step="0.01"
										value={prodPrice}
										onChange={(e) => {
											setProdPrice(e.target.value);
											const val = parseFloat(e.target.value);
											if (!isNaN(val) && val > 0) setPriceError("");
										}}
										placeholder="e.g. 29.99"
										required
										className={`rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800 ${priceError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
									/>
									{priceError && <p className="text-[10px] font-semibold text-red-500 mt-0.5">{priceError}</p>}
								</div>
								<div className="space-y-1.5">
									<label className="text-xs font-bold text-slate-600">Stock Quantity</label>
									<Input
										type="number"
										value={prodStock}
										onChange={(e) => {
											setProdStock(e.target.value);
											const stkVal = parseInt(e.target.value);
											if (!isNaN(stkVal) && stkVal >= 0) setStockError("");
										}}
										placeholder="e.g. 100"
										className={`rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800 ${stockError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
									/>
									{stockError && <p className="text-[10px] font-semibold text-red-500 mt-0.5">{stockError}</p>}
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
								<label className="text-xs font-bold text-slate-600">Product Thumbnail *</label>
								<div className={`relative group border-2 border-dashed rounded-2xl p-6 bg-slate-50/40 hover:bg-emerald-50/10 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2.5 min-h-[140px] ${
									imageError 
										? "border-red-500 hover:border-red-600" 
										: "border-emerald-900/10 hover:border-emerald-800/50"
								}`}>
									{prodImagePreview ? (
										<div className="flex flex-col items-center gap-2">
											<div className="size-20 rounded-xl overflow-hidden bg-white p-1 border border-slate-100 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
												<img src={prodImagePreview} alt="Preview" className="h-full object-contain" />
											</div>
											<span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-800 transition-colors">
												Click to replace image
											</span>
										</div>
									) : (
										<div className="flex flex-col items-center gap-2">
											<div className="p-3 bg-emerald-50 rounded-full text-emerald-800 group-hover:scale-110 transition-transform duration-200">
												<Plus className="size-5" />
											</div>
											<div className="space-y-0.5">
												<span className="text-xs font-bold text-slate-700 block">Upload Product Image</span>
												<span className="text-[10px] text-slate-400 block">PNG, JPG, or WEBP up to 5MB</span>
											</div>
										</div>
									)}
									<input
										type="file"
										accept="image/*"
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) {
												// Validate file size (max 5MB)
												const maxBytes = 5 * 1024 * 1024;
												if (file.size > maxBytes) {
													toast.error("File is too large. Image size must be less than 5MB.");
													return;
												}
												// Validate file type
												const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
												if (!validTypes.includes(file.type)) {
													toast.error("Invalid file format. Please upload JPEG, PNG, or WEBP.");
													return;
												}
												setProdImage(file);
												setProdImagePreview(URL.createObjectURL(file));
												setImageError("");
											}
										}}
										className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
									/>
								</div>
								{imageError && <p className="text-[10px] font-semibold text-red-500 mt-0.5">{imageError}</p>}
							</div>

							<div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6 animate-in fade-in duration-200">
								<Button
									type="button"
									variant="ghost"
									onClick={() => {
										resetProductForm();
										setIsProductModalOpen(false);
									}}
									className="h-10 px-5 rounded-xl cursor-pointer font-semibold text-xs text-slate-700 hover:bg-slate-50"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={prodSubmitting}
									className="h-10 px-5 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl font-bold cursor-pointer text-xs flex items-center gap-1.5 shadow-sm"
								>
									{prodSubmitting ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
								</Button>
							</div>
						</form>
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
