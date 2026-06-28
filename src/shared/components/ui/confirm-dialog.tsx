import { Button } from "./button";

interface ConfirmDialogProps {
	isOpen: boolean;
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
	isDestructive?: boolean;
	onConfirm: () => void;
	onClose: () => void;
}

export const ConfirmDialog = ({
	isOpen,
	title,
	description,
	confirmText = "Continue",
	cancelText = "Cancel",
	isDestructive = false,
	onConfirm,
	onClose,
}: ConfirmDialogProps) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-in fade-in duration-200">
			{/* Backdrop click close */}
			<div className="absolute inset-0" onClick={onClose} />
			
			<div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-6 animate-in zoom-in-95 duration-200 flex flex-col gap-5">
				<div className="space-y-1.5">
					<h3 className="font-sans text-lg font-semibold text-slate-900 leading-none">{title}</h3>
					<p className="font-sans text-sm text-slate-500 leading-normal">{description}</p>
				</div>
				<div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
					<Button
						variant="outline"
						onClick={onClose}
						className="h-9 px-4 rounded-xl border-slate-200 text-xs font-semibold cursor-pointer active:scale-95 transition-all text-slate-700"
					>
						{cancelText}
					</Button>
					<Button
						variant={isDestructive ? "destructive" : "default"}
						onClick={() => {
							onConfirm();
							onClose();
						}}
						className={
							isDestructive
								? "h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all"
								: "h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-950 text-white text-xs font-semibold cursor-pointer active:scale-95 transition-all"
						}
					>
						{confirmText}
					</Button>
				</div>
			</div>
		</div>
	);
};
