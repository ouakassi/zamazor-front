import { Input } from "@/shared/components/ui/input";
import { useId } from "react";
import type {
	FieldErrors,
	FieldValues,
	Path,
	UseFormRegister,
} from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/shared/components/ui/field";

interface NameFieldProps<T extends FieldValues> {
	name: Path<T>;
	label: string;
	register: UseFormRegister<T>;
	errors: FieldErrors<T>;
	placeholder?: string;
	autoComplete?: "name" | "family-name" | "given-name";
}

export const NameField = <T extends FieldValues>({
	name,
	label,
	register,
	errors,
	placeholder = "John Doe",
	autoComplete = "name",
}: NameFieldProps<T>) => {
	const baseId = useId();

	const inputId = `${baseId}-${String(name)}`;
	const errorId = `${baseId}-${String(name)}-error`;
	const fieldError = errors[name];

	return (
		<Field className="space-y-2">
			<FieldLabel htmlFor={inputId} className="block text-sm/6 font-medium">
				{label}
			</FieldLabel>
			<Input
				id={inputId}
				{...register(name)}
				type="text"
				placeholder={placeholder}
				autoComplete={autoComplete}
				aria-invalid={!!fieldError}
				aria-required="true"
				aria-describedby={fieldError ? errorId : undefined}
			/>

			{fieldError && (
				<FieldError id={errorId}>{fieldError.message as string}</FieldError>
			)}
		</Field>
	);
};
