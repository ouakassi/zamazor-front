import { privateApiRequest } from "@/shared/utils/axiosPrivate";
import { isSystemError, type SystemError } from "@/shared/types";
import { API_ENDPOINTS } from "@/core/config/apiEndpoints";

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
	unitPrice?: number;
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
	shippingCountry?: string;
	shippingCity?: string;
	shippingStreet?: string;
	phone?: string;
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

export interface ChangeOrderStatusRequest {
	status: string;
}

interface PaginatedResponse<T> {
	items?: T[];
	totalElements?: number;
	totalPages?: number;
	page?: number;
	size?: number;
}

export interface OrderPageQueryParams {
	page?: number;
	size?: number;
	status?: string;
	userFullName?: string;
	sort?: string | string[];
}

export interface PaginatedOrdersResult {
	items: BackendOrder[];
	totalElements: number;
	totalPages: number;
	page: number;
	size: number;
}

function extractItems<T>(response: unknown): T[] {
	if (Array.isArray(response)) {
		return response as T[];
	}

	if (response && typeof response === "object" && "items" in response) {
		const paginated = response as PaginatedResponse<T>;
		if (Array.isArray(paginated.items)) {
			return paginated.items;
		}
	}

	return [];
}

function extractPaginatedOrders(response: unknown, fallbackPage = 1, fallbackSize = 0): PaginatedOrdersResult {
	const items = extractItems<BackendOrder>(response);

	if (!response || typeof response !== "object" || Array.isArray(response)) {
		return {
			items,
			totalElements: items.length,
			totalPages: 1,
			page: fallbackPage,
			size: items.length || fallbackSize,
		};
	}

	const paginated = response as PaginatedResponse<BackendOrder>;
	return {
		items,
		totalElements: typeof paginated.totalElements === "number" ? paginated.totalElements : items.length,
		totalPages: typeof paginated.totalPages === "number" ? paginated.totalPages : 1,
		page: typeof paginated.page === "number" ? paginated.page + 1 : fallbackPage,
		size: typeof paginated.size === "number" ? paginated.size : (items.length || fallbackSize),
	};
}

function buildQueryString(params: Record<string, string | number | Array<string | number> | undefined>) {
	const query = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null || value === "") return;

		if (Array.isArray(value)) {
			value.forEach((entry) => {
				if (entry === undefined || entry === null || entry === "") return;
				query.append(key, String(entry));
			});
			return;
		}

		query.append(key, String(value));
	});

	return query.toString();
}

export const orderService = {
	getUserOrdersPage: async (params: OrderPageQueryParams = {}): Promise<PaginatedOrdersResult> => {
		try {
			const queryString = buildQueryString({
				page: Math.max(0, (params.page ?? 1) - 1),
				size: params.size,
				sort: params.sort,
			});
			const response = await privateApiRequest<BackendOrder[]>({
				url: `${API_ENDPOINTS.ORDERS.ME}${queryString ? `?${queryString}` : ""}`,
				method: "GET",
			});

			if (isSystemError(response)) {
				console.error("Failed to retrieve user orders from API:", response);
				return {
					items: [],
					totalElements: 0,
					totalPages: 1,
					page: Math.max(0, (params.page ?? 1) - 1),
					size: params.size ?? 0,
				};
			}

			return extractPaginatedOrders(response, params.page ?? 1, params.size ?? 0);
		} catch (error) {
			console.error("Failed to fetch user orders from API:", error);
			return {
				items: [],
				totalElements: 0,
				totalPages: 1,
				page: Math.max(0, (params.page ?? 1) - 1),
				size: params.size ?? 0,
			};
		}
	},

	getUserOrders: async (): Promise<BackendOrder[]> => {
		const response = await orderService.getUserOrdersPage({ page: 1, size: 1000 });
		return response.items;
	},

	getAllOrdersPage: async (params: OrderPageQueryParams = {}): Promise<PaginatedOrdersResult> => {
		try {
			const queryString = buildQueryString({
				page: Math.max(0, (params.page ?? 1) - 1),
				size: params.size,
				status: params.status,
				userFullName: params.userFullName,
				sort: params.sort,
			});
			const response = await privateApiRequest<BackendOrder[]>({
				url: `${API_ENDPOINTS.ORDERS.ROOT}${queryString ? `?${queryString}` : ""}`,
				method: "GET",
			});

			if (isSystemError(response)) {
				console.error("Failed to retrieve all orders from API:", response);
				return {
					items: [],
					totalElements: 0,
					totalPages: 1,
					page: Math.max(0, (params.page ?? 1) - 1),
					size: params.size ?? 0,
				};
			}

			return extractPaginatedOrders(response, params.page ?? 1, params.size ?? 0);
		} catch (error) {
			console.error("Get all orders request failed:", error);
			return {
				items: [],
				totalElements: 0,
				totalPages: 1,
				page: Math.max(0, (params.page ?? 1) - 1),
				size: params.size ?? 0,
			};
		}
	},

	getAllOrders: async (): Promise<BackendOrder[]> => {
		const response = await orderService.getAllOrdersPage({ page: 1, size: 1000 });
		return response.items;
	},

	getOrderById: async (id: string): Promise<BackendOrder | null> => {
		try {
			const response = await privateApiRequest<BackendOrder>({
				url: API_ENDPOINTS.ORDERS.DETAILS(id),
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

	checkout: async (payload: { country: string; city: string; street: string; phone: string; isDefault: boolean }): Promise<BackendOrder> => {
		const response = await privateApiRequest<BackendOrder>({
			url: API_ENDPOINTS.ORDERS.CHECKOUT,
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
				url: API_ENDPOINTS.ORDERS.CANCEL(orderId),
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

	changeOrderStatus: async (orderId: string, status: string): Promise<BackendOrder | SystemError | null> => {
		try {
			const response = await privateApiRequest<BackendOrder>({
				url: API_ENDPOINTS.ORDERS.STATUS(orderId),
				method: "PATCH",
				data: { status },
			});

			if (isSystemError(response)) {
				console.error("Change order status request returned system error:", response);
				return response;
			}

			return response && response.id ? response : null;
		} catch (error) {
			console.error("Change order status request failed:", error);
			return null;
		}
	},
};

