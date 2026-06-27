import { Input } from "@/shared/components/ui/input";
import { useId, useState } from "react";
import type {
	FieldErrors,
	FieldValues,
	Path,
	UseFormRegister,
} from "react-hook-form";
import { EyeIcon, EyeOffIcon, Lock } from "lucide-react";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";

interface FieldProps<T extends FieldValues> {
	name: Path<T>;
	label: string;
	placeholder?: string;
	autoComplete?: "current-password" | "new-password";
	register: UseFormRegister<T>;
	errors: FieldErrors<T>;
}

export const PasswordField = <T extends FieldValues>({
	name,
	label,
	placeholder = "secret1234@",
	autoComplete = "current-password",
	register,
	errors,
}: FieldProps<T>) => {
	const [showPassword, setShowPassword] = useState(false);
	const baseId = useId();

	const inputId = `${baseId}-${name}`;
	const errorId = `${baseId}-${name}-error`;
	const fieldError = errors[name];

	return (
		<Field className="space-y-2">
			<FieldLabel htmlFor={inputId} className="block text-sm/6 font-medium">
				{label}
			</FieldLabel>
			<div className="relative">
				<Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
				<Input
					id={inputId}
					{...register(name)}
					type={showPassword ? "text" : "password"}
					placeholder={placeholder}
					autoComplete={autoComplete}
					aria-invalid={!!fieldError}
					aria-required="true"
					aria-describedby={fieldError ? errorId : undefined}
					className="pl-10 pr-10"
				/>
				<button
					type="button"
					onClick={() => setShowPassword(!showPassword)}
					aria-label={
						showPassword
							? `Hide ${label.toLowerCase()}`
							: `Show ${label.toLowerCase()}`
					}
					className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center justify-center rounded-md p-1 transition-colors hover:bg-gray-200/50 text-muted-foreground"
				>
					{showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
				</button>
			</div>

			{fieldError && (
				<FieldError id={errorId}>{fieldError.message as string}</FieldError>
			)}
		</Field>
	);
};
