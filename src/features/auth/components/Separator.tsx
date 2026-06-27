export const Separator = () => {
	return (
		<div className="relative mt-10">
			<div className="absolute inset-0 flex items-center">
				<div className="w-full border-t border-gray-200 dark:border-gray-700" />
			</div>
			<div className="relative flex justify-center text-sm font-medium">
				<div className="bg-white px-6 dark:bg-gray-900 dark:text-white">
					Or continue with
				</div>
			</div>
		</div>
	);
};
