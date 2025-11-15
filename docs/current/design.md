# Williamstown Soccer Club - Current Website Design Analysis

**URL:** https://www.williamstownsc.com/
**Screenshot:** williamstown_current.png
**Analyzed:** November 15, 2025
**Platform:** Wix (site builder)

## Overview

The current Williamstown Soccer Club website is built on the Wix platform. It features a traditional sports club design with a strong emphasis on the club's blue and yellow brand colors. The design is functional but shows typical constraints of website builder platforms with limited customization and modern design patterns.

## Typography Scale

### Font Families Used

The site uses multiple font families, indicating mixed design sources:

1. **Primary Heading Font:** `helvetica-w01-bold, sans-serif`
2. **Body Font:** `Arial, Helvetica, sans-serif`
3. **Navigation Font:** `wfont_186fbd_f3a5d63e3733490d968b4de98aa7ea62` (Gilroy Extrabold)
4. **Timestamp Font:** `wfont_186fbd_7297278daf174256b4ff290524ce8bb2` (Gilroy Light)
5. **Article Font:** `HelveticaNeueW01-45Ligh`

### Complete Font Size Hierarchy

| Size     | Weight | Line Height | Usage                       | Example                           |
| -------- | ------ | ----------- | --------------------------- | --------------------------------- |
| **70px** | 400    | 70px (1.0)  | Main Site Title (H1)        | "WILLIAMSTOWN SOCCER CLUB"        |
| **30px** | 400    | normal      | Section Headings            | "CLUB NEWS", "CLUB EVENTS"        |
| **26px** | 400    | normal      | Article Headlines (H2)      | "2026 Senior Men's Coaching Team" |
| **25px** | 400    | normal      | Alternative Section Heading | "CLUB NEWS" (styled variant)      |
| **24px** | 700    | normal      | Body Emphasis               | "No events at the moment"         |
| **20px** | 400    | 26px (1.3)  | Body Text                   | General content                   |
| **13px** | 400    | normal      | Navigation Links            | "HOME", "ABOUT", "MEMBER INFO"    |
| **12px** | 400    | normal      | Timestamps/Meta             | "2 days ago"                      |
| **11px** | 400    | normal      | Small Text                  | Secondary content                 |
| **10px** | 400    | normal      | Base Font Size              | Body default                      |

### Typography Issues

1. **Inconsistent Font Sizes:**
   - Base font size is 10px (very small, accessibility issue)
   - Navigation at 13px is difficult to read
   - Multiple similar sizes (25px, 26px, 30px) create visual confusion

2. **Font Weight Limitations:**
   - Most text uses font-weight 400 (regular)
   - Limited use of bold (700) for hierarchy
   - Lacks visual weight variation

3. **Line Height Problems:**
   - Main heading has 1.0 line height (very tight)
   - Many elements use "normal" which is unpredictable
   - Inconsistent spacing between lines

4. **Font Family Confusion:**
   - Multiple custom Wix fonts (wfont\_\*) create loading overhead
   - Mix of Helvetica, Arial, and custom fonts lacks cohesion
   - No clear typographic system

## Color Palette

### Primary Colors

#### Blue (Primary Brand Color)

- **Header Background:** `rgb(6, 33, 116)` - #062174
  - Dark navy blue
  - Used for navigation bar
  - Strong, traditional club color

#### Yellow/Gold (Secondary Brand Color)

- **Accent Color:** `rgb(222, 177, 0)` - #DEB100
  - Golden yellow
  - Used in logo ribbon
  - Complementary to blue

### Supporting Colors

#### Text Colors

- **Primary Text:** `rgb(5, 5, 5)` - Near black
- **Link Blue:** `rgb(0, 0, 238)` - #0000EE (default browser blue)
- **Link Blue Alt:** `rgb(17, 109, 255)` - #116DFF (lighter blue)
- **White Text:** `rgb(255, 255, 255)` - #FFFFFF

#### Background Colors

- **White:** `rgb(255, 255, 255)` - #FFFFFF (main content area)
- **Light Gray:** `rgb(236, 236, 236)` - #ECECEC (subtle background)
- **Dark Overlay:** `rgba(0, 0, 0, 0.55)` - 55% black (image overlays)
- **Black:** `rgb(0, 0, 0)` - #000000 (footer)
- **Dark Text:** `rgb(5, 5, 5)` - #050505 (near black)

### Color Issues

1. **Limited Palette:**
   - Only 2 brand colors (blue and yellow)
   - No intermediate shades or tints
   - Lacks visual variety

2. **Poor Contrast in Places:**
   - Navigation links are blue on dark blue background
   - 10px font size makes contrast issues worse

3. **Default Browser Colors:**
   - Link color `#0000EE` is default browser blue
   - Doesn't match brand identity

4. **No Defined Color System:**
   - No systematic use of opacity
   - Missing hover states definition
   - No accent color variations

## Layout Structure

### Header/Navigation

**Structure:**

- Top navigation bar with dark blue background
- Horizontal menu: HOME | ABOUT | MEMBER INFO | FIXTURES | CALENDAR | CONTACT | SHOP
- Logo and club name centered below navigation
- Social media icons (Facebook, Instagram, YouTube) on right
- Shopping cart icon in header

