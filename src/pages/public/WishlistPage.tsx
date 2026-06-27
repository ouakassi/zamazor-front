import { Link, useNavigate } from "react-router";
import { useBookmarkStore } from "@/features/products/stores/bookmarkStore";
import { useCartStore } from "@/shared/hooks/use-cart-store";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";
import CONFIG from "@/core/config/constants";
import { APP_ROUTES } from "@/core/routes/paths";
import { Button } from "@/shared/components/ui/button";
import { OriginButton } from "@/shared/components/ui/origin-button";
import { toast } from "sonner";
import { Heart, ShoppingBag, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const WishlistPage = () => {
	useDocumentTitle(`My Wishlist | ${CONFIG.APP_NAME}`);
	const navigate = useNavigate();

	const bookmarks = useBookmarkStore((state) => state.bookmarks);
	const removeBookmark = useBookmarkStore((state) => state.removeBookmark);
	const clearBookmarks = useBookmarkStore((state) => state.clearBookmarks);
	const addToCart = useCartStore((state) => state.addItem);

	const handleAddToCart = (product: any, e: React.MouseEvent) => {
		e.stopPropagation();
		addToCart(product);
		toast.success(`${product.name} added to cart!`);
	};

	const handleRemove = (productId: string, productName: string, e: React.MouseEvent) => {
		e.stopPropagation();
		removeBookmark(productId);
		toast.success(`${productName} removed from wishlist.`);
	};

	return (
		<div className="min-h-screen bg-[#fcfdfa] py-12 px-4 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				{/* Header Section */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-emerald-900/10 pb-6 mb-8">
					<div>
						<Link
							to={APP_ROUTES.HOME}
							className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 mb-3"
						>
							<ArrowLeft className="size-3.5" />
							Back to shopping
						</Link>
						<h1 className="text-3xl sm:text-4xl font-playfair font-normal text-slate-950">
							My Wishlist
						</h1>
						<p className="text-sm text-slate-500 mt-1">
							Save and manage your favorite wellness formulas.
						</p>
					</div>

					{bookmarks.length > 0 && (
						<Button
							variant="ghost"
							onClick={() => {
								clearBookmarks();
								toast.success("Wishlist cleared.");
							}}
							className="h-10 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl cursor-pointer"
						>
							<Trash2 className="size-4 mr-1.5" />
							Clear All
						</Button>
					)}
				</div>

				{/* Content Grid */}
				{bookmarks.length === 0 ? (
					<div className="text-center py-20 bg-white rounded-[2rem] border border-emerald-900/5 p-8 max-w-md mx-auto shadow-xs">
						<span className="grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-900/30 mx-auto mb-5">
							<Heart className="size-8" />
						</span>
						<h3 className="text-xl font-playfair text-slate-950">Your wishlist is empty</h3>
						<p className="mt-2 text-sm text-slate-500">
							Explore our targeted supplement stacks and save your favorites here.
						</p>
						<Button asChild className="mt-6 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl h-11 px-5">
							<Link to={APP_ROUTES.SHOP}>
								Browse Formulas
								<ArrowRight className="size-4 ml-1.5" />
							</Link>
						</Button>
					</div>
				) : (
					<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
						{bookmarks.map((product) => (
							<motion.article
								key={product.id}
								whileHover={{ y: -6 }}
								transition={{ duration: 0.12, ease: "easeOut" }}
								onClick={() => navigate(`/product/${product.id}`)}
								className="rounded-[2rem] border border-emerald-950/5 bg-white p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer relative"
							>
								{/* Heart Button Overlay */}
								<button
									onClick={(e) => handleRemove(product.id, product.name, e)}
									className="absolute right-6 top-6 z-10 size-9 rounded-full bg-white/95 text-rose-500 shadow-sm border border-slate-100 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
									title="Remove from Wishlist"
								>
									<Heart className="size-4.5 fill-rose-500 text-rose-500" />
								</button>

								<div>
									{/* Image container */}
									<div className="relative h-64 overflow-hidden rounded-[1.5rem] bg-white border border-gray-100/60">
										<img
											src={product.image}
											alt={product.name}
											className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-103"
										/>
									</div>

									{/* Text details */}
									<div className="mt-4 px-1">
										<p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
											{product.category}
										</p>
										<h3 className="mt-1 text-lg font-playfair font-semibold leading-snug text-slate-950 line-clamp-1">
											{product.name}
										</h3>
										<div className="mt-2 flex items-baseline justify-between">
											<p className="text-base font-bold text-slate-950">{product.price}</p>
											<p className="text-xs text-slate-400 font-sans">{product.flavor}</p>
										</div>
									</div>
								</div>

								{/* CTA Action */}
								<OriginButton
									variant="emerald"
									onClick={(e) => handleAddToCart(product, e)}
									className="mt-5 w-full h-10 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
								>
									<ShoppingBag className="size-3.5" />
									Add to cart
								</OriginButton>
							</motion.article>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
