---
inclusion: fileMatch
fileMatchPattern: ".kiro/agents/*.md"
---

# Token Efficiency Rule (Sub-Agent Delegation)

When delegating work to ANY sub-agent (@frontend, @architect, @tester, @quality-assurance, @protobuf-engineer, @github-agent):

1. **If you already have file contents in context** from the current conversation → pass them in the sub-agent prompt
2. **If you don't have file contents in context** → delegate immediately and let the sub-agent explore on its own
3. **NEVER read files solely to forward them to a sub-agent** — this wastes tokens and duplicates work

The sub-agents have their own read tools. They can explore the codebase themselves. Your job is to delegate with a clear task description, not to pre-load context for them.
