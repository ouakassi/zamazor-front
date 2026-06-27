import { ArrowRightIcon } from "lucide-react";

const InstagramIcon = ({ className }: { className?: string }) => (
	<svg 
		className={className} 
		viewBox="0 0 24 24" 
		fill="none" 
		stroke="currentColor" 
		strokeWidth="2" 
		strokeLinecap="round" 
		strokeLinejoin="round"
	>
		<rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
		<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
		<line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
	</svg>
);

// Import the 6 assets for the Instagram grid
import cardImmune from "@/assets/images/card_immune.png";
import cardMind from "@/assets/images/card_mind.png";
import cardNutrient from "@/assets/images/card_nutrient.png";
import heroProtein from "@/assets/images/hero_protein.png";
import heroRecovery from "@/assets/images/hero_recovery.png";
import heroGreens from "@/assets/images/hero_greens.png";

export const Footer = () => {
	return (
		<footer className="bg-[#052316] text-[#9cbdae] font-sans pt-16 pb-8 border-t border-emerald-950/20">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				
				{/* Top Section */}
				<div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 pb-12">
					
					{/* Brand Column */}
					<div className="lg:col-span-6 flex flex-col justify-start">
						<span className="font-playfair text-[#dce8cd] text-3xl font-semibold tracking-tight">
							Zamazor
						</span>
						<h2 className="font-playfair text-white text-3xl sm:text-4xl md:text-5xl font-medium leading-tight mt-6 max-w-md">
							We’re obsessed with clean, honest supplements.
						</h2>
					</div>

					{/* Links Columns */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:col-span-6">
						
						{/* Company */}
						<div>
							<h3 className="font-playfair text-white text-lg font-medium mb-4">Company</h3>
							<ul className="space-y-3 text-sm">
								<li>
									<a href="/shop" className="hover:text-white transition-colors font-bold text-lime-300">Shop Formulas</a>
								</li>
								<li>
									<a href="#story" className="hover:text-white transition-colors">Our Story</a>
								</li>
								<li>
									<a href="#contact" className="hover:text-white transition-colors">Contact</a>
								</li>
								<li>
									<a href="#faqs" className="hover:text-white transition-colors">FAQs</a>
								</li>
								<li>
									<a href="#blog" className="hover:text-white transition-colors">Blog</a>
								</li>
							</ul>
						</div>

						{/* Get Help */}
						<div>
							<h3 className="font-playfair text-white text-lg font-medium mb-4">Get Help</h3>
							<ul className="space-y-3 text-sm">
								<li>
									<a href="#help" className="hover:text-white transition-colors">Help Center</a>
								</li>
								<li>
									<a href="#chat" className="hover:text-white transition-colors">Live Chat</a>
								</li>
								<li>
									<a href="#returns" className="hover:text-white transition-colors">Return Policy</a>
								</li>
								<li>
									<a href="#shipping" className="hover:text-white transition-colors">Shipping Info</a>
								</li>
								<li>
									<a href="#bulk" className="hover:text-white transition-colors">Bulk Orders</a>
								</li>
							</ul>
						</div>

						{/* Information */}
						<div>
							<h3 className="font-playfair text-white text-lg font-medium mb-4">Information</h3>
							<div className="space-y-4 text-sm leading-relaxed">
								<p>
									3772 Village View Drive, Immokalee, Florida
								</p>
								<p>
									<a href="mailto:support@zamazor.fit" className="hover:text-white underline decoration-dotted transition-colors">
										support@zamazor.fit
									</a>
								</p>
								<p>
									+1 888-234-1234 (tool-free)
								</p>
							</div>
						</div>

					</div>
				</div>

				{/* Divider */}
				<div className="border-t border-[#133a2a] my-8"></div>

				{/* Instagram Section */}
				<div className="pb-12">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
						<h3 className="font-playfair text-white text-xl font-medium">
							Follow Us on Instagram
						</h3>
						<a 
							href="https://instagram.com/zamazor.fit" 
							target="_blank" 
							rel="noreferrer" 
							className="text-sm font-medium hover:text-white transition-colors flex items-center gap-1"
						>
							@zamazor.fit
							<ArrowRightIcon className="h-3.5 w-3.5" />
						</a>
					</div>

					{/* 6-Image Instagram Grid */}
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
						{[
							{ img: cardImmune, alt: "Natural immunity ingredients" },
							{ img: cardMind, alt: "Fitness active routine" },
							{ img: cardNutrient, alt: "Cellular nutrition green bubbles" },
							{ img: heroProtein, alt: "Organic supplement pouch mockup" },
							{ img: heroRecovery, alt: "Facial serum skin care routine" },
							{ img: heroGreens, alt: "Effervescent supplement mix glass" }
						].map((item, index) => (
							<div 
								key={index}
								className="aspect-square w-full rounded-2xl overflow-hidden relative group cursor-pointer bg-[#02180e]"
							>
								<img 
									src={item.img} 
									alt={item.alt} 
									className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
								/>
								<div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
									<InstagramIcon className="h-6 w-6 text-white" />
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Bottom Area: Social Icons & Legal Links */}
				<div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between pt-8 pb-8">
					
					{/* Social Links */}
					<div className="flex items-center gap-3">
						
						{/* X (formerly Twitter) */}
						<a 
							href="https://x.com" 
							target="_blank" 
							rel="noreferrer" 
							className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#02180f] border border-[#133a2a] text-slate-300 hover:text-white hover:border-[#1e4d38] transition-colors"
						>
							<svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
								<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
							</svg>
						</a>

						{/* Instagram */}
						<a 
							href="https://instagram.com" 
							target="_blank" 
							rel="noreferrer" 
							className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#02180f] border border-[#133a2a] text-slate-300 hover:text-white hover:border-[#1e4d38] transition-colors"
						>
							<InstagramIcon className="h-4 w-4" />
						</a>

						{/* TikTok */}
						<a 
							href="https://tiktok.com" 
							target="_blank" 
							rel="noreferrer" 
							className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#02180f] border border-[#133a2a] text-slate-300 hover:text-white hover:border-[#1e4d38] transition-colors"
						>
							<svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
								<path d="M12.525.01c1.306-.022 2.545.405 3.517 1.206.702.585 1.173 1.332 1.393 2.14.072.26.113.528.122.798v2.247c-.504-.2-.962-.486-1.353-.84-.526-.475-.89-.963-1.096-1.46-.226-.547-.282-1.077-.282-1.59V3.11c0-.498-.014-.997-.042-1.493-.016-.27-.048-.54-.095-.807h-2.22v14.159c0 2.26-.856 3.996-2.563 4.908-1.026.547-2.19.782-3.327.674-1.89-.18-3.414-1.287-4.108-2.92-.375-.884-.46-1.802-.27-2.71.393-1.874 1.764-3.28 3.593-3.692.29-.065.586-.098.883-.1v2.176c-.22.015-.436.05-.646.108-.94.262-1.636 1.054-1.785 2.05-.07.472-.02.943.14 1.392.358.995 1.233 1.666 2.288 1.765.176.017.355.025.533.025 1.157 0 2.096-.92 2.14-2.072V.01h2.247z" />
							</svg>
						</a>

						{/* Pinterest */}
						<a 
							href="https://pinterest.com" 
							target="_blank" 
							rel="noreferrer" 
							className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#02180f] border border-[#133a2a] text-slate-300 hover:text-white hover:border-[#1e4d38] transition-colors"
						>
							<svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
								<path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.41 7.61 11.162-.102-.947-.195-2.4 0-3.434.195-.83 1.258-5.327 1.258-5.327s-.321-.642-.321-1.593c0-1.493.865-2.607 1.94-2.607.915 0 1.357.687 1.357 1.512 0 .92-.585 2.3-0.887 3.578-.253 1.07.536 1.94 1.59 1.94 1.909 0 3.376-2.01 3.376-4.91 0-2.569-1.846-4.364-4.484-4.364-3.057 0-4.85 2.296-4.85 4.662 0 .924.356 1.917.8 2.449.088.106.1.2.074.307-.08.33-.26 1.056-.296 1.2-.047.195-.157.237-.361.142-1.347-.625-2.19-2.587-2.19-4.162 0-3.39 2.463-6.502 7.103-6.502 3.729 0 6.626 2.658 6.626 6.208 0 3.711-2.338 6.697-5.586 6.697-1.092 0-2.118-.567-2.468-1.238 0 0-.54 2.057-.671 2.562-.244.939-.9 2.115-1.339 2.83 1.12.345 2.3.533 3.528.533 6.621 0 11.988-5.367 11.988-11.991C24.006 5.367 18.638 0 12.017 0z" />
							</svg>
						</a>

					</div>

					{/* Legal Links */}
					<div className="flex flex-wrap items-center gap-6 text-sm font-medium">
						<a href="#accessibility" className="hover:text-white transition-colors">Accessibility</a>
						<a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
						<a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
					</div>

				</div>

				{/* Footer Bottom: Copyright & Selector & Payment Badges */}
				<div className="border-t border-[#133a2a] pt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between text-xs text-[#7da391]">
					
					{/* Copyright */}
					<div>
						© 2026 Zamazor Clean Supplements. All rights reserved.
					</div>

					{/* Right Side Group: Selector & Payment Badges */}
					<div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
						{/* Currency / Country Selector */}
						<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#133a2a] bg-[#02180f] text-slate-300 hover:text-white hover:border-[#1e4d38] transition-colors cursor-pointer w-fit">
							{/* US Flag Icon */}
							<svg className="h-3 w-4 rounded-xs" viewBox="0 0 7410 3900" fill="none" xmlns="http://www.w3.org/2000/svg">
								<rect width="7410" height="3900" fill="#B22234"/>
								<path d="M0 300H7410M0 900H7410M0 1500H7410M0 2100H7410M0 2700H7410M0 3300H7410" stroke="#F4F3F4" strokeWidth="600"/>
								<rect width="2964" height="2100" fill="#3C3B6E"/>
								<g fill="#F4F3F4">
									{/* Stars Grid - simplified mockup of stars */}
									<circle cx="247" cy="175" r="45"/>
									<circle cx="741" cy="175" r="45"/>
									<circle cx="1235" cy="175" r="45"/>
									<circle cx="1729" cy="175" r="45"/>
									<circle cx="2223" cy="175" r="45"/>
									<circle cx="2717" cy="175" r="45"/>
									<circle cx="494" cy="350" r="45"/>
									<circle cx="988" cy="350" r="45"/>
									<circle cx="1482" cy="350" r="45"/>
									<circle cx="1976" cy="350" r="45"/>
									<circle cx="2470" cy="350" r="45"/>
									<circle cx="247" cy="525" r="45"/>
									<circle cx="741" cy="525" r="45"/>
									<circle cx="1235" cy="525" r="45"/>
									<circle cx="1729" cy="525" r="45"/>
									<circle cx="2223" cy="525" r="45"/>
									<circle cx="2717" cy="525" r="45"/>
									<circle cx="494" cy="700" r="45"/>
									<circle cx="988" cy="700" r="45"/>
									<circle cx="1482" cy="700" r="45"/>
									<circle cx="1976" cy="700" r="45"/>
									<circle cx="2470" cy="700" r="45"/>
									<circle cx="247" cy="875" r="45"/>
									<circle cx="741" cy="875" r="45"/>
									<circle cx="1235" cy="875" r="45"/>
									<circle cx="1729" cy="875" r="45"/>
									<circle cx="2223" cy="875" r="45"/>
									<circle cx="2717" cy="875" r="45"/>
									<circle cx="494" cy="1050" r="45"/>
									<circle cx="988" cy="1050" r="45"/>
									<circle cx="1482" cy="1050" r="45"/>
									<circle cx="1976" cy="1050" r="45"/>
									<circle cx="2470" cy="1050" r="45"/>
									<circle cx="247" cy="1225" r="45"/>
									<circle cx="741" cy="1225" r="45"/>
									<circle cx="1235" cy="1225" r="45"/>
									<circle cx="1729" cy="1225" r="45"/>
									<circle cx="2223" cy="1225" r="45"/>
									<circle cx="2717" cy="1225" r="45"/>
									<circle cx="494" cy="1400" r="45"/>
									<circle cx="988" cy="1400" r="45"/>
									<circle cx="1482" cy="1400" r="45"/>
									<circle cx="1976" cy="1400" r="45"/>
									<circle cx="2470" cy="1400" r="45"/>
									<circle cx="247" cy="1575" r="45"/>
									<circle cx="741" cy="1575" r="45"/>
									<circle cx="1235" cy="1575" r="45"/>
									<circle cx="1729" cy="1575" r="45"/>
									<circle cx="2223" cy="1575" r="45"/>
									<circle cx="2717" cy="1575" r="45"/>
									<circle cx="494" cy="1750" r="45"/>
									<circle cx="988" cy="1750" r="45"/>
									<circle cx="1482" cy="1750" r="45"/>
									<circle cx="1976" cy="1750" r="45"/>
									<circle cx="2470" cy="1750" r="45"/>
									<circle cx="247" cy="1925" r="45"/>
									<circle cx="741" cy="1925" r="45"/>
									<circle cx="1235" cy="1925" r="45"/>
									<circle cx="1729" cy="1925" r="45"/>
									<circle cx="2223" cy="1925" r="45"/>
									<circle cx="2717" cy="1925" r="45"/>
								</g>
							</svg>
							<span className="text-xs font-semibold text-slate-300">USD/ EN</span>
							<svg className="h-3 w-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
							</svg>
						</div>

						{/* Payment Badges */}
						<div className="flex items-center gap-2 flex-wrap">
							
							{/* Visa */}
							<div className="h-6 w-9 rounded bg-[#1A1F71] flex items-center justify-center text-[10px] font-black text-white italic tracking-tighter">
								VISA
							</div>

							{/* Mastercard */}
							<div className="h-6 w-9 rounded bg-[#222222] flex items-center justify-center gap-0.5 relative overflow-hidden">
								<div className="w-3.5 h-3.5 rounded-full bg-[#EB001B] opacity-90 absolute left-2"></div>
								<div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-90 absolute right-2"></div>
							</div>

							{/* Amex */}
							<div className="h-6 w-9 rounded bg-[#0185FF] flex flex-col items-center justify-center text-[7px] font-black text-white leading-none">
								<span>AMER</span>
								<span>EXPR</span>
							</div>

							{/* PayPal */}
							<div className="h-6 w-9 rounded bg-[#003087] flex items-center justify-center text-[10px] font-bold text-white italic tracking-tighter">
								Pay<span className="text-[#009cde]">Pal</span>
							</div>

							{/* Diners Club */}
							<div className="h-6 w-9 rounded bg-[#0079C1] flex flex-col items-center justify-center text-[6px] font-black text-white leading-none">
								<span>DINERS</span>
								<span>CLUB</span>
							</div>

							{/* Discover */}
							<div className="h-6 w-9 rounded bg-[#FFFFFF] border border-[#CCCCCC] flex flex-col items-center justify-center text-[7px] font-extrabold text-[#F47521] leading-none">
								<span>DISC</span>
								<span>OVER</span>
							</div>

						</div>
					</div>

				</div>

			</div>
		</footer>
	);
};
