import CONFIG from "@/core/config/constants";
import type { AllowedEndpoints } from "@/core/routes/paths";

export const apiUrl = (endpoint: AllowedEndpoints) =>
	`${CONFIG.API_BASE_URL}${endpoint}`;
