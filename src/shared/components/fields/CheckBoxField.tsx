import { useId } from "react";
import type {
	FieldErrors,
	FieldValues,
	Path,
	UseFormRegister,
} from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/shared/components/ui/field";

interface CheckboxFieldProps<T extends FieldValues> {
	name: Path<T>;
	label: string;
	register: UseFormRegister<T>;
	errors: FieldErrors<T>;
}

export const CheckboxField = <T extends FieldValues>({
	name,
	label,
	register,
	errors,
}: CheckboxFieldProps<T>) => {
	const baseId = useId();

	const inputId = `${baseId}-${String(name)}`;
	const errorId = `${baseId}-${String(name)}-error`;
	const fieldError = errors[name];

	return (
		<Field className="space-y-2">
			<div className="flex items-center">
				<div className="relative flex items-center">
					<input
						id={inputId}
						{...register(name)}
						type="checkbox"
						className="peer h-5 w-5 appearance-none rounded border border-input bg-background shadow transition-all outline-none checked:border-primary checked:bg-primary hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
						aria-invalid={!!fieldError}
						aria-required="true"
						aria-describedby={fieldError ? errorId : undefined}
					/>
					<span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-primary-foreground opacity-0 pointer-events-none peer-checked:opacity-100">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-3.5 w-3.5"
							viewBox="0 0 20 20"
							fill="currentColor"
							stroke="currentColor"
							strokeWidth="1"
						>
							<path
								fillRule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clipRule="evenodd"
							/>
						</svg>
					</span>
				</div>

				<FieldLabel
					htmlFor={inputId}
					className="ml-3 block text-sm font-medium cursor-pointer"
				>
					{label}
				</FieldLabel>
			</div>

			{fieldError && (
				<FieldError id={errorId}>{fieldError.message as string}</FieldError>
			)}
		</Field>
	);
};
