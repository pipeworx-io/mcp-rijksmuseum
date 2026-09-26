# @pipeworx/rijksmuseum

The Rijksmuseum's ~800,000-object collection — Dutch Golden Age paintings,
prints, drawings, photographs, Delftware and Asian art — from the museum's open
Data Services API, with IIIF images and mostly public-domain rights.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1683+ live data sources.

## Tools

- `rijks_search(...)` — search by title, creator, type, material, technique, object number or image availability; returns hydrated records, not bare ids.
- `rijks_object(id | object_number)` — one object in full, including the museum's own curatorial description.
- `rijks_object_image(id, width)` — IIIF service, full-resolution dimensions, full/scaled/thumbnail JPEG URLs and the rights statement.

## Auth

Keyless.

**There are two Rijksmuseum APIs and only this one is open.** The legacy
`www.rijksmuseum.nl/api` needs a key issued per Rijksstudio account;
`data.rijksmuseum.nl` (used here) needs no credential.

## Data sources

- <https://data.rijksmuseum.nl/search/collection> — field-scoped search, returns identifiers only.
- <https://data.rijksmuseum.nl/{id}?_profile=dc> — Dublin Core record (~4 KB).
- <https://data.rijksmuseum.nl/{id}> — full Linked Art JSON-LD (~95 KB).

Notes the next person would otherwise rediscover:

- **Search returns bare URIs.** A page is 100 `https://id.rijksmuseum.nl/<n>`
  strings plus a total — no titles, no images. `rijks_search` hydrates each
  returned hit with one extra fetch, which is why `limit` is capped at 25.
- **Use `_profile=dc`, not the default Linked Art.** Linked Art buries the
  title three levels inside `identified_by` and the image behind a
  `shows` → VisualItem → `digitally_shown_by` → DigitalObject chain (three more
  fetches). Dublin Core has all of it flat, including the IIIF URL in
  `relation`, at ~1/20th the size.
- **Unknown query parameters are rejected by name** (`{"detail":"Unsupported
  query parameter: q"}`). There is no free-text `q`. Verified accepted:
  `title`, `creator`, `type`, `material`, `technique`, `objectNumber`,
  `imageAvailable`. `subject` is NOT accepted, despite `subject` existing as a
  field on the record.
- **Titles are catalogued in Dutch.** `title=Nachtwacht` finds The Night Watch;
  `title=Night Watch` does not.
- `objectNumber` resolves exactly (`SK-C-5` → 200107928), so `rijks_object`
  accepts a museum object number and resolves it through search.
- Images are IIIF Image API 3, level 2, served from `iiif.micr.io` — any
  region/size/rotation is requestable from `iiif_service`.

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/rijksmuseum/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1683+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/rijks_search \
  -H 'Content-Type: application/json' \
  -d '{"creator":"Rembrandt van Rijn","type":"painting","limit":3}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/rijks_search`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "rijksmuseum": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-rijksmuseum"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-rijksmuseum
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Rijksmuseum data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
