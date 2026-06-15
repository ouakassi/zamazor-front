import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader } from "lucide-react";

const spinnerVariants = cva("flex-col items-center justify-center", {
	variants: {
		show: {
			true: "flex",
			false: "hidden",
		},
	},
	defaultVariants: {
		show: true,
	},
});

const loaderVariants = cva("animate-spin text-primary", {
	variants: {
		size: {
			small: "size-4",
			medium: "size-8",
			large: "size-12",
		},
	},
	defaultVariants: {
		size: "medium",
	},
});

interface SpinnerProps
	extends
		React.ComponentPropsWithoutRef<"div">,
		VariantProps<typeof spinnerVariants>,
		VariantProps<typeof loaderVariants> {}

export function Spinner({ size, show, children, className }: SpinnerProps) {
	return (
		<div className="col-span-full flex h-full w-full items-center justify-center py-38">
			<span className={spinnerVariants({ show })}>
				<Loader
					className={cn(loaderVariants({ size }), className)}
					strokeWidth={2}
				/>
				{children}
			</span>
		</div>
	);
}
