import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";
import CONFIG from "@/core/config/constants";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { Tooltip } from "@/shared/components/ui/tooltip";
import { productService, type BackendCategory } from "@/features/products/services/productService";
import { useProductStore } from "@/features/products/stores/productStore";
import {
	Blocks,
	Edit,
	FolderKanban,
	Package,
	Plus,
	RefreshCw,
	Search,
	Tag,
	Trash2,
	X,
} from "lucide-react";

const CATEGORIES_PER_PAGE = 8;

const cardMotion = {
	initial: { opacity: 0, y: 16 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.35 },
};

const formatCount = (value: number) =>
	new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);

export const CategoriesPage = () => {
	useDocumentTitle(`Categories Management | ${CONFIG.APP_NAME}`);

	const fetchStoreProducts = useProductStore((state) => state.fetchProducts);
	const [products, setProducts] = useState<{ category: string }[]>([]);
	const [categories, setCategories] = useState<BackendCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState("label-asc");
	const [page, setPage] = useState(1);

	const [createOpen, setCreateOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<BackendCategory | null>(null);
	const [categoryName, setCategoryName] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [nameError, setNameError] = useState("");

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirmTitle, setConfirmTitle] = useState("");
	const [confirmDesc, setConfirmDesc] = useState("");
	const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
	const [confirmDestructive, setConfirmDestructive] = useState(false);
	const [confirmText, setConfirmText] = useState("Continue");

	const categoryCounts = useMemo(() => {
		const counts = new Map<string, number>();
		for (const product of products) {
			const key = (product.category || "Uncategorized").trim().toLowerCase();
			counts.set(key, (counts.get(key) || 0) + 1);
		}
		return counts;
	}, [products]);

	const loadData = useCallback(async () => {
		setLoading(true);
		try {
			const [allCategories, allProducts] = await Promise.all([
				productService.getCategoriesPage({ page: 1, size: 1000 }),
				fetchStoreProducts(true),
			]);

			setCategories(allCategories.items);
			setProducts(allProducts.map((product) => ({ category: product.category })));
		} catch (error) {
			console.error("Failed to load categories page data:", error);
			toast.error("Failed to refresh categories.");
		} finally {
			setLoading(false);
		}
	}, [fetchStoreProducts]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		void loadData();
	}, [loadData]);

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

	const openCreate = () => {
		setEditingCategory(null);
		setCategoryName("");
		setNameError("");
		setCreateOpen(true);
	};

	const openEdit = (category: BackendCategory) => {
		setEditingCategory(category);
		setCategoryName(category.label);
		setNameError("");
		setEditOpen(true);
	};

	const resetForm = () => {
		setCategoryName("");
		setNameError("");
		setEditingCategory(null);
	};

	const validateCategoryName = (value: string) => {
		const next = value.trim();
		if (!next) {
			setNameError("Category name is required.");
			return false;
		}

		const duplicate = categories.some(
			(category) =>
				category.label.trim().toLowerCase() === next.toLowerCase() &&
				category.id !== editingCategory?.id,
		);

		if (duplicate) {
			setNameError("That category already exists.");
			return false;
		}

		setNameError("");
		return true;
	};

	const saveCategory = async () => {
		if (!validateCategoryName(categoryName)) return;

		setSubmitting(true);
		try {
			const nextLabel = categoryName.trim();
			const result = editingCategory
				? await productService.updateCategory(editingCategory.id, nextLabel)
				: await productService.createCategory(nextLabel);

			if (!result) {
				toast.error(editingCategory ? "Failed to update category." : "Failed to create category.");
				return;
			}

			toast.success(editingCategory ? "Category updated successfully." : "Category created successfully.");
			setCreateOpen(false);
			setEditOpen(false);
			resetForm();
			await loadData();
		} catch (error) {
			console.error("Category save failed:", error);
			toast.error("An error occurred while saving the category.");
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = (category: BackendCategory) => {
		const linkedProducts = categoryCounts.get(category.label.trim().toLowerCase()) || 0;

		showConfirm(
			"Delete Category",
			linkedProducts > 0
				? `Delete "${category.label}"? This category is currently linked to ${linkedProducts} product(s).`
				: `Delete "${category.label}"? This action cannot be undone.`,
			async () => {
				try {
					const success = await productService.deleteCategory(category.id);
					if (!success) {
						toast.error("Failed to delete category.");
						return;
					}

					toast.success("Category deleted successfully.");
					await loadData();
				} catch (error) {
					console.error("Category deletion failed:", error);
					toast.error("An error occurred while deleting.");
				}
			},
			true,
			"Delete",
		);
	};

	const normalizedSearch = search.trim().toLowerCase();
	const filteredCategories = useMemo(() => {
		const next = categories.filter((category) => {
			if (!normalizedSearch) return true;
			return (
				category.id.toLowerCase().includes(normalizedSearch) ||
				category.label.toLowerCase().includes(normalizedSearch)
			);
		});

		next.sort((a, b) => {
			if (sortBy === "label-desc") return b.label.localeCompare(a.label);
			if (sortBy === "products-desc") {
				return (categoryCounts.get(b.label.trim().toLowerCase()) || 0) - (categoryCounts.get(a.label.trim().toLowerCase()) || 0);
			}
			if (sortBy === "products-asc") {
				return (categoryCounts.get(a.label.trim().toLowerCase()) || 0) - (categoryCounts.get(b.label.trim().toLowerCase()) || 0);
			}
			return a.label.localeCompare(b.label);
		});

		return next;
	}, [categories, categoryCounts, normalizedSearch, sortBy]);

	const totalPages = Math.max(1, Math.ceil(filteredCategories.length / CATEGORIES_PER_PAGE));
	const safePage = Math.min(page, totalPages);
	const paginatedCategories = filteredCategories.slice(
		(safePage - 1) * CATEGORIES_PER_PAGE,
		safePage * CATEGORIES_PER_PAGE,
	);

	const totalProductsLinked = useMemo(
		() => Array.from(categoryCounts.values()).reduce((sum, count) => sum + count, 0),
		[categoryCounts],
	);

	const categoriesInUse = useMemo(
		() => categories.filter((category) => (categoryCounts.get(category.label.trim().toLowerCase()) || 0) > 0).length,
		[categories, categoryCounts],
	);

	const topCategory = useMemo(() => {
		let bestLabel = "";
		let bestCount = 0;
		for (const category of categories) {
			const count = categoryCounts.get(category.label.trim().toLowerCase()) || 0;
			if (count > bestCount) {
				bestCount = count;
				bestLabel = category.label;
			}
		}
		return { label: bestLabel, count: bestCount };
	}, [categories, categoryCounts]);

	if (loading) {
		return (
			<div className="flex min-h-[420px] flex-col items-center justify-center gap-3">
				<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-950" />
				<p className="text-xs font-semibold text-slate-500">Loading categories...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div className="space-y-1">
					<p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-800">Categories</p>
					<h2 className="text-2xl font-playfair text-slate-950 sm:text-3xl">Category list</h2>
					<p className="max-w-2xl text-sm text-slate-500">Manage catalog groupings and keep product navigation clean.</p>
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
					<Button onClick={openCreate} className="h-10 rounded-xl bg-emerald-900 px-4 text-xs font-semibold text-white hover:bg-emerald-950">
						<Plus className="mr-1.5 size-4" />
						New Category
					</Button>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{[
					{
						label: "Total Categories",
						value: formatCount(categories.length),
						icon: FolderKanban,
						accent: "bg-emerald-50 text-emerald-800",
					},
					{
						label: "Linked Products",
						value: formatCount(totalProductsLinked),
						icon: Package,
						accent: "bg-teal-50 text-teal-800",
					},
					{
						label: "Categories In Use",
						value: formatCount(categoriesInUse),
						icon: Blocks,
						accent: "bg-lime-50 text-lime-800",
					},
					{
						label: "Top Category",
						value: topCategory.label || "None",
						icon: Tag,
						accent: "bg-amber-50 text-amber-800",
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
									<h3 className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-950">{metric.value}</h3>
									{metric.label === "Top Category" ? (
										<p className="mt-1 text-xs text-slate-500">
											{topCategory.count > 0 ? `${topCategory.count} products` : "No category activity yet"}
										</p>
									) : (
										<p className="mt-1 text-xs text-slate-500">
											{metric.label === "Total Categories"
												? "Across the catalog"
												: metric.label === "Linked Products"
													? "Product mappings"
													: "Assigned to products"}
										</p>
									)}
								</div>
								<div className={`grid size-12 shrink-0 place-items-center rounded-2xl ring-1 ring-inset ${metric.accent}`}>
									<Icon className="size-5" />
								</div>
							</div>
						</motion.div>
					);
				})}
			</div>

			<div className="overflow-hidden rounded-3xl border border-emerald-900/5 bg-white shadow-md">
				<div className="flex flex-col gap-3 border-b border-slate-100 bg-white p-4 xl:flex-row xl:items-center xl:justify-between">
					<div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center max-w-3xl">
						<div className="relative flex-1 min-w-0">
							<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
							<Input
								value={search}
								onChange={(e) => {
									setSearch(e.target.value);
									setPage(1);
								}}
								placeholder="Search categories..."
								className="h-10 rounded-xl border-slate-200 bg-slate-50/40 pl-9 text-xs focus-visible:ring-emerald-800"
							/>
						</div>

						<select
							value={sortBy}
							onChange={(e) => {
								setSortBy(e.target.value);
								setPage(1);
							}}
							className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-emerald-800"
						>
							<option value="label-asc">Label A-Z</option>
							<option value="label-desc">Label Z-A</option>
							<option value="products-desc">Most products</option>
							<option value="products-asc">Least products</option>
						</select>

						{(search !== "" || sortBy !== "label-asc") && (
							<Button
								variant="outline"
								onClick={() => {
									setSearch("");
									setSortBy("label-asc");
									setPage(1);
								}}
								className="h-10 shrink-0 rounded-xl border border-dashed border-red-200 bg-red-50/25 px-3 text-xs font-semibold text-red-600 transition-all duration-150 hover:bg-red-50 hover:text-red-700"
							>
								Reset
								<X className="ml-1.5 size-3.5" />
							</Button>
						)}
					</div>

					<div className="flex items-center gap-2">
						<div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs font-bold text-slate-500">
							{filteredCategories.length === 0
								? "No categories found"
								: `Showing ${Math.min(filteredCategories.length, (safePage - 1) * CATEGORIES_PER_PAGE + 1)}-${Math.min(
										safePage * CATEGORIES_PER_PAGE,
										filteredCategories.length,
								  )} of ${filteredCategories.length}`}
						</div>
						<div className="flex items-center gap-1 rounded-lg border border-slate-100 bg-slate-50/50 p-0.5 select-none">
							<Button
								variant="outline"
								size="icon"
								disabled={safePage === 1}
								onClick={() => setPage((current) => Math.max(1, current - 1))}
								className="h-7 w-7 rounded-md border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
								title="Previous page"
							>
								&larr;
							</Button>
							<span className="min-w-[55px] px-1.5 text-center text-[10px] font-bold text-slate-500">
								{safePage} / {totalPages}
							</span>
							<Button
								variant="outline"
								size="icon"
								disabled={safePage === totalPages}
								onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
								className="h-7 w-7 rounded-md border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
								title="Next page"
							>
								&rarr;
							</Button>
						</div>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full border-collapse text-left text-sm">
						<thead>
							<tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
								<th className="px-6 py-4">Category</th>
								<th className="px-6 py-4">ID</th>
								<th className="px-6 py-4">Linked Products</th>
								<th className="px-6 py-4">Usage</th>
								<th className="px-6 py-4 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{paginatedCategories.length === 0 ? (
								<tr>
									<td colSpan={5} className="px-6 py-14 text-center text-slate-400">
										No categories match the current filters.
									</td>
								</tr>
							) : (
								paginatedCategories.map((category) => {
									const linkedProducts = categoryCounts.get(category.label.trim().toLowerCase()) || 0;

									return (
										<tr key={category.id} className="hover:bg-slate-50/40">
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													<div className="grid size-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-900/8">
														<FolderKanban className="size-4" />
													</div>
													<div>
														<p className="text-sm font-semibold text-slate-950">{category.label}</p>
														<p className="text-[11px] text-slate-500">
															{linkedProducts > 0 ? "Used in catalog" : "Not used yet"}
														</p>
													</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<Tooltip content={category.id}>
													<span className="cursor-help select-all font-mono text-[10px] font-bold text-slate-500">
														{category.id.slice(0, 8).toUpperCase()}
													</span>
												</Tooltip>
											</td>
											<td className="px-6 py-4">
												<span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
													{linkedProducts} products
												</span>
											</td>
											<td className="px-6 py-4 text-xs text-slate-500">
												{linkedProducts > 0
													? `Category appears in ${linkedProducts} product${linkedProducts > 1 ? "s" : ""}.`
													: "Ready to assign in the product form."}
											</td>
											<td className="px-6 py-4 text-right">
												<div className="flex items-center justify-end gap-2">
													<Button
														variant="outline"
														size="icon"
														onClick={() => openEdit(category)}
														className="h-8 w-8 rounded-lg border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
														title="Edit category"
													>
														<Edit className="size-4" />
													</Button>
													<Button
														variant="outline"
														size="icon"
														onClick={() => handleDelete(category)}
														className="h-8 w-8 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50"
														title="Delete category"
													>
														<Trash2 className="size-4" />
													</Button>
												</div>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>

			{(createOpen || editOpen) && (
				<div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
					<div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
						<button
							onClick={() => {
								setCreateOpen(false);
								setEditOpen(false);
								resetForm();
							}}
							className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
						>
							<X className="size-4" />
						</button>

						<h3 className="mb-2 font-sans text-xl font-semibold text-slate-950">
							{editingCategory ? "Edit Category" : "New Category"}
						</h3>
						<p className="mb-6 text-sm text-slate-500">
							{editingCategory
								? "Rename the category used in the catalog and product forms."
								: "Create a new category group for products and storefront filters."}
						</p>

						<div className="space-y-2">
							<label className="text-xs font-bold uppercase tracking-wider text-slate-400">Category Label</label>
							<Input
								value={categoryName}
								onChange={(e) => {
									setCategoryName(e.target.value);
									if (nameError) setNameError("");
								}}
								placeholder="e.g. Recovery"
								className={`h-11 rounded-xl border-slate-200 bg-slate-50/40 focus-visible:ring-emerald-800 ${
									nameError ? "border-red-500 focus-visible:ring-red-500" : ""
								}`}
							/>
							{nameError && <p className="text-xs font-semibold text-red-600">{nameError}</p>}
						</div>

						<div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
							<Button
								variant="outline"
								onClick={() => {
									setCreateOpen(false);
									setEditOpen(false);
									resetForm();
								}}
								className="h-10 rounded-xl border-slate-200 px-5 text-xs font-semibold text-slate-600"
							>
								Cancel
							</Button>
							<Button
								onClick={() => void saveCategory()}
								disabled={submitting}
								className="h-10 rounded-xl bg-emerald-900 px-5 text-xs font-bold text-white hover:bg-emerald-950"
							>
								{submitting ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
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
