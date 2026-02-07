import { format, isValid, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';
import type { KeyDateItem } from '@/lib/content';

type KeyDateCardProps = {
	item: KeyDateItem;
};

function formatKeyDate(dateString: string): string {
	try {
		const date = parseISO(dateString);
		if (!isValid(date)) {
			return dateString;
		}
		return format(date, 'EEEE, MMMM d, yyyy');
	} catch {
		return dateString;
	}
}

export function KeyDateCard({ item }: KeyDateCardProps) {
	return (
		<div className="bg-secondary/20 rounded-lg p-4">
			<div className="flex items-start gap-3">
				<Calendar className="text-secondary mt-1 h-5 w-5 shrink-0" />
				<div>
					<p className="font-semibold">{item.title}</p>
					<p className="text-base-content/80 text-sm">{formatKeyDate(item.date)}</p>
					{item.description && (
						<p className="text-base-content/70 mt-1 text-sm">{item.description}</p>
					)}
				</div>
			</div>
		</div>
	);
}
