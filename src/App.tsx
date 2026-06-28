import "./assets/styles/App.css";
import router from "./core/routes/router";
import { Toaster } from "sonner";
import { RouterProvider } from "react-router";
import { useEffect } from "react";
import { userService } from "./features/auth/services/usersService";
import { tokenManager } from "./features/auth/globals/tokenManager";
import { useAuthStore } from "./features/auth/stores/authStore";
import { AuthStatus } from "./features/auth/types";
import { LanguageProvider } from "./shared/context/LanguageContext";

function App() {
	useEffect(() => {
		const token = tokenManager.getAccessToken();
		if (token) {
			userService.fetchCurrentUser();
		} else {
			useAuthStore.setState({ status: AuthStatus.Unauthenticated });
		}
	}, []);

	return (
		<LanguageProvider>
			<RouterProvider router={router} />
			<Toaster position="bottom-left" />
		</LanguageProvider>
	);
}

export default App;
