import { APP_ROUTES } from "@/core/routes/paths";
import { Link, useLocation } from "react-router";

export const RegisterLink = () => {
	const location = useLocation();
	const from = location.state?.from;

	return (
		<p className="mt-10 text-center text-sm/6 text-gray-500 dark:text-gray-400">
			Don&apos;t have an account?
			<Link
				to={APP_ROUTES.AUTH.REGISTER}
				state={{ from }}
				className="ms-1 font-semibold text-emerald-700 hover:text-emerald-800 dark:text-lime-400 dark:hover:text-lime-300 hover:underline"
			>
				Register
			</Link>
		</p>
	);
};
