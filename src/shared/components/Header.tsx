import React from "react";
import { Link, useNavigate } from "react-router";
import logo from "@/assets/images/zamazor.svg";
import { APP_ROUTES } from "@/core/routes/paths";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useLanguage } from "@/shared/context/LanguageContext";
import { OriginButton } from "@/shared/components/ui/origin-button";
import { useCartStore } from "@/shared/hooks/use-cart-store";
import { useBookmarkStore } from "@/features/products/stores/bookmarkStore";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { AuthStatus } from "@/features/auth/types";
import { productService } from "@/features/products/services/productService";
import type { Product } from "@/core/config/productsData";
import {
	MenuIcon,
	X as XIcon,
	SearchIcon,
	UserIcon,
	ShoppingBagIcon,
	Heart as HeartIcon,
	Store,
	Sparkles,
	Layers,
	MessageSquare,
	Award,
} from "lucide-react";



export const Header = React.forwardRef<HTMLElement, { className?: string }>(
	({ className }, ref) => {
		const navigate = useNavigate();
		const { language, setLanguage, t } = useLanguage();
		const cartItems = useCartStore((state) => state.items);
		const cartCount = React.useMemo(() => {
			return cartItems.reduce((sum, item) => sum + item.quantity, 0);
		}, [cartItems]);
		const bookmarkCount = useBookmarkStore((state) => state.bookmarks.length);
		const [searchVal, setSearchVal] = React.useState("");
		const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

		const [isCartBouncing, setIsCartBouncing] = React.useState(false);
		const prevCountRef = React.useRef(cartCount);

		React.useEffect(() => {
			if (cartCount > prevCountRef.current) {
				setIsCartBouncing(true);
				const timer = setTimeout(() => setIsCartBouncing(false), 500);
				return () => clearTimeout(timer);
			}
			prevCountRef.current = cartCount;
		}, [cartCount]);

		const [suggestions, setSuggestions] = React.useState<Product[]>([]);
		const [showSuggestions, setShowSuggestions] = React.useState(false);
		const [showMobileSuggestions, setShowMobileSuggestions] = React.useState(false);
		const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);

		const searchRef = React.useRef<HTMLDivElement>(null);
		const mobileSearchRef = React.useRef<HTMLDivElement>(null);

		const { user, status } = useAuthStore();
		const isAuthenticated = status === AuthStatus.Authenticated;

		// Click outside Suggestion Dropdown close listener
		React.useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
					setShowSuggestions(false);
				}
				if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
					setShowMobileSuggestions(false);
				}
			};
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}, []);

		// Fetch autocomplete suggestions as the user types
		React.useEffect(() => {
			if (!searchVal.trim()) {
				setSuggestions([]);
				return;
			}

			const fetchSuggestions = async () => {
				setLoadingSuggestions(true);
				try {
					const results = await productService.searchProducts(searchVal);
					setSuggestions(results.slice(0, 5)); // Limit to 5 suggestions
				} catch (err) {
					console.warn("Failed to fetch suggestions:", err);
				} finally {
					setLoadingSuggestions(false);
				}
			};

			const delayDebounce = setTimeout(() => {
				fetchSuggestions();
			}, 300);

			return () => clearTimeout(delayDebounce);
		}, [searchVal]);

		const handleSearchSubmit = (e: React.FormEvent) => {
			e.preventDefault();
			if (searchVal.trim()) {
				setMobileMenuOpen(false);
				setShowSuggestions(false);
				setShowMobileSuggestions(false);
				navigate(`${APP_ROUTES.SHOP}?search=${encodeURIComponent(searchVal.trim())}`);
			}
		};

		return (
			<header
				ref={ref}
				className={cn(
					"sticky top-2 z-40 mx-auto mt-2 w-[calc(100%-2rem)] max-w-7xl rounded-3xl border border-emerald-900/10 bg-[#f7fbf3]/95 shadow-md backdrop-blur transition-all duration-300",
					className
				)}
			>

				{/* Main Brand & Action Row */}
				<div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:gap-6 lg:px-6">
					
					{/* Left: Mobile Menu Toggle & Brand Logo */}
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							aria-label="Menu"
							className="lg:hidden cursor-pointer"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						>
							{mobileMenuOpen ? <XIcon className="size-5 text-emerald-900" /> : <MenuIcon className="size-5 text-emerald-900" />}
						</Button>

						<Link
							to={APP_ROUTES.HOME}
							className="flex items-center gap-2.5 shrink-0"
						>
							<img
								src={logo}
								alt="Zamazor logo"
								className="size-9 rounded-xl border border-emerald-900/10 bg-white"
							/>
							<span className="text-xl font-black tracking-tight text-emerald-950 font-playfair">
								Zamazor
							</span>
						</Link>
					</div>

					{/* Center: iHerb-style Wide Search Bar (Desktop Only) */}
					<div ref={searchRef} className="hidden lg:block w-full max-w-2xl mx-auto relative">
						<form onSubmit={handleSearchSubmit} className="relative flex w-full items-center">
							<Input
								type="search"
								value={searchVal}
								onChange={(e) => {
									setSearchVal(e.target.value);
									setShowSuggestions(true);
								}}
								onFocus={() => setShowSuggestions(true)}
								placeholder={t("common.searchPlaceholder")}
								className="h-11 w-full rounded-full border border-emerald-900/15 bg-white pl-5 pr-14 text-sm shadow-xs focus-visible:border-emerald-600 focus-visible:ring-emerald-600/10 focus-visible:ring-offset-0 placeholder:text-slate-400"
							/>
							<Button
								type="submit"
								size="icon"
								className="absolute right-1 top-1 h-9 w-9 rounded-full bg-emerald-900 hover:bg-emerald-950 text-white cursor-pointer shadow-xs"
							>
								<SearchIcon className="size-4" />
							</Button>
						</form>

						{/* Suggestions Dropdown */}
						{showSuggestions && searchVal.trim() !== "" && (
							<div className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-900/10 shadow-lg z-50 overflow-hidden max-h-[380px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
								{loadingSuggestions ? (
									<div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
										<div className="size-4 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" />
										Searching formulas...
									</div>
								) : suggestions.length === 0 ? (
									<div className="p-4 text-center text-xs text-slate-400">
										No formulas match "{searchVal}"
									</div>
								) : (
									<div className="p-2 space-y-1">
										<p className="px-3 py-1.5 text-[10px] font-black uppercase text-emerald-900/40 tracking-widest border-b border-emerald-900/5">
											Suggested Products
										</p>
										{suggestions.map((product) => (
											<div
												key={product.id}
												onClick={() => {
													navigate(`/product/${product.id}`);
													setShowSuggestions(false);
													setSearchVal("");
												}}
												className="flex items-center gap-3 p-2 rounded-xl hover:bg-emerald-50/50 cursor-pointer transition-colors"
											>
												<div className="size-11 shrink-0 bg-slate-50 rounded-lg border border-emerald-900/5 flex items-center justify-center p-1.5">
													<img src={product.image} alt={product.name} className="h-full w-full object-contain" />
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-xs font-bold text-slate-900 truncate leading-tight">{product.name}</p>
													<p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider mt-0.5">{product.category}</p>
												</div>
												<div className="text-right">
													<p className="text-xs font-black text-slate-950">{product.price}</p>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						)}
					</div>

					{/* Right: User actions (Favorites, Account, Cart) */}
					<div className="flex items-center justify-end gap-1 sm:gap-2.5">
						
						{/* Wishlist / Favorites (iHerb style) */}
						{/* Wishlist / Favorites (iHerb style) */}
						<Link
							to={APP_ROUTES.WISHLIST}
							className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors relative"
							title="Wishlist"
						>
							<HeartIcon className="size-5" />
							{bookmarkCount > 0 && (
								<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white ring-1 ring-white">
									{bookmarkCount}
								</span>
							)}
						</Link>

						{/* Language Switcher */}
						<div className="flex items-center gap-1 bg-emerald-50/50 border border-emerald-950/10 p-0.5 rounded-full mr-1">
							<button
								onClick={() => setLanguage("en")}
								className={cn(
									"h-6 px-2 text-[10px] font-bold rounded-full transition-all cursor-pointer",
									language === "en" ? "bg-emerald-900 text-white shadow-xs" : "text-emerald-800 hover:bg-emerald-50/30"
								)}
							>
								EN
							</button>
							<button
								onClick={() => setLanguage("fr")}
								className={cn(
									"h-6 px-2 text-[10px] font-bold rounded-full transition-all cursor-pointer",
									language === "fr" ? "bg-emerald-900 text-white shadow-xs" : "text-emerald-800 hover:bg-emerald-50/30"
								)}
							>
								FR
							</button>
						</div>

						{/* Desktop Account Controls */}
						{isAuthenticated ? (
							<div className="hidden sm:flex items-center gap-1.5">
								<OriginButton
									onClick={() => navigate(user?.role === "ADMIN" ? APP_ROUTES.DASHBOARD : APP_ROUTES.PROFILE)}
									variant="emerald"
									className="h-9 px-4 rounded-full text-xs font-semibold items-center gap-1.5 cursor-pointer"
								>
									<UserIcon className="size-3.5" />
									{user?.role === "ADMIN" ? t("nav.dashboard") : (user?.fullName ? user.fullName.trim().split(/\s+/)[0] : t("nav.profile"))}
								</OriginButton>
							</div>
						) : (
							<OriginButton
								onClick={() => navigate(APP_ROUTES.AUTH.LOGIN)}
								variant="emerald"
								className="hidden sm:inline-flex h-9 px-4 rounded-full text-xs font-semibold items-center gap-1.5 cursor-pointer"
							>
								<UserIcon className="size-3.5" />
								{t("nav.login")}
							</OriginButton>
						)}

						{/* Cart count action button */}
						<OriginButton
							variant="emerald"
							aria-label="Cart"
							onClick={() => navigate(APP_ROUTES.CART)}
							className={cn(
								"h-9 w-9 p-0 rounded-full flex items-center justify-center relative cursor-pointer transition-all duration-300",
								isCartBouncing ? "scale-115 bg-lime-300 text-emerald-950 shadow-md animate-bounce" : ""
							)}
						>
							<ShoppingBagIcon className="size-4.5" />
							{cartCount > 0 && (
								<span className={cn(
									"absolute -top-1 -right-1 bg-lime-300 text-emerald-950 font-sans font-black text-[9px] size-4.5 rounded-full flex items-center justify-center shadow-xs transition-transform duration-300",
									isCartBouncing ? "scale-110 bg-emerald-950 text-white" : ""
								)}>
									{cartCount}
								</span>
							)}
						</OriginButton>
					</div>
				</div>

				{/* 📱 Mobile Search Bar (Row 2 on Mobile - Persistent) */}
				<div ref={mobileSearchRef} className="px-4 pb-3 lg:hidden relative">
					<form onSubmit={handleSearchSubmit} className="relative flex w-full items-center">
						<Input
							type="search"
							value={searchVal}
							onChange={(e) => {
								setSearchVal(e.target.value);
								setShowMobileSuggestions(true);
							}}
							onFocus={() => setShowMobileSuggestions(true)}
							placeholder={t("common.searchPlaceholder")}
							className="h-10 w-full rounded-full border border-emerald-900/10 bg-white pl-4 pr-12 text-xs shadow-xs focus-visible:border-emerald-600 focus-visible:ring-emerald-600/10 focus-visible:ring-offset-0"
						/>
						<Button
							type="submit"
							size="icon"
							variant="ghost"
							className="absolute right-1 top-1 h-8 w-8 rounded-full text-slate-400 hover:text-emerald-900 cursor-pointer"
						>
							<SearchIcon className="size-4" />
						</Button>
					</form>

					{/* Mobile Suggestions Dropdown */}
					{showMobileSuggestions && searchVal.trim() !== "" && (
						<div className="absolute left-4 right-4 mt-2 bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-900/10 shadow-lg z-50 overflow-hidden max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
							{loadingSuggestions ? (
								<div className="p-3 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
									<div className="size-3.5 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" />
									Searching...
								</div>
							) : suggestions.length === 0 ? (
								<div className="p-3 text-center text-xs text-slate-400">
									No formulas match "{searchVal}"
								</div>
							) : (
								<div className="p-1.5 space-y-1">
									{suggestions.map((product) => (
										<div
											key={product.id}
											onClick={() => {
												navigate(`/product/${product.id}`);
												setShowMobileSuggestions(false);
												setSearchVal("");
											}}
											className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-emerald-50/50 cursor-pointer transition-colors"
										>
											<div className="size-9 shrink-0 bg-slate-50 rounded-lg border border-emerald-900/5 flex items-center justify-center p-1">
												<img src={product.image} alt={product.name} className="h-full w-full object-contain" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-[11px] font-bold text-slate-900 truncate leading-tight">{product.name}</p>
												<p className="text-[9px] text-emerald-800 font-bold uppercase tracking-wider">{product.category}</p>
											</div>
											<div>
												<p className="text-[11px] font-black text-slate-950">{product.price}</p>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>

				{/* Desktop quick links */}
				<div className="hidden border-t border-emerald-900/5 bg-transparent py-2 px-6 lg:flex items-center justify-between font-sans">
					<div className="flex items-center gap-1.5">
						<Link to={APP_ROUTES.SHOP} className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-900 px-2 py-1 rounded-md hover:bg-emerald-50/50 transition-colors">
							<Store className="size-3.5 text-emerald-850" />
							{t("nav.shop")}
						</Link>
						<Link to="/#products" className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-900 px-2 py-1 rounded-md hover:bg-emerald-50/50 transition-colors">
							<Sparkles className="size-3.5 text-emerald-850" />
							Best Sellers
						</Link>
						<Link to="/#stack" className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-900 px-2 py-1 rounded-md hover:bg-emerald-50/50 transition-colors">
							<Layers className="size-3.5 text-emerald-850" />
							Daily Stacks
						</Link>
						<Link to="/#reviews" className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-900 px-2 py-1 rounded-md hover:bg-emerald-50/50 transition-colors">
							<MessageSquare className="size-3.5 text-emerald-850" />
							Reviews
						</Link>
						<Link to="/#proof" className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-900 px-2 py-1 rounded-md hover:bg-emerald-50/50 transition-colors">
							<Award className="size-3.5 text-emerald-850" />
							Clinical Results
						</Link>
					</div>
					<div className="text-[10px] font-black text-emerald-950/40 uppercase tracking-widest">
						100% Organic & Clean Formulas
					</div>
				</div>

				{/* 📱 Mobile Menu Drawer content */}
				{mobileMenuOpen && (
					<div className="border-t border-emerald-900/5 px-4 py-5 space-y-5 lg:hidden animate-in fade-in slide-in-from-top-3 duration-200">
						
						{/* Links list */}
						<div className="flex flex-col gap-3 font-semibold text-slate-700 text-sm">
							<Link
								to={APP_ROUTES.SHOP}
								onClick={() => setMobileMenuOpen(false)}
								className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
							>
								<Store className="size-4 text-emerald-850" />
								Store
							</Link>
							<Link
								to={APP_ROUTES.WISHLIST}
								onClick={() => setMobileMenuOpen(false)}
								className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
							>
								<span className="flex items-center gap-2.5">
									<HeartIcon className="size-4 text-emerald-850" />
									Wishlist
								</span>
								{bookmarkCount > 0 && (
									<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white">
										{bookmarkCount}
									</span>
								)}
							</Link>

							<Link
								to="/#reviews"
								onClick={() => setMobileMenuOpen(false)}
								className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
							>
								<MessageSquare className="size-4 text-emerald-850" />
								Reviews
							</Link>
							<Link
								to="/#proof"
								onClick={() => setMobileMenuOpen(false)}
								className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
							>
								<Award className="size-4 text-emerald-850" />
								Clinical Results
							</Link>
							<Link
								to="/#stack"
								onClick={() => setMobileMenuOpen(false)}
								className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
							>
								<Layers className="size-4 text-emerald-850" />
								Daily Stacks
							</Link>
						</div>

						{/* Mobile Auth actions */}
						<div className="pt-4 border-t border-emerald-900/5">
							{isAuthenticated ? (
								<div className="space-y-3">
									<div className="px-3 text-xs text-slate-500 font-medium">
										Signed in as <span className="font-bold text-slate-800">{user?.name}</span>
									</div>
									<div className="flex flex-col gap-2">
										<OriginButton
											onClick={() => {
												setMobileMenuOpen(false);
												navigate(user?.role === "ADMIN" ? APP_ROUTES.DASHBOARD : APP_ROUTES.PROFILE);
											}}
											variant="emerald"
											className="w-full h-10 rounded-xl justify-center font-bold text-xs cursor-pointer"
										>
											{user?.role === "ADMIN" ? "Dashboard" : (user?.fullName ? user.fullName.trim().split(/\s+/)[0] : "Profile")}
										</OriginButton>
									</div>
								</div>
							) : (
								<OriginButton
									onClick={() => {
										setMobileMenuOpen(false);
										navigate(APP_ROUTES.AUTH.LOGIN);
									}}
									variant="emerald"
									className="w-full h-10 rounded-xl justify-center font-bold text-xs cursor-pointer"
								>
									Sign in
								</OriginButton>
							)}
						</div>
					</div>
				)}
			</header>
		);
	}
);

Header.displayName = "Header";
