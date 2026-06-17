import { APP_ROUTES } from "@/core/routes/paths";
import { Link } from "react-router";

export const LoginLink = () => {
	return (
		<p className="mt-10 text-center text-sm/6 text-gray-500">
			Already have an account?
			<Link
				to={APP_ROUTES.AUTH.LOGIN}
				className="ms-1 font-semibold text-blue-600 hover:text-blue-500"
			>
				Sign in
			</Link>
		</p>
	);
};
