import CONFIG from "@/core/config/constants";
import axios, { type AxiosRequestConfig } from "axios";
import { coreApiRequest, type ApiRequestOptions } from "./coreApiRequest";

const axiosPublic = axios.create({
	baseURL: CONFIG.API_BASE_URL,
	timeout: CONFIG.TIMEOUT,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

export async function publicApiRequest<T>(
	config: AxiosRequestConfig,
	options: Omit<ApiRequestOptions, "axiosInstance"> = {},
) {
	return coreApiRequest<T>(config, { ...options, axiosInstance: axiosPublic });
}
