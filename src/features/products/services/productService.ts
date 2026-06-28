import { type Product } from "@/core/config/productsData";
import { API_ENDPOINTS } from "@/core/config/apiEndpoints";
import { isSystemError } from "@/shared/types";
import { CONFIG } from "@/core/config/constants";
import { privateApiRequest } from "@/shared/utils/axiosPrivate";
import { publicApiRequest } from "@/shared/utils/axiosPublic";



export interface BackendCategory {
	id: string;
	label: string;
}

export interface BackendProduct {
	id: string;
	name: string;
	description: string | null;
	imageUrl: string | null;
	price: number;
	stockQuantity: number;
	reservedQuantity: number;
	category: BackendCategory;
}

interface PaginatedProductResponse {
	items?: BackendProduct[];
}

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface RichMetadata {
	category?: string;
	flavor?: string;
	badge?: string;
	theme?: string;
	description?: string;
	benefits?: string[];
	ingredients?: string[];
	usage?: string;
}

const productMetadataMap: Record<string, RichMetadata> = {
	"greenfuel protein": {
		flavor: "Vanilla matcha",
		badge: "Best seller",
		theme: "emerald",
		benefits: [
			"18g of organic pea & brown rice protein per serving",
			"Infused with antioxidant-rich Japanese matcha",
			"Zero artificial colors, sweeteners, or soy fillers",
			"Smooth blendability with water, oat milk, or smoothies"
		],
		ingredients: ["Organic Pea Protein", "Organic Brown Rice Protein", "Ceremonial Matcha", "Natural Vanilla Flavor", "Stevia Leaf Extract", "Digestive Enzymes"],
		usage: "Mix 1 scoop with 8-10 oz of cold water or plant-based milk. Shake or blend for 20 seconds. Best consumed within 45 minutes after training or as a morning protein boost."
	},
	"daily greens": {
		flavor: "Citrus mint",
		badge: "New formula",
		theme: "lime",
		benefits: [
			"Contains spirulina, chlorella, wheatgrass, and organic kale",
			"Probiotic complex for active digestive & gut support",
			"Zero grassy aftertaste — flavored with real citrus and mint oils",
			"Easy daily ritual for complete green nutrition"
		],
		ingredients: ["Organic Spirulina", "Organic Wheatgrass Powder", "Organic Kale", "Chlorella", "Lactobacillus Acidophilus (Probiotic)", "Peppermint Extract", "Lemon Extract"],
		usage: "Stir 1 scoop into 8 oz of cold water. Drink daily first thing in the morning on an empty stomach for maximum absorption and digestion support."
	},
	"hydra charge": {
		flavor: "Lemon salt",
		badge: "Zero sugar",
		theme: "amber",
		benefits: [
			"Real Pink Himalayan sea salt for clean sodium balance",
			"Formulated with potassium, magnesium, and calcium",
			"Zero added sugars or high-fructose corn syrups",
			"Provides sustained cellular hydration and focus"
		],
		ingredients: ["Pink Himalayan Sea Salt", "Potassium Citrate", "Magnesium Glycinate", "Calcium Carbonate", "Natural Lemon Flavor", "B-Vitamin Complex", "Stevia Leaf Extract"],
		usage: "Add 1 packet or scoop into 16 oz of cold water. Shake well. Sip before, during, or after exercise, or throughout hot days to maintain hydration."
	},
	"night repair": {
		flavor: "Berry calm",
		badge: "Rest support",
		theme: "teal",
		benefits: [
			"Supports deep, natural sleep cycles without morning grogginess",
			"Tart cherry extract helps naturally reduce muscle inflammation",
			"Magnesium glycinate promotes muscle and nervous system relaxation",
			"Delicious berry flavor makes a soothing bedtime hot or cold tea"
		],
		ingredients: ["Magnesium Glycinate", "L-Theanine", "Tart Cherry Extract", "Chamomile Flower Extract", "Natural Berry Flavor", "Melatonin (0.5mg)"],
		usage: "Stir 1 scoop into 6-8 oz of warm or cold water 30-45 minutes before sleep. Sip slowly as you wind down for the night."
	}
};

