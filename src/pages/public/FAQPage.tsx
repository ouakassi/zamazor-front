import { Link } from "react-router";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";
import CONFIG from "@/core/config/constants";
import { APP_ROUTES } from "@/core/routes/paths";
import { FAQSection } from "@/shared/components/ui/faqsection";
import { Button } from "@/shared/components/ui/button";
import { useLanguage } from "@/shared/context/LanguageContext";
import { ArrowRight, Headphones, Mail, ShieldCheck, Truck } from "lucide-react";

export const FAQPage = () => {
	const { language } = useLanguage();
	useDocumentTitle(`FAQs | ${CONFIG.APP_NAME}`);

	return (
		<div className="min-h-screen bg-[#fcfdfa] py-12 px-4 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<div className="rounded-[2rem] border border-emerald-900/8 bg-gradient-to-br from-emerald-950 to-emerald-900 p-8 text-white shadow-xl shadow-emerald-950/10">
					<p className="text-[11px] font-black uppercase tracking-[0.26em] text-lime-300">
						{language === "fr" ? "Centre d'aide" : "Help center"}
					</p>
					<h1 className="mt-3 text-3xl sm:text-5xl font-playfair font-normal leading-tight">
						{language === "fr" ? "Questions Fréquemment Posées" : "Frequently Asked Questions"}
					</h1>
					<p className="mt-4 max-w-3xl text-sm sm:text-base leading-7 text-emerald-50/80">
						{language === "fr"
							? "Retrouvez ici des réponses détaillées sur les commandes, la livraison, les paiements, les retours et la façon dont Zamazor accompagne vos routines."
							: "Find detailed answers on orders, shipping, payments, returns, and how Zamazor supports your routines."}
					</p>
				</div>

				<div className="mt-8 grid gap-4 md:grid-cols-3">
					{[
						{
							title: language === "fr" ? "Livraison rapide" : "Fast delivery",
							copy: language === "fr" ? "3 à 5 jours ouvrés sur la plupart des commandes." : "3 to 5 business days on most orders.",
							icon: Truck,
						},
						{
							title: language === "fr" ? "Paiement sécurisé" : "Secure checkout",
							copy: language === "fr" ? "Paiement protégé avec vérification des détails." : "Protected payment with verified details.",
							icon: ShieldCheck,
						},
						{
							title: language === "fr" ? "Aide réactive" : "Responsive help",
							copy: language === "fr" ? "Le support vous guide rapidement vers la bonne solution." : "Support quickly guides you to the right solution.",
							icon: Headphones,
						},
					].map((item) => {
						const Icon = item.icon;
						return (
							<div key={item.title} className="rounded-3xl border border-emerald-900/6 bg-white p-5 shadow-sm">
								<div className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-800">
									<Icon className="size-5" />
								</div>
								<h2 className="mt-4 text-lg font-bold text-slate-950">{item.title}</h2>
								<p className="mt-1 text-sm leading-6 text-slate-500">{item.copy}</p>
							</div>
						);
					})}
				</div>

				<FAQSection
					title={language === "fr" ? "Support boutique & commandes" : "Store & order support"}
					subtitle={language === "fr" ? "Réponses détaillées" : "Detailed answers"}
					description={
						language === "fr"
							? "Nous avons regroupé les questions les plus utiles pour vous aider à acheter, suivre et gérer votre commande sans friction."
							: "We grouped the most useful questions to help you shop, track, and manage your order without friction."
					}
					buttonLabel={language === "fr" ? "Contacter le support" : "Contact support"}
					onButtonClick={() => window.location.assign(APP_ROUTES.CONTACT)}
					faqsLeft={[
						{
							question: language === "fr" ? "Comment savoir quel produit choisir ?" : "How do I know which product to choose?",
							answer:
								language === "fr"
									? "Commencez par votre objectif principal: énergie, récupération, concentration, ou nutrition quotidienne. Les cartes de produits et les catégories vous orientent vers la formule la plus adaptée."
									: "Start with your main goal: energy, recovery, focus, or daily nutrition. Product cards and categories guide you toward the most suitable formula.",
						},
						{
							question: language === "fr" ? "Puis-je modifier ma commande après paiement ?" : "Can I change my order after payment?",
							answer:
								language === "fr"
									? "Les modifications dépendent du statut de commande. Plus tôt vous nous contactez, plus il est facile d'ajuster une adresse ou un détail de livraison."
									: "Changes depend on the order status. The sooner you contact us, the easier it is to adjust an address or delivery detail.",
						},
						{
							question: language === "fr" ? "Combien de temps prend la livraison ?" : "How long does shipping take?",
							answer:
								language === "fr"
									? "La plupart des commandes sont livrées sous 3 à 5 jours ouvrés. Les délais peuvent varier selon la destination et le volume de commandes."
									: "Most orders arrive within 3 to 5 business days. Timing can vary by destination and order volume.",
						},
						{
							question: language === "fr" ? "Les formules conviennent-elles à un usage quotidien ?" : "Are the formulas suitable for everyday use?",
							answer:
								language === "fr"
									? "Oui, les produits sont pensés pour s'intégrer facilement dans une routine régulière, avec des ingrédients clairs et des usages simples."
									: "Yes, the products are designed to fit easily into a regular routine with clear ingredients and simple usage.",
						},
					]}
					faqsRight={[
						{
							question: language === "fr" ? "Comment fonctionnent les retours ?" : "How do returns work?",
							answer:
								language === "fr"
									? "Contactez d'abord le support. Nous vérifions les détails de la commande, puis nous vous guidons vers la solution la plus adaptée."
									: "Contact support first. We review the order details and guide you toward the best solution.",
						},
						{
							question: language === "fr" ? "Puis-je passer une commande en gros ?" : "Can I place a bulk order?",
							answer:
								language === "fr"
									? "Oui. La page Contact et la section Bulk Orders sont prévues pour les salles de sport, clubs et achats plus importants."
									: "Yes. The Contact page and Bulk Orders section are set up for gyms, clubs, and larger purchases.",
						},
						{
							question: language === "fr" ? "Le paiement est-il sécurisé ?" : "Is checkout secure?",
							answer:
								language === "fr"
									? "Oui. Le checkout utilise une expérience sécurisée et les informations de livraison sont conservées de manière ordonnée pour les commandes futures."
									: "Yes. Checkout uses a secure experience, and shipping details are stored cleanly for future orders.",
						},
						{
							question: language === "fr" ? "Qui dois-je contacter en cas de souci ?" : "Who should I contact if something goes wrong?",
							answer:
								language === "fr"
									? "Écrivez à support@zamazor.ma ou utilisez le formulaire de contact; nous répondons avec les informations nécessaires pour avancer rapidement."
									: "Email support@zamazor.ma or use the contact form; we reply with the details needed to move quickly.",
						},
					]}
				/>

				<div className="mt-8 grid gap-4 lg:grid-cols-[1fr_320px]">
					<div className="rounded-[2rem] border border-emerald-900/6 bg-white p-6 shadow-sm">
						<h2 className="text-xl font-playfair font-normal text-slate-950">
							{language === "fr" ? "Besoin d'une réponse plus précise ?" : "Need a more specific answer?"}
						</h2>
						<p className="mt-2 text-sm leading-7 text-slate-500">
							{language === "fr"
								? "Notre équipe peut aider pour les commandes, les retours, les adresses, les produits et les achats en quantité."
								: "Our team can help with orders, returns, addresses, products, and bulk purchasing."}
						</p>
					</div>
					<div className="rounded-[2rem] border border-emerald-900/6 bg-[#f2f8ef] p-6">
						<div className="flex items-start gap-3">
							<div className="grid size-10 place-items-center rounded-2xl bg-emerald-900 text-white">
								<Mail className="size-4" />
							</div>
							<div>
								<p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
									{language === "fr" ? "Contact direct" : "Direct contact"}
								</p>
								<p className="mt-2 text-sm font-semibold text-slate-900">support@zamazor.ma</p>
								<p className="text-sm text-slate-600">+212 6 11 42 31 16</p>
							</div>
						</div>
						<Button asChild className="mt-5 h-11 w-full rounded-xl bg-emerald-900 text-white hover:bg-emerald-950">
							<Link to={APP_ROUTES.CONTACT}>
								{language === "fr" ? "Aller au contact" : "Go to contact"}
								<ArrowRight className="ml-2 size-4" />
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};
