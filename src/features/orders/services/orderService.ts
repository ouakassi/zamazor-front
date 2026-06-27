import { privateApiRequest } from "@/shared/utils/axiosPrivate";
import { isSystemError } from "@/shared/types";

export interface BackendOrderProduct {
	id: string;
	name: string;
	description?: string | null;
	imageUrl?: string | null;
	price: number;
	stockQuantity: number;
	reservedQuantity: number;
	category: { id: string; label: string };
}

export interface BackendOrderItem {
	id: string;
	unitPrice: number;
	product: BackendOrderProduct;
	quantity: number;
}

export interface BackendOrder {
	id: string;
	userId: string;
	status: string;
	total: number;
	items: BackendOrderItem[];
	createdAt: string;
	shippingAddress: string;
}

export interface CheckoutRequest {
	email: string;
	firstName: string;
	lastName: string;
	address: string;
	city: string;
	zipCode: string;
	items: { productId: string; quantity: number }[];
	paymentDetails: {
		cardNumber: string;
		expiryDate: string;
		cvv: string;
	};
}

export const orderService = {
	getUserOrders: async (): Promise<BackendOrder[]> => {
		try {
			const response = await privateApiRequest<BackendOrder[]>({
				url: "/orders/me",
				method: "GET",
			});

			if (isSystemError(response)) {
				console.error("Failed to retrieve user orders from API:", response);
				return [];
			}

			if (Array.isArray(response)) {
				return response;
			} else if (response && typeof response === "object" && "items" in response && Array.isArray((response as any).items)) {
				return (response as any).items;
			}
			return [];
		} catch (error) {
			console.error("Failed to fetch user orders from API:", error);
			return [];
		}
	},

	getAllOrders: async (): Promise<BackendOrder[]> => {
		try {
			const response = await privateApiRequest<BackendOrder[]>({
				url: "/orders",
				method: "GET",
			});

			if (isSystemError(response)) {
				console.error("Failed to retrieve all orders from API:", response);
				return [];
			}

			if (Array.isArray(response)) {
				return response;
			} else if (response && typeof response === "object" && "items" in response && Array.isArray((response as any).items)) {
				return (response as any).items;
			}
			return [];
		} catch (error) {
			console.error("Get all orders request failed:", error);
			return [];
		}
	},

	getOrderById: async (id: string): Promise<BackendOrder | null> => {
		try {
			const response = await privateApiRequest<BackendOrder>({
				url: `/orders/${id}`,
				method: "GET",
			});

			if (isSystemError(response)) {
				console.error(`Failed to retrieve order details for ${id}:`, response);
				return null;
			}

			if (response && response.id) {
				return response;
			}
			return null;
		} catch (error) {
			console.error("Failed to fetch order details:", error);
			return null;
		}
	},

	checkout: async (payload: { country: string; city: string; street: string; isDefault: boolean }): Promise<BackendOrder> => {
		const response = await privateApiRequest<BackendOrder>({
			url: "/orders/checkout",
			method: "POST",
			data: payload,
		});

		if (isSystemError(response)) {
			console.error("Checkout API failed:", response);
			throw new Error(response.detail || "Failed to complete checkout on API.");
		}

		if (response && response.id) {
			return response;
		}

		throw new Error("Invalid order response returned by server.");
	},

	cancelOrder: async (orderId: string): Promise<boolean> => {
		try {
			const response = await privateApiRequest<unknown>({
				url: `/orders/${orderId}/cancel`,
				method: "POST",
			});

			if (isSystemError(response)) {
				console.error("Cancel order request returned system error:", response);
				return false;
			}

			return true;
		} catch (error) {
			console.error("Cancel order request failed:", error);
			return false;
		}
	},
};
