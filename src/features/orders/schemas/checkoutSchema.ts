import { z } from "zod";

export const checkoutSchema = z.object({
	email: z.string().min(1, "Email is required").email("Invalid email address"),
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	address: z.string().min(1, "Address is required"),
	city: z.string().min(1, "City is required"),
	zip: z.string().min(1, "ZIP code is required"),
	phone: z.string().min(1, "Phone number is required"),
	country: z.string().min(1, "Country is required"),
	cardNumber: z.string().min(1, "Card number is required").regex(/^[\d\s]{13,19}$/, "Invalid card number (13-19 digits)"),
	cardExpiry: z.string().min(1, "Expiry is required").regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)"),
	cardCvv: z.string().min(1, "CVV is required").regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
