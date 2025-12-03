import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';

interface TextChild {
	_key?: string;
	text?: string;
	marks?: string[];
}

interface SanityImageBlock {
	_type: 'image';
	_key?: string;
	alt?: string;
	caption?: string;
	asset?: {
		_ref: string;
	};
}

interface SanityBlock {
	_type: 'block';
	_key?: string;
	style?: string;
	listItem?: 'bullet' | 'number';
	children?: TextChild[];
}

interface ListGroup {
	type: 'bullet' | 'number';
	items: SanityBlock[];
}

type BlockOrList = SanityBlock | SanityImageBlock | ListGroup;

interface PortableTextContentProps {
	blocks: unknown[];
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
			h2: 'mb-4 mt-8 text-2xl font-bold',
			h3: 'mb-3 mt-6 text-xl font-bold'
		},
		section: {
			h2: 'mb-3 mt-6 text-xl font-bold',
			h3: 'mb-2 mt-4 text-lg font-bold'
		}
	};

	const classes = headingClasses[headingLevel];

	const renderChildren = (children: TextChild[]) => {
		return children.map((child, idx) => {
			if (!child.text) return null;

			let content: React.ReactNode = child.text;

			// Apply marks (bold, italic)
			if (child.marks && child.marks.length > 0) {
				child.marks.forEach((mark: string) => {
					if (mark === 'strong') {
						content = <strong key={`strong-${idx}`}>{content}</strong>;
					} else if (mark === 'em') {
						content = <em key={`em-${idx}`}>{content}</em>;
					}
				});
			}

			return <span key={child._key || idx}>{content}</span>;
		});
	};

	const renderBlock = (block: SanityBlock | SanityImageBlock, index: number) => {
		// Handle images
		if (block._type === 'image') {
			const imageBlock = block as SanityImageBlock;
			const imageUrl = urlFor(imageBlock).width(1200).url();
			return (
				<figure key={imageBlock._key || index} className="my-8">
					<Image
						src={imageUrl}
						alt={imageBlock.alt || ''}
						width={1200}
						height={800}
						className="h-auto w-full rounded-lg"
					/>
					{imageBlock.caption && (
						<figcaption className="text-base-content/70 mt-2 text-center text-sm">
							{imageBlock.caption}
						</figcaption>
					)}
				</figure>
			);
		}

		// Handle text blocks
		if (block._type === 'block') {
			const children = block.children || [];

			// Handle headings
			if (block.style === 'h2') {
				return headingLevel === 'page' ? (
					<h2 key={block._key || index} className={classes.h2}>
						{renderChildren(children)}
					</h2>
				) : (
					<h4 key={block._key || index} className={classes.h2}>
						{renderChildren(children)}
					</h4>
				);
			}

			if (block.style === 'h3') {
				return headingLevel === 'page' ? (
					<h3 key={block._key || index} className={classes.h3}>
						{renderChildren(children)}
					</h3>
				) : (
					<h5 key={block._key || index} className={classes.h3}>
						{renderChildren(children)}
					</h5>
				);
			}

			// Handle lists
			if (block.listItem === 'bullet') {
				return (
					<li key={block._key || index} className="mb-2 leading-relaxed">
						{renderChildren(children)}
					</li>
				);
			}

			if (block.listItem === 'number') {
				return (
					<li key={block._key || index} className="mb-2 leading-relaxed">
						{renderChildren(children)}
					</li>
				);
			}

			// Regular paragraphs
			return (
				<p key={block._key || index} className="mb-4 leading-relaxed">
					{renderChildren(children)}
				</p>
			);
		}

		return null;
	};

	// Group list items
	const groupedBlocks: BlockOrList[] = [];
	let currentList: ListGroup | null = null;

	blocks.forEach((block) => {
		const typedBlock = block as SanityBlock | SanityImageBlock;
		if (
			typedBlock._type === 'block' &&
			(typedBlock.listItem === 'bullet' || typedBlock.listItem === 'number')
		) {
			if (!currentList || currentList.type !== typedBlock.listItem) {
				if (currentList) {
					groupedBlocks.push(currentList);
				}
				currentList = { type: typedBlock.listItem, items: [typedBlock as SanityBlock] };
			} else {
				currentList.items.push(typedBlock as SanityBlock);
			}
		} else {
			if (currentList) {
				groupedBlocks.push(currentList);
				currentList = null;
			}
			groupedBlocks.push(typedBlock);
		}
	});

	if (currentList) {
		groupedBlocks.push(currentList);
	}

	return (
		<div className={className}>
			{groupedBlocks.map((item, index) => {
				if ('type' in item && item.type === 'bullet') {
					return (
						<ul key={`list-${index}`} className="mb-4 ml-6 list-disc">
							{item.items.map((block, idx) => renderBlock(block, idx))}
						</ul>
					);
				}
				if ('type' in item && item.type === 'number') {
					return (
						<ol key={`list-${index}`} className="mb-4 ml-6 list-decimal">
							{item.items.map((block, idx) => renderBlock(block, idx))}
						</ol>
					);
				}
				return renderBlock(item as SanityBlock | SanityImageBlock, index);
			})}
		</div>
	);
}
