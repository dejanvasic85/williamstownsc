# Accessibility Improvements Plan

## Status: In Progress

Branch: `claude/improve-homepage-accessibility-MQnUH`

---

## Completed

### 1. Skip Link

- **File**: `src/app/(site)/layout.tsx:74-79`
- **Change**: Added skip-to-main-content link before Banner
- **Target**: `#main-content` on `<main>` element (line 95-100)

### 2. Heading Hierarchy (Homepage)

- **File**: `src/components/home/MobileHeader.tsx:24`
- **Change**: `<h1>` → `<p>` for club name (branding only)
- **File**: `src/components/home/HeroCarousel.tsx:95-106`
- **Change**: `<h2>` → `<h1>` for featured article title (main page heading)

### 3. Carousel Accessibility

- **File**: `src/components/home/HeroCarousel.tsx`
- **Changes**:
  - Line 67-72: Added `role="region"`, `aria-roledescription="carousel"`, `aria-label="Featured news"`
  - Line 75-76: Added `aria-live="polite"`, `aria-atomic="true"`
  - Line 81-84: Each slide has `role="group"`, `aria-roledescription="slide"`, `aria-label`, `aria-hidden`
  - Line 87: Added `pointer-events-none` to hidden slides
  - Line 124, 131: Replaced ❮❯ symbols with `ChevronLeft`/`ChevronRight` icons
  - Line 136-137: Added `role="tablist"`, `aria-label` to dot indicators
  - Line 142, 148: Added `role="tab"`, `aria-selected` to dot buttons

### 4. Color Contrast

- **File**: `src/app/globals.css`
  - Line 15: Added `--color-base-content-secondary: oklch(40% 0.006 285.885)` (light theme)
  - Line 50: Added `--color-base-content-secondary: oklch(65% 0.007 265.754)` (dark theme)
- **File**: `src/components/news/NewsCard.tsx:64,72`
- **Change**: Replaced `text-base-content/70` and `text-base-content/60` with `text-[color:var(--color-base-content-secondary)]`

### 5. Carousel Pause Control

- **File**: `src/components/home/HeroCarousel.tsx`
- **Changes**:
  - Line 7: Added `Pause` and `Play` icons from lucide-react
  - Line 17: Added `isPaused` state
  - Line 21, 30: Updated `startInterval` to check `isPaused` state
  - Lines 56-70: Added `handleTogglePause`, `handleMouseEnter`, `handleMouseLeave` functions
  - Lines 90-93: Added `onMouseEnter`, `onMouseLeave`, `onFocus`, `onBlur` to pause on hover/focus
  - Lines 170-181: Added pause/play toggle button with proper ARIA labels (`aria-label`, `aria-pressed`)
- **WCAG Compliance**: Now meets WCAG 2.2.2 (Pause, Stop, Hide) requirement

---

## Remaining Tasks

### High Priority

#### 1. Desktop Navbar Keyboard Navigation

- **File**: `src/components/layout/DesktopNavbar.tsx`
- **Issue**: Dropdown menus lack arrow key navigation
- **Fix**: Add `onKeyDown` handler to dropdown buttons for ArrowUp/ArrowDown/Enter/Escape
- **Reference**: Lines 147-166 (dropdown button), 169-195 (dropdown menu)

### Medium Priority

#### 3. Additional Color Contrast Fixes

Files using `text-base-content/XX` or `opacity-XX` patterns:

- `src/components/layout/Footer.tsx` - Check for opacity text
- `src/components/home/SocialLinks.tsx` - Line 23 area
- `src/components/teams/PlayerCard.tsx` - Opacity backgrounds
- `src/components/teams/CoachCard.tsx` - Opacity text

**Fix pattern**: Replace with `text-[color:var(--color-base-content-secondary)]`

#### 4. Tab Panel Focus Management

- **File**: `src/components/contact/ContactTypeTabs.tsx`
- **Issue**: Tab switches don't announce changes or manage focus
- **Fix**: Add `aria-labelledby` to panels, move focus on tab change

#### 5. Banner Alert Role

- **File**: `src/components/layout/Banner/Banner.tsx`
- **Issue**: Important announcements not marked as alerts
- **Fix**: Add `role="alert"` or `aria-live="assertive"` for urgent messages

### Low Priority

#### 6. Image Alt Text Improvements

- `src/components/layout/DesktopNavbar.tsx:117` - "Club logo" → "Williamstown SC logo"
- `src/components/home/MobileHeader.tsx:18` - Same improvement
- `src/components/layout/PageContainer.tsx:56` - Review fallback logic

#### 7. Footer Decorative Elements

- **File**: `src/components/layout/Footer.tsx:162`
- **Issue**: Pipe separators ("|") read by screen readers
- **Fix**: Add `aria-hidden="true"` to decorative separators

#### 8. Hidden Panel Accessibility

- **File**: `src/components/teams/TeamTabs.tsx:81-84`
- **Issue**: Uses `pointer-events-none opacity-0` instead of proper hiding
- **Fix**: Add `aria-hidden="true"` and consider `inert` attribute

---

## Testing Checklist

- [ ] Tab through entire page with keyboard only
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Check skip link visibility on focus
- [ ] Verify carousel announces slide changes
- [ ] Test color contrast with browser devtools (>4.5:1 for text)
- [ ] Verify single h1 per page
- [ ] Test in both light and dark themes

---

## Key Files Reference

| Component     | Path                                         | Purpose                   |
| ------------- | -------------------------------------------- | ------------------------- |
| Site Layout   | `src/app/(site)/layout.tsx`                  | Skip link, main structure |
| Homepage      | `src/app/(site)/page.tsx`                    | Page composition          |
| Hero Carousel | `src/components/home/HeroCarousel.tsx`       | Featured news slider      |
| Desktop Nav   | `src/components/layout/DesktopNavbar.tsx`    | Main navigation           |
| Mobile Header | `src/components/home/MobileHeader.tsx`       | Mobile branding           |
| Theme CSS     | `src/app/globals.css`                        | Color variables           |
| News Card     | `src/components/news/NewsCard.tsx`           | Article cards             |
| Footer        | `src/components/layout/Footer.tsx`           | Site footer               |
| Contact Tabs  | `src/components/contact/ContactTypeTabs.tsx` | Form tabs                 |

---

## WCAG 2.1 AA Targets

- 1.3.1 Info and Relationships (semantic HTML) ✅ Partial
- 1.4.3 Contrast Minimum (4.5:1) ✅ Partial
- 2.1.1 Keyboard (all functionality) ⏳ Needs dropdown fix
- 2.2.2 Pause, Stop, Hide (carousel) ✅ Done
- 2.4.1 Bypass Blocks (skip link) ✅ Done
- 2.4.6 Headings and Labels ✅ Done
- 4.1.2 Name, Role, Value (ARIA) ✅ Partial
