import { Link, useLocation } from "react-router";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";
import CONFIG from "@/core/config/constants";
import { APP_ROUTES } from "@/core/routes/paths";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useLanguage } from "@/shared/context/LanguageContext";
import {
	ArrowRight,
	BookOpen,
	Clock3,
	FileText,
	Headphones,
	HelpCircle,
	Lock,
	Mail,
	MapPin,
	Phone,
	ShieldCheck,
	ShoppingBag,
	Truck,
} from "lucide-react";

type InfoCard = {
	title: string;
	copy: string;
	icon: typeof Mail;
	tone: string;
};

type PageConfig = {
	title: string;
	subtitle: string;
	eyebrow: string;
	cards: InfoCard[];
	ctaLabel: string;
	ctaTo: string;
	contact?: boolean;
};

const getConfig = (language: "en" | "fr"): Record<string, PageConfig> => ({
	contact: {
		eyebrow: language === "fr" ? "Entrer en contact" : "Get in touch",
		title: language === "fr" ? "Contact" : "Contact",
		subtitle:
			language === "fr"
				? "Envoyez-nous un message pour le support, les commandes en gros, ou les questions produit."
				: "Send us a message for support, bulk orders, or product questions.",
		cards: [
			{
				title: language === "fr" ? "Support par e-mail" : "Email support",
				copy: "support@zamazor.ma",
				icon: Mail,
				tone: "bg-emerald-50 text-emerald-800",
			},
			{
				title: language === "fr" ? "Téléphone" : "Phone",
				copy: "+212 6 11 42 31 16",
				icon: Phone,
				tone: "bg-lime-50 text-lime-800",
			},
			{
				title: language === "fr" ? "Adresse" : "Location",
				copy: "12 Rue des Jasmins, Casablanca, Morocco",
				icon: MapPin,
				tone: "bg-sky-50 text-sky-800",
			},
		],
		ctaLabel: language === "fr" ? "Parcourir la boutique" : "Browse the shop",
		ctaTo: APP_ROUTES.SHOP,
		contact: true,
	},
	faq: {
		eyebrow: language === "fr" ? "Aide rapide" : "Quick help",
		title: language === "fr" ? "FAQs" : "FAQs",
		subtitle:
			language === "fr"
				? "Les réponses rapides couvrent la livraison, les retours, les paiements et les commandes."
				: "Quick answers covering shipping, returns, payments, and orders.",
		cards: [
			{ title: "Shipping", copy: "Delivery timelines, tracking, and updates.", icon: Truck, tone: "bg-emerald-50 text-emerald-800" },
			{ title: "Orders", copy: "Placement, changes, and status updates.", icon: ShoppingBag, tone: "bg-lime-50 text-lime-800" },
			{ title: "Payments", copy: "Secure checkout and card guidance.", icon: ShieldCheck, tone: "bg-sky-50 text-sky-800" },
		],
		ctaLabel: language === "fr" ? "Aller à la boutique" : "Go to shop",
		ctaTo: APP_ROUTES.SHOP,
	},
	story: {
		eyebrow: language === "fr" ? "Notre marque" : "Our brand",
		title: language === "fr" ? "Notre histoire" : "Our story",
		subtitle:
			language === "fr"
				? "Zamazor crée des compléments propres, modernes, et faciles à comprendre."
				: "Zamazor creates clean, modern supplements that are easy to understand.",
		cards: [
			{ title: "Clean formulas", copy: "Simple stacks with clear ingredient intent.", icon: FileText, tone: "bg-emerald-50 text-emerald-800" },
			{ title: "Trusted routines", copy: "Designed for everyday consistency.", icon: BookOpen, tone: "bg-lime-50 text-lime-800" },
			{ title: "Support first", copy: "We help users pick products that fit their goals.", icon: HelpCircle, tone: "bg-sky-50 text-sky-800" },
		],
		ctaLabel: language === "fr" ? "Voir les produits" : "See products",
		ctaTo: APP_ROUTES.SHOP,
	},
	blog: {
		eyebrow: language === "fr" ? "Conseils & guides" : "Tips & guides",
		title: language === "fr" ? "Blog" : "Blog",
		subtitle:
			language === "fr"
				? "Des articles simples sur la nutrition, l'entraînement, et la récupération."
				: "Simple articles about nutrition, training, and recovery.",
		cards: [
			{ title: "Supplement timing", copy: "When to take protein, greens, and recovery stacks.", icon: Clock3, tone: "bg-emerald-50 text-emerald-800" },
			{ title: "Ingredient basics", copy: "Understand what goes into each formula.", icon: FileText, tone: "bg-lime-50 text-lime-800" },
			{ title: "Routine building", copy: "Build a stack that stays consistent.", icon: BookOpen, tone: "bg-sky-50 text-sky-800" },
		],
		ctaLabel: language === "fr" ? "Contacter l'équipe" : "Contact the team",
		ctaTo: APP_ROUTES.CONTACT,
	},
	help: {
		eyebrow: language === "fr" ? "Centre d'aide" : "Help center",
		title: language === "fr" ? "Help Center" : "Help Center",
		subtitle:
			language === "fr"
				? "Tout ce qu'il faut pour commander, suivre et gérer vos achats."
				: "Everything you need to order, track, and manage purchases.",
		cards: [
			{ title: "Track orders", copy: "Monitor status and shipping updates.", icon: Truck, tone: "bg-emerald-50 text-emerald-800" },
			{ title: "Returns", copy: "Understand return and refund steps.", icon: ShieldCheck, tone: "bg-lime-50 text-lime-800" },
			{ title: "Live support", copy: "Reach the team when you need a hand.", icon: Headphones, tone: "bg-sky-50 text-sky-800" },
		],
		ctaLabel: language === "fr" ? "Écrire au support" : "Write to support",
		ctaTo: APP_ROUTES.CONTACT,
	},
	chat: {
		eyebrow: language === "fr" ? "Conversation" : "Conversation",
		title: language === "fr" ? "Live Chat" : "Live Chat",
		subtitle:
			language === "fr"
				? "Le chat en direct est organisé par support e-mail pour une réponse plus claire."
				: "Live chat is handled through email support for clearer replies.",
		cards: [
			{ title: "Fast replies", copy: "Best for simple product questions.", icon: Headphones, tone: "bg-emerald-50 text-emerald-800" },
			{ title: "Order help", copy: "Use this channel for shipping and checkout issues.", icon: ShoppingBag, tone: "bg-lime-50 text-lime-800" },
			{ title: "Bulk quotes", copy: "Ask for larger purchase support.", icon: FileText, tone: "bg-sky-50 text-sky-800" },
		],
		ctaLabel: language === "fr" ? "Aller au contact" : "Go to contact",
		ctaTo: APP_ROUTES.CONTACT,
	},
	shipping: {
		eyebrow: language === "fr" ? "Livraison" : "Shipping",
		title: language === "fr" ? "Shipping Info" : "Shipping Info",
		subtitle:
			language === "fr"
				? "Informations sur les délais, le suivi et la livraison assurée."
				: "Details on delivery timing, tracking, and insured shipping.",
		cards: [
			{ title: "Standard delivery", copy: "3 to 5 business days on most orders.", icon: Truck, tone: "bg-emerald-50 text-emerald-800" },
			{ title: "Order tracking", copy: "Track progress after checkout.", icon: Clock3, tone: "bg-lime-50 text-lime-800" },
			{ title: "Packaging", copy: "Protected, clean, and easy to receive.", icon: ShieldCheck, tone: "bg-sky-50 text-sky-800" },
		],
		ctaLabel: language === "fr" ? "Voir la FAQ" : "See FAQs",
		ctaTo: APP_ROUTES.FAQ,
	},
	returns: {
		eyebrow: language === "fr" ? "Retours" : "Returns",
		title: language === "fr" ? "Return Policy" : "Return Policy",
		subtitle:
			language === "fr"
				? "Les retours sont gérés avec le support pour garder le processus simple."
				: "Returns are handled with support to keep the process simple.",
		cards: [
			{ title: "Request support", copy: "Contact us first so we can review the order.", icon: Headphones, tone: "bg-emerald-50 text-emerald-800" },
			{ title: "Refund review", copy: "Each case is checked against the order details.", icon: ShieldCheck, tone: "bg-lime-50 text-lime-800" },
			{ title: "Next steps", copy: "We guide you through the cleanest path forward.", icon: FileText, tone: "bg-sky-50 text-sky-800" },
		],
		ctaLabel: language === "fr" ? "Contacter le support" : "Contact support",
		ctaTo: APP_ROUTES.CONTACT,
	},
	privacy: {
		eyebrow: language === "fr" ? "Confidentialité" : "Privacy",
		title: language === "fr" ? "Privacy Policy" : "Privacy Policy",
		subtitle:
			language === "fr"
				? "Comment les données sont utilisées pour les commandes et le support."
				: "How data is used for orders and support.",
		cards: [
			{ title: "Account data", copy: "Used for login, orders, and shipping details.", icon: ShieldCheck, tone: "bg-emerald-50 text-emerald-800" },
			{ title: "Order records", copy: "Kept to help with delivery and support.", icon: FileText, tone: "bg-lime-50 text-lime-800" },
			{ title: "Security", copy: "Protected checkout and session handling.", icon: Lock, tone: "bg-sky-50 text-sky-800" },
		],
		ctaLabel: language === "fr" ? "Lire les conditions" : "Read terms",
		ctaTo: APP_ROUTES.TERMS,
	},
	terms: {
		eyebrow: language === "fr" ? "Conditions" : "Terms",
		title: language === "fr" ? "Terms of Service" : "Terms of Service",
		subtitle:
			language === "fr"
				? "Les règles d'utilisation de la boutique et des services."
				: "The rules for using the store and services.",
		cards: [
			{ title: "Shop use", copy: "Use the storefront for personal wellness purchases.", icon: ShoppingBag, tone: "bg-emerald-50 text-emerald-800" },
			{ title: "Checkout", copy: "Provide accurate details for shipping and billing.", icon: ShieldCheck, tone: "bg-lime-50 text-lime-800" },
			{ title: "Support", copy: "Reach out when something needs clarification.", icon: Headphones, tone: "bg-sky-50 text-sky-800" },
		],
		ctaLabel: language === "fr" ? "Contacter le support" : "Contact support",
		ctaTo: APP_ROUTES.CONTACT,
	},
	accessibility: {
		eyebrow: language === "fr" ? "Accessibilité" : "Accessibility",
		title: language === "fr" ? "Accessibility" : "Accessibility",
		subtitle:
			language === "fr"
				? "Nous visons une navigation claire, lisible, et simple à utiliser."
				: "We aim for clear, readable, easy-to-use navigation.",
		cards: [
			{ title: "Readable layout", copy: "Strong contrast and simple hierarchy.", icon: BookOpen, tone: "bg-emerald-50 text-emerald-800" },
			{ title: "Keyboard friendly", copy: "Buttons and links are easy to reach.", icon: HelpCircle, tone: "bg-lime-50 text-lime-800" },
			{ title: "Support access", copy: "Let us know if you need a hand.", icon: Headphones, tone: "bg-sky-50 text-sky-800" },
		],
		ctaLabel: language === "fr" ? "Nous contacter" : "Contact us",
		ctaTo: APP_ROUTES.CONTACT,
	},
	bulk: {
		eyebrow: language === "fr" ? "Commandes pro" : "Bulk orders",
		title: language === "fr" ? "Bulk Orders" : "Bulk Orders",
		subtitle:
			language === "fr"
				? "Support pour les clubs, salles, et commandes en quantité."
				: "Support for clubs, gyms, and quantity orders.",
		cards: [
			{ title: "Quote request", copy: "Ask for pricing on larger runs.", icon: FileText, tone: "bg-emerald-50 text-emerald-800" },
			{ title: "Delivery planning", copy: "We help with timing and shipping.", icon: Truck, tone: "bg-lime-50 text-lime-800" },
			{ title: "Account support", copy: "Work with the team on special needs.", icon: Headphones, tone: "bg-sky-50 text-sky-800" },
		],
		ctaLabel: language === "fr" ? "Contacter l'équipe" : "Contact the team",
		ctaTo: APP_ROUTES.CONTACT,
	},
});

