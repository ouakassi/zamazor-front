import { Button } from "@/shared/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	registerRequestSchema,
	type RegisterRequest,
} from "../../schemas/registerSchema";
import { PasswordField } from "@/shared/components/fields/PasswordField";
import { EmailField } from "@/shared/components/fields/EmailField";
import { useNavigate } from "react-router";
import { authService } from "../../services/authService";
import { isSystemError } from "@/shared/types";
import { APP_ROUTES } from "@/core/routes/paths";
import { notify } from "@/lib/notify";
import { BirthDateField } from "@/shared/components/fields/BirthDateField";
import { CheckboxField } from "@/shared/components/fields/CheckBoxField";
import { NameField } from "@/shared/components/fields/NameField";

export const RegisterForm = () => {
	const navigate = useNavigate();

	const onSubmit = async (data: RegisterRequest) => {
		const payload = registerRequestSchema.parse(data);
		const response = await authService.register(payload);
		if (!isSystemError(response)) {
			navigate(APP_ROUTES.AUTH.LOGIN);
		}
	};

	const onError = () => {
		notify.error("Validation Error", {
			description: "Please fix the errors in the form.",
			requiresInternet: false,
		});
		console.log(errors);
	};

	const {
		control,
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

			<PasswordField
				label="Password"
				name="password"
				autoComplete="new-password"
				errors={errors}
				register={register}
			/>

			<PasswordField
				label="Confirm Password"
				name="passwordConfirm"
				autoComplete="new-password"
				errors={errors}
				register={register}
			/>

			<BirthDateField
				label="Birth Date"
				name="birthDate"
				errors={errors}
				control={control}
			/>

			<CheckboxField
				label="Accept Conditions"
				name="conditions"
				errors={errors}
				register={register}
			/>

			<Button
				type="submit"
				disabled={isSubmitting || !isDirty}
				className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
			>
				{isSubmitting ? "Registering..." : "Register"}
			</Button>
		</form>
	);
};
