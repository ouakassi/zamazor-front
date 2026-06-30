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
import { addressService } from "@/features/addresses/services/addressService";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useLanguage } from "@/shared/context/LanguageContext";
import { parsePrice } from "@/shared/utils/price";
import { buildShippingAddressString, toAddressFormValues } from "@/features/addresses/utils/addressHelpers";
import { isSystemError } from "@/shared/types";
import {
	ArrowLeft,
	Lock,
	CheckCircle2,
	ShoppingBag,
	Truck,
	ShieldCheck,
	Sparkles,
	Loader2,
} from "lucide-react";

const StripeMark = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
		<rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="#635BFF" />
		<path
			d="M14.9 9.2c-.8-.3-1.6-.5-2.4-.5-1 0-1.5.4-1.5.9 0 .6.6.9 2 1.4 2.2.8 3.2 1.7 3.2 3.3 0 2-1.5 3.1-3.9 3.1-1.1 0-2.2-.2-3-.6v-2.1c.8.4 1.9.8 2.9.8 1 0 1.6-.4 1.6-1 0-.7-.6-1-2-1.5-2.1-.8-3.1-1.7-3.1-3.2 0-1.8 1.5-3 3.8-3 .9 0 1.8.1 2.5.4v2z"
			fill="#fff"
		/>
	</svg>
);

