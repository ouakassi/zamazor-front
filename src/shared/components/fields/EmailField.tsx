import { Input } from "@/shared/components/ui/input";
import { useId } from "react";
import type {
	FieldErrors,
	FieldValues,
	Path,
	UseFormRegister,
} from "react-hook-form";
import { Mail } from "lucide-react";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";

interface FieldProps<T extends FieldValues> {
	name: Path<T>;
	label: string;
	register: UseFormRegister<T>;
	errors: FieldErrors<T>;
	placeholder?: string;
}

export const EmailField = <T extends FieldValues>({
	name,
	label,
	register,
	errors,
	placeholder = "john@doe.com",
}: FieldProps<T>) => {
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
				<Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
				<Input
					id={inputId}
					{...register(name)}
					type="email"
					placeholder={placeholder}
					autoComplete="email"
					aria-invalid={!!fieldError}
					aria-required="true"
					aria-describedby={fieldError ? errorId : undefined}
					className="pl-10"
				/>
			</div>

			{fieldError && (
				<FieldError id={errorId}>{fieldError.message as string}</FieldError>
			)}
		</Field>
	);
};
