# Kiro CLI Configuration Package

This package contains agent configurations, steering documents, and MCP server setup for the UbiQuity project.

## Contents

- `agents/` - Custom agent configurations (dotnet, frontend, infra, product)
- `steering/` - Project context documents for AI agents
- `settings/` - LSP and MCP configurations
- `mcp-servers/` - MCP server configurations (if any)

## Setup Instructions

### 1. Install Kiro CLI

Follow instructions at https://kiro.dev/downloads/

### 2. Copy Configuration Files

```bash
# Copy agents
cp agents/*.json ~/.kiro/agents/

# Copy steering documents
cp steering/*.md ~/.kiro/steering/

# Copy settings
cp settings/lsp.json ~/.kiro/settings/
```

### 3. Configure MCP Servers

Edit `settings/mcp.json` and replace placeholders:

- `YOUR_ORG.atlassian.net` - Your Confluence URL
- `your.email@company.com` - Your Confluence email
- `YOUR_CONFLUENCE_API_TOKEN_HERE` - Generate at: https://id.atlassian.com/manage-profile/security/api-tokens
- `YOUR_GITHUB_PAT_HERE` - Generate at: https://github.com/settings/tokens
- `YOUR_ORG_NAME` - Your Azure DevOps organization name

Then copy to Kiro:
```bash
cp settings/mcp.json ~/.kiro/settings/
```

### 4. Verify Setup

```bash
# List agents
kiro-cli agent list

# Check MCP servers
kiro-cli mcp list
```

### 5. Using Agents

Start chat with specific agent:
```bash
kiro-cli --agent dotnet
kiro-cli --agent frontend
kiro-cli --agent infra
kiro-cli --agent product
```

Or use keyboard shortcuts (if configured):
- Ctrl+D - .NET agent
- Ctrl+F - Frontend agent
- Ctrl+I - Infrastructure agent

## Agent Descriptions

- **dotnet** - .NET Framework 4.8 and .NET 8+ development
- **frontend** - Next.js, TypeScript, React development
- **infra** - AWS, Terraform, Docker, infrastructure
- **product** - Azure DevOps ticketing, documentation, backlog management

## Steering Documents

- `legacy-backend.md` - .NET Framework 4.8 backend architecture
- `modern-platform.md` - .NET 8+ platform services
- `frontend.md` - Next.js applications
- `infrastructure.md` - Terraform and AWS
- `product.md` - Azure DevOps and product management
- `README.md` - Overview of steering documents

## MCP Servers

- **playwright** - Browser automation
- **mcp-atlassian** - Confluence integration
- **github** - GitHub API access
- **azure-devops** - Azure DevOps integration

## Troubleshooting

If agents don't load steering documents, check file paths in agent JSON files match your setup.

For MCP issues, run:
```bash
kiro-cli mcp status --name <server-name>
```
