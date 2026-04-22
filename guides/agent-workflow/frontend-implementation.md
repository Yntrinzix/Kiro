---
inclusion: manual
---

# Phase 2: Frontend Implementation

When writing frontend code:

## Step 1: Implementation
Use **@frontend** for code writing
- Follow functional programming principles
- Use proper TypeScript types  read `.kiro/guides/frontend/typescript-best-practices.md` before writing any TypeScript
- Apply React best practices
- Keep code simple and clean
- Avoid `useRef(false)` as a mount guard for `useEffect`  this obscures intent. Prefer `[]` with an explicit conditional (e.g. checking atom/prop state) to express why the effect is guarded

## Step 2: Critical Review
Always let **@quality-assurance** check the code.

**Handoff context**: Include a 1-2 sentence summary of what @frontend did and which files were created/modified. This avoids the reviewer re-discovering everything from scratch.

- Review for bugs and edge cases
- Check error handling
- Validate assumptions
- Question complexity

## Step 3: Feedback Loop (conditional)
Only re-invoke **@frontend** if @quality-assurance raised critical issues.
- If @quality-assurance found no critical issues  done, skip this step
- If @quality-assurance found issues  submit feedback to @frontend:
  - Address critical issues
  - Fix identified bugs
  - Simplify over-engineered solutions
  - Improve error handling
  - Ensure Biome compliance and formatting

## Example

```
User: "Implement the journey list page"

1. @frontend - Write the component
2. @quality-assurance - Review for issues
3. IF critical issues found  @frontend - Fix issues and ensure Biome compliance
   IF no critical issues  done
```

## MVC / Legacy jQuery (QT-Ubi-UbiquityBackend)

When working on the MVC frontend (`.aspx`, `.ascx`, `Util.js`, `Lists*.js`):

- **Never build HTML from server JSON via string concatenation + `.html()`**  this is XSS. Use DOM construction with `<element>.text(value)` and `document.createTextNode()` instead. The existing codebase uses `.text()` for user-supplied values (e.g., delete/archive dialogs).
- **`Util.showDialog` uses `keypress` for Escape**  `keypress` doesn't fire for non-printable keys in modern browsers. Any dialog needing custom Escape handling must use `keydown` with a namespace (e.g., `keydown.myDialog`) bound *after* `Util.showDialog()`.
- **`<a>` tags with `addClass("disabled")` are only visual**  click events still fire. Always add `if (}(this).hasClass("disabled")) return;` as the first line of click handlers on `<a>` buttons.
- **No JS test infrastructure**  the MVC project has no test runner. QA review is the primary quality gate for JS changes.

## Next Step: Testing

If the change includes new business logic, user flows, or error handling paths, suggest running the testing workflow next. Don't force it  just nudge:
> "This added new logic in X. Want to run the testing workflow to cover it?"