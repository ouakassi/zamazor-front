import { useEffect } from "react";
import { useLocation } from "react-router";

export const useScrollToTop = () => {
	const { pathname, hash } = useLocation();

	useEffect(() => {
		if (hash) {
			const id = hash.replace("#", "");
			const element = document.getElementById(id);
			if (element) {
				element.scrollIntoView({ behavior: "smooth" });
			} else {
				// Fallback if element is not in DOM yet
				const timer = setTimeout(() => {
					const el = document.getElementById(id);
					if (el) el.scrollIntoView({ behavior: "smooth" });
				}, 100);
				return () => clearTimeout(timer);
			}
		} else {
			window.scrollTo(0, 0);
		}
	}, [pathname, hash]);
};
