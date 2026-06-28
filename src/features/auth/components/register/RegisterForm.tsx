import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	registerRequestSchema,
	type RegisterRequest,
} from "../../schemas/registerSchema";
import { PasswordField } from "@/shared/components/fields/PasswordField";
import { EmailField } from "@/shared/components/fields/EmailField";
import { useNavigate, useLocation } from "react-router";
import { authService } from "../../services/authService";
import { isSystemError } from "@/shared/types";
import { APP_ROUTES } from "@/core/routes/paths";
import { notify } from "@/lib/notify";
import { NameField } from "@/shared/components/fields/NameField";
import { OriginButton } from "@/shared/components/ui/origin-button";
import { useLanguage } from "@/shared/context/LanguageContext";

export const RegisterForm = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { language } = useLanguage();
	const from = location.state?.from;

	const onSubmit = async (data: RegisterRequest) => {
		const payload = registerRequestSchema.parse(data);
		const response = await authService.register(payload);
		if (!isSystemError(response)) {
			navigate(APP_ROUTES.AUTH.LOGIN, { state: { from } });
		}
	};

	const onError = () => {
		notify.error(language === "fr" ? "Erreur de validation" : "Validation Error", {
			description: language === "fr" ? "Veuillez corriger les erreurs dans le formulaire." : "Please fix the errors in the form.",
			requiresInternet: false,
		});
	};

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isDirty },
	} = useForm({
		resolver: zodResolver(registerRequestSchema),
	});

	return (
		<form
			onSubmit={handleSubmit(onSubmit, onError)}
			noValidate
			className="space-y-4"
		>
			<NameField
				label={language === "fr" ? "Nom complet" : "Full Name"}
				name="fullName"
				errors={errors}
				register={register}
			/>

			<EmailField
				label={language === "fr" ? "Adresse e-mail" : "Email"}
				name="email"
				errors={errors}
				register={register}
			/>

			<PasswordField
				label={language === "fr" ? "Mot de passe" : "Password"}
				name="password"
				autoComplete="new-password"
				errors={errors}
				register={register}
			/>

			<OriginButton
				type="submit"
				variant="emerald"
				loading={isSubmitting}
				disabled={!isDirty}
				className="w-full flex justify-center rounded-lg font-semibold"
			>
				{isSubmitting 
					? (language === "fr" ? "Inscription en cours…" : "Registering…") 
					: (language === "fr" ? "S'inscrire" : "Register")}
			</OriginButton>

			<p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
				{language === "fr" ? "En vous inscrivant, vous acceptez nos " : "By registering, you agree to our "}
				<a href="#terms" className="text-emerald-700 hover:text-emerald-800 dark:text-lime-400 dark:hover:text-lime-300 hover:underline">
					{language === "fr" ? "Conditions d'utilisation" : "Terms of Service"}
				</a>
				{language === "fr" ? " et notre " : " and "}
				<a href="#privacy" className="text-emerald-700 hover:text-emerald-800 dark:text-lime-400 dark:hover:text-lime-300 hover:underline">
					{language === "fr" ? "Politique de confidentialité" : "Privacy Policy"}
				</a>.
			</p>
		</form>
	);
};
