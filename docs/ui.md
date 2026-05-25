# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used for UI in this project.**

- Import components from `@/components/ui/` (the shadcn/ui generated components)
- Do NOT create custom UI components — if a UI element is needed, find the appropriate shadcn/ui component
- Do NOT write raw HTML elements for UI purposes (buttons, inputs, cards, dialogs, etc.) when a shadcn/ui equivalent exists
- If a component is not yet installed, add it with: `npx shadcn@latest add <component-name>`

## Date Formatting

All dates must be formatted using **date-fns**. Do not use `Date.toLocaleDateString()`, `Intl.DateTimeFormat`, or any other date formatting method.

### Required Format

Dates must display with an ordinal suffix, abbreviated month, and full year:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

### Implementation

```ts
import { format } from "date-fns";

function formatDate(date: Date): string {
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

  return `${day}${suffix} ${format(date, "MMM yyyy")}`;
}
```
