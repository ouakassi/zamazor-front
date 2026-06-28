import { API_ENDPOINTS } from "@/core/config/apiEndpoints";
import { privateApiRequest } from "@/shared/utils/axiosPrivate";
import { isSystemError } from "@/shared/types";

export interface BackendAddress {
	id: string;
	country: string;
	city: string;
	street: string;
	phone: string;
	isDefault: boolean;
}

export interface AddressRequest {
	country: string;
	city: string;
	street: string;
	phone: string;
	isDefault?: boolean;
}

export const addressService = {
	getDefaultAddress: async (): Promise<BackendAddress | null> => {
		try {
			const response = await privateApiRequest<BackendAddress>({
				url: API_ENDPOINTS.ADDRESSES.ROOT,
				method: "GET",
			});

			if (isSystemError(response)) {
				console.error("Get default address failed:", response);
				return null;
			}

			return response && response.id ? response : null;
		} catch (error) {
			console.error("Get default address request failed:", error);
			return null;
		}
	},

	createDefaultAddress: async (payload: AddressRequest): Promise<BackendAddress | null> => {
		try {
			const response = await privateApiRequest<BackendAddress>({
				url: API_ENDPOINTS.ADDRESSES.ROOT,
				method: "POST",
				data: payload,
			});

			if (isSystemError(response)) {
				console.error("Create default address failed:", response);
				return null;
			}

			return response && response.id ? response : null;
		} catch (error) {
			console.error("Create default address request failed:", error);
			return null;
		}
	},

	updateDefaultAddress: async (payload: AddressRequest): Promise<BackendAddress | null> => {
		try {
			const response = await privateApiRequest<BackendAddress>({
				url: API_ENDPOINTS.ADDRESSES.ROOT,
				method: "PUT",
				data: payload,
			});

			if (isSystemError(response)) {
				console.error("Update default address failed:", response);
				return null;
			}

			return response && response.id ? response : null;
		} catch (error) {
			console.error("Update default address request failed:", error);
			return null;
		}
	},
};
