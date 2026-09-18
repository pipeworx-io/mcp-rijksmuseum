# mcp-rijksmuseum

Rijksmuseum MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 960+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search` | Search the Rijksmuseum collection by keyword. Returns matching items with ids (pass an id to artwork), titles, creators, dates and image links. |
| `artwork` | Fetch full details for one Rijksmuseum item by id — a Rijksmuseum object number (e.g. "SK-C-5", from search). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "rijksmuseum": {
      "url": "https://gateway.pipeworx.io/rijksmuseum/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 960+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Rijksmuseum data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/rijks_search \
  -H 'Content-Type: application/json' \
  -d '{"creator":"Rembrandt van Rijn","type":"painting","limit":3}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/rijks_search`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.