export function mapBackendProduct(backendProd: BackendProduct): Product {
	const formattedPrice = `${Number(backendProd.price).toFixed(2)} MAD`;
	const key = backendProd.name.toLowerCase();
	const meta = productMetadataMap[key];

	let imageUrl = backendProd.imageUrl || "";
	if (imageUrl && !imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
		const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
		let serverRoot = "http://localhost:8080";
		try {
			serverRoot = new URL(CONFIG.API_BASE_URL).origin;
		} catch {
			if (!window.location.origin.includes("localhost")) {
				serverRoot = window.location.origin;
			}
		}
		imageUrl = `${serverRoot}${cleanPath}`;
	}

	if (!imageUrl) {
		let serverRoot = "http://localhost:8080";
		try {
			serverRoot = new URL(CONFIG.API_BASE_URL).origin;
		} catch {
			if (!window.location.origin.includes("localhost")) {
				serverRoot = window.location.origin;
			}
		}
		if (key.includes("greens") || key.includes("shield") || key.includes("vitamin") || key.includes("omega") || key.includes("ashwagandha")) {
			imageUrl = `${serverRoot}/images/product_greens.png`;
		} else if (key.includes("hydra") || key.includes("pre-workout") || key.includes("probiotic") || key.includes("energy")) {
			imageUrl = `${serverRoot}/images/product_hydra.png`;
		} else if (key.includes("recovery") || key.includes("night") || key.includes("bcaa") || key.includes("collagen") || key.includes("casein") || key.includes("creatine")) {
			imageUrl = `${serverRoot}/images/product_recovery.png`;
		} else {
			imageUrl = `${serverRoot}/images/product_protein.png`;
		}
	}

	return {
		id: backendProd.id,
		name: backendProd.name,
		category: (() => {
			const label = backendProd.category ? backendProd.category.label : (meta?.category || "Supplement");
			if (label === "Proteins") return "Protein";
			if (label === "Vitamins & Minerals") return "Greens";
			if (label === "Pre-Workout & Energy") return "Energy";
			if (label === "Performance & Recovery") return "Recovery";
			if (label === "Health & Wellness") return "Wellness";
			return label;
		})(),
		price: formattedPrice,
		flavor: meta?.flavor || "Pure & clean",
		badge: meta?.badge || "Formulated",
		theme: meta?.theme || "emerald",
		image: imageUrl,
		description: backendProd.description || meta?.description || "",
		stock: backendProd.stockQuantity,
		benefits: meta?.benefits || [
			"Premium scientifically validated formula",
			"Naturally sweetened, zero artificial colors",
			"Lab tested for active purity and safety",
		],
		ingredients: meta?.ingredients || ["Active formula blend"],
		usage: meta?.usage || "Mix 1 scoop with 8 oz of cold water daily.",
	};
}

function extractProductItems(response: unknown): BackendProduct[] {
	if (Array.isArray(response)) {
		return response as BackendProduct[];
	}

	if (response && typeof response === "object") {
		const paginated = response as PaginatedProductResponse;
		if (Array.isArray(paginated.items)) {
			return paginated.items;
		}
	}

	return [];
}

