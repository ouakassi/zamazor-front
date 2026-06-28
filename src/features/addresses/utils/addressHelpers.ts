import type { BackendAddress } from "@/features/addresses/services/addressService";

export interface ShippingAddressParts {
	street: string;
	city: string;
	phone: string;
	country: string;
}

export function parseShippingAddressFallback(shippingAddress?: string | null): ShippingAddressParts {
	const empty: ShippingAddressParts = {
		street: "",
		city: "",
		phone: "",
		country: "Morocco",
	};

	if (!shippingAddress) {
		return empty;
	}

	const parts = shippingAddress.split(",").map((part) => part.trim()).filter(Boolean);
	const phonePart = parts.find((part) => part.toLowerCase().startsWith("phone:"));
	const countryPart = parts.find((part) => part.toLowerCase() === "morocco");
	const cleanParts = parts.filter((part) => !part.toLowerCase().startsWith("phone:") && part.toLowerCase() !== "morocco");

	return {
		street: cleanParts[0] || "",
		city: cleanParts[1] || "",
		phone: phonePart ? phonePart.split(":")[1]?.trim() || "" : "",
		country: countryPart || "Morocco",
	};
}

export function buildShippingAddressString(parts: ShippingAddressParts): string {
	const pieces = [parts.street.trim(), parts.city.trim(), parts.country.trim() || "Morocco"];
	const base = pieces.filter(Boolean).join(", ");
	return parts.phone.trim() ? `${base}, Phone: ${parts.phone.trim()}` : base;
}

export function toAddressFormValues(address?: BackendAddress | null, fallback?: string | null): ShippingAddressParts {
	const fallbackParts = parseShippingAddressFallback(fallback);

	return {
		street: address?.street || fallbackParts.street,
		city: address?.city || fallbackParts.city,
		phone: address?.phone || fallbackParts.phone,
		country: address?.country || fallbackParts.country,
	};
}
