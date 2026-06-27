import "./assets/styles/App.css";
import router from "./core/routes/router";
import { Toaster } from "sonner";
import { RouterProvider } from "react-router";
import { useEffect } from "react";
import { userService } from "./features/auth/services/usersService";

function App() {
	useEffect(() => {
		userService.fetchCurrentUser();
	}, []);

	return (
		<>
			<RouterProvider router={router} />
			<Toaster position="bottom-left" />
		</>
	);
}

export default App;
