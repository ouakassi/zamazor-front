export const ORDER_STATUSES = [
	"PENDING",
	"PAID",
	"CONFIRMED",
	"PROCESSING",
	"SHIPPED",
	"DELIVERED",
	"CANCELED",
	"REFUNDED",
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];

const ORDER_STATUS_META: Record<
	OrderStatus,
	{
		label: string;
		badgeClass: string;
		accentClass: string;
	}
> = {
	PENDING: {
		label: "Pending",
		badgeClass: "border-amber-200/70 bg-amber-50 text-amber-800",
		accentClass: "bg-amber-50 text-amber-800",
	},
	CONFIRMED: {
		label: "Confirmed",
		badgeClass: "border-sky-200/70 bg-sky-50 text-sky-800",
		accentClass: "bg-sky-50 text-sky-800",
	},
	PROCESSING: {
		label: "Processing",
		badgeClass: "border-violet-200/70 bg-violet-50 text-violet-800",
		accentClass: "bg-violet-50 text-violet-800",
	},
	SHIPPED: {
		label: "Shipped",
		badgeClass: "border-cyan-200/70 bg-cyan-50 text-cyan-800",
		accentClass: "bg-cyan-50 text-cyan-800",
	},
	DELIVERED: {
		label: "Delivered",
		badgeClass: "border-lime-200/70 bg-lime-50 text-lime-800",
		accentClass: "bg-lime-50 text-lime-800",
	},
	PAID: {
		label: "Paid",
		badgeClass: "border-emerald-200/70 bg-emerald-50 text-emerald-800",
		accentClass: "bg-emerald-50 text-emerald-800",
	},
	CANCELED: {
		label: "Canceled",
		badgeClass: "border-slate-200 bg-slate-100 text-slate-500",
		accentClass: "bg-slate-100 text-slate-500",
	},
	REFUNDED: {
		label: "Refunded",
		badgeClass: "border-rose-200/70 bg-rose-50 text-rose-800",
		accentClass: "bg-rose-50 text-rose-800",
	},
} as const;

export const ORDER_STATUS_OPTIONS = ORDER_STATUSES.map((status) => ({
	value: status,
	label: ORDER_STATUS_META[status].label,
}));

const FINAL_ORDER_STATUSES = ["DELIVERED", "CANCELED", "REFUNDED"] as const;

export function isFinalOrderStatus(status: string) {
	return FINAL_ORDER_STATUSES.includes(status as (typeof FINAL_ORDER_STATUSES)[number]);
}

export function getOrderStatusMeta(status: string) {
	if (status in ORDER_STATUS_META) {
		return ORDER_STATUS_META[status as OrderStatus];
	}

	return {
		label: status,
		badgeClass: "border-teal-200/70 bg-teal-50 text-teal-800",
		accentClass: "bg-teal-50 text-teal-800",
	};
}