export const CheckoutPage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { language, t } = useLanguage();
	const items = useCartStore((state) => state.items);
	const clearCart = useCartStore((state) => state.clearCart);
	const subtotal = useCartStore((state) => state.subtotal());

	// Retrieve discount from location state (applied promo code from cart)
	const discountPercentage = (location.state as { discount?: number })?.discount || 0;
	const isCheckoutCancelled = location.pathname.endsWith("/cancel");
	const cancelledOrderId = new URLSearchParams(location.search).get("orderId");

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
	const [paymentError, setPaymentError] = useState("");
	const [isSuccess, setIsSuccess] = useState(false);
	const [orderNumber, setOrderNumber] = useState("");
	const [completedOrderTotal, setCompletedOrderTotal] = useState<number | null>(null);
	const user = useAuthStore((state) => state.user);

	const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm<CheckoutFormValues>({
		resolver: zodResolver(checkoutSchema),
		defaultValues: {
			email: "",
			firstName: "",
			lastName: "",
			address: "",
			city: "",
			phone: "",
			country: "Morocco",
		}
	});

	useEffect(() => {
		let active = true;

		const loadAddress = async () => {
			if (!user) return;

			if (user.email) setValue("email", user.email);
			if (user.fullName) {
				const names = user.fullName.trim().split(/\s+/);
				setValue("firstName", names[0] || "");
				setValue("lastName", names.slice(1).join(" ") || "");
			}

			const backendAddress = await addressService.getDefaultAddress();
			if (!active) return;

			const source = toAddressFormValues(backendAddress, user.shippingAddress);
			setValue("address", source.street);
			setValue("city", source.city);
			setValue("phone", source.phone);
			setValue("country", source.country || "Morocco");
		};

		loadAddress();

		return () => {
			active = false;
		};
	}, [user, setValue]);

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const orderId = params.get("orderId");
		const sessionId = params.get("sessionId");
		const fallbackTotal = subtotal - subtotal * (discountPercentage / 100);

		if (!orderId || !sessionId || isSuccess) {
			return;
		}

		let active = true;

		const verifyPayment = async () => {
			setIsVerifyingPayment(true);
			setPaymentError("");

			const verified = await orderService.verifyCheckoutPayment(orderId, sessionId);
			if (!active) return;

			if (!verified || isSystemError(verified)) {
				setIsVerifyingPayment(false);
				setPaymentError(language === "fr" ? "La vérification du paiement a échoué." : "Payment verification failed.");
				toast.error(language === "fr" ? "Vérification Stripe échouée." : "Stripe verification failed.");
				return;
			}

			const finalOrderTotal = Number.isFinite(verified.total) ? verified.total : fallbackTotal;
			clearCart();
			setCompletedOrderTotal(finalOrderTotal);
			setOrderNumber(verified.id.slice(0, 8).toUpperCase());
			setIsSuccess(true);
			setIsVerifyingPayment(false);
			sessionStorage.removeItem("zamazor.pending-payment-order-id");
			toast.success(language === "fr" ? "Paiement confirmé avec succès !" : "Payment confirmed successfully!");
		};

		void verifyPayment();

		return () => {
			active = false;
		};
	}, [clearCart, discountPercentage, isSuccess, language, location.search, subtotal]);

	useDocumentTitle(`${t("checkout.title")} | Zamazor`);

	// Calculations
	const discountAmount = subtotal * (discountPercentage / 100);
	const shippingCost: number = 0;
	const orderTotal = subtotal - discountAmount;
	const resolvePaymentUrl = (value: unknown) => {
		if (typeof value === "string") return value;
		if (!value || typeof value !== "object") return null;

		const paymentResponse = value as {
			paymentUrl?: string;
			url?: string;
			checkoutUrl?: string;
		};

		return paymentResponse.paymentUrl || paymentResponse.url || paymentResponse.checkoutUrl || null;
	};

	if (isCheckoutCancelled) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-[#fcfdfa] p-4 text-center">
				<ShieldCheck className="mb-4 size-16 text-amber-700/30" />
				<h1 className="text-3xl font-playfair text-slate-900">
					{language === "fr" ? "Paiement annulé" : "Payment canceled"}
				</h1>
				<p className="mt-2 max-w-md text-slate-500">
					{language === "fr"
						? `Votre paiement Stripe a été annulé${cancelledOrderId ? ` pour la commande ${cancelledOrderId.slice(0, 8).toUpperCase()}` : ""}.`
						: `Your Stripe payment was canceled${cancelledOrderId ? ` for order ${cancelledOrderId.slice(0, 8).toUpperCase()}` : ""}.`}
				</p>
				<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
					<Button asChild className="rounded-xl bg-emerald-900 px-6 text-white hover:bg-emerald-950">
						<Link to={APP_ROUTES.CHECKOUT}>{language === "fr" ? "Revenir au paiement" : "Return to checkout"}</Link>
					</Button>
					<Button asChild variant="outline" className="rounded-xl border-emerald-900/10 px-6 text-emerald-900 hover:bg-emerald-50">
						<Link to={APP_ROUTES.SHOP}>{language === "fr" ? "Retour à la boutique" : "Back to shop"}</Link>
					</Button>
				</div>
			</div>
		);
	}

	const handleCheckoutSubmit = async (data: CheckoutFormValues) => {
		await submitPayment(data);
	};

	const submitPayment = async (data: CheckoutFormValues) => {
		setIsSubmitting(true);

		try {
			const auth = useAuthStore.getState();
			const shippingAddress = buildShippingAddressString({
				street: data.address,
				city: data.city,
				phone: data.phone,
				country: data.country,
			});
			const response = await orderService.checkout({
				country: data.country,
				city: data.city,
				street: data.address,
				phone: data.phone,
				isDefault: true,
			});

			const existingAddress = await addressService.getDefaultAddress();
			const addressPayload = {
				country: data.country,
				city: data.city,
				street: data.address,
				phone: data.phone,
				isDefault: true,
			};
			const savedAddress = existingAddress
				? await addressService.updateDefaultAddress(addressPayload)
				: await addressService.createDefaultAddress(addressPayload);

			if (!savedAddress) {
				toast.error(language === "fr" ? "Adresse non enregistrée." : "Address could not be saved.");
			}

			// Update local auth store so the saved shipping address is stored and pre-filled next time
			if (auth.user) {
				useAuthStore.setState({
					user: {
						...auth.user,
						shippingAddress,
					},
				});
			}

			sessionStorage.setItem("zamazor.pending-payment-order-id", response.id);
			sessionStorage.setItem(
				"zamazor.pending-payment-total",
				String(Number.isFinite(response.total) ? response.total : orderTotal),
			);
			sessionStorage.setItem("zamazor.pending-payment-email", data.email);

			const paymentResponse = await orderService.getCheckoutPaymentUrl(response.id);
			const paymentUrl = resolvePaymentUrl(paymentResponse);

			if (!paymentUrl) {
				throw new Error("The backend did not return a valid Stripe payment URL.");
			}

			setIsSubmitting(false);
			toast.success(language === "fr" ? "Redirection vers le paiement sécurisé..." : "Redirecting to secure payment...");
			window.location.assign(paymentUrl);
		} catch (error) {
			setIsSubmitting(false);
			const message =
				error instanceof Error && error.message
					? error.message
					: language === "fr"
						? "Une erreur s'est produite lors de la commande."
						: "An error occurred while placing your order. Please try again.";
			toast.error(message);
			setPaymentError(message);
		}
	};

	const handleSuccessReturn = () => {
		clearCart();
		sessionStorage.removeItem("zamazor.pending-payment-order-id");
		sessionStorage.removeItem("zamazor.pending-payment-total");
		sessionStorage.removeItem("zamazor.pending-payment-email");
		navigate(APP_ROUTES.SHOP);
	};

	if (items.length === 0 && !isSuccess) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-[#fcfdfa] p-4 text-center">
				<ShoppingBag className="size-16 text-emerald-900/25 mb-4" />
				<h1 className="text-3xl font-playfair text-slate-900">{language === "fr" ? "Votre panier est vide" : "Your checkout is empty"}</h1>
				<p className="mt-2 text-slate-500">{language === "fr" ? "Il n'y a aucun article dans votre panier." : "There are no items in your cart to checkout."}</p>
				<Button asChild className="mt-6 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl">
					<Link to={APP_ROUTES.SHOP}>{language === "fr" ? "Parcourir les formules" : "Browse formulas"}</Link>
				</Button>
			</div>
		);
	}

	if (isSuccess) {
		const finalOrderTotal = completedOrderTotal ?? orderTotal;

		return (
			<div className="min-h-screen bg-[#fcfdfa] flex flex-col items-center justify-center p-4">
				<div className="max-w-md w-full bg-white rounded-3xl border border-emerald-900/10 p-6 sm:p-8 text-center shadow-xl shadow-emerald-950/5">
					<CheckCircle2 className="size-16 text-emerald-600 mx-auto mb-5 animate-pulse" />
					<h1 className="text-3xl font-playfair font-normal text-slate-950">{t("checkout.successTitle")}</h1>
					<p className="text-sm text-slate-500 mt-2">
						{language === "fr" ? "Votre commande de compléments propres a été passée avec succès. Les détails ont été envoyés à " : "Your clean stack order has been successfully placed. We've sent a receipt details and updates to "}<strong className="text-slate-700">{getValues("email")}</strong>.
					</p>

					<div className="my-6 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-900/5 text-left text-sm space-y-2">
						<div className="flex justify-between">
							<span className="text-slate-500">{t("checkout.orderNumber")}:</span>
							<span className="font-mono font-bold text-slate-900">{orderNumber}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-500">{t("checkout.delivery")}:</span>
							<span className="font-bold text-slate-900">{t("checkout.standardShipping")}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-500">{language === "fr" ? "Total de la commande:" : "Order Total:"}</span>
							<span className="font-extrabold text-emerald-900">{finalOrderTotal.toFixed(2)} MAD</span>
						</div>
					</div>

					<div className="flex items-center gap-2 justify-center text-xs text-emerald-800 font-bold uppercase tracking-wider mb-6">
						<Sparkles className="size-4 animate-spin-slow text-emerald-700" />
						<span>{language === "fr" ? "La régularité commence maintenant" : "Consistency starts now"}</span>
					</div>

					<Button
						onClick={handleSuccessReturn}
						className="w-full h-12 bg-emerald-900 hover:bg-emerald-950 text-white font-bold rounded-xl cursor-pointer shadow-md"
					>
						{t("checkout.returnHome")}
					</Button>
				</div>
			</div>
		);
	}

	if (isVerifyingPayment) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#fcfdfa] p-4">
				<div className="flex flex-col items-center gap-4 rounded-3xl border border-emerald-900/10 bg-white px-8 py-10 text-center shadow-xl shadow-emerald-950/5">
					<div className="grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-800">
						<Loader2 className="size-6 animate-spin" />
					</div>
					<div>
						<h1 className="text-2xl font-playfair text-slate-950">
							{language === "fr" ? "Vérification du paiement" : "Verifying payment"}
						</h1>
						<p className="mt-2 max-w-sm text-sm text-slate-500">
							{language === "fr"
								? "Nous vérifions votre session Stripe et finalisons la commande."
								: "We are verifying your Stripe session and finalizing the order."}
						</p>
					</div>
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
					<Link to={APP_ROUTES.SHOP} className="flex items-center gap-2">
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
							{paymentError && (
								<div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
									{paymentError}
								</div>
							)}

							{/* Section 1: Customer Contact */}
							<div className="bg-white rounded-3xl border border-emerald-900/5 p-5 sm:p-6 shadow-xs">
								<h2 className="font-playfair text-xl font-bold text-slate-950 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
									<span className="size-6 bg-emerald-900 text-white rounded-full flex items-center justify-center text-xs font-bold font-sans">1</span>
									{t("checkout.step1")}
								</h2>
								<div className="space-y-3">
									<div>
										<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">{t("checkout.email")}</label>
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
									{t("checkout.step2")}
								</h2>
								<div className="space-y-3">
									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">{t("checkout.firstName")}</label>
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
											<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">{t("checkout.lastName")}</label>
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
										<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">{t("checkout.address")}</label>
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
 
									<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
										<div>
											<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">{t("checkout.city")}</label>
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
											<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">{t("checkout.phone")}</label>
											<div className="flex gap-2">
												<div className="flex h-11 items-center gap-2 rounded-xl border border-emerald-900/10 bg-slate-50 px-3 text-sm font-black text-slate-700 shrink-0">
													<span aria-hidden="true" className="text-base leading-none">🇲🇦</span>
													<span>+212</span>
												</div>
												<Input
													type="tel"
													placeholder="600-000000"
													{...register("phone")}
													className="h-11 rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800 bg-[#fbfcf9]"
												/>
											</div>
											{errors.phone && (
												<p className="text-xs text-rose-600 mt-1 font-bold">{errors.phone.message}</p>
											)}
										</div>
									</div>
									<div className="grid gap-3">
										<div>
											<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">{t("checkout.country")}</label>
											<Input
												type="text"
												value="Morocco"
												disabled
												{...register("country")}
												className="h-11 rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800 bg-slate-50 text-slate-500 cursor-not-allowed"
											/>
										</div>
									</div>
								</div>
							</div>

							{/* Section 3: Secure Payment details */}
							<div className="bg-white rounded-3xl border border-emerald-900/5 p-5 sm:p-6 shadow-xs">
								<h2 className="font-playfair text-xl font-bold text-slate-950 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
									<span className="size-6 bg-emerald-900 text-white rounded-full flex items-center justify-center text-xs font-bold font-sans">3</span>
									{language === "fr" ? "Paiement Stripe" : "Stripe payment"}
								</h2>
								<div className="rounded-2xl border border-emerald-900/10 bg-[#f7fbf3] p-4">
									<div className="flex items-start gap-3">
										<div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white ring-1 ring-[#635BFF]/15 shadow-sm">
											<StripeMark />
										</div>
										<div className="min-w-0">
											<p className="text-sm font-bold text-slate-950">
												{language === "fr" ? "Paiement sécurisé via Stripe" : "Secure payment via Stripe"}
											</p>
											<p className="mt-1 text-sm leading-6 text-slate-500">
												{language === "fr"
													? "Vous serez redirigé vers Stripe pour finaliser le paiement de manière sécurisée. Aucune donnée bancaire n'est stockée dans le frontend."
													: "You will be redirected to Stripe to complete your payment securely. No card details are stored in the frontend."}
											</p>
										</div>
									</div>

									<div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
										<span className="rounded-full border border-emerald-900/10 bg-white px-2.5 py-1">SSL protected</span>
										<span className="rounded-full border border-emerald-900/10 bg-white px-2.5 py-1">Stripe Checkout</span>
										<span className="rounded-full border border-emerald-900/10 bg-white px-2.5 py-1">Secure redirect</span>
									</div>
								</div>
							</div>

							{/* Checkout Action buttons */}
							<div className="grid gap-3">
								<OriginButton
									type="submit"
									variant="emerald"
									disabled={isSubmitting}
									className="w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/10 text-base"
								>
									{isSubmitting ? (
										<>
											<Loader2 className="size-4 animate-spin" />
											<span>{language === "fr" ? "Redirection en cours..." : "Redirecting..."}</span>
										</>
									) : (
										<>
											<Lock className="size-4" />
											{language === "fr" ? "Payer avec Stripe" : "Pay with Stripe"} &bull; {orderTotal.toFixed(2)} MAD
										</>
									)}
								</OriginButton>
							</div>
						</form>

						{/* Right Column: Order Review */}
						<div className="space-y-4">
							<div className="bg-white rounded-3xl border border-emerald-900/5 p-5 sm:p-6 shadow-md shadow-emerald-950/5">
								<h3 className="font-playfair text-lg font-bold text-slate-950 mb-4 border-b border-slate-100 pb-3">
									{language === "fr" ? `Résumé de la commande (${items.length})` : `Review Stack (${items.length})`}
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
												{(parsePrice(product.price) * quantity).toFixed(2)} MAD
											</span>
										</div>
									))}
								</div>

								{/* Price review list */}
								<div className="space-y-2.5 text-xs border-t border-slate-100 pt-4">
									<div className="flex justify-between text-slate-500">
										<span>Subtotal</span>
										<span className="font-bold text-slate-900">{subtotal.toFixed(2)} MAD</span>
									</div>

									{discountPercentage > 0 && (
										<div className="flex justify-between text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
											<span>Wellness Promo (20%)</span>
											<span>-{discountAmount.toFixed(2)} MAD</span>
										</div>
									)}

									<div className="flex justify-between text-slate-500">
										<span>Shipping</span>
										{shippingCost === 0 ? (
											<span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px] uppercase">Free</span>
										) : (
											<span className="font-bold text-slate-900">{shippingCost.toFixed(2)} MAD</span>
										)}
									</div>


									<div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-100 pt-3 mt-2">
										<span>Order Total</span>
										<span>{orderTotal.toFixed(2)} MAD</span>
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
