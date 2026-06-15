import { createBrowserRouter } from "react-router";

import { APP_ROUTES } from "./paths";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import NotFound from "@/pages/NotFound";

const router = createBrowserRouter([
	{
		path: APP_ROUTES.AUTH.LOGIN,
		element: <h3 className="text-3xl font-bold">Log In Page</h3>,
	},
	{
		element: <RequireAuth />,
		children: [
			{
				path: APP_ROUTES.HOME,
				element: (
					<div className="flex min-h-screen items-center justify-center bg-background text-foreground antialiased font-sans">
						<div className="text-center space-y-2">
							<h1 className="text-3xl font-extrabold tracking-tight">
								Zamazor Clean Base
							</h1>
							<p className="text-muted-foreground text-sm">
								React Router, Axios, and Shadcn/UI are fully configured.
							</p>
						</div>
					</div>
				),
			},
		],
	},
	{
		path: APP_ROUTES.NOT_FOUND,
		element: <NotFound />,
	},
]);

export default router;
