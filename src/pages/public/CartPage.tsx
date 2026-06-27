import { useNavigate, Link } from "react-router";
import { useState } from "react";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";
import { APP_ROUTES } from "@/core/routes/paths";
import { useCartStore } from "@/shared/hooks/use-cart-store";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

import { toast } from "sonner";
import {
	ArrowLeft,
	ArrowRightIcon,
	Trash2,
	ShoppingBagIcon
} from "lucide-react";


export const CartPage = () => {
	const navigate = useNavigate();
	const items = useCartStore((state) => state.items);
	const updateQuantity = useCartStore((state) => state.updateQuantity);
	const removeItem = useCartStore((state) => state.removeItem);
	const subtotal = useCartStore((state) => state.subtotal());

	useDocumentTitle("Shopping Cart | Zamazor");

	// Calculations
	const shippingThreshold = 50;
	const shippingCost = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 4.99;
	const orderTotal = subtotal + shippingCost;



	return (
		<>

				{/* Cart page body */}
				<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					<h1 className="text-3xl sm:text-4xl font-playfair font-normal text-slate-950 mb-8">
						Your Shopping Cart
					</h1>

					{items.length === 0 ? (
						<div className="text-center py-20 bg-white rounded-3xl border border-emerald-900/5 shadow-xs max-w-xl mx-auto px-6">
							<ShoppingBagIcon className="size-16 text-emerald-900/25 mx-auto mb-4" />
							<h2 className="text-2xl font-playfair text-slate-900">Your cart is empty</h2>
							<p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm leading-relaxed">
								You haven't added any clean formulas to your stack yet. Build a simpler routine today.
							</p>
							<Button asChild className="mt-8 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl h-11 px-6">
								<Link to={APP_ROUTES.HOME}>Browse formulas</Link>
							</Button>
						</div>
					) : (
						<div className="grid gap-8 lg:grid-cols-[1fr_360px] items-start">
							{/* Items list */}
							<div className="space-y-4">
								{items.map(({ product, quantity }) => (
									<div
										key={product.id}
										className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 sm:p-5 bg-white rounded-2xl border border-emerald-900/5 shadow-xs hover:border-emerald-900/10 transition-colors"
									>
										{/* Details */}
										<div className="flex gap-4 items-center">
											<div
												onClick={() => navigate(`/product/${product.id}`)}
												className="size-20 shrink-0 bg-slate-50 rounded-xl border border-emerald-900/5 flex items-center justify-center p-2 cursor-pointer hover:scale-102 transition-transform"
											>
												<img src={product.image} alt={product.name} className="h-full w-full object-contain" />
											</div>
											<div>
												<Link
													to={`/product/${product.id}`}
													className="font-playfair text-lg font-bold text-slate-950 hover:text-emerald-800 transition-colors leading-tight"
												>
													{product.name}
												</Link>
												<p className="text-xs text-emerald-800 font-bold uppercase tracking-wider mt-1">{product.category}</p>
												<p className="text-xs text-slate-500 mt-0.5">{product.flavor}</p>
											</div>
										</div>

										{/* Controls (quantity, subtotal, remove) */}
										<div className="flex items-center gap-6 sm:gap-8 justify-between w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
											{/* Quantity Selector */}
											<div className="flex items-center rounded-lg border border-emerald-900/15 bg-white p-0.5">
												<button
													onClick={() => updateQuantity(product.id, quantity - 1)}
													className="size-7 font-bold text-slate-500 hover:text-slate-900 flex items-center justify-center hover:bg-slate-50 rounded-md cursor-pointer"
												>
													-
												</button>
												<span className="w-8 text-center text-xs font-bold text-slate-900 select-none">
													{quantity}
												</span>
												<button
													onClick={() => updateQuantity(product.id, quantity + 1)}
													className="size-7 font-bold text-slate-500 hover:text-slate-900 flex items-center justify-center hover:bg-slate-50 rounded-md cursor-pointer"
												>
													+
												</button>
											</div>

											{/* Price Subtotal */}
											<div className="text-right min-w-[70px]">
												<p className="text-sm font-black text-slate-900">
													{(parseFloat(product.price.replace(/[^0-9.]/g, "")) * quantity).toFixed(2)} MAD
												</p>
												<p className="text-[10px] text-slate-400 mt-0.5">{product.price} each</p>
											</div>

											{/* Delete button */}
											<button
												onClick={() => {
													removeItem(product.id);
													toast.error(`${product.name} removed from cart`);
												}}
												className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
												aria-label="Remove item"
											>
												<Trash2 className="size-4" />
											</button>
										</div>
									</div>
								))}

								<button
									onClick={() => navigate(APP_ROUTES.HOME)}
									className="flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors pt-4 group cursor-pointer"
								>
									<ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
									Continue shopping formulas
								</button>
							</div>

							{/* Summary panel */}
							<div className="space-y-4">
								<div className="bg-white rounded-3xl border border-emerald-900/5 p-5 sm:p-6 shadow-md shadow-emerald-950/5">
									<h3 className="font-playfair text-xl font-bold text-slate-950 mb-5 border-b border-slate-100 pb-4">
										Order Summary
									</h3>

									<div className="space-y-3.5 text-sm">
										<div className="flex justify-between text-slate-600">
											<span>Subtotal</span>
											<span className="font-bold text-slate-900">{subtotal.toFixed(2)} MAD</span>
										</div>


										<div className="flex justify-between text-slate-600">
											<span>Shipping</span>
											{shippingCost === 0 ? (
												<span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs uppercase tracking-wide">
													Free
												</span>
											) : (
												<span className="font-bold text-slate-900">{shippingCost.toFixed(2)} MAD</span>
											)}
										</div>

										{shippingCost > 0 && (
											<p className="text-[11px] text-slate-400 leading-snug">
												Add <strong className="text-slate-500">{(shippingThreshold - subtotal).toFixed(2)} MAD</strong> more to get free shipping!
											</p>
										)}


										<div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-100 pt-4 mt-2">
											<span>Total</span>
											<span>{orderTotal.toFixed(2)} MAD</span>
										</div>
									</div>

									{/* Checkout button */}
									<Button
										onClick={() => navigate(APP_ROUTES.CHECKOUT)}
										className="w-full h-12 bg-emerald-900 hover:bg-emerald-950 text-white font-bold rounded-xl mt-6 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/10"
									>
										Proceed to checkout
										<ArrowRightIcon className="size-4" />
									</Button>
								</div>

								{/* Info panel */}
								<div className="rounded-2xl border border-emerald-900/5 bg-[#f0f7ec] p-4 text-center">
									<p className="text-[11px] leading-relaxed text-slate-600">
										🌿 Zamazor orders are processed within 24 hours. Subscription stacks save an additional 15% on repeat deliveries with total cancel/skip controls.
									</p>
								</div>
							</div>
						</div>
					)}
				</main>


		</>
	);
};
