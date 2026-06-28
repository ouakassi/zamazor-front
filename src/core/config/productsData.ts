export interface Product {
	id: string;
	name: string;
	category: string;
	price: string;
	flavor: string;
	badge: string;
	theme: string;
	image: string;
	description?: string;
	benefits?: string[];
	ingredients?: string[];
	usage?: string;
	stock?: number;
}
