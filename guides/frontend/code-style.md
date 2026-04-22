---
inclusion: manual
---

# Code Style Guidelines

## Import Ordering

- ALL import statements MUST be grouped together at the top of the file (after "use client"/"use server" directives if present)
- NEVER place constants, variables, type declarations, or any other code between import statements
- Module-level constants (like `logger`) go AFTER all imports are complete

```tsx
// ❌ Bad: constant between imports
import { createClientLogger } from "@monorepo/packages-logger";

const logger = createClientLogger({ component: "MyComponent" });

import { useState } from "react";
import { Button } from "@monorepo/packages-ui";

// ✅ Good: all imports together, then constants
import { createClientLogger } from "@monorepo/packages-logger";
import { useState } from "react";
import { Button } from "@monorepo/packages-ui";

const logger = createClientLogger({ component: "MyComponent" });
```

## Variables

- Use `const` by default, `let` only when reassignment needed
- NEVER use `var`
- Destructure objects and arrays
- Use meaningful, descriptive names
- Use camelCase for variables/functions, PascalCase for components/types

## Functions

- Use arrow functions exclusively — Biome enforces `complexity/useArrowFunction: error`
- For React components: `const MyComponent = (): React.JSX.Element => { ... }` with `export default MyComponent` at the bottom of the file (arrow functions can't use inline `export default`)
- Keep functions small (< 20 lines ideally)
- Single responsibility principle
- Use early returns to avoid nesting
- Pure functions when possible

## Conditionals

- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Prefer early returns over nested if/else
- Use ternaries for simple conditions
- Use guard clauses to reduce nesting

## Examples

```typescript
// ❌ Bad: Nested conditionals
const getDiscount = (user) => {
  if (user) {
    if (user.isPremium) {
      if (user.orders > 10) {
        return 0.2;
      } else {
        return 0.1;
      }
    } else {
      return 0;
    }
  }
  return 0;
};

// ✅ Good: Early returns
const getDiscount = (user: User | null): number => {
  if (!user) return 0;
  if (!user.isPremium) return 0;
  return user.orders > 10 ? 0.2 : 0.1;
};

// ❌ Bad: Verbose null checks
const userName = user && user.profile && user.profile.name ? user.profile.name : 'Guest';

// ✅ Good: Optional chaining and nullish coalescing
const userName = user?.profile?.name ?? 'Guest';
```

## Commenting Philosophy

### When to Comment:
- ONLY when the WHY is not obvious from the code
- Complex algorithms that need explanation
- Non-obvious business logic or domain rules
- Workarounds for bugs or limitations
- Public API documentation (JSDoc)

### When NOT to Comment:
- NEVER comment what the code does (code shows that)
- Don't state the obvious
- Don't comment bad code - refactor it instead
- Don't leave commented-out code

### Examples:

```typescript
// ❌ Bad: Obvious comments
// Set the user name
const name = user.name;

// Loop through items
items.forEach(item => {
  // Process the item
  processItem(item);
});

// Return the result
return result;

// ✅ Good: Only comment non-obvious WHY
// Using exponential backoff to avoid overwhelming the API during high traffic
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);

// ✅ Good: Self-documenting code needs no comments
const activeUsers = users.filter(user => user.isActive);
const userNames = activeUsers.map(user => user.name);
return userNames.sort();
```

## Biome Rules You Must Follow

These are enforced by the project's `biome.json` and must be followed in all code you write:

- `complexity/useArrowFunction: error` — Always use arrow functions, never `function` declarations
- `a11y/useButtonType: error` — Every `<button>` must have an explicit `type` attribute
- `a11y/useKeyWithClickEvents: error` — Elements with `onClick` must also have keyboard handlers
- `a11y/useAltText: error` — All `<img>` elements must have `alt` text
- `style/useConst: error` — Use `const` for all non-reassigned variables
- `style/useSelfClosingElements: error` — Self-close elements without children (`<div />`)
- `style/useConsistentArrayType: shorthand` — Use `T[]` not `Array<T>`
- `style/useCollapsedIf: error` — Collapse nested `if` into `if (a && b)`
- `style/useConsistentCurlyBraces: error` — Consistent curly braces in JSX expressions
- `style/noEnum: error` — Never use `enum`, use `as const` objects or union types instead
- `style/useTemplate: error` — Use template literals instead of string concatenation
- `suspicious/noDoubleEquals: error` — Always use `===` and `!==`
- `suspicious/noExplicitAny: error` — Never use `any`
- `suspicious/noVar: error` — Never use `var`
- `correctness/noUnusedImports: error` — Remove all unused imports
- `correctness/noUnusedVariables: error` — Remove all unused variables
- `correctness/useExhaustiveDependencies: error` — Complete dependency arrays in hooks
- `correctness/useJsxKeyInIterable: error` — Always provide `key` in mapped JSX
- `nursery/useSortedClasses: error` — Tailwind classes must be sorted (use `cn()` helper)
- `performance/noAccumulatingSpread: error` — Don't spread in loops (use `push` or `concat`)

When in doubt about a Biome rule, don't guess — use `getDiagnostics` to verify.

## Error Handling

- Use proper error types, not generic Error
- Handle errors at appropriate boundaries
- Use Result types or error boundaries in React
- Provide meaningful error messages
- Don't swallow errors silently

```typescript
// ✅ Good: Proper error handling
const fetchUser = async (id: string): Promise<User> => {
  const response = await fetch(`/api/users/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  
  return response.json();
};
```

## Logger Placement Convention

When using `createClientLogger` from `@monorepo/packages-logger`:

- Always declare `const logger = createClientLogger({ component: "ComponentName" })` at the module top level, immediately after all import statements and before any function, component, interface, or type declarations
- Never declare the logger inside a function, component body, or any block scope
- The component name passed to `createClientLogger` should match the file's primary export name

```tsx
// ✅ Good: Logger at module top level
"use client";

import { createClientLogger } from "@monorepo/packages-logger";
import { useState } from "react";

const logger = createClientLogger({ component: "MyComponent" });

export function MyComponent() {
  // use logger here
}

// ❌ Bad: Logger inside component
export function MyComponent() {
  const logger = createClientLogger({ component: "MyComponent" });
}
```
