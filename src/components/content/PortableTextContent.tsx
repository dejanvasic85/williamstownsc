import type { PortableTextBlock } from '@portabletext/types';

interface PortableTextContentProps {
	blocks: PortableTextBlock[];
	className?: string;
	headingLevel?: 'page' | 'section';
}

export function PortableTextContent({
	blocks,
	className = 'prose max-w-none',
	headingLevel = 'page'
}: PortableTextContentProps) {
	if (!blocks || blocks.length === 0) {
		return null;
	}

	const headingClasses = {
		page: {
			h1: 'mb-4 text-2xl font-bold',
			h2: 'mb-3 text-xl font-bold',
			h3: 'mb-2 text-lg font-bold'
		},
		section: {
			h1: 'mb-3 text-xl font-bold',
			h2: 'mb-2 text-lg font-bold',
			h3: 'mb-2 text-base font-bold'
		}
	};

	const classes = headingClasses[headingLevel];

	return (
		<div className={className}>
			{blocks.map((block, index) => {
				if (block._type === 'block') {
					const children = block.children || [];
					const text = children.map((child) => ('text' in child ? child.text : '')).join('');

					if (block.style === 'h1') {
						return headingLevel === 'page' ? (
							<h2 key={block._key || index} className={classes.h1}>
								{text}
							</h2>
						) : (
							<h4 key={block._key || index} className={classes.h1}>
								{text}
							</h4>
						);
					}
					if (block.style === 'h2') {
						return headingLevel === 'page' ? (
							<h3 key={block._key || index} className={classes.h2}>
								{text}
							</h3>
						) : (
							<h5 key={block._key || index} className={classes.h2}>
								{text}
							</h5>
						);
					}
					if (block.style === 'h3') {
						return (
							<h6 key={block._key || index} className={classes.h3}>
								{text}
							</h6>
						);
					}

					return (
						<p key={block._key || index} className="mb-3 leading-relaxed">
							{text}
						</p>
					);
				}
				return null;
			})}
		</div>
	);
}
