'use client';

import { PortableTextContent } from '@/components/content/PortableTextContent';
import { ContactType } from '@/lib/contact/contactEmail';
import { useActionState, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormState, submitContactForm } from './actions';
import { ContactTypeTabs } from './ContactTypeTabs';

type TypeContent = {
	heading: string;
	introduction?: unknown[];
	ctaText?: string;
};

type ContactFormProps = {
	initialType?: ContactType;
	programs?: { _id: string; name: string }[];
	typeContentMap: {
		player?: TypeContent;
		coach?: TypeContent;
		sponsor?: TypeContent;
		program?: TypeContent;
		general?: TypeContent;
	};
};

type ContactFormData = {
	name: string;
	email: string;
	phone?: string;
	message: string;
	ageGroup?: string;
	experience?: string;
	position?: string;
	qualifications?: string;
	ageGroupsInterest?: string;
	organization?: string;
	sponsorshipTier?: string;
	programId?: string;
	subject?: string;
};

export function ContactForm({
	initialType = 'general',
	programs = [],
	typeContentMap
}: ContactFormProps) {
	const [contactType, setContactType] = useState<ContactType>(initialType);
	const [state, formAction, isPending] = useActionState<FormState | null, FormData>(
		submitContactForm,
		null
	);

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<ContactFormData>();

	const handleTypeChange = (newType: ContactType) => {
		setContactType(newType);
	};

	const onSubmit = handleSubmit((data) => {
		const formData = new FormData();
		formData.append('contactType', contactType);
		Object.entries(data).forEach(([key, value]) => {
			if (value) {
				formData.append(key, value.toString());
			}
		});
		formAction(formData);
	});

	const typeContent = typeContentMap[contactType];
	const ctaText = typeContent?.ctaText || 'Submit Enquiry';

	return (
		<div className="flex flex-col items-center">
			<div className="w-full space-y-8 md:w-8/12">
				<ContactTypeTabs activeType={contactType} onChange={handleTypeChange} />

				{typeContent && (
					<div className="mb-6">
						<h2 className="mb-4 text-2xl font-bold">{typeContent.heading}</h2>
						{typeContent.introduction && <PortableTextContent blocks={typeContent.introduction} />}
					</div>
				)}

				{/* Success Message */}
				{state?.success ? (
					<div className="alert alert-success">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6 shrink-0 stroke-current"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<div>
							<h3 className="font-bold">Thank you!</h3>
							<div className="text-sm">{state.message}</div>
						</div>
					</div>
				) : (
					<form
						onSubmit={onSubmit}
						className="bg-base-100 space-y-4 rounded-lg p-6 shadow-xl lg:p-8"
					>
						{/* Hidden contact type field */}
						<input type="hidden" name="contactType" value={contactType} />

						{/* Common Fields */}
						<div className="form-control w-full">
							<label className="label">
								<span className="label-text">
									Name <span className="text-error">*</span>
								</span>
							</label>
							<input
								type="text"
								{...register('name', { required: 'Name is required' })}
								className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
								disabled={isPending}
							/>
							{errors.name && (
								<label className="label">
									<span className="label-text-alt text-error">{errors.name.message}</span>
								</label>
							)}
						</div>

						<div className="form-control w-full">
							<label className="label">
								<span className="label-text">
									Email <span className="text-error">*</span>
								</span>
							</label>
							<input
								type="email"
								{...register('email', {
									required: 'Email is required',
									pattern: {
										value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
										message: 'Invalid email address'
									}
								})}
								className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
								disabled={isPending}
							/>
							{errors.email && (
								<label className="label">
									<span className="label-text-alt text-error">{errors.email.message}</span>
								</label>
							)}
						</div>

						<div className="form-control w-full">
							<label className="label">
								<span className="label-text">Phone</span>
							</label>
							<input
								type="tel"
								{...register('phone')}
								className="input input-bordered w-full"
								disabled={isPending}
							/>
						</div>

						{/* Player-specific fields */}
						{contactType === 'player' && (
							<>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
									<div className="form-control w-full">
										<label className="label">
											<span className="label-text">Age Group</span>
										</label>
										<input
											type="text"
											{...register('ageGroup')}
											className="input input-bordered w-full"
											placeholder="e.g., Under 12"
											disabled={isPending}
										/>
									</div>

									<div className="form-control w-full">
										<label className="label">
											<span className="label-text">Experience Level</span>
										</label>
										<select
											{...register('experience')}
											className="select select-bordered w-full"
											disabled={isPending}
										>
											<option value="">Select...</option>
											<option value="beginner">Beginner</option>
											<option value="intermediate">Intermediate</option>
											<option value="advanced">Advanced</option>
										</select>
									</div>

									<div className="form-control w-full">
										<label className="label">
											<span className="label-text">Preferred Position</span>
										</label>
										<input
											type="text"
											{...register('position')}
											className="input input-bordered w-full"
											placeholder="e.g., Striker"
											disabled={isPending}
										/>
									</div>
								</div>
							</>
						)}

						{/* Coach-specific fields */}
						{contactType === 'coach' && (
							<>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div className="form-control w-full">
										<label className="label">
											<span className="label-text">Coaching Qualifications</span>
										</label>
										<input
											type="text"
											{...register('qualifications')}
											className="input input-bordered w-full"
											placeholder="e.g., FFA Level 1"
											disabled={isPending}
										/>
									</div>

									<div className="form-control w-full">
										<label className="label">
											<span className="label-text">Experience Level</span>
										</label>
										<select
											{...register('experience')}
											className="select select-bordered w-full"
											disabled={isPending}
										>
											<option value="">Select...</option>
											<option value="new">New to coaching</option>
											<option value="some">Some experience</option>
											<option value="experienced">Experienced coach</option>
										</select>
									</div>
								</div>

								<div className="form-control w-full">
									<label className="label">
										<span className="label-text">Age Groups of Interest</span>
									</label>
									<input
										type="text"
										{...register('ageGroupsInterest')}
										className="input input-bordered w-full"
										placeholder="e.g., Juniors, Seniors"
										disabled={isPending}
									/>
								</div>
							</>
						)}

						{/* Sponsor-specific fields */}
						{contactType === 'sponsor' && (
							<>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div className="form-control w-full">
										<label className="label">
											<span className="label-text">Organization Name</span>
										</label>
										<input
											type="text"
											{...register('organization')}
											className="input input-bordered w-full"
											disabled={isPending}
										/>
									</div>

									<div className="form-control w-full">
										<label className="label">
											<span className="label-text">Sponsorship Tier of Interest</span>
										</label>
										<select
											{...register('sponsorshipTier')}
											className="select select-bordered w-full"
											disabled={isPending}
										>
											<option value="">Select...</option>
											<option value="bronze">Bronze</option>
											<option value="silver">Silver</option>
											<option value="gold">Gold</option>
											<option value="platinum">Platinum</option>
											<option value="custom">Custom Package</option>
										</select>
									</div>
								</div>
							</>
						)}

						{/* Program-specific fields */}
						{contactType === 'program' && (
							<div className="form-control w-full">
								<label className="label">
									<span className="label-text">Program of Interest</span>
								</label>
								<select
									{...register('programId')}
									className="select select-bordered w-full"
									disabled={isPending}
								>
									<option value="">Select a program...</option>
									{programs.map((program) => (
										<option key={program._id} value={program._id}>
											{program.name}
										</option>
									))}
								</select>
							</div>
						)}

						{/* General-specific fields */}
						{contactType === 'general' && (
							<div className="form-control w-full">
								<label className="label">
									<span className="label-text">Subject</span>
								</label>
								<select
									{...register('subject')}
									className="select select-bordered w-full"
									disabled={isPending}
								>
									<option value="">Select...</option>
									<option value="facilities">Facilities</option>
									<option value="events">Events</option>
									<option value="membership">Membership</option>
									<option value="volunteering">Volunteering</option>
									<option value="other">Other</option>
								</select>
							</div>
						)}

						{/* Message field */}
						<div className="form-control w-full">
							<label className="label">
								<span className="label-text">
									Message <span className="text-error">*</span>
								</span>
							</label>
							<textarea
								{...register('message', { required: 'Message is required' })}
								className={`textarea textarea-bordered h-32 w-full ${errors.message ? 'textarea-error' : ''}`}
								disabled={isPending}
							></textarea>
							{errors.message && (
								<label className="label">
									<span className="label-text-alt text-error">{errors.message.message}</span>
								</label>
							)}
						</div>

						{/* Error message */}
						{state && !state.success && (
							<div className="alert alert-error">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6 shrink-0 stroke-current"
									fill="none"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<div>
									<span className="font-bold">Error:</span> {state.message}
								</div>
							</div>
						)}

						{/* Submit button */}
						<div className="form-control mt-6">
							<button type="submit" className="btn btn-primary" disabled={isPending}>
								{isPending ? (
									<>
										<span className="loading loading-spinner"></span>
										Sending...
									</>
								) : (
									ctaText
								)}
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
