import { toast, type ExternalToast } from "sonner";
import { CheckCircle2Icon, XCircleIcon, InfoIcon } from "lucide-react";

type ToastOptions = {
	requiresInternet?: boolean;
};

const DEFAULT_ICONS = {
	success: <CheckCircle2Icon className="size-5 text-green-500" />,
	error: <XCircleIcon className="size-5 text-red-500" />,
	info: <InfoIcon className="size-5 text-blue-500" />,
};

const defaultDuration = 3000;

const createToast = (type: keyof typeof DEFAULT_ICONS) => {
	return (title: string, options: ExternalToast & ToastOptions = {}) => {
		const { requiresInternet = true, ...toastOptions } = options;
		const icon = toastOptions.icon ?? DEFAULT_ICONS[type] ?? DEFAULT_ICONS.info;
		let finalTitle = title;
		let finalDescription = toastOptions.description;

		if (type === "error" && requiresInternet && !navigator.onLine) {
			finalTitle = "No internet connection";
			finalDescription = "Please check your connection and try again.";
		}

		toast[type](finalTitle, {
			...toastOptions,
			description: finalDescription,
			duration: toastOptions.duration ?? defaultDuration,
			icon,
		});
	};
};

export const notify = {
	success: createToast("success"),
	error: createToast("error"),
	info: createToast("info"),
};
