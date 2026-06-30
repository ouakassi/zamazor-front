import { z } from "zod";

export const checkoutSchema = z.object({
	email: z.string().min(1, "Email is required").email("Invalid email address"),
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	address: z.string().min(1, "Address is required"),
	city: z.string().min(1, "City is required"),
	phone: z.string().min(1, "Phone number is required"),
	country: z.string().min(1, "Country is required"),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
