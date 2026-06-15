import { useEffect, useLayoutEffect, useRef } from "react";

interface UseDocumentTitleOptions {
	preserveTitleOnUnmount?: boolean;
}
const DefaultDocumentTitleOptions = {
	preserveTitleOnUnmount: true,
};

export function useDocumentTitle(
	title: string,
	options: UseDocumentTitleOptions = DefaultDocumentTitleOptions,
): void {
	const { preserveTitleOnUnmount } = options;
	const defaultTitle = useRef<string | null>(null);

	useLayoutEffect(() => {
		defaultTitle.current = window.document.title;
	}, []);

	useLayoutEffect(() => {
		window.document.title = title;
	}, [title]);

	useEffect(() => {
		return () => {
			if (!preserveTitleOnUnmount && defaultTitle.current) {
				window.document.title = defaultTitle.current;
			}
		};
	}, [preserveTitleOnUnmount]);
}
