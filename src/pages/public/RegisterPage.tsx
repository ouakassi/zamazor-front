import CONFIG from "@/core/config/constants";
import { LoginLink } from "@/features/auth/components/register/LoginLink";
import { RegisterForm } from "@/features/auth/components/register/RegisterForm";
import { Separator } from "@/features/auth/components/Separator";
import { LoginWithThirdParties } from "@/features/auth/components/ThirdParties";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";

export const RegisterPage = () => {
	useDocumentTitle(`Register | ${CONFIG.APP_NAME}`);

	return (
		<div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
			<div className="text-center sm:mx-auto sm:w-full sm:max-w-sm">
				<h1 className="mt-5 text-2xl/9 font-bold tracking-tight text-gray-800">
					Create Your Account
				</h1>
				<p className="mb-8 text-gray-500">
					Create your account—your brand journey starts here.
				</p>
			</div>
			<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-120">
				<div className="border-slate-800 bg-white px-6 py-12 shadow shadow-gray-300 sm:rounded-lg sm:px-12 dark:border dark:bg-gray-900 dark:shadow-gray-800/50">
					<div className="sm:mx-auto sm:w-full sm:max-w-sm">
						<RegisterForm />
						<Separator />
						<LoginWithThirdParties />
					</div>
				</div>
			</div>
			<LoginLink />
		</div>
	);
};
