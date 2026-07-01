/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "fr";

interface TranslationDictionary {
	[key: string]: string | TranslationDictionary;
}

type TranslationValue = string | TranslationDictionary;

const translations: Record<Language, TranslationDictionary> = {
	en: {
		nav: {
			home: "Home",
			shop: "Shop",
			cart: "Cart",
			wishlist: "Wishlist",
			profile: "Profile",
			dashboard: "Dashboard",
			login: "Log In",
			logout: "Log Out",
			register: "Register",
			storefront: "Storefront",
		},
		common: {
			search: "Search...",
			searchPlaceholder: "Search formulas...",
			addToCart: "Add to Cart",
			checkout: "Checkout",
			cancel: "Cancel",
			save: "Save Changes",
			close: "Close",
			loading: "Loading...",
			noDescription: "No description provided.",
			delete: "Delete",
		},
		homepage: {
			hero: {
				badge1: "100% CLEAN FORMULAS",
				title1: "Fuel Your Highest Potential",
				desc1: "Premium, zero-compromise plant proteins and organic nutrition designed to elevate your energy and recovery.",
				badge2: "ZERO ARTIFICIAL SWEETENERS",
				title2: "Matcha Botanical Green Energy",
				desc2: "Harness clean cellular focus with organic ceremonial matcha blended with high-absorption plant enzymes.",
				badge3: "DEEP SLEEP & REPAIR",
				title3: "Nighttime Recovery Peptides",
				desc3: "Calm your nervous system and repair muscle fibers overnight with rich minerals and tart cherry extracts.",
				shopNow: "Shop Formulas",
				quiz: "Take Wellness Quiz",
			},
			categories: {
				title: "Engineered for Results",
				desc: "Targeted stack categories formulated for athletic peak and daily wellness vitality.",
				protein: "Proteins",
				greens: "Vitamins & Minerals",
				energy: "Pre-Workout & Energy",
				recovery: "Performance & Recovery",
				wellness: "Health & Wellness",
			},
			featured: {
				title: "Pure Science. High Efficacy.",
				desc: "Explore our best-selling daily formulas, verified for maximum absorption and clean results.",
			},
		},
		shop: {
			title: "Shop Formulas",
			desc: "All formulas are naturally sweetened and laboratory tested for absolute purity.",
			filterCategory: "All Categories",
			sortBy: "Sort by",
			sortDefault: "Default",
			sortPriceLow: "Price: Low to High",
			sortPriceHigh: "Price: High to Low",
			sortName: "Alphabetical",
			outOfStock: "Out of Stock",
			inStock: "In Stock",
			unitsLeft: "units left",
			benefits: "Key Benefits",
			usage: "Recommended Usage",
			ingredients: "Active Ingredients",
		},
		cart: {
			title: "Your Cart",
			empty: "Your cart is empty",
			emptyDesc: "Choose some clean formulas to get started.",
			subtotal: "Subtotal",
			discount: "Discount",
			shipping: "Shipping",
			total: "Total",
			checkoutBtn: "Proceed to Checkout",
			freeShipping: "Free shipping active on all orders.",
			promoCode: "Promo Code",
			apply: "Apply",
			remove: "Remove",
		},
		checkout: {
			title: "Secure Checkout",
			back: "Back to Cart",
			step1: "Contact Information",
			email: "Email address",
			step2: "Shipping Destination",
			firstName: "First name",
			lastName: "Last name",
			address: "Address line 1",
			city: "City",
			zip: "Postal/ZIP Code",
			phone: "Phone Number",
			country: "Country",
			step3: "Secure Payment",
			card: "Credit Card Number",
			expiry: "Expiry (MM/YY)",
			cvv: "CVV",
			submitting: "Processing...",
			placeOrder: "Place Order",
			orderSummary: "Order Summary",
			successTitle: "Thank you for your order!",
			successDesc: "Your clean stack order has been successfully placed. We've sent updates to your email.",
			orderNumber: "Order ID",
			delivery: "Delivery Method",
			standardShipping: "Standard Insured (3-5 days)",
			returnHome: "Return to Store",
		},
		profile: {
			title: "User Settings",
			desc: "Manage your default shipping addresses, update user details, and check orders history.",
			fullName: "Full Name",
			street: "Street Address",
			city: "City",
			zip: "Postal / ZIP Code",
			phone: "Phone Number",
			country: "Country",
			ordersHistory: "Orders History",
			emptyOrders: "You have not placed any orders yet.",
			status: "Status",
			date: "Date",
			total: "Total",
			viewDetails: "View Details",
		},
		dashboard: {
			title: "Management Dashboard",
			overview: "Overview",
			products: "Products",
			orders: "Orders",
			revenue: "Total Revenue",
			allProducts: "All Products",
			totalOrders: "Total Orders",
			dynamics: "Recent Sales Dynamics",
			newProduct: "New Product",
			editProduct: "Edit Product",
			deleteConfirm: "Are you sure you want to delete this product?",
		}
	},
	fr: {
		nav: {
			home: "Accueil",
			shop: "Boutique",
			cart: "Panier",
			wishlist: "Favoris",
			profile: "Profil",
			dashboard: "Tableau de Bord",
			login: "Connexion",
			logout: "Déconnexion",
			register: "S'inscrire",
			storefront: "Magasin",
		},
		common: {
			search: "Rechercher...",
			searchPlaceholder: "Rechercher une formule...",
			addToCart: "Ajouter au Panier",
			checkout: "Passer à la caisse",
			cancel: "Annuler",
			save: "Enregistrer",
			close: "Fermer",
			loading: "Chargement...",
			noDescription: "Aucune description fournie.",
			delete: "Supprimer",
		},
		homepage: {
			hero: {
				badge1: "FORMULES 100% PROPRES",
				title1: "Libérez Votre Plus Grand Potentiel",
				desc1: "Protéines végétales de qualité supérieure et nutrition biologique conçues pour élever votre énergie et votre récupération.",
				badge2: "SANS ÉDULCORANTS ARTIFICIELS",
				title2: "Énergie Verte au Matcha Botanique",
				desc2: "Exploitez une concentration cellulaire propre grâce à du matcha de cérémonie biologique mélangé à des enzymes végétales.",
				badge3: "SOMMEIL PROFOND & RÉPARATION",
				title3: "Peptides de Récupération Nocturne",
				desc3: "Calmez votre système nerveux et réparez vos fibres musculaires pendant la nuit grâce aux minéraux et extraits de cerise acidulée.",
				shopNow: "Découvrir les Formules",
				quiz: "Faire le Quiz Bien-être",
			},
			categories: {
				title: "Conçu pour les Résultats",
				desc: "Catégories ciblées formulées pour les sommets athlétiques et la vitalité quotidienne.",
				protein: "Protéines",
				greens: "Vitamines & Minéraux",
				energy: "Pré-entraînement & Énergie",
				recovery: "Performance & Récupération",
				wellness: "Santé & Bien-être",
			},
			featured: {
				title: "Science Pure. Haute Efficacité.",
				desc: "Découvrez nos formules quotidiennes les plus vendues, vérifiées pour une absorption maximale et des résultats propres.",
			},
		},
		shop: {
			title: "Nos Formules",
			desc: "Toutes nos formules sont naturellement sucrées et testées en laboratoire pour une pureté absolue.",
			filterCategory: "Toutes les Catégories",
			sortBy: "Trier par",
			sortDefault: "Par défaut",
			sortPriceLow: "Prix: Du moins cher",
			sortPriceHigh: "Prix: Du plus cher",
			sortName: "Alphabétique",
			outOfStock: "Rupture de Stock",
			inStock: "En Stock",
			unitsLeft: "unités restantes",
			benefits: "Avantages Clés",
			usage: "Conseils d'Utilisation",
			ingredients: "Ingrédients Actifs",
		},
		cart: {
			title: "Votre Panier",
			empty: "Votre panier est vide",
			emptyDesc: "Choisissez des formules propres pour commencer.",
			subtotal: "Sous-total",
			discount: "Remise",
			shipping: "Livraison",
			total: "Total",
			checkoutBtn: "Passer commande",
			freeShipping: "Livraison gratuite active sur toutes les commandes.",
			promoCode: "Code Promo",
			apply: "Appliquer",
			remove: "Retirer",
		},
		checkout: {
			title: "Paiement Sécurisé",
			back: "Retour au Panier",
			step1: "Informations de Contact",
			email: "Adresse e-mail",
			step2: "Destination de Livraison",
			firstName: "Prénom",
			lastName: "Nom",
			address: "Adresse",
			city: "Ville",
			zip: "Code Postal",
			phone: "Numéro de Téléphone",
			country: "Pays",
			step3: "Paiement Sécurisé",
			card: "Numéro de Carte Bancaire",
			expiry: "Date d'expiration (MM/AA)",
			cvv: "CVV",
			submitting: "Traitement...",
			placeOrder: "Passer la Commande",
			orderSummary: "Résumé de la Commande",
			successTitle: "Merci pour votre commande !",
			successDesc: "Votre commande a été passée avec succès. Nous avons envoyé les détails de la commande par e-mail.",
			orderNumber: "ID de Commande",
			delivery: "Mode de Livraison",
			standardShipping: "Livraison Standard Assurée (3-5 jours)",
			returnHome: "Retour à la Boutique",
		},
		profile: {
			title: "Paramètres du Profil",
			desc: "Gérez vos adresses de livraison, mettez à jour vos coordonnées et consultez l'historique de vos commandes.",
			fullName: "Nom Complet",
			street: "Adresse",
			city: "Ville",
			zip: "Code Postal",
			phone: "Numéro de Téléphone",
			country: "Pays",
			ordersHistory: "Historique des Commandes",
			emptyOrders: "Vous n'avez pas encore passé de commande.",
			status: "Statut",
			date: "Date",
			total: "Total",
			viewDetails: "Voir les Détails",
		},
		dashboard: {
			title: "Console d'Administration",
			overview: "Aperçu",
			products: "Produits",
			orders: "Commandes",
			revenue: "Revenu Total",
			allProducts: "Tous les Produits",
			totalOrders: "Total des Commandes",
			dynamics: "Dynamique des Ventes Récentes",
			newProduct: "Nouveau Produit",
			editProduct: "Modifier le Produit",
			deleteConfirm: "Êtes-vous sûr de vouloir supprimer ce produit ?",
		}
	}
};

interface LanguageContextProps {
	language: Language;
	setLanguage: (lang: Language) => void;
	t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [language, setLanguageState] = useState<Language>(() => {
		const stored = localStorage.getItem("zamazor-language");
		return (stored === "fr" || stored === "en" ? stored : "en") as Language;
	});

	const setLanguage = (lang: Language) => {
		setLanguageState(lang);
		localStorage.setItem("zamazor-language", lang);
		document.documentElement.lang = lang;
	};

	useEffect(() => {
		document.documentElement.lang = language;
	}, [language]);

	// Dot notation translator: e.g. t("homepage.hero.title")
	const t = (key: string): string => {
		const keys = key.split(".");
		let current: TranslationValue = translations[language];

		for (const k of keys) {
			if (typeof current === "string" || !(k in current)) {
				return key;
			}
			current = current[k];
		}

		return typeof current === "string" ? current : key;
	};

	return (
		<LanguageContext.Provider value={{ language, setLanguage, t }}>
			{children}
		</LanguageContext.Provider>
	);
};

export const useLanguage = () => {
	const context = useContext(LanguageContext);
	if (!context) {
		throw new Error("useLanguage must be used within a LanguageProvider");
	}
	return context;
};
