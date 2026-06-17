"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { DateSelector } from "@/shared/components/ui/date-selector";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/shared/components/ui/popover";

export function DatePicker({
	id,
	date,
	setDate,
	startDate,
	endDate,
}: {
	id: string;
	date: Date | undefined;
	setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
	startDate?: Date;
	endDate?: Date;
}) {
	return (
		<Popover>
			<PopoverTrigger
				render={
					<Button
						id={id}
						variant={"ghost"}
						className={cn(
							"border-input aria-invalid:ring-destructive/60 dark:aria-invalid:ring-destructive/40 my-2 flex h-auto w-full min-w-0 justify-between rounded-sm border px-3 py-2 text-left text-base font-normal text-gray-900 shadow-2xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm/6",
							!date && "text-muted-foreground",
						)}
					>
						{date ? format(date, "MM/dd/yyyy") : <span>Pick a date</span>}
						<CalendarIcon />
					</Button>
				}
			/>
			<PopoverContent className="w-auto p-0" align="start">
				<DateSelector
					date={date}
					setDate={setDate}
					startDate={startDate}
					endDate={endDate}
				/>
			</PopoverContent>
		</Popover>
	);
}
