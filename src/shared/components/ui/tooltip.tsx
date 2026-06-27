import React, { useState } from "react";

interface TooltipProps {
	content: string;
	children: React.ReactNode;
}

export const Tooltip = ({ content, children }: TooltipProps) => {
	const [visible, setVisible] = useState(false);

	return (
		<div
			className="relative inline-flex items-center"
			onMouseEnter={() => setVisible(true)}
			onMouseLeave={() => setVisible(false)}
			onFocus={() => setVisible(true)}
			onBlur={() => setVisible(false)}
		>
			{children}
			{visible && (
				<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-[1100] px-2.5 py-1 text-[10px] font-semibold text-white bg-slate-950 rounded-lg shadow-md whitespace-nowrap animate-in fade-in zoom-in-95 duration-100 pointer-events-none">
					{content}
					{/* Small Arrow indicator */}
					<div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-slate-950" />
				</div>
			)}
		</div>
	);
};
