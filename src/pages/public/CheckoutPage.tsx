import { useNavigate, useLocation, Link } from "react-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutFormValues } from "@/features/orders/schemas/checkoutSchema";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";
import { APP_ROUTES } from "@/core/routes/paths";
import { useCartStore } from "@/shared/hooks/use-cart-store";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { OriginButton } from "@/shared/components/ui/origin-button";
import logo from "@/assets/images/zamazor.svg";
import { toast } from "sonner";
import { orderService } from "@/features/orders/services/orderService";
import { useAuthStore } from "@/features/auth/stores/authStore";
import {
	ArrowLeft,
	CreditCard,
	Lock,
	CheckCircle2,
	ShoppingBag,
	Truck,
	ShieldCheck,
	Sparkles
} from "lucide-react";

export const CheckoutPage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const items = useCartStore((state) => state.items);
	const clearCart = useCartStore((state) => state.clearCart);
	const subtotal = useCartStore((state) => state.subtotal());

	// Retrieve discount from location state (applied promo code from cart)
	const discountPercentage = (location.state as { discount?: number })?.discount || 0;

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [orderNumber, setOrderNumber] = useState("");
	const user = useAuthStore((state) => state.user);

	const { register, handleSubmit, setValue, formState: { errors } } = useForm<CheckoutFormValues>({
		resolver: zodResolver(checkoutSchema),
		defaultValues: {
			email: "",
			firstName: "",
			lastName: "",
			address: "",
			city: "",
			zip: "",
			cardNumber: "",
			cardExpiry: "",
			cardCvv: "",
		}
	});

	useEffect(() => {
		if (user) {
			if (user.email) setValue("email", user.email);
			if (user.fullName) {
				const names = user.fullName.trim().split(/\s+/);
				setValue("firstName", names[0] || "");
				setValue("lastName", names.slice(1).join(" ") || "");
			}
			if (user.shippingAddress) {
				const parts = user.shippingAddress.split(",").map((p) => p.trim());
				if (parts.length >= 4) {
					const hasNamePrefix = parts[0].toLowerCase().includes(user.fullName.toLowerCase()) || 
					                     parts[0].toLowerCase().includes((user.fullName.trim().split(/\s+/)[0] || "").toLowerCase());
					if (hasNamePrefix) {
						setValue("address", parts[1] || "");
						setValue("city", parts[2] || "");
						setValue("zip", parts[3] || "");
					} else {
						setValue("address", parts[0] || "");
						setValue("city", parts[1] || "");
						setValue("zip", parts[2] || "");
					}
				} else if (parts.length === 3) {
					setValue("address", parts[0] || "");
					setValue("city", parts[1] || "");
					setValue("zip", parts[2] || "");
				} else {
					setValue("address", user.shippingAddress);
				}
			}
		}
	}, [user, setValue]);

	useDocumentTitle("Secure Checkout | Zamazor");

	// Calculations
	const discountAmount = subtotal * (discountPercentage / 100);
	const shippingThreshold = 50;
	const shippingCost = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 4.99;
	const orderTotal = subtotal - discountAmount + shippingCost;

	const handleCheckoutSubmit = async (data: CheckoutFormValues) => {
		setIsSubmitting(true);

		try {
			const auth = useAuthStore.getState();
			const userId = auth.user?.id || "";
			const shippingAddress = `${data.firstName} ${data.lastName}, ${data.address}, ${data.city}, ${data.zip}`;
			const response = await orderService.checkout(userId, shippingAddress);

			// Update local auth store so the saved shipping address is stored and pre-filled next time
			if (auth.user) {
				useAuthStore.setState({
					user: {
						...auth.user,
						shippingAddress,
					},
				});
			}

			setIsSubmitting(false);
			setIsSuccess(true);
			setOrderNumber(response.orderNumber);
			toast.success("Order placed successfully!");
		} catch {
			setIsSubmitting(false);
			toast.error("An error occurred while placing your order. Please try again.");
		}
	};

	const handleSuccessReturn = () => {
		clearCart();
		navigate(APP_ROUTES.HOME);
	};

	if (items.length === 0 && !isSuccess) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-[#fcfdfa] p-4 text-center">
				<ShoppingBag className="size-16 text-emerald-900/25 mb-4" />
				<h1 className="text-3xl font-playfair text-slate-900">Your checkout is empty</h1>
				<p className="mt-2 text-slate-500">There are no items in your cart to checkout.</p>
				<Button asChild className="mt-6 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl">
					<Link to={APP_ROUTES.HOME}>Browse formulas</Link>
				</Button>
			</div>
		);
	}

	if (isSuccess) {
		return (
			<div className="min-h-screen bg-[#fcfdfa] flex flex-col items-center justify-center p-4">
				<div className="max-w-md w-full bg-white rounded-3xl border border-emerald-900/10 p-6 sm:p-8 text-center shadow-xl shadow-emerald-950/5">
					<CheckCircle2 className="size-16 text-emerald-600 mx-auto mb-5 animate-pulse" />
					<h1 className="text-3xl font-playfair font-normal text-slate-950">Thank you for your order!</h1>
					<p className="text-sm text-slate-500 mt-2">
						Your clean stack order has been successfully placed. We've sent a receipt details and updates to <strong className="text-slate-700">{email}</strong>.
					</p>

					<div className="my-6 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-900/5 text-left text-sm space-y-2">
						<div className="flex justify-between">
							<span className="text-slate-500">Order Number:</span>
							<span className="font-mono font-bold text-slate-900">{orderNumber}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-500">Delivery Method:</span>
							<span className="font-bold text-slate-900">Standard Insured (3-5 days)</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-500">Order Total:</span>
							<span className="font-extrabold text-emerald-900">${orderTotal.toFixed(2)}</span>
						</div>
					</div>

					<div className="flex items-center gap-2 justify-center text-xs text-emerald-800 font-bold uppercase tracking-wider mb-6">
						<Sparkles className="size-4 animate-spin-slow text-emerald-700" />
						<span>Consistency starts now</span>
					</div>

					<Button
						onClick={handleSuccessReturn}
						className="w-full h-12 bg-emerald-900 hover:bg-emerald-950 text-white font-bold rounded-xl cursor-pointer shadow-md"
					>
						Return to homepage
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#fcfdfa] text-slate-900 selection:bg-emerald-100 flex flex-col justify-between">
			<div>
				{/* Top Secure Banner */}
				<div className="bg-emerald-950 px-4 py-2.5 text-center text-xs sm:text-sm font-semibold text-emerald-50 flex items-center justify-center gap-2 relative z-50">
					<Lock className="size-3.5 text-lime-300" />
					<span>Secure SSL 256-bit checkout &bull; Zamazor Inc.</span>
				</div>

				{/* Simplified Header */}
				<header className="mx-auto mt-2 w-[calc(100%-2rem)] max-w-7xl rounded-2xl border border-emerald-900/10 bg-[#f7fbf3]/90 shadow-md backdrop-blur p-4 flex items-center justify-between">
					<Link to={APP_ROUTES.CART} className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950">
						<ArrowLeft className="size-4" />
						Cart
					</Link>
					<Link to={APP_ROUTES.HOME} className="flex items-center gap-2">
						<img src={logo} alt="Zamazor" className="size-9 rounded-lg border border-emerald-900/10 bg-white" />
						<span className="text-lg font-black tracking-normal text-emerald-950">Zamazor</span>
					</Link>
					<div className="flex items-center gap-1.5 text-slate-500 text-xs sm:text-sm font-bold">
						<Lock className="size-4 text-emerald-700" />
						<span className="hidden sm:inline">Secure checkout</span>
					</div>
				</header>

				{/* Checkout Content Grid */}
				<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					<div className="grid gap-8 lg:grid-cols-[1fr_380px] items-start">
						{/* Checkout details Form */}
						<form onSubmit={handleSubmit(handleCheckoutSubmit)} className="space-y-6">
							{/* Section 1: Customer Contact */}
							<div className="bg-white rounded-3xl border border-emerald-900/5 p-5 sm:p-6 shadow-xs">
								<h2 className="font-playfair text-xl font-bold text-slate-950 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
									<span className="size-6 bg-emerald-900 text-white rounded-full flex items-center justify-center text-xs font-bold font-sans">1</span>
									Contact Information
								</h2>
								<div className="space-y-3">
									<div>
										<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">Email address</label>
										<Input
											type="email"
											placeholder="you@example.com"
											{...register("email")}
											className="h-11 rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800 bg-[#fbfcf9]"
										/>
										{errors.email && (
											<p className="text-xs text-rose-600 mt-1 font-bold">{errors.email.message}</p>
										)}
									</div>
								</div>
							</div>

							{/* Section 2: Shipping details */}
							<div className="bg-white rounded-3xl border border-emerald-900/5 p-5 sm:p-6 shadow-xs">
								<h2 className="font-playfair text-xl font-bold text-slate-950 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
									<span className="size-6 bg-emerald-900 text-white rounded-full flex items-center justify-center text-xs font-bold font-sans">2</span>
									Shipping Details
								</h2>
								<div className="space-y-3">
									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">First name</label>
											<Input
												type="text"
												placeholder="John"
												{...register("firstName")}
												className="h-11 rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800 bg-[#fbfcf9]"
											/>
											{errors.firstName && (
												<p className="text-xs text-rose-600 mt-1 font-bold">{errors.firstName.message}</p>
											)}
										</div>
										<div>
											<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">Last name</label>
											<Input
												type="text"
												placeholder="Doe"
												{...register("lastName")}
												className="h-11 rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800 bg-[#fbfcf9]"
											/>
											{errors.lastName && (
												<p className="text-xs text-rose-600 mt-1 font-bold">{errors.lastName.message}</p>
											)}
										</div>
									</div>

									<div>
										<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">Address line 1</label>
										<Input
											type="text"
											placeholder="123 Wellness Way"
											{...register("address")}
											className="h-11 rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800 bg-[#fbfcf9]"
										/>
										{errors.address && (
											<p className="text-xs text-rose-600 mt-1 font-bold">{errors.address.message}</p>
										)}
									</div>
 
									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">City</label>
											<Input
												type="text"
												placeholder="San Francisco"
												{...register("city")}
												className="h-11 rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800 bg-[#fbfcf9]"
											/>
											{errors.city && (
												<p className="text-xs text-rose-600 mt-1 font-bold">{errors.city.message}</p>
											)}
										</div>
										<div>
											<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">Postal/ZIP Code</label>
											<Input
												type="text"
												placeholder="94103"
												{...register("zip")}
												className="h-11 rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800 bg-[#fbfcf9]"
											/>
											{errors.zip && (
												<p className="text-xs text-rose-600 mt-1 font-bold">{errors.zip.message}</p>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Section 3: Secure Payment details */}
							<div className="bg-white rounded-3xl border border-emerald-900/5 p-5 sm:p-6 shadow-xs">
								<h2 className="font-playfair text-xl font-bold text-slate-950 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
									<span className="size-6 bg-emerald-900 text-white rounded-full flex items-center justify-center text-xs font-bold font-sans">3</span>
									Secure Payment
								</h2>
								<div className="space-y-4">
									{/* Credit card tab header */}
									<div className="flex gap-2 p-1.5 bg-[#f0f7ec] rounded-xl border border-emerald-900/10">
										<button type="button" className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg bg-emerald-900 text-white shadow-xs">
											<CreditCard className="size-4" />
											Credit Card
										</button>
									</div>

									<div className="space-y-3">
										<div>
											<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">Card number</label>
											<Input
												type="text"
												placeholder="4111 2222 3333 4444"
												{...register("cardNumber")}
												className="h-11 rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800 bg-[#fbfcf9]"
											/>
											{errors.cardNumber && (
												<p className="text-xs text-rose-600 mt-1 font-bold">{errors.cardNumber.message}</p>
											)}
										</div>
 
										<div className="grid grid-cols-2 gap-3">
											<div>
												<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">Expiry date</label>
												<Input
													type="text"
													placeholder="MM/YY"
													{...register("cardExpiry")}
													className="h-11 rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800 bg-[#fbfcf9]"
												/>
												{errors.cardExpiry && (
													<p className="text-xs text-rose-600 mt-1 font-bold">{errors.cardExpiry.message}</p>
												)}
											</div>
											<div>
												<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">CVV/CVC</label>
												<Input
													type="password"
													maxLength={4}
													placeholder="•••"
													{...register("cardCvv")}
													className="h-11 rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800 bg-[#fbfcf9]"
												/>
												{errors.cardCvv && (
													<p className="text-xs text-rose-600 mt-1 font-bold">{errors.cardCvv.message}</p>
												)}
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Checkout Action button */}
							<OriginButton
								type="submit"
								variant="emerald"
								disabled={isSubmitting}
								className="w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/10 text-base"
							>
								{isSubmitting ? (
									<span>Processing payment...</span>
								) : (
									<>
										<Lock className="size-4" />
										Complete Order &bull; ${orderTotal.toFixed(2)}
									</>
								)}
							</OriginButton>
						</form>

						{/* Right Column: Order Review */}
						<div className="space-y-4">
							<div className="bg-white rounded-3xl border border-emerald-900/5 p-5 sm:p-6 shadow-md shadow-emerald-950/5">
								<h3 className="font-playfair text-lg font-bold text-slate-950 mb-4 border-b border-slate-100 pb-3">
									Review Stack ({items.length})
								</h3>

								{/* Items list */}
								<div className="max-h-[220px] overflow-y-auto pr-1 divide-y divide-slate-100 scrollbar-none mb-4">
									{items.map(({ product, quantity }) => (
										<div key={product.id} className="flex gap-3 py-3 items-center justify-between first:pt-0 last:pb-0">
											<div className="flex gap-3 items-center min-w-0">
												<div className="size-12 shrink-0 bg-slate-50 border border-emerald-900/5 rounded-xl flex items-center justify-center p-1">
													<img src={product.image} alt={product.name} className="h-full w-full object-contain" />
												</div>
												<div className="min-w-0">
													<p className="font-bold text-slate-900 text-xs truncate leading-snug">{product.name}</p>
													<p className="text-[10px] text-slate-400 mt-0.5">{quantity}x &bull; {product.flavor}</p>
												</div>
											</div>
											<span className="text-xs font-bold text-slate-900 shrink-0">
												${(parseFloat(product.price.replace("$", "")) * quantity).toFixed(2)}
											</span>
										</div>
									))}
								</div>

								{/* Price review list */}
								<div className="space-y-2.5 text-xs border-t border-slate-100 pt-4">
									<div className="flex justify-between text-slate-500">
										<span>Subtotal</span>
										<span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
									</div>

									{discountPercentage > 0 && (
										<div className="flex justify-between text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
											<span>Wellness Promo (20%)</span>
											<span>-${discountAmount.toFixed(2)}</span>
										</div>
									)}

									<div className="flex justify-between text-slate-500">
										<span>Shipping</span>
										{shippingCost === 0 ? (
											<span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px] uppercase">Free</span>
										) : (
											<span className="font-bold text-slate-900">${shippingCost.toFixed(2)}</span>
										)}
									</div>


									<div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-100 pt-3 mt-2">
										<span>Order Total</span>
										<span>${orderTotal.toFixed(2)}</span>
									</div>
								</div>
							</div>

							{/* Trust USPs */}
							<div className="bg-white rounded-3xl border border-emerald-900/5 p-5 shadow-xs space-y-4">
								<div className="flex items-start gap-3">
									<ShieldCheck className="size-5 text-emerald-700 shrink-0 mt-0.5" />
									<div>
										<h4 className="text-xs font-bold text-slate-950 font-sans">Money-Back Guarantee</h4>
										<p className="text-[10px] text-slate-500 leading-normal mt-0.5">
											If your stack doesn't help you feel more consistent within 30 days, we'll refund you 100%. No questions asked.
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Truck className="size-5 text-emerald-700 shrink-0 mt-0.5" />
									<div>
										<h4 className="text-xs font-bold text-slate-950 font-sans">Insured Shipping</h4>
										<p className="text-[10px] text-slate-500 leading-normal mt-0.5">
											All Zamazor deliveries are fully insured. If your canister is damaged in transit, we ship a replacement immediately.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>

			{/* Secure Footer */}
			<footer className="text-center py-8 text-xs text-slate-400 border-t border-emerald-900/5 mt-12 bg-white font-sans">
				<p>&copy; {new Date().getFullYear()} Zamazor Clean Supplements. All rights reserved. Secure 256-bit encryption connection.</p>
			</footer>
		</div>
	);
};
