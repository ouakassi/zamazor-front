import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { useProductStore } from "@/features/products/stores/productStore";
import { useCartStore } from "@/shared/hooks/use-cart-store";
import { toast } from "sonner";
import {
	Brain,
	Dumbbell,
	HeartPulse,
	Leaf,
	Moon,
	ShoppingBag,
	X,
	Zap,
} from "lucide-react";

type QuizStep = "intro" | "focus" | "diet" | "activity" | "result";
type QuizFocus = "performance" | "greens" | "wellness" | "energy" | "recovery" | "";
interface QuizModalProps {
	onClose: () => void;
}

export const QuizModal = ({ onClose }: QuizModalProps) => {
	const navigate = useNavigate();
	const addItem = useCartStore((state) => state.addItem);
	const { products: storeProducts, fetchProducts } = useProductStore();

	useEffect(() => { fetchProducts(); }, [fetchProducts]);

	const [quizStep, setQuizStep] = useState<QuizStep>("intro");
	const [quizFocus, setQuizFocus] = useState<QuizFocus>("");
	const [quizDiet, setQuizDiet] = useState<string>("vegan");
	const backdropRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [onClose]);

	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => { document.body.style.overflow = ""; };
	}, []);

	const recommendedProduct = useMemo(() => {
		if (storeProducts.length === 0 || !quizFocus) return null;
		const map: Record<string, string> = {
			performance: "Protein", greens: "Greens", wellness: "Wellness",
			energy: "Energy", recovery: "Recovery",
		};
		return storeProducts.find((p) => p.category === map[quizFocus]) || storeProducts[0];
	}, [storeProducts, quizFocus]);

	const resetQuiz = () => {
		setQuizStep("intro");
		setQuizFocus("");
		setQuizDiet("vegan");
	};

	return (
		<div
			ref={backdropRef}
			onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
			className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
			role="dialog"
			aria-modal="true"
		>
			<div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-emerald-50/95 to-lime-50/60 border border-emerald-900/10 rounded-3xl shadow-2xl p-6 sm:p-10">
				<button
					onClick={onClose}
					className="absolute top-4 right-4 size-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm z-10"
					aria-label="Close quiz"
				>
					<X className="size-4" />
				</button>

				<div className="text-center mb-8">
					<span className="text-xs font-black uppercase tracking-widest text-emerald-800">Smart Supplement Finder</span>
					<h2 className="mt-2 text-2xl font-playfair font-normal text-slate-950">Discover your personalized organic stack.</h2>
					<p className="mt-2 text-sm text-slate-500">30-second science-backed quiz</p>
				</div>

				{quizStep === "intro" && (
					<div className="flex flex-col items-center justify-center text-center py-6">
						<Brain className="size-14 text-emerald-800 mb-5 animate-pulse" />
						<h3 className="text-xl font-playfair text-slate-950 font-normal">Find Your Clean Formula Match</h3>
						<p className="text-slate-500 text-sm max-w-sm mt-3 leading-relaxed">Answer three quick questions about your health focus, diet, and activity level.</p>
						<Button onClick={() => setQuizStep("focus")} className="mt-8 bg-emerald-900 hover:bg-emerald-950 text-white font-bold h-12 px-8 rounded-full cursor-pointer">
							Start Advisor Quiz &rarr;
						</Button>
					</div>
				)}

				{quizStep === "focus" && (
					<div className="space-y-6">
						<div>
							<span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Step 1 of 3</span>
							<h3 className="text-xl font-playfair text-slate-950 font-normal mt-1">What is your primary wellness or fitness focus?</h3>
						</div>
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{[
								{ id: "performance", label: "Muscle Growth & Strength", icon: Dumbbell, desc: "Premium organic proteins" },
								{ id: "greens", label: "Daily Micronutrients", icon: Leaf, desc: "Raw active supergreens" },
								{ id: "energy", label: "Natural Stamina & Focus", icon: Zap, desc: "Clean pre-workout spark" },
								{ id: "recovery", label: "Muscle Repair & Sleep", icon: Moon, desc: "Organic recovery BCAAs" },
								{ id: "wellness", label: "Immunity & Longevity", icon: HeartPulse, desc: "Adaptogen calm extracts" },
							].map((opt) => (
								<button
									key={opt.id}
									onClick={() => { setQuizFocus(opt.id as QuizFocus); setQuizStep("diet"); }}
									className="p-4 bg-white rounded-2xl border border-emerald-900/10 hover:border-emerald-700 hover:bg-emerald-50/20 text-left transition-all duration-150 cursor-pointer group shadow-sm hover:shadow-md"
								>
									<opt.icon className="size-6 text-emerald-800 mb-3 group-hover:scale-110 transition-transform" />
									<p className="text-sm font-bold text-slate-900 leading-tight">{opt.label}</p>
									<p className="text-[11px] text-slate-400 mt-1">{opt.desc}</p>
								</button>
							))}
						</div>
					</div>
				)}

				{quizStep === "diet" && (
					<div className="space-y-6">
						<div>
							<span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Step 2 of 3</span>
							<h3 className="text-xl font-playfair text-slate-950 font-normal mt-1">Select your primary dietary preference:</h3>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							{[
								{ id: "vegan", label: "Vegan / Plant-Based Only", desc: "No dairy or animal derivatives" },
								{ id: "organic", label: "Organic & Non-GMO First", desc: "Purest certified organic raw crops" },
								{ id: "keto", label: "Keto / Low-Carb Friendly", desc: "Sugar-free keto fats & minerals" },
								{ id: "glutenFree", label: "Gluten & Soy Free", desc: "Safe allergen-conscious blends" },
							].map((opt) => (
								<button
									key={opt.id}
									onClick={() => { setQuizDiet(opt.id); setQuizStep("activity"); }}
									className={cn(
										"p-4 rounded-2xl border text-left transition-all duration-150 cursor-pointer shadow-sm",
										quizDiet === opt.id ? "bg-emerald-900 border-emerald-900" : "bg-white border-emerald-900/10 hover:border-emerald-700 hover:bg-emerald-50/20"
									)}
								>
									<p className={cn("text-sm font-bold leading-tight", quizDiet === opt.id ? "text-white" : "text-slate-900")}>{opt.label}</p>
									<p className={cn("text-[11px] mt-1", quizDiet === opt.id ? "text-emerald-100" : "text-slate-400")}>{opt.desc}</p>
								</button>
							))}
						</div>
						<Button variant="ghost" onClick={() => setQuizStep("focus")} className="text-emerald-900 hover:bg-emerald-50 rounded-xl cursor-pointer">&larr; Back</Button>
					</div>
				)}

				{quizStep === "activity" && (
					<div className="space-y-6">
						<div>
							<span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Step 3 of 3</span>
							<h3 className="text-xl font-playfair text-slate-950 font-normal mt-1">What is your current physical activity level?</h3>
						</div>
						<div className="grid gap-3 sm:grid-cols-3">
							{[
								{ id: "sedentary", label: "Light Active", desc: "1-2 short sessions/week" },
								{ id: "moderate", label: "Moderately Active", desc: "3-4 standard workouts/week" },
								{ id: "intense", label: "Extremely Active", desc: "5+ high intensity workouts/week" },
							].map((opt) => (
								<button
									key={opt.id}
									onClick={() => { setQuizStep("result"); }}
									className="p-4 bg-white rounded-2xl border border-emerald-900/10 hover:border-emerald-700 hover:bg-emerald-50/20 text-left transition-all duration-150 cursor-pointer shadow-sm group"
								>
									<p className="text-sm font-bold text-slate-900 leading-tight group-hover:text-emerald-800 transition-colors">{opt.label}</p>
									<p className="text-[11px] text-slate-400 mt-1.5">{opt.desc}</p>
								</button>
							))}
						</div>
						<Button variant="ghost" onClick={() => setQuizStep("diet")} className="text-emerald-900 hover:bg-emerald-50 rounded-xl cursor-pointer">&larr; Back</Button>
					</div>
				)}

				{quizStep === "result" && recommendedProduct && (
					<div className="space-y-6">
						<div>
							<span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Your Recommendation</span>
							<h3 className="text-xl font-playfair text-slate-950 font-normal mt-1">Here is your personalized clean formula match:</h3>
						</div>
						<div className="flex flex-col md:flex-row gap-6 p-4 sm:p-6 bg-white rounded-2xl border border-emerald-900/10 shadow-md">
							<div className="size-28 sm:size-36 shrink-0 bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center justify-center mx-auto md:mx-0">
								<img src={recommendedProduct.image} alt={recommendedProduct.name} className="h-full object-contain" />
							</div>
							<div className="flex-1 text-center md:text-left flex flex-col justify-between">
								<div>
									<span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider bg-emerald-50 border border-emerald-900/5 px-2.5 py-0.5 rounded-full inline-block">
										{recommendedProduct.category}
									</span>
									<h4 className="text-xl font-playfair font-bold text-slate-950 mt-1.5">{recommendedProduct.name}</h4>
									<p className="text-xs text-slate-500 mt-2 leading-relaxed">
										Based on your wellness goals for <strong className="text-emerald-950">{quizFocus}</strong> and active schedule, this premium clean formula delivers bioavailable nourishment with zero synthetics.
									</p>
								</div>
								<div className="mt-4 flex items-center justify-between flex-wrap gap-2 border-t border-slate-100 pt-3">
									<span className="text-lg font-black text-slate-900">{recommendedProduct.price}</span>
									<div className="flex gap-2 w-full sm:w-auto">
										<Button
											onClick={() => { addItem(recommendedProduct); toast.success(`${recommendedProduct.name} added to cart!`); }}
											className="flex-1 sm:flex-initial h-10 px-5 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
										>
											<ShoppingBag className="size-3.5" />
											Add to Cart
										</Button>
										<Button
											variant="outline"
											onClick={() => { navigate(`/product/${recommendedProduct.id}`); onClose(); }}
											className="h-10 px-4 rounded-xl border-emerald-900/15 text-emerald-800 hover:bg-emerald-50 cursor-pointer"
										>
											Details
										</Button>
									</div>
								</div>
							</div>
						</div>
						<div className="flex justify-end pt-2">
							<Button variant="ghost" onClick={resetQuiz} className="text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer text-xs font-bold uppercase tracking-wider">
								Retake Quiz &larr;
							</Button>
						</div>
					</div>
				)}

				{quizStep === "result" && !recommendedProduct && (
					<div className="text-center py-10">
						<p className="text-slate-500 text-sm">No products loaded yet. Please try again shortly.</p>
						<Button variant="ghost" onClick={resetQuiz} className="mt-4 cursor-pointer">Retake Quiz</Button>
					</div>
				)}
			</div>
		</div>
	);
};
