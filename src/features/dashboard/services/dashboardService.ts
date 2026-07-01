import { API_ENDPOINTS } from "@/core/config/apiEndpoints";
import { isSystemError } from "@/shared/types";
import { privateApiRequest } from "@/shared/utils/axiosPrivate";

interface DashboardMetricSummary {
	totalSales?: number;
	averageOrderValue?: number;
	totalOrders?: number;
	pendingOrders?: number;
	paidOrders?: number;
	confirmedOrders?: number;
	processingOrders?: number;
	shippedOrders?: number;
	deliveredOrders?: number;
	canceledOrders?: number;
	refundedOrders?: number;
	lowStockCount?: number;
}

interface DashboardRecentOrderItem {
	id?: string;
	status?: string;
	total?: number;
	createdAt?: string;
	shippingAddress?: string;
	shippingCountry?: string;
	shippingCity?: string;
	shippingStreet?: string;
	phone?: string;
}

interface DashboardTopProductItem {
	id?: string;
	productId?: string;
	name?: string;
	category?: string;
	quantity?: number;
	quantitySold?: number;
	revenue?: number;
}

interface DashboardCategorySummaryItem {
	category?: string;
	label?: string;
	count?: number;
	total?: number;
}

interface DashboardLowStockItem {
	id?: string;
	name?: string;
	category?: string;
	stock?: number;
	quantity?: number;
}

export interface DashboardOverviewResponse {
	metrics?: DashboardMetricSummary;
	totalSales?: number;
	averageOrderValue?: number;
	totalOrders?: number;
	pendingOrders?: number;
	paidOrders?: number;
	confirmedOrders?: number;
	processingOrders?: number;
	shippedOrders?: number;
	deliveredOrders?: number;
	canceledOrders?: number;
	refundedOrders?: number;
	lowStockCount?: number;
	recentOrders?: DashboardRecentOrderItem[];
	topSellingItems?: DashboardTopProductItem[];
	topProducts?: DashboardTopProductItem[];
	categorySummaries?: DashboardCategorySummaryItem[];
	categorySummary?: DashboardCategorySummaryItem[];
	lowStockWarnings?: DashboardLowStockItem[];
	lowStockProducts?: DashboardLowStockItem[];
	[key: string]: unknown;
}

const extractOverviewPayload = (response: unknown): DashboardOverviewResponse | null => {
	if (!response || typeof response !== "object" || Array.isArray(response)) {
		return null;
	}

	if ("data" in response) {
		const data = (response as { data?: unknown }).data;
		if (data && typeof data === "object" && !Array.isArray(data)) {
			return data as DashboardOverviewResponse;
		}
	}

	return response as DashboardOverviewResponse;
};

export const dashboardService = {
	getOverview: async (): Promise<DashboardOverviewResponse | null> => {
		try {
			const response = await privateApiRequest<DashboardOverviewResponse>({
				url: API_ENDPOINTS.DASHBOARD.OVERVIEW,
				method: "GET",
			});

			if (isSystemError(response)) {
				console.error("Failed to retrieve dashboard overview:", response);
				return null;
			}

			return extractOverviewPayload(response);
		} catch (error) {
			console.error("Dashboard overview request failed:", error);
			return null;
		}
	},
};
