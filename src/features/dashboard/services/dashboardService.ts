import { API_ENDPOINTS } from "@/core/config/apiEndpoints";
import { privateApiRequest } from "@/shared/utils/axiosPrivate";
import {
	dashboardOverviewSchema,
	type DashboardOverview,
} from "../schemas/dashboardSchema";
import { isSystemError } from "@/shared/types";

export const dashboardService = {
	getOverview: async () => {
		const response = await privateApiRequest<DashboardOverview>({
			url: API_ENDPOINTS.DASHBOARD.OVERVIEW,
			method: "GET",
		});

		if (isSystemError(response)) {
			console.error("Failed to fetch dashboard overview: ", response);
			return null;
		}
		const parsed = dashboardOverviewSchema.safeParse(response);
		if (!parsed.success) {
			console.error("Dashboard overview data validation failed:", parsed.error);
			return null;
		}
		return parsed.data;
	},
};
