import type { Metadata } from 'next';
import { format } from 'date-fns';
import { FileDown, FileText } from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { getPageData, getPageMetadata } from '@/lib/content/page';
import { getPolicyDocuments } from '@/lib/content/policyDocuments';

export async function generateMetadata(): Promise<Metadata> {
	return getPageMetadata('policiesPage');
}

function formatFileSize(bytes?: number): string {
	if (!bytes) return 'PDF';
	const mb = bytes / (1024 * 1024);
	if (mb < 1) {
		const kb = bytes / 1024;
		return `PDF ${kb.toFixed(0)} KB`;
	}
	return `PDF ${mb.toFixed(1)} MB`;
}

export default async function ClubPoliciesPage() {
	const [pageData, policyDocumentsByCategory] = await Promise.all([
		getPageData('policiesPage'),
		getPolicyDocuments()
	]);

	return (
		<PageContainer
			heading={pageData?.heading || 'Policies and Regulations'}
			intro={pageData?.introduction}
			layout="article"
		>
			{policyDocumentsByCategory.length > 0 ? (
				<div className="space-y-12">
					{policyDocumentsByCategory.map((group) => (
						<section key={group.category}>
							<h2 className="mb-6 text-2xl font-bold">{group.category}</h2>
							<div className="space-y-4">
								{group.documents.map((doc) => (
									<div
										key={doc._id}
										className="bg-surface flex flex-col gap-4 rounded-lg p-6 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
									>
										<div className="flex flex-1 gap-4">
											<div className="text-primary flex-shrink-0">
												<FileText className="h-8 w-8" />
											</div>
											<div className="flex-1">
												<h3 className="mb-1 text-lg font-semibold">{doc.title}</h3>
												{doc.description && (
													<p className="text-base-content/70 mb-2 text-sm">{doc.description}</p>
												)}
												<div className="flex flex-wrap items-center gap-2">
													<span className="badge badge-outline text-xs">
														{formatFileSize(doc.file.size)}
													</span>
													{doc.effectiveDate && (
														<span className="text-base-content/60 text-xs">
															Effective: {format(new Date(doc.effectiveDate), 'dd MMM yyyy')}
														</span>
													)}
												</div>
											</div>
										</div>
										<div className="flex-shrink-0">
											<a
												href={doc.file.url}
												download
												className="btn btn-primary btn-sm gap-2"
												aria-label={`Download ${doc.title}`}
											>
												<FileDown className="h-4 w-4" />
												Download
											</a>
										</div>
									</div>
								))}
							</div>
						</section>
					))}
				</div>
			) : (
				<div className="bg-base-100 mt-10 rounded-xl p-12 text-center">
					<FileText className="text-base-content/30 mx-auto h-16 w-16" />
					<p className="text-base-content/70 mt-4 text-lg">
						Policy documents will be available soon.
					</p>
				</div>
			)}
		</PageContainer>
	);
}
