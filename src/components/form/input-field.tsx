"use client";

import { HTMLInputTypeAttribute } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { useFormContext } from "react-hook-form";

type Props = {
	name: string;
	label?: string | React.ReactNode;
	type?: HTMLInputTypeAttribute;
	placeholder?: string;
	description?: string;
};

export function InputField({ name, label, type = "text", placeholder, description }: Props) {
	const {
		register,
		formState: { errors },
	} = useFormContext();
	const error = errors[name];
	const invalid = !!error;

	return (
		<Field data-invalid={invalid}>
			{label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
			<Input
				{...register(name)}
				id={name}
				type={type}
				aria-invalid={invalid}
				placeholder={placeholder}
				autoComplete="off"
			/>
			{description && <FieldDescription>{description}</FieldDescription>}
			{invalid && <FieldError errors={[error]} />}
		</Field>
	);
}
