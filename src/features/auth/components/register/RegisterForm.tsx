import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	registerRequestSchema,
	type RegisterRequest,
	type RegisterApiRequest,
} from "../../schemas/registerSchema";
import { PasswordField } from "@/shared/components/fields/PasswordField";
import { EmailField } from "@/shared/components/fields/EmailField";
import { useNavigate, useLocation } from "react-router";
import { authService } from "../../services/authService";
import { isSystemError } from "@/shared/types";
import { APP_ROUTES } from "@/core/routes/paths";
import { notify } from "@/lib/notify";
import { NameField } from "@/shared/components/fields/NameField";
import { BirthDateField } from "@/shared/components/fields/BirthDateField";
import { OriginButton } from "@/shared/components/ui/origin-button";

export const RegisterForm = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const from = location.state?.from;

	const onSubmit = async (data: RegisterRequest) => {
		const parsed = registerRequestSchema.parse(data);
		const formattedDate = parsed.birthDate.toISOString().split("T")[0];
		const payload: RegisterApiRequest = {
			...parsed,
			birthDate: formattedDate,
		};
		const response = await authService.register(payload);
		if (!isSystemError(response)) {
			navigate(APP_ROUTES.AUTH.LOGIN, { state: { from } });
		}
	};

	const onError = () => {
		notify.error("Validation Error", {
			description: "Please fix the errors in the form.",
			requiresInternet: false,
		});
	};

	const {
		register,
		handleSubmit,
		control,
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
				label="Full Name"
				name="name"
				errors={errors}
				register={register}
			/>

			<EmailField
				label="Email"
				name="email"
				errors={errors}
				register={register}
			/>

			<BirthDateField
				label="Birth Date"
				name="birthDate"
				control={control}
				errors={errors}
			/>

			<PasswordField
				label="Password"
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
				{isSubmitting ? "Registering…" : "Register"}
			</OriginButton>

			<p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
				By registering, you agree to our{" "}
				<a href="#terms" className="text-emerald-700 hover:text-emerald-800 dark:text-lime-400 dark:hover:text-lime-300 hover:underline">Terms of Service</a>
				{" "}and{" "}
				<a href="#privacy" className="text-emerald-700 hover:text-emerald-800 dark:text-lime-400 dark:hover:text-lime-300 hover:underline">Privacy Policy</a>.
			</p>
		</form>
	);
};
