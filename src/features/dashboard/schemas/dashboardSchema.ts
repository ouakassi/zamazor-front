import z from "zod/v4";

export const recentOrderSchema = z.object({
	id: z.uuid(),
	total: z.number().nonnegative(),
	status: z.string(),
	shippingCountry: z.string(),
	shippingCity: z.string(),
	shippingStreet: z.string(),
	phone: z.string(),
	createdAt: z.iso.datetime(),
});

export const lowStockProductSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	stockQuantity: z.number().int().nonnegative(),
	category: z.string()
});

export const categorySummarySchema = z.object({
	category: z.string(),
	count: z.number().int().nonnegative(),
});

export const topProductSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	quantity: z.number().int().nonnegative(),
	revenue: z.number().nonnegative(),
	category: z.string(),
});

export const dashboardOverviewSchema = z.object({
	totalSales: z.number().nonnegative(),
	averageOrderValue: z.number().nonnegative(),
	totalOrders: z.number().int().nonnegative(),
	pendingOrders: z.number().int().nonnegative(),
	completedOrders: z.number().int().nonnegative(),
	canceledOrders: z.number().int().nonnegative(),
	inFlightOrders: z.number().int().nonnegative(),
	recentOrders: z.array(recentOrderSchema),
	lowStockProducts: z.array(lowStockProductSchema),
	categorySummary: z.array(categorySummarySchema),
	topProducts: z.array(topProductSchema),
});

export type DashboardOverview = z.infer<typeof dashboardOverviewSchema>;
