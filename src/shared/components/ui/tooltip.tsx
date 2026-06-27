import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
	content: string;
	children: React.ReactNode;
}

export const Tooltip = ({ content, children }: TooltipProps) => {
	const [visible, setVisible] = useState(false);
	const triggerRef = useRef<HTMLDivElement>(null);
	const [coords, setCoords] = useState({ top: 0, left: 0 });

	useEffect(() => {
		const updateCoords = () => {
			if (triggerRef.current) {
				const rect = triggerRef.current.getBoundingClientRect();
				setCoords({
					top: rect.top + window.scrollY - 34, // Centered 34px above trigger top
					left: rect.left + window.scrollX + rect.width / 2,
				});
			}
		};

		if (visible) {
			updateCoords();
			// Listen to scroll events on capture phase to detect nested scroll container offsets
			window.addEventListener("scroll", updateCoords, true);
			window.addEventListener("resize", updateCoords);
		}

		return () => {
			window.removeEventListener("scroll", updateCoords, true);
			window.removeEventListener("resize", updateCoords);
		};
	}, [visible]);

	return (
		<div
			ref={triggerRef}
			className="inline-flex items-center"
			onMouseEnter={() => setVisible(true)}
			onMouseLeave={() => setVisible(false)}
			onFocus={() => setVisible(true)}
			onBlur={() => setVisible(false)}
		>
			{children}
			{visible &&
				createPortal(
					<div
						className="absolute z-[99999] px-2.5 py-1 text-[10px] font-semibold text-white bg-slate-950 rounded-lg shadow-md whitespace-nowrap animate-in fade-in zoom-in-95 duration-100 pointer-events-none -translate-x-1/2"
						style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
					>
						{content}
						{/* Small Arrow indicator */}
						<div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-slate-950" />
					</div>,
					document.body
				)}
		</div>
	);
};
