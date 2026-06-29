import CONFIG from "@/core/config/constants";
import { APP_ROUTES } from "@/core/routes/paths";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { FAQSection } from "@/shared/components/ui/faqsection";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";
import { AnimatePresence, motion } from "framer-motion";
import {
	Check,
	X,
	ArrowRightIcon,
	BadgeCheckIcon,
	BatteryChargingIcon,
	BrainIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	DumbbellIcon,
	HeartPulseIcon,
	LeafIcon,
	MoonIcon,
	PackageCheckIcon,
	StarIcon,
	TruckIcon,
	ZapIcon,
	ShoppingBagIcon,
	Heart as HeartIcon,
	type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import type { Product } from "@/core/config/productsData";

import { OriginButton } from "@/shared/components/ui/origin-button";
import heroProtein from "@/assets/images/hero_protein.png";
import heroGreens from "@/assets/images/hero_greens.png";
import heroRecovery from "@/assets/images/hero_recovery.png";
import cardNutrientImg from "@/assets/images/card_nutrient.png";
import cardImmuneImg from "@/assets/images/card_immune.png";
import cardMindImg from "@/assets/images/card_mind.png";
const productProtein = `${CONFIG.API_BASE_URL}/images/product_protein.png`;
const productGreens = `${CONFIG.API_BASE_URL}/images/product_greens.png`;
const productHydra = `${CONFIG.API_BASE_URL}/images/product_hydra.png`;
import { useProductStore } from "@/features/products/stores/productStore";
import { useBookmarkStore } from "@/features/products/stores/bookmarkStore";
import { useCartStore } from "@/shared/hooks/use-cart-store";
import { toast } from "sonner";
import { useLanguage } from "@/shared/context/LanguageContext";


const getHeroSlides = (language: string) => [
	{
		image: heroProtein,
		kicker: language === "fr" ? "Performance vÃƒÂ©gÃƒÂ©tale" : "Plant-powered performance",
		title: language === "fr" ? "Des complÃƒÂ©ments propres pour l'ÃƒÂ©nergie, la force et la rÃƒÂ©cupÃƒÂ©ration." : "Clean supplements for energy, strength, and recovery.",
		copy: language === "fr" ? "CrÃƒÂ©ez votre stack quotidien avec des formules transparentes, un excellent goÃƒÂ»t et des ingrÃƒÂ©dients choisis pour de vraies routines." : "Build your daily stack with transparent formulas, great taste, and ingredients chosen for real routines.",
		cta: language === "fr" ? "Acheter les meilleures ventes" : "Shop best sellers",
		accent: "bg-emerald-500",
		product: "GreenFuel Protein",
		type: language === "fr" ? "LactosÃƒÂ©rum + lÃƒÂ©gumes" : "Whey + greens",
		price: "390 MAD",
		theme: "emerald",
	},
	{
		image: heroGreens,
		kicker: language === "fr" ? "ClartÃƒÂ© matinale" : "Morning clarity",
		title: language === "fr" ? "Commencez concentrÃƒÂ© sans coup de barre dÃƒÂ» au sucre." : "Start focused without the sugar crash.",
		copy: language === "fr" ? "Hydratation, ÃƒÂ©lectrolytes, adaptogÃƒÂ¨nes et superaliments conÃƒÂ§us pour allÃƒÂ©ger vos journÃƒÂ©es bien remplies." : "Hydration, electrolytes, adaptogens, and greens designed to help busy days feel lighter.",
		cta: language === "fr" ? "CrÃƒÂ©er mon stack" : "Build my stack",
		accent: "bg-lime-500",
		product: "Daily Greens",
		type: language === "fr" ? "MÃƒÂ©lange de superaliments" : "Superfood blend",
		price: "320 MAD",
		theme: "lime",
	},
	{
		image: heroRecovery,
		kicker: language === "fr" ? "Une rÃƒÂ©cupÃƒÂ©ration qui suit le rythme" : "Recovery that keeps up",
		title: language === "fr" ? "Dormez plus profondÃƒÂ©ment, rÃƒÂ©cupÃƒÂ©rez plus vite, revenez plus fort." : "Sleep deeper, recover faster, come back stronger.",
		copy: language === "fr" ? "Favorisez le repos, la rÃƒÂ©paration musculaire et la rÃƒÂ©gularitÃƒÂ© avec des essentiels propres pour l'entraÃƒÂ®nement et le bien-ÃƒÂªtre quotidien." : "Support rest, muscle repair, and consistency with clean essentials for training and everyday wellness.",
		cta: language === "fr" ? "Explorer la rÃƒÂ©cupÃƒÂ©ration" : "Explore recovery",
		accent: "bg-teal-500",
		product: "Night Repair",
		type: language === "fr" ? "Complexe de magnÃƒÂ©sium" : "Magnesium complex",
		price: "280 MAD",
		theme: "teal",
	},
];

const getDetailedStackSteps = (language: string) => [
	{
		time: "08:00 AM",
		moment: language === "fr" ? "DÃ‰BUT DE MATINÃ‰E" : "MORNING START",
		title: language === "fr" ? "RÃ©veil propre" : "Wake up clean",
		copy: language === "fr" ? "Daily Greens et Hydra Charge aident votre matinÃ©e Ã  dÃ©marrer avec des minÃ©raux actifs, des enzymes digestives et une concentration stable." : "Daily Greens and Hydra Charge help your morning start with active minerals, digestive enzymes, and steady focus.",
		products: ["Daily Greens", "Hydra Charge"],
		icon: BatteryChargingIcon,
		color: "bg-emerald-500 text-white shadow-emerald-500/20"
	},
	{
		time: "02:00 PM",
		moment: language === "fr" ? "ENTRAÃŽNEMENT & CONCENTRATION" : "TRAINING & FOCUS",
		title: language === "fr" ? "S'entraÃ®ner avec intention" : "Train with intent",
		copy: language === "fr" ? "Les mÃ©langes de protÃ©ines et les BCAAs de performance favorisent la synthÃ¨se musculaire, l'endurance et la rÃ©cupÃ©ration les jours d'entraÃ®nement." : "Protein blends and performance BCAAs support muscle synthesis, stamina, and recovery on training days.",
		products: ["GreenFuel Protein", "Pre-Workout Spark"],
		icon: DumbbellIcon,
		color: "bg-amber-500 text-white shadow-amber-500/20"
	},
	{
		time: "09:30 PM",
		moment: language === "fr" ? "REPOS & RÃ‰PARATION" : "REST & REPAIR",
		title: language === "fr" ? "Reconstruire la nuit" : "Rebuild at night",
		copy: language === "fr" ? "Les formules de rÃ©cupÃ©ration Ã  libÃ©ration progressive et les minÃ©raux apaisants favorisent des cycles de sommeil plus profonds et la rÃ©paration cellulaire naturelle." : "Slow-release recovery formulas and soothing minerals support deeper sleep cycles and natural cellular repair.",
		products: ["Night Repair", "Muscle Restore BCAAs"],
		icon: MoonIcon,
		color: "bg-indigo-600 text-white shadow-indigo-600/20"
	}
];

const getReviews = (language: string) => [
	{
		quote: language === "fr"
			? "Les superaliments ont un goÃƒÂ»t frais, pas herbacÃƒÂ©. C'est la premiÃƒÂ¨re habitude de complÃƒÂ©ment que j'ai rÃƒÂ©ellement gardÃƒÂ©e."
			: "The greens taste fresh, not grassy. It is the first supplement habit I have actually kept.",
		name: "Maya R.",
		meta: language === "fr" ? "AbonnÃƒÂ© Daily Greens" : "Daily Greens subscriber",
	},
	{
		quote: language === "fr"
			? "La protÃƒÂ©ine se mÃƒÂ©lange facilement et ne pÃƒÂ¨se pas sur l'estomac. Parfait aprÃƒÂ¨s l'entraÃƒÂ®nement du matin."
			: "Protein mixes smooth and does not feel heavy. Perfect after morning training.",
		name: "Adam K.",
		meta: "GreenFuel Protein",
	},
	{
		quote: language === "fr"
			? "Le stack de rÃƒÂ©cupÃƒÂ©ration a rendu mes soirÃƒÂ©es plus rÃƒÂ©guliÃƒÂ¨res. Simple, propre et facile ÃƒÂ  faire confiance."
			: "The recovery stack made my evenings more consistent. Simple, clean, and easy to trust.",
		name: "Nadia S.",
		meta: language === "fr" ? "Pack RÃƒÂ©cupÃƒÂ©ration" : "Recovery bundle",
	},
];

const getTrustItems = (language: string) => [
	{ label: language === "fr" ? "Lots testÃƒÂ©s en laboratoire" : "Lab-tested batches", icon: BadgeCheckIcon },
	{ label: language === "fr" ? "Sans colorants artificiels" : "No artificial colors", icon: LeafIcon },
	{ label: language === "fr" ? "Livraison rapide" : "Fast delivery", icon: TruckIcon },
	{ label: language === "fr" ? "Abonnements faciles" : "Easy subscriptions", icon: PackageCheckIcon },
];

const getMarqueeItems = (language: string) => [
	{ name: language === "fr" ? "Frais & LÃƒÂ©ger" : "Fresh & Light", targetId: APP_ROUTES.SHOP },
	{ name: language === "fr" ? "Vitamines & MinÃƒÂ©raux" : "Vitamins & Minerals", targetId: APP_ROUTES.SHOP },
	{ name: language === "fr" ? "PrÃƒÂ©biotiques" : "Prebiotics", targetId: APP_ROUTES.SHOP },
	{ name: language === "fr" ? "Antioxydants" : "Antioxidants", targetId: APP_ROUTES.SHOP },
];



const getProofStats = (language: string) => [
	{ value: "92%", label: language === "fr" ? "des clients se sont sentis plus rÃƒÂ©guliers aprÃƒÂ¨s 30 jours" : "customers felt more consistent after 30 days" },
	{ value: "18g", label: language === "fr" ? "de protÃƒÂ©ines par portion dans notre mÃƒÂ©lange quotidien" : "protein per serving in our daily blend" },
	{ value: "0g", label: language === "fr" ? "de sucre ajoutÃƒÂ© dans l'hydratation et les superaliments" : "added sugar in hydration and greens" },
	{ value: "3rd", label: language === "fr" ? "testÃƒÂ© par un laboratoire tiers pour la qualitÃƒÂ© et la puretÃƒÂ©" : "party tested for quality and purity" },
];

const getComparisonData = (language: string) => [
	{
		feature: language === "fr" ? "Liste d'ingrÃƒÂ©dients transparente" : "Transparent ingredient list",
		zamazor: { text: language === "fr" ? "Divulgation complÃƒÂ¨te ÃƒÂ  100%" : "100% full disclosure", type: "success" },
		typical: { text: language === "fr" ? "Souvent cachÃƒÂ© dans des mÃƒÂ©langes brevetÃƒÂ©s" : "Often hidden in proprietary blends", type: "fail" }
	},
	{
		feature: language === "fr" ? "Accompagnement de routine" : "Routine guidance",
		zamazor: { text: language === "fr" ? "Stacks personnalisÃƒÂ©s par objectif" : "Personalized stacks by goal", type: "success" },
		typical: { text: language === "fr" ? "Achat de produits uniquement" : "Product-only shopping", type: "fail" }
	},
	{
		feature: language === "fr" ? "FlexibilitÃƒÂ© d'abonnement" : "Subscription flexibility",
		zamazor: { text: language === "fr" ? "Sauter, suspendre ou modifier en 30s" : "Skip, pause, or edit in 30 seconds", type: "success" },
		typical: { text: language === "fr" ? "Cycles rigides et difficiles ÃƒÂ  annuler" : "Rigid, hard-to-cancel cycles", type: "fail" }
	},
	{
		feature: language === "fr" ? "Colorants & ÃƒÂ©dulcorants artificiels" : "Artificial colors & sweeteners",
		zamazor: { text: language === "fr" ? "Jamais utilisÃƒÂ© (zÃƒÂ©ro artificiel)" : "Never used (zero artificials)", type: "success" },
		typical: { text: language === "fr" ? "Couramment ajoutÃƒÂ©s pour le goÃƒÂ»t/la couleur" : "Commonly added for flavor/color", type: "fail" }
	},
	{
		feature: language === "fr" ? "ContrÃƒÂ´les labo tiers" : "Third-party lab checks",
		zamazor: { text: language === "fr" ? "Chaque lot testÃƒÂ© + rapports publics" : "Every batch tested + public reports", type: "success" },
		typical: { text: language === "fr" ? "Rarely done or private" : "Rarely done or private", type: "fail" }
	}
];

const fadeUp = {
	hidden: { opacity: 0, y: 24 },
	visible: { opacity: 1, y: 0 },
};

const sectionLift = {
	hidden: { opacity: 0, y: 28 },
	visible: { opacity: 1, y: 0 },
};

const cardLift = {
	hidden: { opacity: 0, y: 20, scale: 0.985 },
	visible: { opacity: 1, y: 0, scale: 1 },
};



function SectionHeading({
	kicker,
	title,
	copy,
}: {
	kicker: string;
	title: string;
	copy?: string;
}) {
	return (
		<motion.div
			variants={fadeUp}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, amount: 0.4 }}
			transition={{ duration: 0.32, ease: "easeOut" }}
			className="max-w-3xl"
		>
			<p className="text-sm font-bold uppercase text-emerald-700">{kicker}</p>
			<h2 className="mt-2 text-3xl font-playfair font-normal leading-tight tracking-normal text-slate-950 sm:text-4xl">
				{title}
			</h2>
			{copy ? <p className="mt-4 text-base leading-7 text-slate-600">{copy}</p> : null}
		</motion.div>
	);
}

