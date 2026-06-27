import { useParams, useNavigate, Link } from "react-router";
import { useState, useEffect } from "react";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";
import { APP_ROUTES } from "@/core/routes/paths";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";

import { OriginButton } from "@/shared/components/ui/origin-button";
import {
	ArrowLeft,
	Check,
	StarIcon,
	ShieldCheckIcon,
	LeafIcon,
	SparklesIcon,
	HeartIcon,
	CompassIcon,
	ShoppingBagIcon
} from "lucide-react";
import { useProductStore } from "@/features/products/stores/productStore";
import { useBookmarkStore } from "@/features/products/stores/bookmarkStore";
import { useCartStore } from "@/shared/hooks/use-cart-store";
import { toast } from "sonner";
import { type Product } from "@/core/config/productsData";


export const ProductDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const addItem = useCartStore((state) => state.addItem);
	const [activeTab, setActiveTab] = useState<"usage" | "ingredients" | "science">("usage");
	const [quantity, setQuantity] = useState(1);
	const addBookmark = useBookmarkStore((state) => state.addBookmark);
	const removeBookmark = useBookmarkStore((state) => state.removeBookmark);
	const isBookmarked = useBookmarkStore((state) => state.isBookmarked);

	const { getProductById, products, fetchProducts } = useProductStore();
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [prevId, setPrevId] = useState<string | undefined>(id);

	if (id !== prevId) {
		setPrevId(id);
		setLoading(true);
		setProduct(null);
	}

	// Fetch single product details and list for recommendations
	useEffect(() => {
		let isMounted = true;
		if (id) {
			getProductById(id).then((prod) => {
				if (isMounted) {
					setProduct(prod);
					setLoading(false);
				}
			});
		}
		fetchProducts();

		return () => {
			isMounted = false;
		};
	}, [id, getProductById, fetchProducts]);

	useDocumentTitle(
		product ? `${product.name} | Zamazor Clean Supplements` : `Product | Zamazor`
	);

	// Scroll to top on load or product change
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [id]);

	if (loading) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-[#fcfdfa] p-4 text-center">
				<div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-900 border-t-transparent"></div>
				<p className="mt-4 text-slate-500 font-sans text-sm">Loading supplement stack details...</p>
			</div>
		);
	}

	if (!product) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-[#fcfdfa] p-4 text-center">
				<h1 className="text-3xl font-playfair text-slate-900">Product not found</h1>
				<p className="mt-2 text-slate-500">We couldn't find the clean supplement formula you were looking for.</p>
				<Button asChild className="mt-6 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl">
					<Link to={APP_ROUTES.HOME}>Return to home</Link>
				</Button>
			</div>
		);
	}

	// Generate cross-sell recommendations (different from the current product)
	const recommendations = products
		.filter((p) => p.id !== product.id)
		.slice(0, 3);



	return (
		<>

			{/* Main Product Area */}
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Back Button */}
				<button
					onClick={() => navigate(APP_ROUTES.HOME)}
					className="flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition-colors mb-8 group cursor-pointer"
				>
					<ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
					Back to home
				</button>

				<div className="grid gap-12 lg:grid-cols-2 lg:items-start">
					{/* Left Column: Visual Container */}
					<div className="space-y-6">
						<div className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-emerald-950/5 bg-white p-8 flex items-center justify-center shadow-lg shadow-emerald-950/5 group">
							<span className="absolute left-6 top-6 z-10 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-900 border border-emerald-900/10 shadow-xs">
								{product.badge}
							</span>

							<button
								type="button"
								onClick={() => {
									if (isBookmarked(product.id)) {
										removeBookmark(product.id);
										toast.success(`Removed ${product.name} from wishlist.`);
									} else {
										addBookmark(product);
										toast.success(`Added ${product.name} to wishlist!`);
									}
								}}
								className="absolute right-6 top-6 z-10 size-10 rounded-full bg-white flex items-center justify-center border border-emerald-950/5 shadow-xs hover:scale-105 transition-all text-slate-400 hover:text-rose-500 cursor-pointer"
								title={isBookmarked(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
							>
								<HeartIcon className={cn("size-5 transition-colors", isBookmarked(product.id) ? "fill-rose-500 text-rose-500" : "text-slate-400")} />
							</button>

							<img
								src={product.image}
								alt={product.name}
								className="h-4/5 w-4/5 object-contain transition-transform duration-300 group-hover:scale-105"
							/>
						</div>

						{/* Feature highlights grid */}
						<div className="grid grid-cols-3 gap-3">
							<div className="rounded-2xl border border-emerald-900/5 bg-white p-4 text-center shadow-xs">
								<ShieldCheckIcon className="size-5 text-emerald-700 mx-auto" />
								<p className="mt-2 text-xs font-extrabold text-slate-900 uppercase tracking-wide">3rd Party Tested</p>
								<p className="text-[10px] text-slate-500 mt-0.5">Lab verified purity</p>
							</div>
							<div className="rounded-2xl border border-emerald-900/5 bg-white p-4 text-center shadow-xs">
								<LeafIcon className="size-5 text-emerald-700 mx-auto" />
								<p className="mt-2 text-xs font-extrabold text-slate-900 uppercase tracking-wide">100% Clean</p>
								<p className="text-[10px] text-slate-500 mt-0.5">No artificial colors</p>
							</div>
							<div className="rounded-2xl border border-emerald-900/5 bg-white p-4 text-center shadow-xs">
								<SparklesIcon className="size-5 text-emerald-700 mx-auto" />
								<p className="mt-2 text-xs font-extrabold text-slate-900 uppercase tracking-wide">Optimal Dose</p>
								<p className="text-[10px] text-slate-500 mt-0.5">High bioavailability</p>
							</div>
						</div>
					</div>

					{/* Right Column: Product Detail details */}
					<div className="flex flex-col justify-between">
						<div>
							<p className="text-xs font-black uppercase tracking-widest text-emerald-700">{product.category}</p>
							<h1 className="mt-2 text-4xl font-playfair font-normal leading-none text-slate-950 sm:text-5xl">
								{product.name}
							</h1>

							{/* Rating details */}
							<div className="mt-4 flex items-center gap-2">
								<div className="flex text-amber-400">
									{Array.from({ length: 5 }).map((_, i) => (
										<StarIcon key={i} className="size-4 fill-current" />
									))}
								</div>
								<span className="text-xs font-bold text-slate-500">4.9 (184 reviews)</span>
							</div>

							<div className="mt-6 flex items-baseline gap-4">
								<span className="text-3xl font-black text-slate-950">{product.price}</span>
								<span className="text-sm font-semibold text-slate-500">Free shipping included</span>
							</div>

							{/* Flavor pill */}
							<div className="mt-6">
								<span className="text-xs font-black text-slate-400 uppercase tracking-wider block">Flavor</span>
								<span className="inline-block mt-2 text-xs font-bold px-4 py-2 bg-emerald-50 text-emerald-900 border border-emerald-900/10 rounded-full">
									{product.flavor}
								</span>
							</div>

							<p className="mt-6 text-sm sm:text-base leading-relaxed text-slate-600 font-sans">
								{product.description}
							</p>

							{/* Stacking routine advisory box */}
							<div className="mt-8 rounded-2xl bg-[#f0f7ec] border border-emerald-900/10 p-5 flex items-start gap-4">
								<CompassIcon className="size-6 text-emerald-800 mt-0.5 shrink-0" />
								<div>
									<h4 className="text-sm font-bold text-emerald-950 font-sans">Optimal Daily Window</h4>
									<p className="text-xs text-slate-600 mt-1 font-sans leading-relaxed">
										{product.category === "Recovery" 
											? "Consuming Night Repair 30-45 minutes before bedtime encourages deeper recovery and resets muscle tissue cell growth overnight." 
											: product.category === "Protein"
											? "Take within 45 minutes of training to build muscle fibers, or use as a mid-day meal supplement to boost metabolic energy."
											: product.category === "Greens"
											? "Consume first thing in the morning on an empty stomach to enhance gut biome health and natural digestive enzyme pathways."
											: "Sip throughout workout cycles or focus windows to maintain hydration, blood flow, and sustained mineral levels."}
									</p>
								</div>
							</div>

							{/* Quantity and Add to Cart */}
							<div className="mt-8 flex flex-col sm:flex-row gap-4 sm:items-center border-t border-emerald-900/5 pt-8">
								<div className="flex items-center self-start sm:self-auto rounded-xl border border-emerald-900/15 bg-white p-1">
									<button
										onClick={() => setQuantity(Math.max(1, quantity - 1))}
										className="size-9 font-bold text-slate-500 hover:text-slate-900 flex items-center justify-center hover:bg-slate-50 rounded-lg cursor-pointer"
									>
										-
									</button>
									<span className="w-12 text-center text-sm font-bold text-slate-900 select-none">
										{quantity}
									</span>
									<button
										onClick={() => setQuantity(quantity + 1)}
										className="size-9 font-bold text-slate-500 hover:text-slate-900 flex items-center justify-center hover:bg-slate-50 rounded-lg cursor-pointer"
									>
										+
									</button>
								</div>

								<div className="flex-1 flex gap-3">
									<OriginButton
										variant="emerald"
										onClick={() => {
											if (product) {
												addItem(product, quantity);
												toast.success(`${quantity}x ${product.name} added to cart!`);
											}
										}}
										className="flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
									>
										<ShoppingBagIcon className="size-4" />
										Add to cart &bull; {product ? `${(parseFloat(product.price.replace(/[^0-9.]/g, "")) * quantity).toFixed(2)} MAD` : ""}
									</OriginButton>

									{product && (
										<Button
											type="button"
											variant="outline"
											onClick={() => {
												if (isBookmarked(product.id)) {
													removeBookmark(product.id);
													toast.success(`Removed ${product.name} from wishlist.`);
												} else {
													addBookmark(product);
													toast.success(`Added ${product.name} to wishlist!`);
												}
											}}
											className="size-12 rounded-xl border-emerald-900/10 text-slate-700 hover:bg-rose-50/50 hover:text-rose-600 hover:border-rose-100 flex items-center justify-center cursor-pointer transition-colors shadow-sm"
											title={isBookmarked(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
										>
											<HeartIcon className={cn("size-5 transition-colors", isBookmarked(product.id) ? "fill-rose-500 text-rose-500" : "text-slate-500")} />
										</Button>
									)}
								</div>
							</div>

							{/* Key Benefits */}
							<div className="mt-8">
								<h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Benefits</h3>
								<ul className="mt-3 space-y-2.5">
									{product.benefits?.map((benefit) => (
										<li key={benefit} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
											<span className="grid size-4 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800 mt-0.5">
												<Check className="size-2.5" />
											</span>
											<span>{benefit}</span>
										</li>
									))}
								</ul>
							</div>
						</div>

						{/* Interactive Tabs bar */}
						<div className="mt-10 border-t border-emerald-900/5 pt-8">
							<div className="flex border-b border-emerald-900/10 gap-6">
								{(["usage", "ingredients", "science"] as const).map((tab) => (
									<button
										key={tab}
										onClick={() => setActiveTab(tab)}
										className={cn(
											"pb-3 text-xs sm:text-sm font-black uppercase tracking-wider border-b-2 -mb-[2px] transition-all cursor-pointer",
											activeTab === tab
												? "border-emerald-800 text-emerald-900"
												: "border-transparent text-slate-400 hover:text-slate-600"
										)}
									>
										{tab === "usage" ? "How to use" : tab === "ingredients" ? "Ingredients" : "Evidence"}
									</button>
								))}
							</div>

							<div className="py-5 font-sans">
								{activeTab === "usage" && (
									<div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3">
										<p>{product.usage}</p>
										<p><strong>Note:</strong> We recommend starting consistency with 1 dose daily. Best mixed with cold liquid, as hot liquids can degrade active probiotic cultures or vitamins.</p>
									</div>
								)}

								{activeTab === "ingredients" && (
									<div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
										<p className="font-bold mb-3 text-slate-900">Active ingredients in each dose:</p>
										<div className="flex flex-wrap gap-2">
											{product.ingredients?.map((ing) => (
												<span key={ing} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
													{ing}
												</span>
											))}
										</div>
										<p className="mt-4 text-[11px] text-slate-400 leading-snug">All Zamazor supplement formulations are free from magnesium stearate, gluten, GMOs, soy, and dairy. Full transparent batch sheets are accessible via the QR code printed on the bottom canister.</p>
									</div>
								)}

								{activeTab === "science" && (
									<div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
										<p>Every active component in this product is included in clinical, science-backed dosages rather than generic micro-doses. Our formulations are validated by sports scientists and certified chemists.</p>
										<div className="flex items-center gap-2 mt-4 text-emerald-800 font-semibold text-xs">
											<ShieldCheckIcon className="size-4" />
											<span>Certified NSF & ISO-9001 quality facility</span>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Cross-Sell Recommendations */}
				<section className="mt-20 border-t border-emerald-900/10 pt-16">
					<div className="text-center mb-12">
						<p className="text-xs font-black uppercase tracking-widest text-emerald-700">Perfect your stack</p>
						<h2 className="mt-2 text-3xl font-playfair font-normal tracking-tight text-slate-950 sm:text-4xl">Complete your daily routine.</h2>
						<p className="mt-3 max-w-xl mx-auto text-sm leading-relaxed text-slate-500">
							These supplementary blends pair beautifully with {product.name} to optimize your training and recovery balance.
						</p>
					</div>

					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{recommendations.map((rec) => (
							<div
								key={rec.id}
								onClick={() => navigate(`/product/${rec.id}`)}
								className="rounded-3xl border border-emerald-950/5 bg-white p-4 shadow-sm hover:shadow-lg transition-all duration-150 flex flex-col justify-between group cursor-pointer"
							>
								<div>
									<div className="relative aspect-square overflow-hidden rounded-2xl bg-white border border-gray-100/60 p-4 flex items-center justify-center">
										<span className="absolute left-3 top-3 z-10 rounded-full bg-white/80 backdrop-blur-md px-3 py-0.5 text-[10px] font-semibold text-emerald-900 border border-white/20 shadow-sm">
											{rec.badge}
										</span>
										<img
											src={rec.image}
											alt={rec.name}
											className="h-3/4 w-3/4 object-contain transition-transform duration-200 ease-out group-hover:scale-105"
										/>
									</div>
									<div className="mt-4 px-1">
										<p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
											{rec.category}
										</p>
										<div className="mt-1 flex items-baseline justify-between gap-2">
											<h3 className="text-lg font-playfair font-semibold leading-tight text-slate-950">
												{rec.name}
											</h3>
											<p className="text-sm font-bold text-slate-900 shrink-0">{rec.price}</p>
										</div>
									</div>
								</div>

								<OriginButton
									variant="emerald"
									onClick={(e) => {
										e.stopPropagation();
										addItem(rec);
										toast.success(`${rec.name} added to cart!`);
									}}
									className="mt-4 w-full h-10 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
								>
									<ShoppingBagIcon className="size-3.5" />
									Add to cart
								</OriginButton>
							</div>
						))}
					</div>
				</section>
			</main>

		</>
	);
};
