import { useNavigate, useLocation } from "react-router";
import { useState, useMemo, useEffect } from "react";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";
import { useCartStore } from "@/shared/hooks/use-cart-store";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

import { OriginButton } from "@/shared/components/ui/origin-button";
import { toast } from "sonner";
import {
	SlidersHorizontal,
	X,
	Check,
	ArrowUpDown,
	SearchIcon,
	ShoppingBagIcon,
	Heart as HeartIcon
} from "lucide-react";
import { useProductStore } from "@/features/products/stores/productStore";
import { useBookmarkStore } from "@/features/products/stores/bookmarkStore";
import {
	productService,
	type BackendCategory,
} from "@/features/products/services/productService";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { APP_ROUTES } from "@/core/routes/paths";
import { useLanguage } from "@/shared/context/LanguageContext";
import type { Product } from "@/core/config/productsData";


type PriceFilter = "all" | "under-25" | "25-40" | "over-40";
type SortOption = "name-asc" | "price-asc" | "price-desc";

export const ShopPage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { language, t } = useLanguage();
	const addItem = useCartStore((state) => state.addItem);
	const addBookmark = useBookmarkStore((state) => state.addBookmark);
	const removeBookmark = useBookmarkStore((state) => state.removeBookmark);
	const isBookmarked = useBookmarkStore((state) => state.isBookmarked);
	const { fetchProducts, products, loading: productsLoading } = useProductStore();
	const user = useAuthStore((state) => state.user);

	const getCategoryLabel = (cat: string) => {
		if (cat === "All") return t("shop.filterCategory");
		if (cat === "Protein") return t("homepage.categories.protein");
		if (cat === "Greens") return t("homepage.categories.greens");
		if (cat === "Energy") return t("homepage.categories.energy");
		if (cat === "Recovery") return t("homepage.categories.recovery");
		if (cat === "Wellness") return t("homepage.categories.wellness");
		return cat;
	};

	useDocumentTitle(`${t("shop.title")} | Zamazor`);

	const [apiProducts, setApiProducts] = useState<Product[]>([]);
	const [loadingSearch, setLoadingSearch] = useState(false);
	const [dbCategories, setDbCategories] = useState<string[]>(["All", "Protein", "Greens", "Energy", "Recovery", "Immunity", "Wellness"]);

	useEffect(() => {
		void fetchProducts();
	}, [fetchProducts]);

	// Fetch categories from database on mount
	useEffect(() => {
		const fetchCategoriesList = async () => {
			try {
				const cats = await productService.getCategories();
				const formatted = ["All", ...cats.map((c: BackendCategory) => c.label)];
				setDbCategories(formatted);
			} catch (error) {
				console.error("Failed to fetch categories:", error);
			}
		};
		fetchCategoriesList();
	}, []);

	// State variables for filtering & sorting
	const searchParams = useMemo(
		() => new URLSearchParams(location.search),
		[location.search],
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "All");
	const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
	const [selectedBadge, setSelectedBadge] = useState<string>("All");
	const [sortBy, setSortBy] = useState<SortOption>("name-asc");
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

	const ITEMS_PER_PAGE = 6;
	const [currentPage, setCurrentPage] = useState(1);

	// Fetch products on search query or category/filter change
	useEffect(() => {
		const loadSearchProducts = async () => {
			if (searchQuery.trim() === "") {
				setApiProducts([]);
				return;
			}
			setLoadingSearch(true);
			try {
				const results = await productService.searchProducts(searchQuery);
				setApiProducts(results);
			} catch (error) {
				console.error("Failed search query:", error);
			} finally {
				setLoadingSearch(false);
			}
		};
		loadSearchProducts();
	}, [searchQuery]);

	// Sync categories if route state changes
	useEffect(() => {
		const categoryParam = searchParams.get("category");
		queueMicrotask(() => {
			setSelectedCategory(categoryParam || "All");
			setCurrentPage(1);
		});
	}, [searchParams]);

	// Reset to first page when query or filters change
	useEffect(() => {
		queueMicrotask(() => setCurrentPage(1));
	}, [searchQuery, selectedCategory, priceFilter, selectedBadge, sortBy]);

	// Get all unique badges/goals for the dropdown filter
	const uniqueBadges = useMemo(() => {
		const source = searchQuery.trim() !== "" ? apiProducts : products;
		const badgesSet = new Set<string>();
		source.forEach((p) => {
			if (p.badge) badgesSet.add(p.badge);
		});
		return ["All", ...Array.from(badgesSet)];
	}, [apiProducts, products, searchQuery]);

	// Filter & Sort Logic
	const filteredProducts = useMemo(() => {
		let result = searchQuery.trim() !== "" ? apiProducts : products;

		// 2. Filter by Category
		if (selectedCategory !== "All") {
			result = result.filter((p) => p.category === selectedCategory);
		}

		// 3. Filter by Price
		if (priceFilter === "under-25") {
			result = result.filter((p) => {
				const numeric = parseFloat(p.price.replace(/[^\d.]/g, ""));
				return numeric < 25;
			});
		} else if (priceFilter === "25-40") {
			result = result.filter((p) => {
				const numeric = parseFloat(p.price.replace(/[^\d.]/g, ""));
				return numeric >= 25 && numeric <= 40;
			});
		} else if (priceFilter === "over-40") {
			result = result.filter((p) => {
				const numeric = parseFloat(p.price.replace(/[^\d.]/g, ""));
				return numeric > 40;
			});
		}

		// 4. Filter by Badge/Goal
		if (selectedBadge !== "All") {
			result = result.filter((p) => p.badge === selectedBadge);
		}

		// 5. Sort
		result = [...result];
		if (sortBy === "name-asc") {
			result.sort((a, b) => a.name.localeCompare(b.name));
		} else if (sortBy === "price-asc") {
			result.sort((a, b) => {
				const pA = parseFloat(a.price.replace(/[^\d.]/g, ""));
				const pB = parseFloat(b.price.replace(/[^\d.]/g, ""));
				return pA - pB;
			});
		} else if (sortBy === "price-desc") {
			result.sort((a, b) => {
				const pA = parseFloat(a.price.replace(/[^\d.]/g, ""));
				const pB = parseFloat(b.price.replace(/[^\d.]/g, ""));
				return pB - pA;
			});
		}

		return result;
	}, [apiProducts, products, searchQuery, selectedCategory, priceFilter, selectedBadge, sortBy]);

	const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

	useEffect(() => {
		queueMicrotask(() => {
			setCurrentPage((page) => Math.min(page, totalPages));
		});
	}, [totalPages]);

	const paginatedProducts = useMemo(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE;
		return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
	}, [filteredProducts, currentPage]);

	const countMessage = useMemo(() => {
		if (filteredProducts.length === 0) return language === "fr" ? "Affichage de 0 formules propres" : "Showing 0 clean formulas";
		const start = (currentPage - 1) * ITEMS_PER_PAGE;
		const end = Math.min(start + ITEMS_PER_PAGE, filteredProducts.length);
		return language === "fr" 
			? `Affichage de ${start + 1}–${end} sur ${filteredProducts.length} formules propres`
			: `Showing ${start + 1}–${end} of ${filteredProducts.length} clean formulas`;
	}, [filteredProducts.length, currentPage, language]);

	const handleResetFilters = () => {
		setSearchQuery("");
		setSelectedCategory("All");
		setPriceFilter("all");
		setSelectedBadge("All");
		setSortBy("name-asc");
		setCurrentPage(1);
		toast.info(language === "fr" ? "Filtres réinitialisés." : "Filters cleared successfully.");
	};

	return (
		<>

				{/* Shop Banner */}
				<section className="bg-emerald-950 text-white py-16 sm:py-20 mt-4 rounded-b-[3rem] text-center px-4">
					<div className="max-w-3xl mx-auto">
						<p className="text-xs font-bold uppercase tracking-widest text-lime-300">{t("homepage.hero.badge1")}</p>
						<h1 className="mt-3 text-4xl sm:text-5xl font-playfair font-normal leading-tight">
							{t("shop.title")}
						</h1>
						<p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-emerald-50/80 leading-relaxed font-sans">
							{t("shop.desc")}
						</p>
					</div>
				</section>

				{/* Shop Main content Grid */}
				<main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
					<div className="grid gap-8 lg:grid-cols-[250px_1fr] items-start">
						{/* Desktop Filters Sidebar */}
						<aside className="hidden lg:block space-y-6">
							{/* Filter heading */}
							<div className="flex items-center justify-between border-b border-slate-100 pb-4">
								<h3 className="font-playfair text-lg font-bold text-slate-900">{language === "fr" ? "Filtres" : "Filters"}</h3>
								<button
									onClick={handleResetFilters}
									className="text-xs font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
								>
									{language === "fr" ? "Réinitialiser" : "Clear all"}
								</button>
							</div>

							{/* Search input */}
							<div className="space-y-2">
								<label className="text-xs font-black uppercase text-slate-400 tracking-wider">{t("common.search")}</label>
								<div className="relative">
									<SearchIcon className="absolute left-3 top-3 size-4 text-slate-400" />
									<Input
										type="text"
										placeholder="e.g. Protein, Matcha"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="h-10 pl-9 rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800"
									/>
								</div>
							</div>

							{/* Categories Filter */}
							<div className="space-y-2.5">
								<label className="text-xs font-black uppercase text-slate-400 tracking-wider">{language === "fr" ? "Catégorie" : "Category"}</label>
								<div className="flex flex-col gap-1.5">
									{dbCategories.map((cat) => (
										<button
											key={cat}
											onClick={() => setSelectedCategory(cat)}
											className={cn(
												"flex items-center justify-between text-left text-sm py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer",
												selectedCategory === cat
													? "bg-emerald-50 text-emerald-900 font-bold"
													: "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
											)}
										>
											<span>{getCategoryLabel(cat)}</span>
											{selectedCategory === cat && <Check className="size-3.5 text-emerald-800" />}
										</button>
									))}
								</div>
							</div>

							{/* Price Range Filter */}
							<div className="space-y-2.5">
								<label className="text-xs font-black uppercase text-slate-400 tracking-wider">{language === "fr" ? "Gamme de prix" : "Price Range"}</label>
								<div className="flex flex-col gap-1.5">
									{[
										{ id: "all", label: language === "fr" ? "Tous les prix" : "All Prices" },
										{ id: "under-25", label: language === "fr" ? "Moins de 25 MAD" : "Under 25 MAD" },
										{ id: "25-40", label: language === "fr" ? "25 à 40 MAD" : "25 to 40 MAD" },
										{ id: "over-40", label: language === "fr" ? "Plus de 40 MAD" : "Over 40 MAD" }
									].map((opt) => (
										<button
											key={opt.id}
											onClick={() => setPriceFilter(opt.id as PriceFilter)}
											className={cn(
												"flex items-center justify-between text-left text-sm py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer",
												priceFilter === opt.id
													? "bg-emerald-50 text-emerald-900 font-bold"
													: "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
											)}
										>
											<span>{opt.label}</span>
											{priceFilter === opt.id && <Check className="size-3.5 text-emerald-800" />}
										</button>
									))}
								</div>
							</div>

							{/* Badge/Goal Filter */}
							<div className="space-y-2.5">
								<label className="text-xs font-black uppercase text-slate-400 tracking-wider">Benefit Badge</label>
								<div className="flex flex-col gap-1.5">
									{uniqueBadges.map((badge) => (
										<button
											key={badge}
											onClick={() => setSelectedBadge(badge)}
											className={cn(
												"flex items-center justify-between text-left text-sm py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer",
												selectedBadge === badge
													? "bg-emerald-50 text-emerald-900 font-bold"
													: "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
											)}
										>
											<span>{badge}</span>
											{selectedBadge === badge && <Check className="size-3.5 text-emerald-800" />}
										</button>
									))}
								</div>
							</div>
						</aside>

						{/* Product Catalog side */}
						<div className="space-y-6">
							{/* Controls & Mob trigger */}
							<div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 flex-wrap">
								<div className="flex items-center gap-3">
									{/* Mobile filter button */}
									<Button
										onClick={() => setMobileFiltersOpen(true)}
										variant="outline"
										size="sm"
										className="lg:hidden h-10 px-4 rounded-xl border-emerald-900/10 text-emerald-800 flex items-center gap-1.5"
									>
										<SlidersHorizontal className="size-4" />
										Filters
									</Button>
									<span className="text-xs font-bold text-slate-500 font-sans">
										{countMessage}
									</span>
								</div>

								<div className="flex items-center gap-3">
									{/* Mini Pagination Navigation */}
									{totalPages > 1 && (
										<div className="flex items-center gap-2 bg-white border border-emerald-900/10 rounded-xl px-2.5 py-1 h-10 select-none">
											<button
												disabled={currentPage === 1}
												onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
												className="text-emerald-800 hover:text-emerald-950 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-sm cursor-pointer p-0.5"
												title="Previous Page"
											>
												&larr;
											</button>
											<span className="text-xs font-bold text-slate-600 font-sans px-1">
												{currentPage}/{totalPages}
											</span>
											<button
												disabled={currentPage === totalPages}
												onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
												className="text-emerald-800 hover:text-emerald-950 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-sm cursor-pointer p-0.5"
												title="Next Page"
											>
												&rarr;
											</button>
										</div>
									)}

									{/* Sort Selector */}
									<div className="flex items-center gap-2">
										<ArrowUpDown className="size-4 text-slate-400" />
										<select
											value={sortBy}
											onChange={(e) => setSortBy(e.target.value as SortOption)}
											className="h-10 rounded-xl border border-emerald-900/10 bg-white px-3 py-1 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-800 cursor-pointer shadow-xs"
										>
											<option value="name-asc">{t("shop.sortName")}</option>
											<option value="price-asc">{t("shop.sortPriceLow")}</option>
											<option value="price-desc">{t("shop.sortPriceHigh")}</option>
										</select>
									</div>
								</div>
							</div>

							{/* Active filter badges display */}
							{(selectedCategory !== "All" || priceFilter !== "all" || selectedBadge !== "All" || searchQuery !== "") && (
								<div className="flex flex-wrap gap-2 items-center">
									<span className="text-xs font-bold text-slate-400 mr-1 uppercase">{language === "fr" ? "Filtres actifs:" : "Active filters:"}</span>
									{searchQuery && (
										<span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200">
											"{searchQuery}"
											<X className="size-3 text-slate-500 hover:text-slate-800 cursor-pointer" onClick={() => setSearchQuery("")} />
										</span>
									)}
									{selectedCategory !== "All" && (
										<span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-900/10">
											{selectedCategory}
											<X className="size-3 text-emerald-700 hover:text-emerald-900 cursor-pointer" onClick={() => setSelectedCategory("All")} />
										</span>
									)}
									{priceFilter !== "all" && (
										<span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-900/10">
											{priceFilter === "under-25" ? "Under 25 MAD" : priceFilter === "25-40" ? "25 to 40 MAD" : "Over 40 MAD"}
											<X className="size-3 text-emerald-700 hover:text-emerald-900 cursor-pointer" onClick={() => setPriceFilter("all")} />
										</span>
									)}
									{selectedBadge !== "All" && (
										<span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-900/10">
											{selectedBadge}
											<X className="size-3 text-emerald-700 hover:text-emerald-900 cursor-pointer" onClick={() => setSelectedBadge("All")} />
										</span>
									)}
								</div>
							)}

							{/* Product Grid */}
							{loadingSearch || (productsLoading && products.length === 0 && searchQuery.trim() === "") ? (
								<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
									{[...Array(6)].map((_, i) => (
										<div key={i} className="rounded-3xl border border-emerald-950/5 bg-white p-4 shadow-sm animate-pulse space-y-4">
											<div className="aspect-square bg-slate-50 rounded-2xl flex items-center justify-center">
												<div className="size-20 bg-slate-100 rounded-full animate-pulse" />
											</div>
											<div className="h-4 bg-slate-100 rounded-full w-2/3" />
											<div className="h-3 bg-slate-50 rounded-full w-1/3" />
											<div className="flex items-center justify-between pt-4">
												<div className="h-5 bg-slate-100 rounded-full w-1/4" />
												<div className="h-9 bg-slate-100 rounded-xl w-1/3" />
											</div>
										</div>
									))}
								</div>
							) : filteredProducts.length === 0 ? (
								<div className="text-center py-20 bg-white rounded-3xl border border-emerald-900/5 px-6">
									<SlidersHorizontal className="size-16 text-emerald-900/25 mx-auto mb-4" />
									<h3 className="text-xl font-playfair text-slate-900 font-bold">No supplement blends found</h3>
									<p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm leading-relaxed">
										We couldn't find any clean supplements matching your filters. Try checking different categories or search queries.
									</p>
									<Button
										onClick={handleResetFilters}
										className="mt-6 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl h-11 px-6 font-bold cursor-pointer"
									>
										Reset filters
									</Button>
								</div>
							) : (
								<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
									{paginatedProducts.map((product) => (
										<div
											key={product.id}
											onClick={() => navigate(`/product/${product.id}`)}
											className="rounded-3xl border border-emerald-950/5 bg-white p-4 shadow-sm hover:shadow-lg transition-all duration-150 flex flex-col justify-between group cursor-pointer"
										>
											<div>
												<div className="relative aspect-square overflow-hidden rounded-2xl bg-white border border-gray-100/60 p-4 flex items-center justify-center">
													<span className="absolute left-3 top-3 z-10 rounded-full bg-white/80 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-emerald-900 border border-white/20 shadow-sm">
														{product.badge}
													</span>
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															if (isBookmarked(product.id)) {
																removeBookmark(product.id);
																toast.success(`Removed ${product.name} from wishlist.`);
															} else {
																addBookmark(product);
																toast.success(`Added ${product.name} to wishlist!`);
															}
														}}
														className="absolute right-3 top-3 z-10 size-9 rounded-full bg-white/95 text-slate-700 shadow-sm border border-slate-100 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
														title={isBookmarked(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
													>
														<HeartIcon className={cn("size-4 transition-colors", isBookmarked(product.id) ? "fill-rose-500 text-rose-500" : "text-slate-500")} />
													</button>
													{user?.role === "ADMIN" && (
														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation();
																navigate(APP_ROUTES.DASHBOARD);
															}}
															className="absolute left-3 bottom-3 z-10 bg-emerald-900 hover:bg-emerald-950 text-white font-sans font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-lg shadow-sm cursor-pointer transition-transform hover:scale-105"
															title="Edit Product (Admin Panel)"
														>
															{language === "fr" ? "✏️ Modifier" : "✏️ Edit"}
														</button>
													)}
													<img
														src={product.image}
														alt={product.name}
														className="h-3/4 w-3/4 object-contain transition-transform duration-200 ease-out group-hover:scale-105"
													/>
												</div>
												<div className="mt-5 px-1">
													<p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
														{getCategoryLabel(product.category)}
													</p>
													<div className="mt-2 flex items-baseline justify-between gap-2">
														<h3 className="text-xl font-playfair font-semibold leading-tight text-slate-950">
															{product.name}
														</h3>
														<p className="text-base font-bold text-slate-900 shrink-0">{product.price}</p>
													</div>
													<p className="mt-1.5 text-sm text-slate-500 font-sans">{product.flavor}</p>
												</div>
											</div>

											<OriginButton
												variant="emerald"
												onClick={(e) => {
													e.stopPropagation();
													addItem(product);
													toast.success(language === "fr" ? `${product.name} ajouté au panier !` : `${product.name} added to cart!`);
												}}
												className="mt-5 w-full h-11 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
											>
												<ShoppingBagIcon className="size-3.5" />
												{t("common.addToCart")}
											</OriginButton>
										</div>
									))}
								</div>
							)}

							{/* Pagination Controls */}
							{totalPages > 1 && (
								<div className="flex items-center justify-center gap-2 mt-10 pt-6 border-t border-emerald-900/5 select-none">
									<Button
										variant="outline"
										size="icon"
										disabled={currentPage === 1}
										onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
										className="h-9 w-9 rounded-xl border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
									>
										&larr;
									</Button>
									
									{Array.from({ length: totalPages }).map((_, i) => {
										const pageNum = i + 1;
										return (
											<Button
												key={pageNum}
												variant={currentPage === pageNum ? "default" : "outline"}
												onClick={() => setCurrentPage(pageNum)}
												className={cn(
													"h-9 w-9 rounded-xl font-bold cursor-pointer transition-all text-xs",
													currentPage === pageNum
														? "bg-emerald-900 hover:bg-emerald-950 text-white border-emerald-900 shadow-sm"
														: "border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
												)}
											>
												{pageNum}
											</Button>
										);
									})}

									<Button
										variant="outline"
										size="icon"
										disabled={currentPage === totalPages}
										onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
										className="h-9 w-9 rounded-xl border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
									>
										&rarr;
									</Button>
								</div>
							)}
						</div>
					</div>
				</main>

			{/* Mobile Filters Drawer Modal */}
			{mobileFiltersOpen && (
				<div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/50 backdrop-blur-sm">
					<div className="ml-auto w-full max-w-xs bg-white p-6 h-full flex flex-col justify-between shadow-2xl relative animate-slide-left select-none">
						<div>
							{/* Modal Header */}
							<div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
								<h3 className="font-playfair text-lg font-bold text-slate-900">{language === "fr" ? "Filtres" : "Filters"}</h3>
								<button
									onClick={() => setMobileFiltersOpen(false)}
									className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
								>
									<X className="size-5" />
								</button>
							</div>

							{/* Search input mobile */}
							<div className="space-y-2 mb-6">
								<label className="text-xs font-black uppercase text-slate-400 tracking-wider">{t("common.search")}</label>
								<div className="relative">
									<SearchIcon className="absolute left-3 top-3 size-4 text-slate-400" />
									<Input
										type="text"
										placeholder="e.g. Protein, Matcha"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="h-10 pl-9 rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800"
									/>
								</div>
							</div>

							{/* Categories Filter mobile */}
							<div className="space-y-2.5 mb-6">
								<label className="text-xs font-black uppercase text-slate-400 tracking-wider">{language === "fr" ? "Catégorie" : "Category"}</label>
								<div className="flex flex-wrap gap-1.5">
									{dbCategories.map((cat) => (
										<button
											key={cat}
											onClick={() => setSelectedCategory(cat)}
											className={cn(
												"text-xs font-bold px-3 py-1.5 rounded-full border transition-colors cursor-pointer",
												selectedCategory === cat
													? "bg-emerald-900 text-white border-emerald-900 shadow-sm"
													: "bg-white text-emerald-800 border-emerald-900/10 hover:bg-emerald-50"
											)}
										>
											{getCategoryLabel(cat)}
										</button>
									))}
								</div>
							</div>

							{/* Price Range Filter mobile */}
							<div className="space-y-2.5 mb-6">
								<label className="text-xs font-black uppercase text-slate-400 tracking-wider">{language === "fr" ? "Gamme de prix" : "Price Range"}</label>
								<div className="flex flex-wrap gap-1.5">
									{[
										{ id: "all", label: language === "fr" ? "Tous les prix" : "All Prices" },
										{ id: "under-25", label: language === "fr" ? "Moins de 25 MAD" : "Under 25 MAD" },
										{ id: "25-40", label: language === "fr" ? "25 à 40 MAD" : "25 to 40 MAD" },
										{ id: "over-40", label: language === "fr" ? "Plus de 40 MAD" : "Over 40 MAD" }
									].map((opt) => (
										<button
											key={opt.id}
											onClick={() => setPriceFilter(opt.id as PriceFilter)}
											className={cn(
												"text-xs font-bold px-3 py-1.5 rounded-full border transition-colors cursor-pointer",
												priceFilter === opt.id
													? "bg-emerald-900 text-white border-emerald-900 shadow-sm"
													: "bg-white text-emerald-800 border-emerald-900/10 hover:bg-emerald-50"
											)}
										>
											{opt.label}
										</button>
									))}
								</div>
							</div>
						</div>

						<div className="space-y-3 pt-6 border-t border-slate-100">
							<Button
								onClick={handleResetFilters}
								variant="outline"
								className="w-full h-11 rounded-xl border-emerald-900/15 text-emerald-800 font-bold"
							>
								{language === "fr" ? "Réinitialiser" : "Clear Filters"}
							</Button>
							<Button
								onClick={() => setMobileFiltersOpen(false)}
								className="w-full h-11 bg-emerald-900 hover:bg-emerald-950 text-white font-bold rounded-xl"
							>
								{language === "fr" ? `Afficher les résultats (${filteredProducts.length})` : `Show Results (${filteredProducts.length})`}
							</Button>
						</div>
					</div>
				</div>
			)}

		</>
	);
};
