import CONFIG from "@/core/config/constants";
import { LoginForm } from "@/features/auth/components/login/LoginForm";
import { RegisterLink } from "@/features/auth/components/login/RegisterLink";
import { Separator } from "@/features/auth/components/Separator";
import { LoginWithThirdParties } from "@/features/auth/components/ThirdParties";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";

const LoginPage = () => {
	useDocumentTitle(`Login | ${CONFIG.APP_NAME}`);

	return (
		<>
			<main className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
				<div className="sm:mx-auto sm:w-full sm:max-w-sm">
					<h1 className="mt-5 text-center text-2xl/9 font-bold tracking-tight text-gray-800">
						Sign In To Your Account
					</h1>
				</div>
				<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-120">
					<div className="border-slate-800 bg-white px-6 py-12 shadow shadow-gray-300 sm:rounded-lg sm:px-12 dark:border dark:bg-gray-900 dark:shadow-gray-800/50">
						<div className="sm:mx-auto sm:w-full sm:max-w-sm">
							<LoginForm />
							<Separator />
							<LoginWithThirdParties />
						</div>
					</div>
				</div>
				<RegisterLink />
			</main>
		</>
	);
};

export default LoginPage;
