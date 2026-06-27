import { OriginButton } from "@/shared/components/ui/origin-button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	loginRequestSchema,
	type LoginRequest,
} from "../../schemas/loginSchema";
import { EmailField } from "../../../../shared/components/fields/EmailField";
import { PasswordField } from "../../../../shared/components/fields/PasswordField";
import { useForm } from "react-hook-form";
import { CheckboxField } from "@/shared/components/fields/CheckBoxField";
import { useLocation, useNavigate } from "react-router";
import { APP_ROUTES } from "@/core/routes/paths";
import { authService } from "../../services/authService";
import { isSystemError } from "@/shared/types";
import { notify } from "@/lib/notify";

import { useAuthStore } from "../../stores/authStore";

export const LoginForm = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const from = location.state?.from?.pathname || APP_ROUTES.HOME;

	const onSubmit = async (data: LoginRequest) => {
		const payload = loginRequestSchema.parse(data);
		const response = await authService.login(payload);
		if (isSystemError(response)) {
			if (response.code === "REQUEST_CANCELLED") return;
		} else {
			const user = useAuthStore.getState().user;
			if (user?.role === "ADMIN") {
				navigate(APP_ROUTES.DASHBOARD, { replace: true });
			} else {
				navigate(from, { replace: true });
			}
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
		formState: { errors, isSubmitting, isDirty },
	} = useForm({
		resolver: zodResolver(loginRequestSchema),
	});

	return (
		<form
			onSubmit={handleSubmit(onSubmit, onError)}
			noValidate
			className="space-y-6"
		>
			<EmailField
				name="email"
				label="Email"
				register={register}
				errors={errors}
			/>
			<PasswordField
				name="password"
				label="Password"
				register={register}
				errors={errors}
			/>

			<div className="flex items-center justify-between gap-4 py-1">
				<CheckboxField
					label="Remember me"
					name="remember"
					errors={errors}
					register={register}
				/>
				<button
					type="button"
					className="shrink-0 text-sm font-medium text-emerald-700 hover:text-emerald-800 dark:text-lime-400 dark:hover:text-lime-300 hover:underline outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
				>
					Forgot password?
				</button>
			</div>
			<OriginButton
				type="submit"
				variant="emerald"
				loading={isSubmitting}
				disabled={!isDirty}
				className="w-full flex justify-center rounded-lg font-semibold"
			>
				{isSubmitting ? "Signing in…" : "Sign in"}
			</OriginButton>
		</form>
	);
};
