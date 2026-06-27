import { useEffect, useRef } from "react";
import { Outlet } from "react-router";
import { Header } from "@/shared/components/Header";
import { Footer } from "@/shared/components/Footer";
import { FloatingQuizButton } from "@/shared/components/FloatingQuizButton";

export const MainLayout = () => {
	const headerRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const handleResize = () => {
			if (headerRef.current) {
				const rect = headerRef.current.getBoundingClientRect();
				const style = window.getComputedStyle(headerRef.current);
				const marginTop = parseFloat(style.marginTop) || 0;
				const totalHeight = rect.height + marginTop;
				document.documentElement.style.setProperty(
					"--header-height",
					`${totalHeight}px`
				);
			}
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<div className="min-h-screen bg-[#f7fbf3] text-slate-950 selection:bg-emerald-100 flex flex-col justify-between">
			<div>
				

				<Header ref={headerRef} />

				<Outlet />
			</div>

			<Footer />
			<FloatingQuizButton />
		</div>
	);
};
