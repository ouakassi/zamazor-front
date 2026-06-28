import { useState } from "react";
import { Sparkles } from "lucide-react";
import { QuizModal } from "./QuizModal";

export const FloatingQuizButton = () => {
	const [open, setOpen] = useState(false);

	return (
		<>
			{/* Floating Button */}
			<div className="fixed bottom-6 right-6 z-[9998] flex flex-col items-end gap-2 group">
				{/* Tooltip label */}
				<div className="hidden group-hover:flex items-center gap-2 bg-emerald-950 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap transition-all">
					<Sparkles className="size-3 text-lime-300" />
					Supplement Advisor Quiz
				</div>
				<button
					onClick={() => setOpen(true)}
					aria-label="Open Supplement Advisor Quiz"
					className="relative flex items-center justify-center size-14 rounded-full bg-emerald-900 hover:bg-emerald-950 text-white shadow-xl shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border-2 border-emerald-700/30"
				>
					{/* Ping animation ring */}
					<span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
					<Sparkles className="size-6 relative z-10" />
				</button>
			</div>

			{/* Modal */}
			{open && <QuizModal onClose={() => setOpen(false)} />}
		</>
	);
};
