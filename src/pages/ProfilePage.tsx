import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormValues } from "@/features/auth/schemas/profileSchema";
import CONFIG from "@/core/config/constants";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { orderService, type BackendOrder } from "@/features/orders/services/orderService";
import { addressService } from "@/features/addresses/services/addressService";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { Input } from "@/shared/components/ui/input";
import { OriginButton } from "@/shared/components/ui/origin-button";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import { APP_ROUTES } from "@/core/routes/paths";
import { authService } from "@/features/auth/services/authService";
import { useLanguage } from "@/shared/context/LanguageContext";
import { parsePrice } from "@/shared/utils/price";
import { parseShippingAddressFallback } from "@/features/addresses/utils/addressHelpers";
import { buildShippingAddressString, toAddressFormValues } from "@/features/addresses/utils/addressHelpers";
import { getOrderStatusMeta } from "@/features/orders/constants/orderStatus";
import {
	User as UserIcon,
	MapPin,
	ShoppingBag,
	Calendar,
	Package,
	Loader2,
	LogOut,
	Save,
	Trash2,




} from "lucide-react";

export const ProfilePage = () => {
	const { language, t } = useLanguage();
	useDocumentTitle(`${t("profile.title")} | ${CONFIG.APP_NAME}`);

	const user = useAuthStore((state) => state.user);
	const navigate = useNavigate();

	const handleSignOut = async () => {
		try {
			await authService.logout();
			toast.success(language === "fr" ? "DÃ©connexion rÃ©ussie." : "Signed out successfully.");
			navigate(APP_ROUTES.HOME);
		} catch (error) {
			console.error("Logout error:", error);
			toast.error(language === "fr" ? "Erreur de dÃ©connexion." : "Failed to sign out.");
		}
	};

	// Tabs: "profile" | "orders"
	const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");

	const [isSaving, setIsSaving] = useState(false);
	const [orders, setOrders] = useState<BackendOrder[]>([]);
	const [isLoadingOrders, setIsLoadingOrders] = useState(false);
	const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
	const [cancelConfirmOrder, setCancelConfirmOrder] = useState<BackendOrder | null>(null);
	const [isCancelingOrder, setIsCancelingOrder] = useState(false);

	const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			fullName: "",
			street: "",
			city: "",
			phone: "",
			country: "Morocco",
		}
	});


	// Load user details
	useEffect(() => {
		let active = true;

		const loadAddress = async () => {
			if (!user) return;

			setValue("fullName", user.fullName || "");

			const backendAddress = await addressService.getDefaultAddress();
			if (!active) return;

			const source = toAddressFormValues(backendAddress, user.shippingAddress);
			setValue("street", source.street);
			setValue("city", source.city);
			setValue("phone", source.phone);
			setValue("country", source.country || "Morocco");
		};

		loadAddress();

		return () => {
			active = false;
		};
	}, [user, setValue]);

	// Load order history when orders tab is active
	useEffect(() => {
		if (activeTab === "orders") {
			const fetchOrders = async () => {
				setIsLoadingOrders(true);
				try {
					const data = await orderService.getUserOrders();
					setOrders(data);
				} catch {
					toast.error(language === "fr" ? "Impossible de charger l'historique des commandes." : "Could not load your order history.");
				} finally {
					setIsLoadingOrders(false);
				}
			};
			fetchOrders();
		}
	}, [activeTab, language]);

	const handleProfileSubmit = async (data: ProfileFormValues) => {
		setIsSaving(true);
		try {
			const existingAddress = await addressService.getDefaultAddress();
			const addressPayload = {
				country: data.country.trim() || "Morocco",
				city: (data.city || "").trim(),
				street: (data.street || "").trim(),
				phone: (data.phone || "").trim(),
				isDefault: true,
			};

			const savedAddress =
				(await addressService.updateDefaultAddress(addressPayload)) ||
				(!existingAddress ? await addressService.createDefaultAddress(addressPayload) : null);

			if (!savedAddress) {
				toast.error(language === "fr" ? "Impossible d'enregistrer l'adresse." : "Could not save the address.");
				setIsSaving(false);
				return;
			}

			const shippingAddress = buildShippingAddressString({
				street: data.street || "",
				city: data.city || "",
				phone: data.phone || "",
				country: data.country || "Morocco",
			});

			const currentUser = useAuthStore.getState().user;
			if (currentUser) {
				useAuthStore.setState({
					user: {
						...currentUser,
						fullName: data.fullName.trim(),
						shippingAddress,
					},
				});
			}

			toast.success(language === "fr" ? "Adresse mise à jour avec succès !" : "Address updated successfully!");
		} catch {
			console.error("Profile update error:");
			toast.error(language === "fr" ? "Une erreur est survenue lors de l'enregistrement." : "An error occurred while saving changes.");
		} finally {
			setIsSaving(false);
		}
	};

	const promptCancelOrder = (order: BackendOrder) => {
		if (order.status !== "PENDING") {
			toast.error(
				language === "fr"
					? "Seules les commandes en attente peuvent être annulées."
					: "Only pending orders can be cancelled.",
			);
			return;
		}

		setCancelConfirmOrder(order);
		setCancelConfirmOpen(true);
	};

	const handleCancelOrder = async () => {
		if (!cancelConfirmOrder) return;

		if (cancelConfirmOrder.status !== "PENDING") {
			toast.error(
				language === "fr"
					? "Seules les commandes en attente peuvent être annulées."
					: "Only pending orders can be cancelled.",
			);
			setCancelConfirmOpen(false);
			setCancelConfirmOrder(null);
			return;
		}

		setIsCancelingOrder(true);
		try {
			const success = await orderService.cancelOrder(cancelConfirmOrder.id);
			if (!success) {
				toast.error(language === "fr" ? "Impossible d'annuler la commande." : "Could not cancel the order.");
				return;
			}

			toast.success(language === "fr" ? "Commande annulée avec succès." : "Order cancelled successfully.");
			setOrders((current) =>
				current.map((order) =>
					order.id === cancelConfirmOrder.id ? { ...order, status: "CANCELED" } : order,
				),
			);
		} catch (error) {
			console.error("Order cancellation error:", error);
			toast.error(language === "fr" ? "Une erreur est survenue lors de l'annulation." : "An error occurred while cancelling.");
		} finally {
			setIsCancelingOrder(false);
			setCancelConfirmOpen(false);
			setCancelConfirmOrder(null);
		}
	};

	const formatShippingDetails = (shippingAddress?: string | null) => {
		const parsed = parseShippingAddressFallback(shippingAddress);
		const fullAddress = [parsed.street, parsed.city, parsed.country].filter(Boolean).join(", ");
		const phone = parsed.phone.trim();
		const phoneLabel = phone ? `${parsed.country.trim().toLowerCase() === "morocco" ? "🇲🇦 " : ""}${phone}` : "";

		return { fullAddress, phoneLabel };
	};

	return (
		<div className="min-h-screen bg-[#fcfdfa] py-12 px-4 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-5xl">
				{/* Top Welcome Card */}
				<div className="bg-gradient-to-r from-emerald-950 to-emerald-900 rounded-[2.5rem] p-6 sm:p-10 text-white shadow-xl shadow-emerald-950/5 mb-8">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<div>
							<span className="text-xs font-black uppercase text-lime-300 tracking-widest">{language === "fr" ? "Mon Compte" : "My Account"}</span>
							<h1 className="mt-1 text-3xl sm:text-4xl font-playfair font-normal leading-tight">
								{language === "fr" ? `Bonjour, ${user?.fullName || "Utilisateur"}` : `Hello, ${user?.fullName || "User"}`}
							</h1>
							<p className="text-sm text-emerald-100/75 mt-1">
								{language === "fr" ? "GÃ©rez vos coordonnÃ©es, adresses de livraison et la rÃ©gularitÃ© de vos commandes." : "Manage your settings, billing details, and clean stack consistency."}
							</p>
						</div>
					</div>
				</div>

				{/* Tabs Navigation */}
				<div className="flex border-b border-emerald-900/10 mb-8 gap-4 select-none">
					<button
						onClick={() => setActiveTab("profile")}
						className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
							activeTab === "profile"
								? "border-emerald-800 text-emerald-950"
								: "border-transparent text-slate-400 hover:text-slate-600"
						}`}
					>
						{language === "fr" ? "Profil & Adresse" : "Profile & Address"}
					</button>
					<button
						onClick={() => setActiveTab("orders")}
						className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
							activeTab === "orders"
								? "border-emerald-800 text-emerald-950"
								: "border-transparent text-slate-400 hover:text-slate-600"
						}`}
					>
						{t("profile.ordersHistory")}
					</button>
				</div>

				{/* Tab content */}
				{activeTab === "profile" ? (
					<div className="grid gap-8 md:grid-cols-3">
						{/* Sidebar Summary Card */}
						<div className="overflow-hidden rounded-[2rem] border border-emerald-900/8 bg-white shadow-sm h-fit">
							<div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-emerald-700 to-lime-400" />
							<div className="p-6">
							<div className="flex items-start gap-4">
								<span className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-900/8 shrink-0">
									<UserIcon className="size-5" />
								</span>
									<div className="min-w-0">
										<h3 className="text-[1.05rem] font-black tracking-tight text-slate-950">
											{language === "fr" ? "Account Summary" : "Account Summary"}
										</h3>
										<p className="mt-1 text-sm leading-6 text-slate-500">
											{language === "fr" ? "Votre profil connecté et l'adresse enregistrée." : "Your signed-in profile and saved address."}
										</p>
									</div>
								</div>

								<div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-900/5">
									<span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 block">
										{language === "fr" ? "Registered Email" : "Registered Email"}
									</span>
									<span className="mt-1 block truncate text-sm font-semibold text-slate-800">
										{user?.email || ""}
									</span>
								</div>
							</div>

							<div className="mt-6 pt-5">
								<Button
									type="button"
									onClick={handleSignOut}
									variant="outline"
									className="w-full h-11 rounded-xl border-rose-100 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold justify-center gap-2 cursor-pointer transition-colors"
								>
									<LogOut className="size-4" />
									{t("nav.logout")}
								</Button>
							</div>
						</div>

						{/* Form Details Area */}
						<div className="bg-white rounded-3xl border border-emerald-900/5 p-6 sm:p-8 shadow-xs md:col-span-2">
							<h2 className="font-playfair text-2xl text-slate-950 mb-6 pb-3 border-b border-slate-100">
								{language === "fr" ? "ParamÃ¨tres Personnels" : "Personal Settings"}
							</h2>
							<form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-6">
								{/* Name */}
								<div>
									<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">
										{t("profile.fullName")}
									</label>
									<Input
										type="text"
										{...register("fullName")}
										className="h-11 rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800 bg-[#fbfcf9]"
									/>
									{errors.fullName && (
										<p className="text-xs text-rose-600 mt-1 font-bold">{errors.fullName.message}</p>
									)}
								</div>

								{/* Read-Only Email */}
								<div>
									<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">
										{language === "fr" ? "Adresse E-mail (Non modifiable)" : "Email Address (Cannot be modified)"}
									</label>
									<Input
										type="email"
										disabled
										value={user?.email || ""}
										className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
									/>
								</div>

								{/* Address Section */}
								<div className="overflow-hidden rounded-[2rem] border border-emerald-900/8 bg-white shadow-sm">
									<div className="p-5 sm:p-6">
										<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
											<div className="flex items-start gap-4">
												<span className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-900/8 shrink-0">
													<MapPin className="size-5" />
												</span>
												<div className="min-w-0">
													<div className="flex flex-wrap items-center gap-2">
														<h3 className="text-[1.05rem] font-black tracking-tight text-slate-950">
															{language === "fr" ? "Shipping Address" : "Shipping Address"}
														</h3>
														<span className="inline-flex items-center rounded-full border border-emerald-900/10 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-800">
															{language === "fr" ? "Primary" : "Primary"}
														</span>
													</div>
													<p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
														{language === "fr"
															? "Modifiez l'adresse utilisée pour les commandes, la livraison et le pré-remplissage au checkout."
															: "Edit the address used for orders, delivery, and checkout autofill."}
													</p>
												</div>
											</div>
										</div>

										<div className="mt-6 grid gap-4">
											<div className="grid gap-2">
												<label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
													{t("profile.street")}
												</label>
												<Input
													type="text"
													placeholder="123 Wellness Way"
													{...register("street")}
													className="h-11 rounded-xl border-emerald-900/10 bg-[#fcfdfa] focus-visible:ring-emerald-800"
												/>
											</div>

											<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
												<div className="grid gap-2">
													<label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
														{t("profile.city")}
													</label>
													<Input
														type="text"
														placeholder="San Francisco"
														{...register("city")}
														className="h-11 rounded-xl border-emerald-900/10 bg-[#fcfdfa] focus-visible:ring-emerald-800"
													/>
												</div>

												<div className="grid gap-2">
													<label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
														{t("profile.country")}
													</label>
													<Input
														type="text"
														placeholder="Morocco"
														{...register("country")}
														className="h-11 rounded-xl border-emerald-900/10 bg-[#fcfdfa] focus-visible:ring-emerald-800"
													/>
												</div>
											</div>

											<div className="grid gap-2">
												<label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
													{t("profile.phone")}
												</label>
												<div className="flex gap-2">
													<div className="flex h-11 items-center gap-2 rounded-xl border border-emerald-900/10 bg-slate-50 px-3 text-sm font-black text-slate-700 shrink-0">
														<span aria-hidden="true" className="text-base leading-none">🇲🇦</span>
														<span>+212</span>
													</div>
													<Input
														type="tel"
														placeholder="600-000000"
														{...register("phone")}
														className="h-11 rounded-xl border-emerald-900/10 bg-[#fcfdfa] focus-visible:ring-emerald-800"
													/>
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* Actions */}
								<div className="pt-4 border-t border-slate-100 flex justify-end">
									<OriginButton
										variant="emerald"
										type="submit"
										disabled={isSaving}
										className="h-12 px-6 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-950/5"
									>
										{isSaving ? (
											<>
												<Loader2 className="size-4 animate-spin" />
												{t("common.loading")}
											</>
										) : (
											<>
												<Save className="size-4" />
												{t("common.save")}
											</>
										)}
									</OriginButton>
								</div>
							</form>
						</div>
					</div>
				) : (
					<div className="bg-white rounded-3xl border border-emerald-900/5 p-6 sm:p-8 shadow-xs">
						<h2 className="font-playfair text-2xl text-slate-950 mb-6 pb-3 border-b border-slate-100">
							{t("profile.ordersHistory")}
						</h2>

						{isLoadingOrders ? (
							<div className="flex flex-col items-center justify-center py-12">
								<Loader2 className="size-8 animate-spin text-emerald-800" />
								<p className="mt-3 text-sm text-slate-500">{language === "fr" ? "RÃ©cupÃ©ration de vos commandes..." : "Retrieving your order records..."}</p>
							</div>
						) : orders.length === 0 ? (
							<div className="text-center py-12">
								<ShoppingBag className="size-16 text-emerald-900/20 mx-auto mb-4" />
								<h3 className="text-xl font-playfair text-slate-900">{t("profile.emptyOrders")}</h3>
								<p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
									{language === "fr" ? "CrÃ©ez votre routine bien-Ãªtre et passez votre premiÃ¨re commande." : "Build your daily wellness routine and check out your first order."}
								</p>
								<Button asChild className="mt-6 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl">
									<Link to={APP_ROUTES.HOME}>{language === "fr" ? "Parcourir les Formules" : "Browse formulas"}</Link>
								</Button>
							</div>
						) : (
							<div className="space-y-6">
								{orders.map((order) => (
									<div
										key={order.id}
										className="border border-slate-100 rounded-2xl p-5 hover:border-emerald-900/10 transition-all bg-[#fbfcf9]/50"
									>
										<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100/70 pb-4.5 mb-4.5">
											<div className="space-y-1">
												<div className="flex items-center gap-2">
													<span className="font-mono text-sm font-bold text-slate-950">
														{language === "fr" ? "Commande #" : "Order #"}{order.id.slice(0, 8).toUpperCase()}
													</span>
													<span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${getOrderStatusMeta(order.status).badgeClass}`}>
														{getOrderStatusMeta(order.status).label}
													</span>
												</div>
												<div className="flex items-center gap-1.5 text-xs text-slate-400">
													<Calendar className="size-3.5" />
													<span>{new Date(order.createdAt).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", { dateStyle: "long" })}</span>
												</div>
											</div>

												<div className="text-right">
													<span className="text-xs text-slate-400 uppercase font-black tracking-wider block">{language === "fr" ? "Montant Total" : "Total Amount"}</span>
													<span className="text-lg font-extrabold text-emerald-950">{parsePrice(order.total).toFixed(2)} MAD</span>
												</div>
											</div>

										<div className="flex justify-end pb-4">
											{order.status === "PENDING" && (
												<Button
													type="button"
													variant="outline"
													onClick={() => promptCancelOrder(order)}
													className="h-9 rounded-xl border-rose-200 px-4 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
												>
													<Trash2 className="mr-1.5 size-3.5" />
													{language === "fr" ? "Annuler la commande" : "Cancel order"}
												</Button>
											)}
										</div>

										{/* Items list */}
										<div className="space-y-3">
											{order.items.map((item) => (
												<div key={item.id} className="flex justify-between items-center text-sm">
													<div className="flex items-center gap-2 text-slate-700">
														<Package className="size-4 text-emerald-800/60" />
														<span>{item.product.name}</span>
														<span className="text-xs text-slate-400 font-bold">x{item.quantity}</span>
													</div>
													<span className="font-bold text-slate-950">
														{(parsePrice(item.unitPrice ?? item.product.price) * item.quantity).toFixed(2)} MAD
													</span>
												</div>
											))}
										</div>

										<div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4">
											<p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
												{language === "fr" ? "Shipping Details" : "Shipping Details"}
											</p>
											<div className="mt-2 space-y-1 text-sm">
												<p className="font-semibold text-slate-900">
													{formatShippingDetails(order.shippingAddress).fullAddress || (language === "fr" ? "Aucune adresse fournie." : "No shipping address provided.")}
												</p>
												{formatShippingDetails(order.shippingAddress).phoneLabel ? (
													<p className="text-slate-600">
														{language === "fr" ? "Téléphone" : "Phone"}: {formatShippingDetails(order.shippingAddress).phoneLabel}
													</p>
												) : null}
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>

			<ConfirmDialog
				isOpen={cancelConfirmOpen}
				title={language === "fr" ? "Annuler la commande" : "Cancel order"}
				description={
					language === "fr"
						? `Voulez-vous vraiment annuler la commande ${cancelConfirmOrder?.id.slice(0, 8).toUpperCase() || ""} ?`
						: `Do you really want to cancel order ${cancelConfirmOrder?.id.slice(0, 8).toUpperCase() || ""}?`
				}
				confirmText={isCancelingOrder ? (language === "fr" ? "Annulation..." : "Cancelling...") : (language === "fr" ? "Annuler" : "Cancel")}
				isDestructive
				onConfirm={() => void handleCancelOrder()}
				onClose={() => {
					if (!isCancelingOrder) {
						setCancelConfirmOpen(false);
						setCancelConfirmOrder(null);
					}
				}}
			/>
		</div>
	);
};

