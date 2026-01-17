# News Layout Improvements

## Purpose

Enhance the news page beyond a simple card grid by implementing a modern magazine-style hierarchical layout that:

- Improves visual hierarchy and content discovery
- Creates more engaging user experience
- Follows 2026 design trends and sports news best practices
- Maintains mobile-first responsive design

## Research Summary

### Modern Design Trends (2026)

- **Modular/Block-based Design**: Flexible, scalable systems adapting across screen sizes
- **Hierarchical Grids**: Different-sized elements for visual interest and content priority
- **Magazine Layouts**: Standard for news sites, placing lots of content while keeping pieces distinct
- **Performance-first**: Speed and optimization from design stage
- **Glassmorphism**: Layered, tactile feel improving readability on busy pages

### Sports News Best Practices

- Grid layouts provide visual balance and easy content scanning
- Card-style layouts work well for varied content types
- Hierarchical grids ideal for online news platforms
- Magazine-style layouts keep content distinct while maximizing page density
- Mobile-first approach critical for sports fans on the move

**Sources:**

- [Web Design Trends 2026 - TheeDigital](https://www.theedigital.com/blog/web-design-trends)
- [Web Layout Best Practices - Toptal](https://www.toptal.com/designers/ui/web-layout-best-practices)
- [Sports Website Design Best Practices - Seahawk Media](https://seahawkmedia.com/design/sports-website-design/)

## Requirements

### Layout Structure

1. **Hero/Featured Section** (Top)
   - Single large featured article taking full width
   - Prominent image, title, excerpt
   - Visual distinction from other articles

2. **Recent News Grid** (Below Hero)
   - Magazine-style hierarchical grid
   - Mix of card sizes for visual hierarchy
   - First few articles larger/more prominent
   - Remaining articles in standard grid

3. **Responsive Behavior**
   - Mobile: Single column, hero followed by stacked cards
   - Tablet: 2-column grid with hero spanning full width
   - Desktop: Magazine layout with varied card sizes

### Technical Constraints

- Reuse existing `NewsCard` component where possible
- Create new layout wrapper component for magazine grid
- Maintain existing data fetching from `getNewsArticles()`
- Preserve SEO, accessibility, and performance standards
- Follow project code style (Tailwind CSS, no inline styles)
- Keep components under 200 lines

### Acceptance Criteria

- [x] Featured article displays prominently at top
- [x] Magazine-style grid shows visual hierarchy
- [x] Responsive design works on mobile, tablet, desktop
- [x] All articles remain accessible and readable
- [x] No performance degradation
- [x] Passes linting, formatting, and type checks
- [x] Maintains existing SEO metadata

## Implementation Tasks

- [x] Create `NewsHero` component for featured article display
- [x] Simplify NewsHero styling to match design specs (removed gradient backgrounds)
- [x] Update news page to use unified grid layout (4 cols xl, 3 cols lg, 2 cols md, 1 col mobile)
- [x] Test responsive behavior across breakpoints
- [x] Run lint, format, and type checks
- [x] Verify accessibility and performance

## Design Approach

### Layout Variations to Consider

**Option A: Single Hero + Standard Grid**

- One featured article at top (full width)
- Remaining articles in uniform 3-column grid
- Simplest implementation

**Option B: Hero + Hierarchical Grid**

- One featured article at top (full width)
- Next 2-3 articles in larger cards (2-column on desktop)
- Remaining articles in 3-column grid
- Better visual hierarchy

**Option C: Magazine Layout**

- Featured article (large, left side)
- 2-3 secondary articles (right side, stacked)
- Remaining in mixed grid (alternating sizes)
- Most engaging, higher complexity

### Recommended Approach: Option B

Best balance of visual interest, user experience, and implementation complexity for a sports club news page.

## Open Questions

None - ready to proceed with implementation.
