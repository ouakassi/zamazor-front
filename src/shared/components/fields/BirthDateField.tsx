import { useId } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors, FieldValues, Path } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/shared/components/ui/field";
import { DatePicker } from "@/shared/components/ui/date-picker";

interface BirthDateFieldProps<T extends FieldValues> {
	name: Path<T>;
	label: string;
	control: Control<T>;
	errors: FieldErrors<T>;
	startDate?: Date;
	endDate?: Date;
}

export const BirthDateField = <T extends FieldValues>({
	name,
	label,
	control,
	errors,
	startDate = new Date(new Date().getFullYear() - 50, 0),
	endDate = new Date(),
}: BirthDateFieldProps<T>) => {
	const baseId = useId();

	const inputId = `${baseId}-${String(name)}`;
	const errorId = `${baseId}-${String(name)}-error`;
	const fieldError = errors[name];

	return (
		<Field className="space-y-2">
			<FieldLabel htmlFor={inputId} className="block text-sm/6 font-medium">
				{label}
			</FieldLabel>

			<Controller
				name={name}
				control={control}
				render={({ field, fieldState }) => (
					<DatePicker
						id={inputId}
						date={field.value}
						setDate={field.onChange}
						startDate={startDate}
						endDate={endDate}
						aria-invalid={!!fieldState.error}
						aria-required="true"
						aria-describedby={fieldState.error ? errorId : undefined}
					/>
				)}
			/>

			{fieldError && (
				<FieldError id={errorId}>{fieldError.message as string}</FieldError>
			)}
		</Field>
	);
};