**Issues:**

- Navigation text very small (13px)
- All caps text can be harder to read
- No visual indication of current page
- Hamburger menu on mobile not visible in analysis

### Main Logo/Branding

**Elements:**

- Club crest/logo on left (blue shield with yellow ribbon, soccer ball, "SC WILLIAMSTOWN", "1981")
- Large "WILLIAMSTOWN SOCCER CLUB" heading in white
- Social media icons positioned top-right

**Characteristics:**

- 70px heading size dominates the header
- White text on blue background
- Traditional sports club aesthetic

### Content Layout

**Primary Structure:**

- Two-column layout on desktop
- Left column: "CLUB NEWS" blog section
- Right column: Sponsor carousel and "CLUB EVENTS"
- White background content area

**Content Elements:**

- Blog post cards with featured images
- Timestamps ("2 days ago")
- Image carousel for sponsors
- Events section (currently empty)

### Footer

**Structure:**

- Black background
- Duplicate navigation menu
- Social media icons
- Very minimal

## Component Patterns

### Blog Post Card

- Featured image on left
- Headline as clickable link
- Timestamp below headline
- Simple hover state

### Image Carousel

- Sponsor logos/images
- Previous/Next navigation arrows
- Slide indicators
- Auto-rotate functionality

### Navigation

- Horizontal menu bar
- All caps text
- Dropdown for "FIXTURES"
- No active state indicator

## Design Patterns

### Visual Hierarchy

1. **Logo and club name** - Largest element, centered
2. **Section headings** - Yellow color, all caps
3. **Content cards** - Featured images draw attention
4. **Body text** - Standard black on white

### Spacing

- Minimal padding in navigation
- Generous white space in content area
- Uneven spacing between sections

### Borders & Shadows

- No visible borders on cards
- Minimal use of shadows
- Flat design aesthetic

## Technical Platform: Wix

### Identified Wix Characteristics

1. **Custom Font Loading:**
   - Multiple `wfont_*` font references
   - Proprietary font system
   - Additional HTTP requests