const slugForPath = (path: string) => {
	if (path === APP_ROUTES.CONTACT) return "contact";
	if (path === APP_ROUTES.FAQ) return "faq";
	if (path === APP_ROUTES.STORY) return "story";
	if (path === APP_ROUTES.BLOG) return "blog";
	if (path === APP_ROUTES.HELP) return "help";
	if (path === APP_ROUTES.CHAT) return "chat";
	if (path === APP_ROUTES.RETURNS) return "returns";
	if (path === APP_ROUTES.SHIPPING) return "shipping";
	if (path === APP_ROUTES.PRIVACY) return "privacy";
	if (path === APP_ROUTES.TERMS) return "terms";
	if (path === APP_ROUTES.ACCESSIBILITY) return "accessibility";
	if (path === APP_ROUTES.BULK) return "bulk";
	return "contact";
};

export const StaticInfoPage = () => {
	const { pathname } = useLocation();
	const { language } = useLanguage();
	const config = getConfig(language)[slugForPath(pathname)] ?? getConfig(language).contact;

	useDocumentTitle(`${config.title} | ${CONFIG.APP_NAME}`);

	return (
		<div className="min-h-screen bg-[#fcfdfa] py-12 px-4 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<div className="rounded-[2rem] border border-emerald-900/8 bg-gradient-to-br from-emerald-950 to-emerald-900 p-8 text-white shadow-xl shadow-emerald-950/10">
					<p className="text-[11px] font-black uppercase tracking-[0.26em] text-lime-300">{config.eyebrow}</p>
					<h1 className="mt-3 text-3xl sm:text-5xl font-playfair font-normal leading-tight">{config.title}</h1>
					<p className="mt-4 max-w-3xl text-sm sm:text-base leading-7 text-emerald-50/80">{config.subtitle}</p>
				</div>

				<div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{config.cards.map((card) => {
						const Icon = card.icon;
						return (
							<div key={card.title} className="rounded-3xl border border-emerald-900/6 bg-white p-5 shadow-sm">
								<div className={`grid size-12 place-items-center rounded-2xl ${card.tone}`}>
									<Icon className="size-5" />
								</div>
								<h2 className="mt-4 text-lg font-bold text-slate-950">{card.title}</h2>
								<p className="mt-1 text-sm leading-6 text-slate-500">{card.copy}</p>
							</div>
						);
					})}
				</div>

				{config.contact ? (
					<div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
						<div className="rounded-[2rem] border border-emerald-900/6 bg-white p-6 shadow-sm">
							<h2 className="text-xl font-playfair font-normal text-slate-950">Send a message</h2>
							<form className="mt-6 space-y-4">
								<div className="grid gap-4 sm:grid-cols-2">
									<Input placeholder="Your name" />
									<Input type="email" placeholder="you@example.com" />
								</div>
								<Input placeholder="Order number or topic" />
								<textarea
									placeholder="Tell us how we can help"
									className="min-h-[180px] w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-3.5 py-3 text-base outline-none transition-all placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
								/>
								<Button type="button" className="h-11 rounded-xl bg-emerald-900 text-white hover:bg-emerald-950">
									<Mail className="mr-2 size-4" />
									Send message
								</Button>
							</form>
						</div>

						<div className="space-y-4">
							<div className="rounded-[2rem] border border-emerald-900/6 bg-white p-6 shadow-sm">
								<h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Direct contact</h3>
								<div className="mt-4 space-y-3 text-sm text-slate-600">
									<p className="flex items-center gap-2"><Mail className="size-4 text-emerald-800" /> support@zamazor.ma</p>
									<p className="flex items-center gap-2"><Phone className="size-4 text-emerald-800" /> +212 6 11 42 31 16</p>
									<p className="flex items-center gap-2"><MapPin className="size-4 text-emerald-800" /> 12 Rue des Jasmins, Casablanca, Morocco</p>
									<p className="flex items-center gap-2"><Clock3 className="size-4 text-emerald-800" /> Mon-Fri, 9:00 - 17:00</p>
								</div>
							</div>
							<div className="rounded-[2rem] border border-emerald-900/6 bg-[#f2f8ef] p-6">
								<p className="text-sm leading-7 text-slate-600">
									{language === "fr"
										? "Pour les commandes, les retours, ou les questions sur les produits, le support reste le chemin le plus rapide."
										: "For orders, returns, or product questions, support is the quickest path."}
								</p>
							</div>
						</div>
					</div>
				) : (
					<div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-[2rem] border border-emerald-900/6 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
						<div>
							<h2 className="text-xl font-playfair font-normal text-slate-950">{config.title}</h2>
							<p className="mt-1 text-sm text-slate-500">{config.subtitle}</p>
						</div>
						<Button asChild className="h-11 rounded-xl bg-emerald-900 text-white hover:bg-emerald-950">
							<Link to={config.ctaTo}>
								{config.ctaLabel}
								<ArrowRight className="ml-2 size-4" />
							</Link>
						</Button>
					</div>
				)}

				<div className="mt-8 rounded-[2rem] border border-emerald-900/6 bg-white p-6 shadow-sm">
					<div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
						<div>
							<p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
								{language === "fr" ? "Plus de contexte" : "More context"}
							</p>
							<p className="mt-3 text-sm leading-7 text-slate-600">
								{language === "fr"
									? "Nous gardons ces pages simples à naviguer, mais assez détaillées pour que chaque visiteur trouve vite la bonne réponse, le bon lien ou le bon point de contact."
									: "We keep these pages easy to scan, but detailed enough that every visitor can quickly find the right answer, link, or point of contact."}
							</p>
						</div>
						<div className="grid gap-3">
							<div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
								{language === "fr" ? "Des réponses utiles et concrètes." : "Helpful, concrete answers."}
							</div>
							<div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
								{language === "fr" ? "Des liens directs vers les prochaines étapes." : "Direct links to the next step."}
							</div>
							<div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
								{language === "fr" ? "Une présentation propre et cohérente." : "A clean, consistent presentation."}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
