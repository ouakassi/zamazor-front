import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormValues } from "@/features/auth/schemas/profileSchema";
import CONFIG from "@/core/config/constants";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { userService } from "@/features/auth/services/usersService";
import { orderService, type BackendOrder } from "@/features/orders/services/orderService";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { OriginButton } from "@/shared/components/ui/origin-button";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import { APP_ROUTES } from "@/core/routes/paths";
import { authService } from "@/features/auth/services/authService";
import { useLanguage } from "@/shared/context/LanguageContext";
import {
	User as UserIcon,
	MapPin,
	ShoppingBag,
	Lock,
	Calendar,
	Package,
	Loader2,
	LogOut
} from "lucide-react";

export const ProfilePage = () => {
	const { language, t } = useLanguage();
	useDocumentTitle(`${t("profile.title")} | ${CONFIG.APP_NAME}`);

	const user = useAuthStore((state) => state.user);
	const navigate = useNavigate();

	const handleSignOut = async () => {
		try {
			await authService.logout();
			toast.success(language === "fr" ? "Déconnexion réussie." : "Signed out successfully.");
			navigate(APP_ROUTES.HOME);
		} catch (error) {
			console.error("Logout error:", error);
			toast.error(language === "fr" ? "Erreur de déconnexion." : "Failed to sign out.");
		}
	};

	// Tabs: "profile" | "orders"
	const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");

	const [isSaving, setIsSaving] = useState(false);
	const [orders, setOrders] = useState<BackendOrder[]>([]);
	const [isLoadingOrders, setIsLoadingOrders] = useState(false);

	const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			fullName: "",
			street: "",
			city: "",
			zip: "",
			phone: "",
			country: "Morocco",
		}
	});

	// Load user details
	useEffect(() => {
		if (user) {
			setValue("fullName", user.fullName || "");

			if (user.shippingAddress) {
				const parts = user.shippingAddress.split(",").map((p) => p.trim());
				
				// Find and extract phone if present
				const phonePart = parts.find(p => p.toLowerCase().startsWith("phone:"));
				if (phonePart) {
					const phoneVal = phonePart.split(":")[1]?.trim() || "";
					setValue("phone", phoneVal);
				}

				// Filter out the phone and country parts to parse street/city/zip
				const cleanParts = parts.filter(p => 
					!p.toLowerCase().startsWith("phone:") && 
					p.toLowerCase() !== "morocco"
				);

				if (cleanParts.length >= 3) {
					setValue("street", cleanParts[0] || "");
					setValue("city", cleanParts[1] || "");
					setValue("zip", cleanParts[2] || "");
				} else if (cleanParts.length === 2) {
					setValue("street", cleanParts[0] || "");
					setValue("city", cleanParts[1] || "");
				} else {
					setValue("street", cleanParts[0] || "");
				}
			}
		}
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
			// Construct shipping address format: Street, City, ZIP, Country, Phone
			let shippingAddress: string | null = null;
			if (data.street?.trim() || data.city?.trim() || data.zip?.trim() || data.phone?.trim()) {
				shippingAddress = `${(data.street || "").trim()}, ${(data.city || "").trim()}, ${(data.zip || "").trim()}, Morocco, Phone: ${(data.phone || "").trim()}`;
			}

			const result = await userService.updateCurrentUser({
				fullName: data.fullName.trim(),
				shippingAddress,
			});

			if (result) {
				toast.success(language === "fr" ? "Profil mis à jour avec succès !" : "Profile updated successfully!");
			} else {
				toast.error(language === "fr" ? "Échec de la mise à jour du profil. Veuillez réessayer." : "Failed to update profile. Please try again.");
			}
		} catch {
			console.error("Profile update error:");
			toast.error(language === "fr" ? "Une erreur est survenue lors de l'enregistrement." : "An error occurred while saving changes.");
		} finally {
			setIsSaving(false);
		}
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
								{language === "fr" ? "Gérez vos coordonnées, adresses de livraison et la régularité de vos commandes." : "Manage your settings, billing details, and clean stack consistency."}
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
						<div className="bg-white rounded-3xl border border-emerald-900/5 p-6 shadow-xs h-fit">
							<div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
								<span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
									<UserIcon className="size-5" />
								</span>
								<div>
									<h3 className="font-bold text-slate-900">{language === "fr" ? "Résumé du Compte" : "Account Summary"}</h3>
									<p className="text-xs text-slate-500">{language === "fr" ? "Identifiants de sécurité" : "Security & login credentials"}</p>
								</div>
							</div>
							<div className="space-y-3.5 text-sm">
								<div>
									<span className="text-xs text-slate-400 uppercase font-black tracking-wider block">{language === "fr" ? "E-mail enregistré" : "Registered Email"}</span>
									<span className="font-semibold text-slate-700">{user?.email || ""}</span>
								</div>
								<div>
									<span className="text-xs text-slate-400 uppercase font-black tracking-wider block">{language === "fr" ? "Connexion SSL sécurisée" : "Secure SSL Connection"}</span>
									<span className="font-semibold text-emerald-700 flex items-center gap-1">
										<Lock className="size-3.5" />
										{language === "fr" ? "Actif" : "Active"}
									</span>
								</div>
							</div>

							<div className="mt-6 pt-5 border-t border-slate-100">
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
								{language === "fr" ? "Paramètres Personnels" : "Personal Settings"}
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
								<div className="pt-4 border-t border-slate-100">
									<h3 className="font-playfair text-xl text-slate-950 mb-4 flex items-center gap-2">
										<MapPin className="size-5 text-emerald-800" />
										{language === "fr" ? "Adresse de Livraison par Défaut" : "Default Shipping Address"}
									</h3>

									<div className="space-y-4">
										<div>
											<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">
												{t("profile.street")}
											</label>
											<Input
												type="text"
												placeholder="123 Wellness Way"
												{...register("street")}
												className="h-11 rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800 bg-[#fbfcf9]"
											/>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">
													{t("profile.city")}
												</label>
												<Input
													type="text"
													placeholder="San Francisco"
													{...register("city")}
													className="h-11 rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800 bg-[#fbfcf9]"
												/>
											</div>
											<div>
												<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">
													{t("profile.zip")}
												</label>
												<Input
													type="text"
													placeholder="94103"
													{...register("zip")}
													className="h-11 rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800 bg-[#fbfcf9]"
												/>
											</div>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">
													{t("profile.phone")}
												</label>
												<Input
													type="tel"
													placeholder="+212 600-000000"
													{...register("phone")}
													className="h-11 rounded-xl border-emerald-900/10 focus-visible:ring-emerald-800 bg-[#fbfcf9]"
												/>
											</div>
											<div>
												<label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-1.5">
													{t("profile.country")}
												</label>
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
											t("common.save")
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
								<p className="mt-3 text-sm text-slate-500">{language === "fr" ? "Récupération de vos commandes..." : "Retrieving your order records..."}</p>
							</div>
						) : orders.length === 0 ? (
							<div className="text-center py-12">
								<ShoppingBag className="size-16 text-emerald-900/20 mx-auto mb-4" />
								<h3 className="text-xl font-playfair text-slate-900">{t("profile.emptyOrders")}</h3>
								<p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
									{language === "fr" ? "Créez votre routine bien-être et passez votre première commande." : "Build your daily wellness routine and check out your first order."}
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
													<span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
														order.status.toLowerCase() === "completed" || order.status.toLowerCase() === "paid"
															? "bg-emerald-50 text-emerald-700 border border-emerald-200"
															: "bg-amber-50 text-amber-700 border border-amber-200"
													}`}>
														{order.status}
													</span>
												</div>
												<div className="flex items-center gap-1.5 text-xs text-slate-400">
													<Calendar className="size-3.5" />
													<span>{new Date(order.createdAt).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", { dateStyle: "long" })}</span>
												</div>
											</div>

											<div className="text-right">
												<span className="text-xs text-slate-400 uppercase font-black tracking-wider block">{language === "fr" ? "Montant Total" : "Total Amount"}</span>
												<span className="text-lg font-extrabold text-emerald-950">{order.total.toFixed(2)} MAD</span>
											</div>
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
													<span className="font-bold text-slate-950">{(item.unitPrice * item.quantity).toFixed(2)} MAD</span>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};
