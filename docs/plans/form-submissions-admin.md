# Form Submissions Admin Interface

## Purpose

Enable admin users to view, manage, and export contact form and expression of interest submissions via Sanity Studio.

## Current State

- Contact forms send emails only (AWS SES)
- No persistent storage of submissions
- No admin dashboard to view/manage submissions
- Staff relies on email inbox management

## Solution

Use Sanity CMS as admin interface with built-in auth, UI, and export functionality.

## Requirements

- Store all form submissions in Sanity
- Maintain existing email notifications
- Admin UI for viewing/filtering/searching submissions
- Export capability (CSV/JSON via Sanity Studio)
- Track submission status (new/reviewed/archived)
- Staff notes for follow-up
- Preserve metadata (IP, user agent) for security

## Todo

- [x] Create Sanity schema for form submissions
- [x] Add formSubmission to schema index
- [x] Create Sanity write client with token support
- [x] Update contact form action to save to Sanity
- [x] Configure Sanity Studio structure for submissions view
- [x] Update environment variables documentation
- [x] Run linting and type checking
- [x] Test implementation

## Technical Implementation

### Schema Design

- Document type: `formSubmission`
- Common fields: contactType, name, email, phone, message, submittedAt
- Type-specific fields: Discriminated union per contact type
- Metadata: userAgent, ipAddress
- Admin fields: status, notes

### Data Flow

1. User submits form
2. Server action validates
3. Save to Sanity (new)
4. Send emails (existing)
5. Return success

### Studio Configuration

- Form Submissions section in navigation
- List view with filters (type, status, date)
- Custom preview showing key info
- Built-in export functionality

## Benefits

- Zero-effort auth and admin UI
- Professional interface
- Export built-in
- Version history
- Permissions system
- No additional deployment

## Notes

- Keep email notifications as backup/immediate notification
- Sanity free tier: 3 users, 10k documents (sufficient)
- Data stored in Sanity cloud (not Postgres)
- Can migrate to Postgres later if needed