function IconLabel({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
	return (
		<div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
			<span className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
				<Icon className="size-4" aria-hidden="true" />
			</span>
			{label}
		</div>
	);
}

export const HomePage = () => {
	const navigate = useNavigate();
	const { language, t } = useLanguage();
	const addItem = useCartStore((state) => state.addItem);
	const addBookmark = useBookmarkStore((state) => state.addBookmark);
	const removeBookmark = useBookmarkStore((state) => state.removeBookmark);
	const isBookmarked = useBookmarkStore((state) => state.isBookmarked);

	const heroSlides = useMemo(() => getHeroSlides(language), [language]);
	const detailedStackSteps = getDetailedStackSteps(language);
	const reviews = getReviews(language);
	const trustItems = getTrustItems(language);
	const marqueeItems = getMarqueeItems(language);
	const proofStats = getProofStats(language);
	const comparisonData = getComparisonData(language);

	const { products: storeProducts, fetchProducts } = useProductStore();
	const products = storeProducts;
	const categoryProducts = storeProducts;

	const routineHighlights = useMemo(() => {
		const pick = (category: string) => storeProducts.find((product) => product.category === category) || null;
		const resolveImage = (fallback: string, product: Product | null) => product?.image || fallback;

		return [
			{
				title: language === "fr" ? "Mornings that feel lighter." : "Mornings that feel lighter.",
				copy: language === "fr" ? "Micronutriments, hydratation, and a cleaner first hour." : "Micronutrients, hydration, and a cleaner first hour.",
				product: pick("Greens"),
				image: resolveImage(heroGreens, pick("Greens")),
				tone: "bg-lime-100 text-lime-800",
			},
			{
				title: language === "fr" ? "Protein with a calm finish." : "Protein with a calm finish.",
				copy: language === "fr" ? "A simple daily protein card for strength and consistency." : "A simple daily protein card for strength and consistency.",
				product: pick("Protein"),
				image: resolveImage(heroProtein, pick("Protein")),
				tone: "bg-emerald-100 text-emerald-800",
			},
			{
				title: language === "fr" ? "Recovery after the work is done." : "Recovery after the work is done.",
				copy: language === "fr" ? "Evening support that feels soft, focused, and easy to repeat." : "Evening support that feels soft, focused, and easy to repeat.",
				product: pick("Recovery"),
				image: resolveImage(heroRecovery, pick("Recovery")),
				tone: "bg-teal-100 text-teal-800",
			},
			{
				title: language === "fr" ? "Energy without the noise." : "Energy without the noise.",
				copy: language === "fr" ? "A cleaner way to stay switched on for the day ahead." : "A cleaner way to stay switched on for the day ahead.",
				product: pick("Energy"),
				image: resolveImage(heroGreens, pick("Energy")),
				tone: "bg-amber-100 text-amber-800",
			},
		];
	}, [language, storeProducts]);

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	const [activeSlide, setActiveSlide] = useState(0);
	const slide = heroSlides[activeSlide];

	// Supplement Quiz State
	const [quizStep, setQuizStep] = useState<"intro" | "focus" | "diet" | "activity" | "result">("intro");
	const [quizFocus, setQuizFocus] = useState<"performance" | "greens" | "wellness" | "energy" | "recovery" | "">("");
	const [quizDiet, setQuizDiet] = useState<string>("vegan");

	const recommendedProduct = useMemo(() => {
		if (storeProducts.length === 0 || !quizFocus) return null;
		
		let targetCategory = "Protein";
		if (quizFocus === "performance") targetCategory = "Protein";
		else if (quizFocus === "greens") targetCategory = "Greens";
		else if (quizFocus === "wellness") targetCategory = "Wellness";
		else if (quizFocus === "energy") targetCategory = "Energy";
		else if (quizFocus === "recovery") targetCategory = "Recovery";
		
		return storeProducts.find(p => p.category === targetCategory) || storeProducts[0];
	}, [storeProducts, quizFocus]);

	const resetQuiz = () => {
		setQuizStep("intro");
		setQuizFocus("");
		setQuizDiet("vegan");
	};

	const productSliderRef = useRef<HTMLDivElement>(null);
	const [activeCategory, setActiveCategory] = useState("All");
	const categorySliderRef = useRef<HTMLDivElement>(null);

	const scrollProductSlider = (direction: "left" | "right") => {
		const container = productSliderRef.current;
		if (!container) return;
		const scrollAmount = container.clientWidth * 0.75;
		container.scrollBy({
			left: direction === "left" ? -scrollAmount : scrollAmount,
			behavior: "smooth",
		});
	};

	const scrollCategorySlider = (direction: "left" | "right") => {
		const container = categorySliderRef.current;
		if (!container) return;
		const scrollAmount = container.clientWidth * 0.75;
		container.scrollBy({
			left: direction === "left" ? -scrollAmount : scrollAmount,
			behavior: "smooth",
		});
	};

	useDocumentTitle(`${CONFIG.APP_NAME} | Clean Supplements`);



	useEffect(() => {
		const timer = window.setInterval(() => {
			setActiveSlide((current) => (current + 1) % heroSlides.length);
		}, 5500);

		return () => window.clearInterval(timer);
	}, [heroSlides.length]);

	const goToPreviousSlide = () => {
		setActiveSlide((current) =>
			current === 0 ? heroSlides.length - 1 : current - 1,
		);
	};

	const goToNextSlide = () => {
		setActiveSlide((current) => (current + 1) % heroSlides.length);
	};


	return (
		<>
			<section className="relative w-full h-screen min-h-[600px] overflow-hidden border-b border-emerald-900/10 bg-emerald-950" style={{ marginTop: `calc(-1 * var(--header-height, 80px))`, transform: "translateY(-2px)" }}>
				{/* Background Image Carousel with Fade Animation */}
				<AnimatePresence mode="wait">
					<motion.div
						key={activeSlide}
						initial={{ opacity: 0, scale: 1.05 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 1.05 }}
												transition={{ duration: 0.45, ease: "easeInOut" }}
						className="absolute inset-0 bg-cover bg-center"
						style={{ backgroundImage: `url(${slide.image})` }}
					>
						{/* Premium Dark Gradient Overlay for Maximum Text Contrast */}
						<div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-950/65 to-transparent max-md:bg-emerald-950/80" />
					</motion.div>
				</AnimatePresence>

				{/* Floating Content Layer */}
				<div className="absolute inset-0 flex items-center pt-12 sm:pt-16 lg:pt-20">
					<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="max-w-2xl relative z-10">
							<AnimatePresence mode="wait">
								<motion.div
									key={activeSlide}
									initial="hidden"
									animate="visible"
									exit="exit"
									variants={{
										hidden: { opacity: 0 },
										visible: {
											opacity: 1,
											transition: {
											staggerChildren: 0.06,
												delayChildren: 0.12,
											},
										},
										exit: {
											opacity: 0,
											transition: { duration: 0.12, ease: "easeOut" },
										},
									}}
								>
									{/* kicker */}
									<motion.div
										variants={{
											hidden: { opacity: 0, y: 15 },
											visible: { opacity: 1, y: 0, transition: { duration: 0.12, ease: "easeOut" } },
											exit: { opacity: 0, y: -10 }
										}}
										className="mb-5 inline-flex w-fit items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-950/55 px-3.5 py-1.5 text-sm font-bold text-emerald-300 shadow-sm backdrop-blur-sm"
									>
										<span className={cn("size-2 rounded-full", slide.accent)} />
										{t(`homepage.hero.badge${activeSlide + 1}`)}
									</motion.div>

									{/* title */}
									<motion.h1
										variants={{
											hidden: { opacity: 0, y: 20 },
											visible: { opacity: 1, y: 0, transition: { duration: 0.12, ease: "easeOut" } },
											exit: { opacity: 0, y: -15 }
										}}
										className="text-4xl font-playfair font-normal leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
									>
										{t(`homepage.hero.title${activeSlide + 1}`)}
									</motion.h1>

									{/* copy */}
									<motion.p
										variants={{
											hidden: { opacity: 0, y: 20 },
											visible: { opacity: 1, y: 0 },
											exit: { opacity: 0, y: -15 }
										}}
										className="mt-6 text-base sm:text-lg leading-relaxed text-emerald-50/85"
									>
										{t(`homepage.hero.desc${activeSlide + 1}`)}
									</motion.p>

									{/* CTA Buttons */}
									<motion.div
										variants={{
											hidden: { opacity: 0, y: 20 },
											visible: { opacity: 1, y: 0 },
											exit: { opacity: 0, y: -15 }
										}}
										className="mt-8 flex flex-col gap-3.5 sm:flex-row"
									>
										<Button asChild size="lg" className="h-12 bg-emerald-500 text-emerald-950 font-extrabold px-6 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20">
											<Link to={APP_ROUTES.SHOP}>
												{t("homepage.hero.shopNow")}
												<ArrowRightIcon className="ml-2 size-4" />
											</Link>
										</Button>
										<Button asChild variant="outline" size="lg" className="h-12 border-white/20 bg-white/10 text-white font-extrabold px-6 hover:bg-white/20 hover:text-white backdrop-blur-sm">
											<a href="#stack">{t("homepage.hero.quiz")}</a>
										</Button>
									</motion.div>
								</motion.div>
							</AnimatePresence>
						</div>
					</div>
				</div>

				{/* Centered Prev/Next Navigation Controls & Dots indicator at the bottom */}
				<div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-25 flex items-center gap-4 rounded-full border border-white/10 bg-emerald-950/45 px-5 py-2.5 shadow-2xl backdrop-blur-md">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label="Previous slide"
						className="size-9 rounded-full text-white hover:bg-white/20 hover:text-white"
						onClick={goToPreviousSlide}
					>
						<ChevronLeftIcon className="size-5" />
					</Button>

					<div className="flex gap-2">
						{heroSlides.map((item, index) => (
							<button
								key={item.title}
								type="button"
								aria-label={`Show slide ${index + 1}`}
								onClick={() => setActiveSlide(index)}
								className={cn(
									"h-2.5 rounded-full transition-all duration-300",
									index === activeSlide
										? "w-8 bg-emerald-400"
										: "w-2.5 bg-white/40 hover:bg-white/70",
								)}
							/>
						))}
					</div>

					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label="Next slide"
						className="size-9 rounded-full text-white hover:bg-white/20 hover:text-white"
						onClick={goToNextSlide}
					>
						<ChevronRightIcon className="size-5" />
					</Button>
				</div>
			</section>

			{/* Category Marquee Loop Section */}
			<section className="bg-[#b8cfc4] py-4.5 border-y border-emerald-900/15 overflow-hidden select-none">
				<div className="flex w-max animate-marquee whitespace-nowrap items-center">
					{Array.from({ length: 8 }).map((_, listIndex) => (
						<div key={listIndex} className="flex items-center">
							{marqueeItems.map((item, itemIndex) => (
								<div key={itemIndex} className="flex items-center mx-6 sm:mx-8">
									<button
									onClick={() => navigate(item.targetId)}
										className="bg-white text-emerald-950 font-sans font-bold text-[11px] sm:text-xs px-5 py-2 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
									>
										{language === "fr" ? "Boutique" : "Shop"}
									</button>
									<span className="font-playfair text-xl sm:text-2xl text-emerald-950 font-medium ml-4 sm:ml-5">
										{item.name}
									</span>
								</div>
							))}
						</div>
					))}
				</div>
			</section>

			{/* Interactive Supplement Advisor Quiz Section */}
			<section className="bg-[#fcfdfa] py-20 border-b border-emerald-900/10">
				<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
					<span className="text-xs font-black uppercase tracking-widest text-emerald-800">
						{language === "fr" ? "Conseiller en ComplÃƒÂ©ments Intelligent" : "Smart Supplement Finder"}
					</span>
					<h2 className="mt-3 text-3xl font-playfair font-normal leading-tight text-slate-950 sm:text-4xl">
						{language === "fr" ? "DÃƒÂ©couvrez votre stack de complÃƒÂ©ments biologiques personnalisÃƒÂ©." : "Discover your personalized organic supplement stack."}
					</h2>
					<p className="mt-3 text-slate-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
						{language === "fr" ? "RÃƒÂ©pondez ÃƒÂ  notre questionnaire de 30 secondes pour trouver les plantes et protÃƒÂ©ines propres adaptÃƒÂ©es ÃƒÂ  votre niveau d'activitÃƒÂ©." : "Take our 30-second science-backed advisor quiz to find the perfect clean botanicals and proteins mapped for your activity level."}
					</p>

					{/* Quiz Box */}
					<div className="mt-12 bg-gradient-to-br from-emerald-50/50 to-lime-50/20 border border-emerald-900/10 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden text-left min-h-[420px] flex flex-col justify-between">
						
						{/* Step: INTRO */}
						{quizStep === "intro" && (
							<div className="flex flex-col items-center justify-center text-center py-10 my-auto w-full">
								<BrainIcon className="size-16 text-emerald-800 mb-6 animate-pulse" />
								<h3 className="text-2xl font-playfair text-slate-950 font-normal">
									{language === "fr" ? "Trouvez Votre Formule Propre IdÃƒÂ©ale" : "Find Your Clean Formula Match"}
								</h3>
								<p className="text-slate-500 text-sm max-w-sm mt-3 leading-relaxed">
									{language === "fr" ? "RÃƒÂ©pondez ÃƒÂ  trois questions rapides sur votre objectif de santÃƒÂ©, votre niveau d'activitÃƒÂ© et vos prÃƒÂ©fÃƒÂ©rences alimentaires." : "Answer three quick questions about your health focus, active schedule, and diet preferences."}
								</p>
								<Button
									onClick={() => setQuizStep("focus")}
									className="mt-8 bg-emerald-900 hover:bg-emerald-950 text-white font-bold h-12 px-8 rounded-full shadow-xs cursor-pointer"
								>
									{language === "fr" ? "DÃƒÂ©marrer le Questionnaire Ã¢â€ â€™" : "Start Advisor Quiz Ã¢â€ â€™"}
								</Button>
							</div>
						)}

						{/* Step 1: FOCUS */}
						{quizStep === "focus" && (
							<div className="space-y-6 my-auto w-full">
								<div>
									<span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">{language === "fr" ? "Ãƒâ€°tape 1 sur 3" : "Step 1 of 3"}</span>
									<h3 className="text-xl sm:text-2xl font-playfair text-slate-950 font-normal mt-1">
										{language === "fr" ? "Quel est votre objectif principal de bien-ÃƒÂªtre ou de fitness ?" : "What is your primary wellness or fitness focus?"}
									</h3>
								</div>
								<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
									{[
										{ id: "performance", label: language === "fr" ? "Croissance Musculaire & Force" : "Muscle Growth & Strength", icon: DumbbellIcon, desc: language === "fr" ? "ProtÃƒÂ©ines biologiques de qualitÃƒÂ©" : "Premium organic proteins" },
										{ id: "greens", label: language === "fr" ? "Micronutriments Quotidiens" : "Daily Micronutrients", icon: LeafIcon, desc: language === "fr" ? "Superaliments crus actifs" : "Raw active supergreens" },
										{ id: "energy", label: language === "fr" ? "Endurance & Concentration Naturelles" : "Natural Stamina & Focus", icon: ZapIcon, desc: language === "fr" ? "Boost d'entraÃƒÂ®nement propre" : "Clean pre-workout spark" },
										{ id: "recovery", label: language === "fr" ? "RÃƒÂ©cupÃƒÂ©ration Musculaire & Sommeil" : "Muscle Repair & Sleep", icon: MoonIcon, desc: language === "fr" ? "BCAAs biologiques de rÃƒÂ©cupÃƒÂ©ration" : "Organic recovery BCAAs" },
										{ id: "wellness", label: language === "fr" ? "ImmunitÃƒÂ© & LongÃƒÂ©vitÃƒÂ©" : "Immunity & Longevity", icon: HeartPulseIcon, desc: language === "fr" ? "Extraits adaptogÃƒÂ¨nes apaisants" : "Adaptogen calm extracts" },
									].map((opt) => (
										<button
											key={opt.id}
											onClick={() => {
												setQuizFocus(opt.id as "performance" | "greens" | "wellness" | "energy" | "recovery");
												setQuizStep("diet");
											}}
											className="p-4 bg-white rounded-2xl border border-emerald-900/10 hover:border-emerald-700 hover:bg-emerald-50/20 text-left transition-all duration-150 cursor-pointer group shadow-2xs hover:shadow-xs"
										>
											<opt.icon className="size-6 text-emerald-800 mb-3 group-hover:scale-110 transition-transform" />
											<p className="text-sm font-bold text-slate-900 leading-tight">{opt.label}</p>
											<p className="text-[11px] text-slate-400 mt-1">{opt.desc}</p>
										</button>
									))}
								</div>
							</div>
						)}

						{/* Step 2: DIET */}
						{quizStep === "diet" && (
							<div className="space-y-6 my-auto w-full">
								<div>
									<span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">{language === "fr" ? "Ãƒâ€°tape 2 sur 3" : "Step 2 of 3"}</span>
									<h3 className="text-xl sm:text-2xl font-playfair text-slate-950 font-normal mt-1">
										{language === "fr" ? "SÃƒÂ©lectionnez votre prÃƒÂ©fÃƒÂ©rence alimentaire :" : "Select your primary dietary preference:"}
									</h3>
								</div>
								<div className="grid gap-3 sm:grid-cols-2">
									{[
										{ id: "vegan", label: language === "fr" ? "VÃƒÂ©gÃƒÂ©talien / Ãƒâ‚¬ Base de Plantes" : "Vegan / Plant-Based Only", desc: language === "fr" ? "Sans produits laitiers ni dÃƒÂ©rivÃƒÂ©s animaux" : "No dairy or animal derivatives" },
										{ id: "organic", label: language === "fr" ? "Biologique & Sans OGM" : "Organic & Non-GMO First", desc: language === "fr" ? "Cultures crues bio certifiÃƒÂ©es les plus pures" : "Purest certified organic raw crops" },
										{ id: "keto", label: language === "fr" ? "Keto / Faible en Glucides" : "Keto / Low-Carb Friendly", desc: language === "fr" ? "Graisses et minÃƒÂ©raux cÃƒÂ©to sans sucre" : "Sugar-free keto fats & minerals" },
										{ id: "glutenFree", label: language === "fr" ? "Sans Gluten ni Soja" : "Gluten & Soy Free", desc: language === "fr" ? "MÃƒÂ©langes hypoallergÃƒÂ©niques sÃƒÂ»rs" : "Safe allergen-conscious blends" },
									].map((opt) => (
										<button
											key={opt.id}
											onClick={() => {
												setQuizDiet(opt.id);
												setQuizStep("activity");
											}}
											className={cn(
												"p-4 rounded-2xl border text-left transition-all duration-150 cursor-pointer group shadow-2xs",
												quizDiet === opt.id
													? "bg-emerald-900 border-emerald-900 text-white"
													: "bg-white border-emerald-900/10 hover:border-emerald-700 hover:bg-emerald-50/20"
											)}
										>
											<p className={cn("text-sm font-bold leading-tight", quizDiet === opt.id ? "text-white" : "text-slate-900")}>{opt.label}</p>
											<p className={cn("text-[11px] mt-1", quizDiet === opt.id ? "text-emerald-100" : "text-slate-400")}>{opt.desc}</p>
										</button>
									))}
								</div>
								<div className="flex justify-between items-center pt-4">
									<Button variant="ghost" onClick={() => setQuizStep("focus")} className="text-emerald-900 hover:bg-emerald-50 rounded-xl cursor-pointer">
										&larr; {language === "fr" ? "Retour" : "Back"}
									</Button>
								</div>
							</div>
						)}

						{/* Step 3: ACTIVITY */}
						{quizStep === "activity" && (
							<div className="space-y-6 my-auto w-full">
								<div>
									<span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">{language === "fr" ? "Ãƒâ€°tape 3 sur 3" : "Step 3 of 3"}</span>
									<h3 className="text-xl sm:text-2xl font-playfair text-slate-950 font-normal mt-1">
										{language === "fr" ? "Quel est votre niveau d'activitÃƒÂ© physique actuel ?" : "What is your current physical activity level?"}
									</h3>
								</div>
								<div className="grid gap-3 sm:grid-cols-3">
									{[
										{ id: "sedentary", label: language === "fr" ? "LÃƒÂ©gÃƒÂ¨rement Actif" : "Light Active", desc: language === "fr" ? "1-2 sÃƒÂ©ances courtes/semaine" : "1-2 short sessions/week" },
										{ id: "moderate", label: language === "fr" ? "ModÃƒÂ©rÃƒÂ©ment Actif" : "Moderately Active", desc: language === "fr" ? "3-4 entraÃƒÂ®nements standard/semaine" : "3-4 standard workouts/week" },
										{ id: "intense", label: language === "fr" ? "ExtrÃƒÂªmement Actif" : "Extremely Active", desc: language === "fr" ? "5+ entraÃƒÂ®nements de haute intensitÃƒÂ©/semaine" : "5+ high intensity workouts/week" },
									].map((opt) => (
										<button
											key={opt.id}
											onClick={() => {
												setQuizStep("result");
											}}
											className="p-4 bg-white rounded-2xl border border-emerald-900/10 hover:border-emerald-700 hover:bg-emerald-50/20 text-left transition-all duration-150 cursor-pointer shadow-2xs group"
										>
											<p className="text-sm font-bold text-slate-900 leading-tight group-hover:text-emerald-800 transition-colors">{opt.label}</p>
											<p className="text-[11px] text-slate-400 mt-1.5">{opt.desc}</p>
										</button>
									))}
								</div>
								<div className="flex justify-between items-center pt-4">
									<Button variant="ghost" onClick={() => setQuizStep("diet")} className="text-emerald-900 hover:bg-emerald-50 rounded-xl cursor-pointer">
										&larr; {language === "fr" ? "Retour" : "Back"}
									</Button>
								</div>
							</div>
						)}

						{/* Step: RESULT */}
						{quizStep === "result" && recommendedProduct && (
							<div className="space-y-6 w-full animate-slide-up">
								<div>
									<span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">{language === "fr" ? "Votre Recommandation" : "Your Recommendation"}</span>
									<h3 className="text-xl sm:text-2xl font-playfair text-slate-950 font-normal mt-1">
										{language === "fr" ? "Voici votre formule propre personnalisÃƒÂ©e :" : "Here is your personalized clean formula match:"}
									</h3>
								</div>

								<div className="flex flex-col md:flex-row gap-6 p-4 sm:p-6 bg-white rounded-2xl border border-emerald-900/10 shadow-md">
									{/* Image */}
									<div className="size-28 sm:size-36 shrink-0 bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center justify-center mx-auto md:mx-0">
										<img src={recommendedProduct.image} alt={recommendedProduct.name} className="h-full object-contain" />
									</div>

									{/* Info */}
									<div className="flex-1 text-center md:text-left flex flex-col justify-between">
										<div>
											<span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider bg-emerald-50 border border-emerald-900/5 px-2.5 py-0.5 rounded-full inline-block">
												{recommendedProduct.category}
											</span>
											<h4 className="text-xl font-playfair font-bold text-slate-955 mt-1.5">
												{recommendedProduct.name}
											</h4>
											<p className="text-xs text-slate-500 mt-2 leading-relaxed">
												{language === "fr" ? (
													<>BasÃƒÂ© sur vos objectifs pour <strong className="text-emerald-950 font-sans">{quizFocus}</strong> et votre rythme actif, cette formule premium apporte des nutriments propres et biodisponibles sans aucun produit synthÃƒÂ©tique.</>
												) : (
													<>Based on your wellness goals for <strong className="text-emerald-950 font-sans">{quizFocus}</strong> and active schedule, this premium clean formula delivers clean, bioavailable nourishment with zero synthetics.</>
												)}
											</p>
										</div>

										<div className="mt-4 flex items-center justify-between flex-wrap gap-2 border-t border-slate-50 pt-3">
											<span className="text-lg font-black text-slate-900">{recommendedProduct.price}</span>
											<div className="flex gap-2 w-full sm:w-auto">
												<Button
													onClick={() => {
														addItem(recommendedProduct);
														toast.success(language === "fr" ? `${recommendedProduct.name} ajoutÃƒÂ© au panier !` : `${recommendedProduct.name} added to cart!`);
													}}
													className="flex-1 sm:flex-initial h-10 px-5 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
												>
													<ShoppingBagIcon className="size-3.5" />
													{t("common.addToCart")}
												</Button>
												<Button
													variant="outline"
													onClick={() => navigate(`/product/${recommendedProduct.id}`)}
													className="h-10 px-4 rounded-xl border-emerald-900/15 text-emerald-800 hover:bg-emerald-50 cursor-pointer animate-in duration-200"
												>
													{language === "fr" ? "DÃƒÂ©tails" : "Details"}
												</Button>
											</div>
										</div>
									</div>
								</div>

								<div className="flex justify-end pt-2">
									<Button variant="ghost" onClick={resetQuiz} className="text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer text-xs font-bold uppercase tracking-wider">
										{language === "fr" ? "Recommencer le questionnaire Ã¢â€ Â" : "Retake Quiz \u2190"}
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>
			</section>


			{/* First Section: Products Slider */}
			<section id="products" className="bg-white py-16 border-b border-emerald-900/10">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9">
						<div className="flex-1">
							<p className="text-xs font-black uppercase tracking-widest text-emerald-700">{language === "fr" ? "Meilleures ventes" : "Best sellers"}</p>
							<h2 className="mt-2 text-3xl font-playfair font-normal tracking-tight text-slate-950 sm:text-4xl">{language === "fr" ? "Formules ÃƒÂ  fort impact." : "High-impact formulas."}</h2>
							<p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">{language === "fr" ? "Chaque produit est conÃƒÂ§u pour s'intÃƒÂ©grer facilement dans votre quotidien : un but clair, des ingrÃƒÂ©dients propres et des saveurs agrÃƒÂ©ables." : "Each product is built to feel easy in real life: clear purpose, clean ingredients, and flavors that make consistency simpler."}</p>
						</div>
						<div className="flex items-center gap-1.5 self-start sm:self-end">
							<Button
								variant="outline"
								size="icon"
								className="h-9 w-9 rounded-lg border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950"
								onClick={() => scrollProductSlider("left")}
								aria-label="Scroll left"
							>
								<ChevronLeftIcon className="size-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								className="h-9 w-9 rounded-lg border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950"
								onClick={() => scrollProductSlider("right")}
								aria-label="Scroll right"
							>
								<ChevronRightIcon className="size-4" />
							</Button>
						</div>
					</div>

					<div
						ref={productSliderRef}
						className="flex overflow-x-auto gap-6 pb-6 scroll-smooth snap-x snap-mandatory scrollbar-none"
					>
						{products.map((product) => (
							<motion.article
								key={product.name}
								whileHover={{ y: -8 }}
								transition={{ duration: 0.12, ease: "easeOut" }}
								onClick={() => navigate(`/product/${product.id}`)}
								className="snap-start shrink-0 w-[290px] sm:w-[330px] rounded-[2rem] border border-emerald-950/5 bg-white p-4 shadow-md hover:shadow-lg transition-shadow duration-150 flex flex-col justify-between group cursor-pointer"
							>
								<div>
									<div className="relative h-80 overflow-hidden rounded-[1.5rem] bg-white border border-gray-100/60">
										<span className="absolute left-3 top-3 z-10 rounded-full bg-white/80 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-emerald-900 border border-white/20 shadow-sm">
											{product.badge}
										</span>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												if (isBookmarked(product.id)) {
													removeBookmark(product.id);
													toast.success(language === "fr" ? `${product.name} retirÃƒÂ© des favoris.` : `Removed ${product.name} from wishlist.`);
												} else {
													addBookmark(product);
													toast.success(language === "fr" ? `${product.name} ajoutÃƒÂ© aux favoris !` : `Added ${product.name} to wishlist!`);
												}
											}}
											className="absolute right-3 top-3 z-10 size-9 rounded-full bg-white/95 text-slate-700 shadow-sm border border-slate-100 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
											title={isBookmarked(product.id) ? (language === "fr" ? "Retirer des favoris" : "Remove from Wishlist") : (language === "fr" ? "Ajouter aux favoris" : "Add to Wishlist")}
										>
											<HeartIcon className={cn("size-4 transition-colors", isBookmarked(product.id) ? "fill-rose-500 text-rose-500" : "text-slate-500")} />
										</button>
										<img 
											src={product.image} 
											alt={product.name} 
											className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-105" 
										/>
									</div>
									<div className="mt-5 px-1">
										<p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
											{product.category}
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
										toast.success(language === "fr" ? `${product.name} ajoutÃƒÂ© au panier !` : `${product.name} added to cart!`);
									}}
									className="mt-5 w-full h-10 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
								>
									<ShoppingBagIcon className="size-3.5" />
									{t("common.addToCart")}
								</OriginButton>
							</motion.article>
						))}
					</div>

					{/* Centered See All Products button at the bottom of the slider */}
					<div className="mt-10 flex justify-center">
						<Button
							asChild
							variant="outline"
							className="rounded-xl border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950 font-bold px-6 py-5"
						>
							<Link to={APP_ROUTES.SHOP}>
								{language === "fr" ? "Voir tous les produits" : "See all products"}
								<ArrowRightIcon className="ml-2 size-4" />
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Formulations Section */}
			<section id="formulations" className="bg-[#fcfdfa] py-20 border-b border-emerald-900/10">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<p className="text-xs font-black uppercase tracking-widest text-emerald-700">{language === "fr" ? "Formulations" : "Formulations"}</p>
						<h2 className="mt-2 text-3xl font-playfair font-normal leading-tight text-slate-950 sm:text-5xl">
							{language === "fr" ? "Formulations scientifiques" : "Science-backed formulations"}
						</h2>
						<p className="mt-4 mx-auto max-w-2xl text-base leading-relaxed text-slate-500">
							{language === "fr" ? "Nos mÃƒÂ©langes ciblÃƒÂ©s associent des ingrÃƒÂ©dients appuyÃƒÂ©s par la recherche avec une formulation soignÃƒÂ©e pour soutenir votre vitalitÃƒÂ©." : "Our targeted blends combine research-backed ingredients with thoughtful formulation to support lasting vitality, balance"}
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-3">
						{/* Card 1: Nutrient Support */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.34 }}
							className="relative overflow-hidden rounded-[2.5rem] aspect-[4/5] p-6 sm:p-8 flex flex-col justify-between shadow-lg border border-emerald-900/10 group cursor-pointer"
						>
							<div
								className="absolute inset-0 bg-cover bg-center transition-transform duration-150 ease-out group-hover:scale-105"
								style={{ backgroundImage: `url(${cardNutrientImg})` }}
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-emerald-950/20 to-black/35 group-hover:from-emerald-950/80 group-hover:via-emerald-950/30 transition-colors duration-150" />
							
							<div className="relative z-10">
								<span className="inline-block bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold">
									{language === "fr" ? "Soutien Nutritionnel" : "Nutrient Support"}
								</span>
								<h3 className="mt-5 text-2xl sm:text-3xl font-playfair font-normal leading-tight text-white max-w-[240px]">
									{language === "fr" ? "Soutenir l'ÃƒÂ©quilibre mÃƒÂ©tabolique" : "Support metabolic balance"}
								</h3>
							</div>

							<div className="relative z-10 flex items-end justify-between mt-auto">
								<button
									onClick={() => navigate(APP_ROUTES.SHOP)}
									className="bg-lime-300 text-emerald-950 hover:bg-lime-400 font-bold px-6 py-3 rounded-full text-xs sm:text-sm transition-all duration-150 transform active:scale-95 shadow-md shadow-lime-950/20"
								>
									{language === "fr" ? "Acheter" : "Shop Now"}
								</button>

								<div className="h-20 w-16 sm:h-24 sm:w-20 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden p-1.5 transition-transform duration-150 group-hover:scale-125">
									<img src={productProtein} alt="Protein canister" className="h-full w-full object-contain" />
								</div>
							</div>
						</motion.div>

						{/* Card 2: Immune Defense */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.34, delay: 0.08 }}
							className="relative overflow-hidden rounded-[2.5rem] aspect-[4/5] p-6 sm:p-8 flex flex-col justify-between shadow-lg border border-emerald-900/10 group cursor-pointer"
						>
							<div
								className="absolute inset-0 bg-cover bg-center transition-transform duration-150 ease-out group-hover:scale-105"
								style={{ backgroundImage: `url(${cardImmuneImg})` }}
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-emerald-950/20 to-black/35 group-hover:from-emerald-950/80 group-hover:via-emerald-950/30 transition-colors duration-150" />
							
							<div className="relative z-10">
								<span className="inline-block bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold">
									{language === "fr" ? "DÃƒÂ©fense Immunitaire" : "Immune Defense"}
								</span>
								<h3 className="mt-5 text-2xl sm:text-3xl font-playfair font-normal leading-tight text-white max-w-[240px]">
									{language === "fr" ? "Renforcer l'immunitÃƒÂ© naturelle" : "Strengthen natural immunity"}
								</h3>
							</div>

							<div className="relative z-10 flex items-end justify-between mt-auto">
								<button
									onClick={() => navigate(APP_ROUTES.SHOP)}
									className="bg-lime-300 text-emerald-950 hover:bg-lime-400 font-bold px-6 py-3 rounded-full text-xs sm:text-sm transition-all duration-150 transform active:scale-95 shadow-md shadow-lime-950/20"
								>
									{language === "fr" ? "Acheter" : "Shop Now"}
								</button>

								<div className="h-20 w-16 sm:h-24 sm:w-20 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden p-1.5 transition-transform duration-150 group-hover:scale-125">
									<img src={productGreens} alt="Greens canister" className="h-full w-full object-contain" />
								</div>
							</div>
						</motion.div>

						{/* Card 3: Mind & Focus */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.34, delay: 0.16 }}
							className="relative overflow-hidden rounded-[2.5rem] aspect-[4/5] p-6 sm:p-8 flex flex-col justify-between shadow-lg border border-emerald-900/10 group cursor-pointer"
						>
							<div
								className="absolute inset-0 bg-cover bg-center transition-transform duration-150 ease-out group-hover:scale-105"
								style={{ backgroundImage: `url(${cardMindImg})` }}
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-emerald-950/20 to-black/35 group-hover:from-emerald-950/80 group-hover:via-emerald-950/30 transition-colors duration-150" />
							
							<div className="relative z-10">
								<span className="inline-block bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold">
									{language === "fr" ? "Esprit & Concentration" : "Mind & Focus"}
								</span>
								<h3 className="mt-5 text-2xl sm:text-3xl font-playfair font-normal leading-tight text-white max-w-[240px]">
									{language === "fr" ? "Favoriser la santÃƒÂ© cognitive" : "Promote cognitive health"}
								</h3>
							</div>

							<div className="relative z-10 flex items-end justify-between mt-auto">
								<button
									onClick={() => navigate(APP_ROUTES.SHOP)}
									className="bg-lime-300 text-emerald-950 hover:bg-lime-400 font-bold px-6 py-3 rounded-full text-xs sm:text-sm transition-all duration-150 transform active:scale-95 shadow-md shadow-lime-950/20"
								>
									{language === "fr" ? "Acheter" : "Shop Now"}
								</button>

								<div className="h-20 w-16 sm:h-24 sm:w-20 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden p-1.5 transition-transform duration-150 group-hover:scale-125">
									<img src={productHydra} alt="Hydra canister" className="h-full w-full object-contain" />
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* New Category Slider Section */}
			<motion.section
				variants={sectionLift}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.18 }}
				transition={{ duration: 0.34, ease: "easeOut" }}
				className="bg-gradient-to-b from-emerald-50/30 via-[#f6fbf2] to-[#fcfdfa] py-20 border-b border-emerald-900/10 overflow-hidden"
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
						<div className="flex-1">
							<p className="text-xs font-black uppercase tracking-widest text-emerald-700">{language === "fr" ? "Explorer les formules" : "Explore formulas"}</p>
							<h2 className="mt-2 text-3xl font-playfair font-normal tracking-tight text-slate-950 sm:text-4xl">{language === "fr" ? "Acheter par CatÃƒÂ©gorie." : "Shop by Category."}</h2>
							<p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
								{language === "fr" ? "SÃƒÂ©lectionnez une catÃƒÂ©gorie pour filtrer. Chaque mÃƒÂ©lange est crÃƒÂ©ÃƒÂ© pour vous aider ÃƒÂ  atteindre vos objectifs de performance et de rÃƒÂ©cupÃƒÂ©ration." : "Select a category to filter. Each blend is created to help you reach target performance and recovery goals with zero fluff."}
							</p>
						</div>
						<div className="flex items-center gap-1.5 self-start sm:self-end">
							<Button
								variant="outline"
								size="icon"
								className="h-9 w-9 rounded-lg border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950"
								onClick={() => scrollCategorySlider("left")}
								aria-label="Scroll left"
							>
								<ChevronLeftIcon className="size-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								className="h-9 w-9 rounded-lg border-emerald-900/10 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950"
								onClick={() => scrollCategorySlider("right")}
								aria-label="Scroll right"
							>
								<ChevronRightIcon className="size-4" />
							</Button>
						</div>
					</div>

					{/* Category Tabs */}
					<div className="flex overflow-x-auto gap-2.5 pb-4 scrollbar-none snap-x mb-8">
						{["All", "Protein", "Greens", "Energy", "Recovery", "Immunity", "Wellness"].map((cat) => {
							const isActive = activeCategory === cat;
							const catLabel = cat === "All"
								? (language === "fr" ? "Tous" : "All")
								: cat === "Protein" ? (language === "fr" ? "ProtÃƒÂ©ine" : "Protein")
								: cat === "Greens" ? (language === "fr" ? "Superaliments" : "Greens")
								: cat === "Energy" ? (language === "fr" ? "Ãƒâ€°nergie" : "Energy")
								: cat === "Recovery" ? (language === "fr" ? "RÃƒÂ©cupÃƒÂ©ration" : "Recovery")
								: cat === "Immunity" ? (language === "fr" ? "ImmunitÃƒÂ©" : "Immunity")
								: cat === "Wellness" ? (language === "fr" ? "Bien-ÃƒÂªtre" : "Wellness")
								: cat;
							return (
								<button
									key={cat}
									onClick={() => setActiveCategory(cat)}
									className={cn(
										"px-5 py-2 text-xs font-bold rounded-full border transition-all duration-200 cursor-pointer snap-start shrink-0 shadow-sm",
										isActive
											? "bg-emerald-950 text-white border-emerald-950 shadow-md shadow-emerald-950/10"
											: "bg-white text-emerald-800 border-emerald-900/10 hover:bg-emerald-50 hover:text-emerald-950 hover:-translate-y-0.5"
									)}
								>
									{catLabel}
								</button>
							);
						})}
					</div>

					{/* Slider container */}
					<div
						ref={categorySliderRef}
						className="flex overflow-x-auto gap-6 pb-6 scroll-smooth snap-x snap-mandatory scrollbar-none min-h-[460px]"
					>
						<AnimatePresence mode="popLayout">
							{categoryProducts
								.filter((p) => activeCategory === "All" || p.category === activeCategory)
								.map((product) => (
								<motion.article
										key={product.name}
										variants={cardLift}
										layout
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.95 }}
										transition={{ duration: 0.16 }}
										whileHover={{ y: -6, rotate: -0.2 }}
										onClick={() => navigate(`/product/${product.id}`)}
										className="snap-start shrink-0 w-[290px] sm:w-[330px] rounded-[2rem] border border-emerald-950/5 bg-white p-4 shadow-md hover:shadow-xl hover:shadow-emerald-950/10 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
									>
										<div>
											<div className="relative h-80 overflow-hidden rounded-[1.5rem] bg-white border border-gray-100/60">
												<span className="absolute left-3 top-3 z-10 rounded-full bg-white/80 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-emerald-900 border border-white/20 shadow-sm">
													{product.badge}
												</span>
												<img
													src={product.image}
													alt={product.name}
													className="h-full w-full object-cover transition-transform duration-220 ease-out group-hover:scale-108"
												/>
												<div className="absolute inset-0 bg-gradient-to-t from-slate-950/15 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
											</div>
											<div className="mt-5 px-1">
												<p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
													{product.category}
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
												toast.success(language === "fr" ? `${product.name} ajoutÃƒÂ© au panier !` : `${product.name} added to cart!`);
											}}
											className="mt-5 w-full h-10 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
										>
											<ShoppingBagIcon className="size-3.5" />
											{t("common.addToCart")}
										</OriginButton>
									</motion.article>
								))}
						</AnimatePresence>
					</div>
				</div>
			</motion.section>

			<motion.section
				variants={sectionLift}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.16 }}
				transition={{ duration: 0.58, ease: "easeOut" }}
				className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
			>
				<div className="grid gap-8 overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-white p-5 shadow-xl shadow-emerald-950/5 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
					<div className="lg:sticky lg:top-28">
						<SectionHeading
							kicker={language === "fr" ? "SÃƒÂ©lection ÃƒÂ©ditoriale" : "Editorial selection"}
							title={language === "fr" ? "Une vitrine plus guidÃƒÂ©e pour acheter plus vite." : "A more guided shelf for faster shopping."}
							copy={language === "fr"
								? "Cette section met en avant les routines qui se lisent dÃ¢â‚¬â„¢un coup dÃ¢â‚¬â„¢Ã…â€œil, avec des cartes plus visuelles et une hiÃƒÂ©rarchie trÃƒÂ¨s propre."
								: "This section puts the most shoppable routines front and center with clearer hierarchy and more visual cards."
							}
						/>

						<div className="mt-8 space-y-3">
							{[
								language === "fr" ? "Vue rapide des routines" : "Quick routine scan",
								language === "fr" ? "Cartes produit plus visuelles" : "More visual product cards",
								language === "fr" ? "AccÃƒÂ¨s direct ÃƒÂ  la boutique" : "Direct access to shop",
							].map((item) => (
								<div key={item} className="flex items-center gap-3 rounded-2xl border border-emerald-900/6 bg-emerald-50/50 px-4 py-3 text-sm font-semibold text-slate-700">
									<Check className="size-4 text-emerald-700" />
									{item}
								</div>
							))}
						</div>

						<div className="mt-8 flex flex-col gap-3 sm:flex-row">
							<Button asChild className="h-11 rounded-xl bg-emerald-900 text-white hover:bg-emerald-950">
								<Link to={APP_ROUTES.SHOP}>
									{language === "fr" ? "Voir la boutique" : "Browse the shop"}
									<ArrowRightIcon className="ml-2 size-4" />
								</Link>
							</Button>
							<Button asChild variant="outline" className="h-11 rounded-xl border-emerald-900/10 text-emerald-800 hover:bg-emerald-50">
								<Link to={APP_ROUTES.SHOP}>
									{language === "fr" ? "Parcourir les produits" : "Browse products"}
								</Link>
							</Button>
						</div>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						{routineHighlights.map((item, index) => (
							<motion.article
								key={item.title}
								variants={cardLift}
								initial="hidden"
								whileInView="visible"
								viewport={{ once: true, amount: 0.2 }}
								transition={{ duration: 0.32 + index * 0.04, ease: "easeOut" }}
								whileHover={{ y: -8, rotate: index % 2 === 0 ? -0.35 : 0.35 }}
								className="group overflow-hidden rounded-[1.75rem] border border-emerald-900/8 bg-[#fbfdf9] shadow-sm transition-all duration-200 hover:shadow-xl hover:shadow-emerald-950/10"
							>
								<div className="relative aspect-[4/3] overflow-hidden bg-white">
									<img
										src={item.image}
										alt={item.product?.name || item.title}
										className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
									<span className={`absolute left-3 top-3 rounded-full border border-white/40 bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${item.tone}`}>
										{item.product?.category || (language === "fr" ? "SÃƒÂ©lection" : "Selection")}
									</span>
								</div>

								<div className="space-y-3 p-4">
									<div>
										<h3 className="text-lg font-black leading-tight text-slate-950">{item.title}</h3>
										<p className="mt-2 text-sm leading-6 text-slate-500">{item.copy}</p>
									</div>

									<div className="flex items-center justify-between gap-3">
										<div>
											<p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
												{language === "fr" ? "Produit en vedette" : "Featured product"}
											</p>
											<p className="mt-1 text-sm font-bold text-slate-900">{item.product?.name || (language === "fr" ? "Ãƒâ‚¬ dÃƒÂ©couvrir" : "Discover now")}</p>
										</div>
										{item.product && (
											<p className="text-sm font-black text-emerald-900">{item.product.price}</p>
										)}
									</div>

									<div className="flex items-center gap-2">
										<Button
											asChild
											variant="outline"
											className="h-10 flex-1 rounded-xl border-emerald-900/10 text-emerald-800 hover:bg-emerald-50"
										>
											<Link to={item.product ? `/product/${item.product.id}` : APP_ROUTES.SHOP}>
												{language === "fr" ? "Voir le produit" : "View product"}
											</Link>
										</Button>
										<Button
											type="button"
											variant="default"
											className="h-10 rounded-xl bg-emerald-900 px-4 text-white hover:bg-emerald-950"
											onClick={() => navigate(APP_ROUTES.SHOP)}
										>
											<ArrowRightIcon className="size-4" />
										</Button>
									</div>
								</div>
							</motion.article>
						))}
					</div>
				</div>
			</motion.section>

			<motion.section
				id="proof"
				variants={sectionLift}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.22 }}
				transition={{ duration: 0.58, ease: "easeOut" }}
				className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
			>
				<div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
					<div>
						<SectionHeading
							kicker={language === "fr" ? "ConÃƒÂ§u pour la confiance" : "Built for trust"}
							title={language === "fr" ? "L'achat de complÃƒÂ©ments bien-ÃƒÂªtre devrait rendre les preuves faciles ÃƒÂ  voir." : "Wellness shopping should make the evidence easy to see."}
							copy={language === "fr" ? "Au lieu de vagues promesses, Zamazor explique chaque formule par des notes d'ingrÃƒÂ©dients claires, des conseils de routine et des contrÃƒÂ´les de qualitÃƒÂ©." : "Instead of vague promises, Zamazor explains each formula through clean ingredient notes, routine guidance, quality checks, and proof points that help customers choose with confidence."}
						/>
						<div className="mt-8 grid grid-cols-2 gap-3">
							{proofStats.map((stat) => (
								<motion.div
									key={stat.label}
									initial={{ opacity: 0, y: 18 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true, amount: 0.5 }}
									transition={{ duration: 0.45 }}
									className="rounded-lg border border-emerald-900/10 bg-white p-4 shadow-sm"
								>
									<p className="text-3xl font-black text-emerald-800">
										{stat.value}
									</p>
									<p className="mt-2 text-sm leading-5 text-slate-600">
										{stat.label}
									</p>
								</motion.div>
							))}
						</div>
					</div>

					<motion.div
						initial={{ opacity: 0, scale: 0.96 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: true, amount: 0.35 }}
						transition={{ duration: 0.55, ease: "easeOut" }}
						className="overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-xl shadow-emerald-950/10"
					>
						<div className="grid sm:grid-cols-2">
							<div className="bg-[#eff8e8] p-5">
								<p className="text-xs font-black uppercase text-emerald-700">
									{language === "fr" ? "Avant" : "Before"}
								</p>
								<h3 className="mt-3 text-2xl font-black text-slate-950">
									{language === "fr" ? "ComplÃƒÂ©ments alÃƒÂ©atoires, rÃƒÂ©sultats flous." : "Random supplements, unclear results."}
								</h3>
								<ul className="mt-5 space-y-3 text-sm text-slate-600">
									<li>{language === "fr" ? "Plusieurs flacons avec des ingrÃƒÂ©dients redondants" : "Multiple bottles with overlapping ingredients"}</li>
									<li>{language === "fr" ? "Pas d'ordre clair pour le matin ou les jours d'entraÃƒÂ®nement" : "No clear order for morning or training days"}</li>
									<li>{language === "fr" ? "Difficile de savoir quoi recommander" : "Hard to know what to reorder"}</li>
								</ul>
							</div>
							<div className="bg-emerald-950 p-5 text-white">
								<p className="text-xs font-black uppercase text-lime-300">
									{language === "fr" ? "AprÃƒÂ¨s" : "After"}
								</p>
								<h3 className="mt-3 text-2xl font-black">
									{language === "fr" ? "Un stack simple adaptÃƒÂ© ÃƒÂ  votre routine." : "A simple stack matched to your daily routine."}
								</h3>
								<ul className="mt-5 space-y-3 text-sm text-emerald-50/80">
									<li>{language === "fr" ? "Objectifs clairs pour l'ÃƒÂ©nergie, la force et la rÃƒÂ©cupÃƒÂ©ration" : "Clear goals for energy, strength, and recovery"}</li>
									<li>{language === "fr" ? "ContrÃƒÂ´les d'abonnement faciles" : "Easy subscription controls"}</li>
									<li>{language === "fr" ? "Preuve de formule affichÃƒÂ©e avant le paiement" : "Formula proof shown before checkout"}</li>
								</ul>
							</div>
						</div>
						<div className="grid grid-cols-3 border-t border-emerald-900/10 bg-white text-center">
							{[(language === "fr" ? "Ãƒâ€°nergie" : "Energy"), (language === "fr" ? "Force" : "Strength"), (language === "fr" ? "RÃƒÂ©cupÃƒÂ©ration" : "Recovery")].map((label) => (
								<div
									key={label}
									className="border-r border-emerald-900/10 p-4 last:border-r-0"
								>
									<p className="text-sm font-black text-emerald-800">{label}</p>
									<p className="mt-1 text-xs text-slate-500">{language === "fr" ? "soutien de routine" : "routine support"}</p>
								</div>
							))}
						</div>
					</motion.div>
				</div>
			</motion.section>

			<motion.section
				variants={sectionLift}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.18 }}
				transition={{ duration: 0.58, ease: "easeOut" }}
				className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
			>
				<div className="grid gap-10 rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-xl shadow-emerald-950/5 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
					<div>
						<SectionHeading
							kicker={language === "fr" ? "Comparez clairement" : "Compare clearly"}
							title={language === "fr" ? "Des routines plus propres valent mieux que des placards encombrÃƒÂ©s." : "Cleaner routines beat crowded cabinets."}
							copy={language === "fr" ? "DÃƒÂ©couvrez comment Zamazor simplifie votre stack de complÃƒÂ©ments par rapport aux boutiques de vitamines commerciales typiques." : "See how Zamazor simplifies your supplement stack compared to typical commercial vitamin stores."}
						/>
						<div className="mt-8 space-y-4">
							<div className="flex items-start gap-3">
								<span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800 mt-1">
									<Check className="size-3" />
								</span>
								<p className="text-sm text-slate-600 font-sans leading-relaxed">
									<strong>{language === "fr" ? "Dosage scientifique :" : "Scientifically dosed:"}</strong>{language === "fr" ? " Pas de mÃƒÂ©langes brevetÃƒÂ©s de remplissage. Vous connaissez exactement le dosage en milligrammes de chaque ingrÃƒÂ©dient." : " No filler proprietary blends. You know exactly how many milligrams of every ingredient you ingest."}
								</p>
							</div>
							<div className="flex items-start gap-3">
								<span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800 mt-1">
									<Check className="size-3" />
								</span>
								<p className="text-sm text-slate-600 font-sans leading-relaxed">
									<strong>{language === "fr" ? "ZÃƒÂ©ro cochonnerie artificielle :" : "Zero artificial junk:"}</strong>{language === "fr" ? " SucrÃƒÂ© naturellement, colorÃƒÂ© naturellement et facile ÃƒÂ  digÃƒÂ©rer." : " Naturally sweetened, naturally colored, and easy on your digestion."}
								</p>
							</div>
						</div>
					</div>

					<div className="overflow-hidden rounded-2xl border border-emerald-900/10 shadow-sm">
						<div className="grid grid-cols-[1.2fr_1fr_1fr] bg-slate-950 text-xs sm:text-sm font-bold text-white items-center">
							<div className="p-4 sm:p-5">{language === "fr" ? "CaractÃƒÂ©ristique" : "Feature"}</div>
							<div className="bg-emerald-900/40 p-4 sm:p-5 text-center text-lime-300 font-extrabold border-x border-white/5">
								Zamazor
							</div>
							<div className="p-4 sm:p-5 text-center text-slate-400">{language === "fr" ? "Boutique typique" : "Typical store"}</div>
						</div>
						{comparisonData.map((row) => (
							<div
								key={row.feature}
								className="grid grid-cols-[1.2fr_1fr_1fr] border-t border-emerald-900/10 text-xs sm:text-sm items-center"
							>
								<div className="p-4 sm:p-5 font-bold text-slate-900 leading-snug">
									{row.feature}
								</div>
								<div className="bg-emerald-50/50 p-4 sm:p-5 text-emerald-950 font-semibold border-x border-emerald-900/5 h-full flex flex-col justify-center items-center text-center gap-1.5">
									<Check className="size-4 text-emerald-700 bg-emerald-100/80 rounded-full p-0.5 shrink-0" />
									<span className="text-[11px] sm:text-xs leading-tight text-emerald-800">{row.zamazor.text}</span>
								</div>
								<div className="p-4 sm:p-5 text-slate-500 h-full flex flex-col justify-center items-center text-center gap-1.5">
									<X className="size-4 text-slate-400 bg-slate-100 rounded-full p-0.5 shrink-0" />
									<span className="text-[11px] sm:text-xs leading-tight text-slate-500">{row.typical.text}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</motion.section>

			<motion.section
				id="stack"
				variants={sectionLift}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.14 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-b border-emerald-900/10"
			>
				<div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
					<div className="lg:sticky lg:top-28">
						<SectionHeading
							kicker={language === "fr" ? "Stack quotidien" : "Daily stack"}
							title={language === "fr" ? "Une meilleure routine est plus simple quand les ÃƒÂ©tapes sont claires." : "A better routine is easier when the steps are obvious."}
							copy={language === "fr" ? "Les stacks de Zamazor sont conÃƒÂ§us autour des moments qui comptent le plus : l'ÃƒÂ©nergie matinale, l'entraÃƒÂ®nement ciblÃƒÂ© et la rÃƒÂ©cupÃƒÂ©ration nocturne." : "Zamazor stacks are designed around the moments that matter most: morning energy, focused training, and real recovery at night."}
						/>
						<div className="mt-8 rounded-2xl bg-emerald-50/50 border border-emerald-900/5 p-6">
							<h4 className="font-playfair text-lg font-bold text-emerald-950">{language === "fr" ? "Pourquoi choisir les stacks" : "Why Stacking Works"}</h4>
							<p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
								{language === "fr" ? "Prendre des vitamines au hasard rÃƒÂ©duit l'absorption et crÃƒÂ©e de la friction dans les habitudes. En regroupant les nutriments complÃƒÂ©mentaires le matin, ÃƒÂ  l'entraÃƒÂ®nement et le soir, vous gagnez en rÃƒÂ©gularitÃƒÂ© et en efficacitÃƒÂ©." : "Taking vitamins at random times reduces absorption and creates habit friction. By grouping complementary nutrients into fixed morning, training, and evening windows, you build consistency and amplify efficacy."}
							</p>
						</div>
					</div>

					<div className="relative pl-6 sm:pl-8">
						{/* Timeline vertical path */}
						<div className="absolute left-[23px] sm:left-[31px] top-4 bottom-4 w-0.5 bg-emerald-900/10 border-dashed border-l" />

						<motion.div
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, amount: 0.15 }}
							transition={{ staggerChildren: 0.12 }}
							className="space-y-8"
						>
							{detailedStackSteps.map(({ title, copy, icon: Icon, time, moment, products, color }, index) => (
								<motion.div
									key={title}
									variants={fadeUp}
									className="relative group flex gap-6 rounded-2xl border border-emerald-900/5 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-emerald-900/20 transition-all duration-150"
								>
									{/* Timeline Node Bullet */}
									<div className="absolute -left-[38px] sm:-left-[47px] top-6 z-10 flex size-8 sm:size-10 items-center justify-center rounded-full bg-white border border-emerald-900/10 shadow-xs group-hover:border-emerald-700 transition-colors">
										<span className={cn("flex size-6 sm:size-8 items-center justify-center rounded-full text-xs font-bold", color)}>
											<Icon className="size-3 sm:size-4" />
										</span>
									</div>

									<div className="flex-1">
										<div className="flex flex-wrap items-center justify-between gap-2">
											<span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
												{language === "fr" ? `Ãƒâ€°tape ${index + 1} \u2022 ${moment}` : `Step ${index + 1} \u2022 ${moment}`}
											</span>
											<span className="text-xs font-bold text-slate-500 font-mono">
												{time}
											</span>
										</div>

										<h3 className="mt-3 text-lg sm:text-xl font-playfair font-bold text-slate-950">
											{title}
										</h3>
										<p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 font-sans">
											{copy}
										</p>

										{/* Interactive Supplement tags */}
										<div className="mt-4 flex flex-wrap gap-1.5 items-center">
											<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">{language === "fr" ? "RecommandÃƒÂ© :" : "Recommended:"}</span>
											{products.map((prod) => (
												<span
													key={prod}
													className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-50 text-emerald-900 border border-slate-100 hover:border-emerald-900/20 hover:bg-emerald-50/20 transition-colors cursor-pointer"
												>
													{prod}
												</span>
											))}
										</div>
									</div>
								</motion.div>
							))}
						</motion.div>
					</div>
				</div>
			</motion.section>
\t\t\t<motion.section
				id="reviews"
				variants={sectionLift}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.16 }}
				transition={{ duration: 0.56, ease: "easeOut" }}
				className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
			>
				<SectionHeading
					kicker={language === "fr" ? "Avis clients" : "Customer love"}
					title={language === "fr" ? "ConÃƒÂ§u pour ceux qui veulent un bien-ÃƒÂªtre en toute simplicitÃƒÂ©." : "Designed for people who want wellness to feel simple."}
				/>

				<div className="mt-9 grid gap-5 md:grid-cols-3">
					{reviews.map((review) => (
						<motion.article
							key={review.name}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.35 }}
							transition={{ duration: 0.5 }}
							className="rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm"
						>
							<div className="flex gap-1 text-amber-400">
								{Array.from({ length: 5 }).map((_, index) => (
									<StarIcon
										key={index}
										className="size-4 fill-current"
										aria-hidden="true"
									/>
								))}
							</div>
							<p className="mt-5 text-base leading-7 text-slate-700">
								"{review.quote}"
							</p>
							<div className="mt-6">
								<p className="font-black text-slate-950">{review.name}</p>
								<p className="text-sm text-slate-500">{review.meta}</p>
							</div>
						</motion.article>
					))}
				</div>
			</motion.section>

			{/* Supplement & Order FAQs Section */}
			<motion.div
				variants={sectionLift}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.16 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
				className="bg-[#fcfdfa] border-t border-b border-emerald-900/5"
			>
				<FAQSection
					title={language === "fr" ? "Support des ComplÃƒÂ©ments & Commandes" : "Supplement & Order Support"}
					subtitle={language === "fr" ? "Questions FrÃƒÂ©quemment PosÃƒÂ©es" : "Frequently Asked Questions"}
					description={language === "fr" ? "RÃƒÂ©ponses rapides aux questions courantes sur nos ingrÃƒÂ©dients biologiques, la livraison, les abonnements et les normes de sÃƒÂ©curitÃƒÂ©." : "Quick answers to common questions about our organic ingredients, shipping, subscriptions, and safety standards."}
					buttonLabel={language === "fr" ? "Aller au Centre d'Aide" : "Go to Help Center"}
					onButtonClick={() => {
						navigate(APP_ROUTES.HELP);
					}}
					faqsLeft={[
						{
							question: language === "fr" ? "Les formules de complÃƒÂ©ments Zamazor sont-elles certifiÃƒÂ©es biologiques et sans OGM ?" : "Are Zamazor supplement formulas certified organic and non-GMO?",
							answer: language === "fr" ? "Oui, tous nos mÃƒÂ©langes sont formulÃƒÂ©s avec des extraits de plantes et minÃƒÂ©raux 100% biologiques, sans OGM et propres. Nous n'utilisons jamais de colorants, d'arÃƒÂ´mes, d'ÃƒÂ©dulcorants artificiels ou de liants chimiques synthÃƒÂ©tiques." : "Yes, all our supplement blends are crafted using 100% organic, non-GMO, clean botanical extracts and minerals. We never use artificial colors, flavors, sweeteners, or synthetic chemical binders.",
						},
						{
							question: language === "fr" ? "Comment dois-je conserver mes boÃƒÂ®tes de complÃƒÂ©ments Zamazor ?" : "How do I store Zamazor supplement canisters?",
							answer: language === "fr" ? "Nous recommandons de conserver vos boÃƒÂ®tes dans un endroit frais et sec, ÃƒÂ  l'abri de la lumiÃƒÂ¨re directe du soleil et de la chaleur. Veillez ÃƒÂ  bien refermer le couvercle aprÃƒÂ¨s chaque utilisation pour ÃƒÂ©viter l'humiditÃƒÂ©." : "We recommend storing your canisters in a cool, dry pantry or cabinet, away from direct sunlight and heat. Always ensure the lid is sealed tightly after each serving to keep moisture out.",
						},
						{
							question: language === "fr" ? "Puis-je combiner diffÃƒÂ©rentes formules Zamazor dans un mÃƒÂªme shake ?" : "Can I combine different Zamazor formulas in one shake?",
							answer: language === "fr" ? "Absolument ! Nos produits sont conÃƒÂ§us pour se complÃƒÂ©ter mutuellement. MÃƒÂ©langer notre protÃƒÂ©ine vÃƒÂ©gÃƒÂ©tale avec notre mÃƒÂ©lange de superaliments dans votre smoothie du matin est un excellent choix riche en nutriments." : "Absolutely! Our products are designed to complement each other. Mixing our clean Protein powder with the organic Greens blend in your morning smoothie is a popular and nutrient-dense choice.",
						},
					]}
					faqsRight={[
						{
							question: language === "fr" ? "Comment fonctionne l'abonnement ?" : "How does the subscription plan work?",
							answer: language === "fr" ? "Notre programme d'abonnement livre automatiquement vos formules prÃƒÂ©fÃƒÂ©rÃƒÂ©es ÃƒÂ  votre porte tous les 30 jours. Vous bÃƒÂ©nÃƒÂ©ficiez d'une rÃƒÂ©duction de 10% sur chaque commande et pouvez suspendre, sauter ou annuler ÃƒÂ  tout moment." : "Our subscription plan delivers your favorite supplement formulas to your door every 30 days automatically. You receive a 10% discount on every order and can pause, skip, or cancel at any time.",
						},
						{
							question: language === "fr" ? "Quelle est votre politique de livraison ?" : "What is your shipping policy?",
							answer: language === "fr" ? "Nous offrons la livraison standard gratuite sur toutes les commandes. Aucun achat minimum requis." : "We offer free standard shipping (3-5 business days) on all orders. No minimum purchase required.",
						},
						{
							question: language === "fr" ? "Proposez-vous une garantie de satisfaction ?" : "Do you offer a satisfaction guarantee?",
							answer: language === "fr" ? "Oui, nous sommes fiers de nos formules propres. Nous offrons une garantie de remboursement de 30 jours. Si vous n'ÃƒÂªtes pas entiÃƒÂ¨rement satisfait de votre stack, contactez-nous pour obtenir un remboursement rapide." : "Yes, we stand behind our clean formulas. We offer a 30-day money-back guarantee. If you are not completely satisfied with your supplement stack, contact us for a hassle-free refund.",
						},
					]}
				/>
			</motion.div>

			<motion.section
				variants={sectionLift}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.16 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
				className="border-t border-emerald-900/10 bg-white py-10"
			>
				<div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
					{trustItems.map((item) => (
						<IconLabel key={item.label} icon={item.icon} label={item.label} />
					))}
				</div>
			</motion.section>

		</>
	);
};

