---
name: plan-creator
description: "Creates and maintains implementation plans for the Williamstown SC project. This skill should be used when the user asks to create a plan, document a feature, or track implementation progress for a task. Plans are stored in docs/plans/ and follow the project's established conventions."
---

# Plan Creator

## Purpose

Create concise, actionable implementation plans stored under `docs/plans/` following project naming and structure conventions. Update plans as tasks are completed by ticking checkboxes.

## Plan File Conventions

- **Location**: `docs/plans/`
- **Filename**: `YYYY-MM-DD-description.md` using today's date (e.g. `2026-03-04-results-crawling.md`)
- **Language**: Imperative, concise — sacrifice grammar for brevity
- **Length**: Keep plans lean; move detailed reference material to separate files

## Plan Structure

```markdown
# <Title>

**Created:** YYYY-MM-DD
**Status:** Pending | In Progress | Done

## Purpose

<1-2 sentences: what outcome this plan achieves and why it is needed>

## Requirements

- Constraints and dependencies
- Acceptance criteria
- Out-of-scope items (if helpful)

## Todo

- [ ] Task one
- [ ] Task two
- [ ] Run `npm run type:check`
- [ ] Run `npm run lint`
- [ ] Run `npm run format`

## Files

List key files being changed and what changes are made to each.

## Unresolved Questions

- List any open questions (omit section if none)
```

## Verification Steps

Always include these as the final todo items in every plan:

```markdown
- [ ] Run `npm run type:check`
- [ ] Run `npm run lint`
- [ ] Run `npm run format`
```

For larger changes involving new components, new routes, or schema changes, also add:

```markdown
- [ ] Run `npm run build`
```

## Workflow

1. **Gather context** — read relevant existing files before drafting the plan
2. **Create the plan file** — use Write tool at `docs/plans/YYYY-MM-DD-description.md`
3. **Update as work progresses** — tick checkboxes (`- [ ]` → `- [x]`) as tasks complete; update **Status** field when plan is fully done

## Updating Plans

When tasks are completed:

- Use Edit tool to change `- [ ]` to `- [x]` for completed items
- Update `**Status:**` from `Pending` → `In Progress` → `Done` as appropriate

## Example Reference

See `docs/plans/2026-03-04-results-crawling.md` for a well-formed example of the expected style and depth.
