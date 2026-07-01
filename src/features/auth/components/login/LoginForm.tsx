import { OriginButton } from "@/shared/components/ui/origin-button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	loginRequestSchema,
	type LoginRequest,
} from "../../schemas/loginSchema";
import { EmailField } from "../../../../shared/components/fields/EmailField";
import { PasswordField } from "../../../../shared/components/fields/PasswordField";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { APP_ROUTES } from "@/core/routes/paths";
import { authService } from "../../services/authService";
import { isSystemError } from "@/shared/types";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuthStore } from "../../stores/authStore";

export const LoginForm = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { language } = useLanguage();
	const from = location.state?.from?.pathname || APP_ROUTES.HOME;

	const getLoginErrorMessage = (response: unknown) => {
		if (!isSystemError(response)) {
			return language === "fr"
				? "Impossible de se connecter."
				: "Unable to sign in.";
		}

		if (response.status === 401) {
			return language === "fr"
				? "Adresse e-mail ou mot de passe incorrect."
				: "Incorrect email or password.";
		}

		if (response.status === 403) {
			return language === "fr"
				? "Votre accès est refusé."
				: "Your access is denied.";
		}

		if (response.status === 429) {
			return language === "fr"
				? "Trop de tentatives. Veuillez réessayer plus tard."
				: "Too many attempts. Please try again later.";
		}

		return (
			response.description ||
			response.title ||
			(language === "fr" ? "Connexion impossible." : "Login failed.")
		);
	};

	const onSubmit = async (data: LoginRequest) => {
		const response = await authService.login(data);
		if (isSystemError(response)) {
			setError("root", {
				type: "server",
				message: getLoginErrorMessage(response),
			});
			return;
		} else {
			const user = useAuthStore.getState().user;
			if (user?.role === "ADMIN") {
				navigate(APP_ROUTES.DASHBOARD, { replace: true });
			} else {
				navigate(from, { replace: true });
			}
		}
	};

	const {
		register,
		handleSubmit,
		setError,
		clearErrors,
		formState: { errors, isSubmitting, isDirty },
	} = useForm({
		resolver: zodResolver(loginRequestSchema),
	});

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			noValidate
			className="space-y-6"
		>
			<EmailField
				name="email"
				label={language === "fr" ? "Adresse e-mail" : "Email"}
				register={register}
				errors={errors}
			/>
			<PasswordField
				name="password"
				label={language === "fr" ? "Mot de passe" : "Password"}
				register={register}
				errors={errors}
			/>

			{errors.root?.message && (
				<p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
					{errors.root.message}
				</p>
			)}

			<OriginButton
				type="submit"
				variant="emerald"
				loading={isSubmitting}
				disabled={!isDirty}
				onClick={() => clearErrors("root")}
				className="w-full flex justify-center rounded-lg font-semibold"
			>
				{isSubmitting
					? language === "fr"
						? "Connexion en cours…"
						: "Signing in…"
					: language === "fr"
						? "Se connecter"
						: "Sign in"}
			</OriginButton>
		</form>
	);
};
