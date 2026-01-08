'use client';

import { CalendarPlus } from 'lucide-react';

type CalendarEvent = {
	title: string;
	date: string;
	description?: string;
};

type AddToCalendarButtonProps = CalendarEvent;

function generateICSContent({ title, date, description }: CalendarEvent): string {
	// Parse the date and create an all-day event
	const eventDate = new Date(date);
	const year = eventDate.getFullYear();
	const month = String(eventDate.getMonth() + 1).padStart(2, '0');
	const day = String(eventDate.getDate()).padStart(2, '0');
	const dateStr = `${year}${month}${day}`;

	// Generate a unique ID for the event
	const uid = `${dateStr}-${title.replace(/\s+/g, '-').toLowerCase()}@williamstownsc.com.au`;

	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Williamstown SC//Key Dates//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VEVENT',
		`UID:${uid}`,
		`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
		`DTSTART;VALUE=DATE:${dateStr}`,
		`DTEND;VALUE=DATE:${dateStr}`,
		`SUMMARY:${title}`,
		...(description ? [`DESCRIPTION:${description.replace(/\n/g, '\\n')}`] : []),
		'END:VEVENT',
		'END:VCALENDAR'
	];

	return lines.join('\r\n');
}

function isMobileDevice(): boolean {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function openCalendar(content: string, filename: string) {
	const dataUri = `data:text/calendar;charset=utf-8,${encodeURIComponent(content)}`;

	// On mobile, navigate directly to trigger calendar app
	if (isMobileDevice()) {
		window.location.href = dataUri;
		return;
	}

	// On desktop, download the file
	const link = document.createElement('a');
	link.href = dataUri;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

export function AddToCalendarButton({ title, date, description }: AddToCalendarButtonProps) {
	const handleClick = () => {
		const icsContent = generateICSContent({ title, date, description });
		const filename = `${title.replace(/\s+/g, '-').toLowerCase()}.ics`;
		openCalendar(icsContent, filename);
	};

	return (
		<button
			onClick={handleClick}
			className="btn btn-ghost btn-sm gap-1.5"
			aria-label={`Add ${title} to calendar`}
		>
			<CalendarPlus className="h-4 w-4" />
			<span className="hidden sm:inline">Add to calendar</span>
		</button>
	);
}
