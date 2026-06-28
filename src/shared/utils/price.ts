export function parsePrice(value: string | number | null | undefined): number {
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : 0;
	}

	if (typeof value !== "string") {
		return 0;
	}

	const normalized = value.replace(/[^0-9.,-]/g, "").replace(/,/g, ".");
	const parsed = parseFloat(normalized);
	return Number.isFinite(parsed) ? parsed : 0;
}

export function formatMadPrice(value: string | number | null | undefined): string {
	return `${parsePrice(value).toFixed(2)} MAD`;
}

export function formatMadCompact(value: string | number | null | undefined): string {
	const amount = parsePrice(value);

	if (Math.abs(amount) < 1000) {
		return `${amount.toFixed(2)} MAD`;
	}

	const compact = new Intl.NumberFormat("en", {
		notation: "compact",
		maximumFractionDigits: 1,
	});

	return `${compact.format(amount)} MAD`;
}
