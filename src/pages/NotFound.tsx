import { Button } from "@/shared/components/ui/button";
import { ArrowLeftIcon, ShoppingBag, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useDocumentTitle } from "@/shared/hooks/use-document-title";
import CONFIG from "@/core/config/constants";
import { APP_ROUTES } from "@/core/routes/paths";

export default function NotFound() {
	const navigate = useNavigate();
	useDocumentTitle(`Page not found | ${CONFIG.APP_NAME}`);

	return (
		<main className="flex min-h-svh w-full items-center bg-[#fcfdfa] px-4 py-8 sm:px-6 lg:px-8">
			<div className="mx-auto flex w-full max-w-2xl justify-center overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_42%),linear-gradient(180deg,_#f7fbf3_0%,_#ffffff_100%)] shadow-[0_30px_80px_-40px_rgba(6,95,70,0.25)]">
				<div className="flex w-full max-w-xl flex-col items-center gap-8 p-8 text-center sm:p-10 lg:p-12">
					<div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-emerald-800">
						<Sparkles className="size-4" />
						<span>{CONFIG.APP_NAME}</span>
					</div>

					<div className="max-w-xl space-y-5">
						<p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-700">404</p>
						<h1 className="font-playfair text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
							This page wandered off the shelf.
						</h1>
						<p className="mx-auto max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
							The page you tried to open is not here, but the shop is still open and ready with clean formulas, fresh picks, and the rest of the collection.
						</p>
					</div>

					<div className="flex flex-col items-center gap-3 sm:flex-row">
						<Button asChild className="h-11 rounded-xl bg-emerald-900 px-5 text-sm font-bold text-white hover:bg-emerald-950">
							<Link to={APP_ROUTES.SHOP} className="flex items-center justify-center gap-2">
								<ShoppingBag className="size-4" />
								Go to shop
							</Link>
						</Button>
						<Button
							variant="outline"
							className="h-11 rounded-xl border-emerald-900/10 px-5 text-sm font-bold text-emerald-900 hover:bg-emerald-50"
							onClick={() => navigate(-1)}
						>
							<ArrowLeftIcon className="size-4" />
							Go back
						</Button>
					</div>
				</div>
			</div>
		</main>
	);
}