export const productService = {
	getProducts: async (): Promise<Product[]> => {
		const response = await publicApiRequest<unknown>(
			{
				url: `${API_ENDPOINTS.PRODUCTS.ROOT}?size=100`,
				method: "GET",
			},
			{ ignoreErrors: true }
		);

		if (isSystemError(response)) {
			console.error("Product API returned system error:", response);
			return [];
		}

		return extractProductItems(response).map(mapBackendProduct);
	},

	getProductById: async (id: string): Promise<Product | null> => {
		if (!uuidRegex.test(id)) {
			return null;
		}

		const response = await publicApiRequest<BackendProduct>(
			{
				url: API_ENDPOINTS.PRODUCTS.DETAILS(id),
				method: "GET",
			},
			{ ignoreErrors: true }
		);

		if (isSystemError(response)) {
			console.error(`Product API returned error for id ${id}:`, response);
			return null;
		}

		if (response && response.id) {
			return mapBackendProduct(response);
		}

		return null;
	},

	getProductsByCategory: async (categoryId: string): Promise<Product[]> => {
		if (!uuidRegex.test(categoryId)) {
			return [];
		}

		const response = await publicApiRequest<unknown>(
			{
				url: `${API_ENDPOINTS.PRODUCTS.CATEGORY(categoryId)}?size=100`,
				method: "GET",
			},
			{ ignoreErrors: true }
		);

		if (isSystemError(response)) {
			console.error(`Category API returned error for category ${categoryId}:`, response);
			return [];
		}

		return extractProductItems(response).map(mapBackendProduct);
	},

	searchProducts: async (query: string): Promise<Product[]> => {
		const response = await publicApiRequest<unknown>(
			{
				url: API_ENDPOINTS.PRODUCTS.SEARCH(query),
				method: "GET",
			},
			{ ignoreErrors: true }
		);

		if (isSystemError(response)) {
			console.error("Product search API returned system error:", response);
			return [];
		}

		return extractProductItems(response).map(mapBackendProduct);
	},

	getCategories: async (): Promise<BackendCategory[]> => {
		const response = await publicApiRequest<BackendCategory[]>(
			{
				url: API_ENDPOINTS.CATEGORIES.ROOT,
				method: "GET",
			},
			{ ignoreErrors: true }
		);

		if (isSystemError(response)) {
			console.error("Categories API returned system error:", response);
			return [];
		}

		return Array.isArray(response) ? response : [];
	},

	createCategory: async (label: string): Promise<BackendCategory | null> => {
		try {
			const response = await privateApiRequest<BackendCategory>({
				url: API_ENDPOINTS.CATEGORIES.ROOT,
				method: "POST",
				data: { label },
			});

			if (isSystemError(response)) {
				console.error("Create category failed:", response);
				return null;
			}

			if (response && response.id && response.label) {
				return response;
			}

			return null;
		} catch (error) {
			console.error("Create category request failed:", error);
			return null;
		}
	},

	createProduct: async (formData: FormData): Promise<Product | null> => {
		try {
			const response = await privateApiRequest<BackendProduct>({
				url: API_ENDPOINTS.PRODUCTS.ROOT,
				method: "POST",
				data: formData,
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			if (isSystemError(response)) {
				console.error("Create product failed:", response);
				return null;
			}
			return mapBackendProduct(response);
		} catch (error) {
			console.error("Create product request failed:", error);
			return null;
		}
	},

	updateProduct: async (id: string, formData: FormData): Promise<Product | null> => {
		try {
			const response = await privateApiRequest<BackendProduct>({
				url: API_ENDPOINTS.PRODUCTS.DETAILS(id),
				method: "PUT",
				data: formData,
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			if (isSystemError(response)) {
				console.error("Update product failed:", response);
				return null;
			}
			return mapBackendProduct(response);
		} catch (error) {
			console.error("Update product request failed:", error);
			return null;
		}
	},

	deleteProduct: async (id: string): Promise<boolean> => {
		try {
			const response = await privateApiRequest<void>({
				url: API_ENDPOINTS.PRODUCTS.DETAILS(id),
				method: "DELETE",
			});

			if (isSystemError(response)) {
				console.error("Delete product failed:", response);
				return false;
			}
			return true;
		} catch (error) {
			console.error("Delete product request failed:", error);
			return false;
		}
	},

	updateCategory: async (id: string, label: string): Promise<BackendCategory | null> => {
		try {
			const response = await privateApiRequest<BackendCategory>({
				url: API_ENDPOINTS.CATEGORIES.DETAILS(id),
				method: "PUT",
				data: { label },
			});

			if (isSystemError(response)) {
				console.error("Update category failed:", response);
				return null;
			}

			return response && response.id ? response : null;
		} catch (error) {
			console.error("Update category request failed:", error);
			return null;
		}
	},

	deleteCategory: async (id: string): Promise<boolean> => {
		try {
			const response = await privateApiRequest<void>({
				url: API_ENDPOINTS.CATEGORIES.DETAILS(id),
				method: "DELETE",
			});

			if (isSystemError(response)) {
				console.error("Delete category failed:", response);
				return false;
			}

			return true;
		} catch (error) {
			console.error("Delete category request failed:", error);
			return false;
		}
	},
};
