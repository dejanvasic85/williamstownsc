import { ReactNode } from 'react';

interface GradientBackgroundProps {
	children: ReactNode;
	className?: string;
}

export function GradientBackground({ children, className = '' }: GradientBackgroundProps) {
	return (
		<div className={`from-brand relative overflow-hidden bg-linear-to-br to-blue-950 ${className}`}>
			<div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-blue-800/20 blur-3xl" />
			<div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-950/30 blur-3xl" />
			<div className="relative">{children}</div>
		</div>
	);
}
