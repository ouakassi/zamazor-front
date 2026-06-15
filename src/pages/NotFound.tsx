import { Button } from "@/shared/components/ui/button";
import { ArrowLeftIcon, HomeIcon } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";
import { useMemo } from "react";
import CONFIG from "@/core/config/constants";
import { APP_ROUTES } from "@/core/routes/paths";

export default function NotFound() {
	const navigate = useNavigate();
	const title = useMemo(
		() => `404 Error - Page Missing | ${CONFIG.APP_NAME}`,
		[],
	);
	useDocumentTitle(title);

	return (
		<main className="grid h-svh min-h-full w-screen place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8 dark:bg-gray-900">
			<div className="text-center">
				<p className="text-7xl font-semibold text-blue-500">404</p>

				<h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
					Page not found
				</h1>

				<p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-400">
					Sorry, we couldn’t find the page you’re looking for.
				</p>

				<div className="mt-10 flex items-center justify-center gap-x-6">
					<div>
						<Button asChild>
							<Link to={APP_ROUTES.HOME}>
								<HomeIcon
									className="-ms-1 opacity-60"
									size={16}
									aria-hidden="true"
								/>
								Go back home
							</Link>
						</Button>
					</div>
					<div>
						<Button
							variant="outline"
							className="group cursor-pointer"
							onClick={() => navigate(-1)}
						>
							<ArrowLeftIcon
								className="-ms-1 opacity-60 transition-transform group-hover:-translate-x-0.5"
								size={16}
								aria-hidden="true"
							/>
							Go back
						</Button>
					</div>
				</div>
			</div>
		</main>
	);
}