2. **Console Errors:**
   - Multiple React minified errors (#418, #423, #425)
   - Component loading errors
   - TPA widget errors

3. **Third-party Scripts:**
   - Visitor analytics tracking
   - Parastorage CDN resources
   - React framework (outdated warnings)

4. **Performance Issues:**
   - Large page weight from Wix infrastructure
   - Multiple external script loads
   - Unoptimized asset delivery

## Accessibility Issues

### Typography

- **Base font size 10px** - Far below recommended 16px minimum
- **Navigation text 13px** - Below recommended 14px minimum for clickable elements
- **Poor touch targets** - Small text = small clickable areas

### Color Contrast

- Navigation links may not meet WCAG AA standards
- Need to verify actual rendered contrast ratios
- White on dark blue should be tested

### Semantic HTML

- Uses proper heading hierarchy (H1, H2)
- Has skip to content link
- Navigation wrapped in `<nav>` elements
- Generally good semantic structure

### Missing Elements

- No visible focus indicators mentioned
- Alt text presence not verified
- Keyboard navigation not tested

## Responsive Design

### Observations

- Wix provides automatic responsive layouts
- Mobile menu likely uses hamburger icon
- Content should stack vertically on mobile
- Unable to fully assess without mobile testing

## Content Organization

### Homepage Sections

1. **Header/Navigation** - Branding and menu
2. **Club News** - Latest blog posts
3. **Sponsors** - Rotating carousel
4. **Club Events** - Calendar/events (currently empty)
5. **Footer** - Links and social

### Information Architecture

- Simple, flat structure
- Clear section labels
- Limited depth (good for small sites)
- Fixtures has dropdown (suggests subcategories)

## Brand Identity Elements

### Logo

- Shield shape with blue background
- Yellow ribbon with "WILLIAMSTOWN"
- Soccer ball icon
- "SC" letters
- "1981" founding year
- Professional, traditional sports aesthetic

### Colors

- **Blue:** `#062174` - Strong, trustworthy, traditional
- **Yellow:** `#DEB100` - Energy, optimism, visibility
- Classic sports team color combination

### Typography Style

- Bold, all-caps headings
- Helvetica-based sans-serif fonts
- Traditional, authoritative feel
- Lacks modern sophistication

## Problems to Address in New Design

### 1. Typography System

- [ ] Create consistent type scale (16px base minimum)
- [ ] Define clear heading hierarchy with proper sizes
- [ ] Use single, modern font family
- [ ] Establish appropriate line heights (1.5+ for body)
- [ ] Add font weight variation (400, 500, 600, 700)

### 2. Color System

- [ ] Expand palette with tints and shades
- [ ] Define hover states
- [ ] Ensure WCAG AA contrast compliance
- [ ] Move away from default browser link colors
- [ ] Create systematic opacity values

### 3. Layout & Spacing

- [ ] Implement consistent spacing scale (4px, 8px, 16px, 24px, etc.)
- [ ] Define component padding standards
- [ ] Create responsive grid system
- [ ] Improve visual rhythm between sections

### 4. Components

- [ ] Redesign navigation with better UX
- [ ] Create modern card components with shadows
- [ ] Improve hover/focus states
- [ ] Add loading states and transitions

### 5. Accessibility

- [ ] Increase base font size to 16px minimum
- [ ] Ensure all touch targets are 44x44px minimum
- [ ] Test and fix color contrast ratios
- [ ] Add visible focus indicators
- [ ] Implement proper ARIA labels

### 6. Performance

- [ ] Move off Wix to custom Next.js build
- [ ] Optimize images and assets
- [ ] Reduce third-party scripts
- [ ] Implement lazy loading
- [ ] Improve Core Web Vitals

### 7. Modern Design

- [ ] Add depth with shadows and layers
- [ ] Implement smooth transitions
- [ ] Use modern component patterns (cards, modals)
- [ ] Add micro-interactions
- [ ] Consider glassmorphism for hero sections

### 8. Mobile Experience

- [ ] Design mobile-first
- [ ] Improve touch targets
- [ ] Optimize navigation for mobile
- [ ] Test on actual devices
- [ ] Ensure responsive images

## Content Migration Needs

### Existing Content Types

1. **Blog Posts** - Club news articles with images
2. **Events** - Calendar/event listings
3. **Navigation Pages** - About, Member Info, Fixtures, Calendar, Contact, Shop
4. **Sponsors** - Logos and potentially links
5. **Social Media** - Links to Facebook, Instagram, YouTube

### Data to Preserve

- All blog post content and images
- Event data (when available)
- Sponsor information and logos
- Navigation structure
- Social media links
- Shopping cart functionality

## Opportunities for Improvement

### Content Presentation

1. **Hero Section:** Add dynamic hero with latest news or upcoming events
2. **Feature Cards:** Modern card design with hover effects
3. **Team Roster:** Add player profiles and team information
4. **Fixtures Integration:** Better display of match schedules and results
5. **Photo Gallery:** Showcase club photos and match highlights

### User Engagement

1. **Search Functionality:** Help users find content
2. **Newsletter Signup:** Build email list
3. **Member Portal:** Dedicated area for members
4. **Live Scores:** Real-time match updates
5. **Social Feed:** Embed Instagram feed

### Modern Features

1. **Dark Mode:** Optional dark theme
2. **Progressive Web App:** Installable on mobile
3. **Push Notifications:** Match reminders and news alerts
4. **Interactive Fixtures:** Click to see match details
5. **Wayfinding:** Map to ground and facilities

## Design Direction for New Site

### Inspiration to Apply

**From ABC Website:**

- Clean, modern card-based layouts
- Clear visual hierarchy with proper spacing
- Responsive grid system (3-column)
- Accessible typography (16px+ base)
- Professional, trustworthy aesthetic

**From Klack Website:**

- Modern glassmorphism effects for hero
- Bold typography with negative letter spacing
- Dramatic size contrast (hero vs. body)
- Clean minimal navigation
- Smooth animations and transitions

**Maintain Current Brand:**

- Blue and yellow color scheme
- Club crest/logo
- Traditional sports club identity
- Community-focused messaging
- Social media integration

### Recommended Approach

1. **Keep:** Brand colors, logo, content structure
2. **Improve:** Typography system, spacing, component design
3. **Add:** Modern effects, better UX, accessibility features
4. **Remove:** Wix constraints, small fonts, cluttered layout

## Technical Stack Recommendation

### Current: Wix

- Proprietary platform
- Limited customization
- Performance overhead
- Vendor lock-in

### Recommended: Next.js + Sanity + Tailwind

- **Next.js:** Modern React framework, excellent performance
- **Sanity CMS:** Flexible content management
- **Tailwind CSS:** Utility-first styling
- **DaisyUI:** Pre-built components
- Full control over design and functionality
- Better performance and SEO
- No platform fees
- Modern developer experience

## Migration Priority

### Phase 1: Foundation

1. Set up Next.js project
2. Implement new typography system
3. Create color system with Tailwind config
4. Build base layout (header, footer)

### Phase 2: Core Pages

1. Homepage with blog feed
2. About page
3. Contact page
4. Navigation system

### Phase 3: Features

1. Blog/news system with Sanity
2. Events calendar
3. Fixtures integration
4. Shop integration

### Phase 4: Enhancement

1. Member portal
2. Advanced features
3. Performance optimization
4. Analytics and SEO

## Conclusion

The current Williamstown Soccer Club website serves its basic purpose but suffers from typical Wix platform limitations including:

- Poor typography (10px base font)
- Limited customization
- Performance issues
- Accessibility problems
- Dated design patterns

The new design should maintain the club's traditional blue and yellow identity while implementing:

- Modern, accessible typography
- Clean, card-based layouts
- Glass effects and depth
- Mobile-first responsive design
- Better user experience
- Improved performance

By combining inspiration from ABC's professional content presentation and Klack's modern visual effects, while respecting the club's traditional sports identity, we can create a website that is both beautiful and functional.
