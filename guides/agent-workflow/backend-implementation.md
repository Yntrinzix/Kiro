---
inclusion: manual
---

# Backend Implementation Workflow

## When to Use
Any C#/.NET implementation work in the QT-Ubi-UbiquityBackend repository.

## Agent Order
1. **@backend**  Implements the C# code changes
2. **@quality-assurance**  Reviews for edge cases, error handling, backward compatibility
3. **@backend**  Addresses QA feedback

## Workflow

### Step 1: Implementation (@backend)
- Identify the target domain and affected projects
- Check existing patterns in the domain before writing new code
- When introducing any naming pattern or convention not already in the guides, search the codebase first (e.g. file search for common suffixes). Never fall back to trained defaults when the codebase has an established pattern.
- Implement changes following C# conventions
- Add/update NUnit tests
- Run `dotnet build` and `dotnet test` for affected projects

### Step 2: Review (@quality-assurance)
- Review for error handling gaps
- Check backward compatibility (existing contracts, XML config)
- Verify test coverage for critical paths
- Flag any missing null checks or exception handling

### Step 3: Fix (@backend)
- Address QA findings
- Re-run tests to confirm fixes

## Key Considerations
- Always check XML config files when modifying service wiring
- Run tests for the specific domain: `dotnet test {domain}/nunit/{domain}.nunit.csproj`
- Check for breaking changes in shared projects (u2ool, system.common)
- Verify gRPC contract compatibility when modifying grpc/ projects
