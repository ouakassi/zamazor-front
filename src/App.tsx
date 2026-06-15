import "./assets/styles/App.css";
import router from "./core/routes/router";
import { Toaster } from "sonner";
import { RouterProvider } from "react-router";

function App() {
	return (
		<>
			<RouterProvider router={router} />
			<Toaster position="bottom-left" />
		</>
	);
}

export default App;
