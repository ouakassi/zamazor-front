import "./assets/styles/App.css";
import router from "./core/routes/router";
import { Toaster } from "sonner";
import { RouterProvider } from "react-router";
import { useEffect, useRef } from "react";
import { userService } from "./features/auth/services/usersService";
import { LanguageProvider } from "./shared/context/LanguageContext";
import { tokenManager } from "./features/auth/globals/tokenManager";
import { useBookmarkStore } from "./features/products/stores/bookmarkStore";

function App() {
	const didBootstrapRef = useRef(false);

	useEffect(() => {
		if (didBootstrapRef.current) {
			return;
		}

		didBootstrapRef.current = true;

		const bootstrap = async () => {
			const syncCommerceState = !window.location.pathname.startsWith("/dashboard");
			await userService.fetchCurrentUser({ syncCommerceState });
			if (syncCommerceState && tokenManager.getAccessToken()) {
				await useBookmarkStore.getState().syncWishlists();
			}
		};

		void bootstrap();
	}, []);

	return (
		<LanguageProvider>
			<RouterProvider router={router} />
			<Toaster position="bottom-left" />
		</LanguageProvider>
	);
}

export default App;
