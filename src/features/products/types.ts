export interface Product {
	id: string;
	name: string;
	createdAt?: string;
	category: string;
	price: string;
	image: string;
	flavor?: string;
	badge?: string;
	theme?: string;
	description?: string;
	benefits?: string[];
	ingredients?: string[];
	usage?: string;
	stock?: number;
}
