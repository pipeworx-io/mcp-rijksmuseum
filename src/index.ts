interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Rijksmuseum MCP.
 *
 * Rijksmuseum (Amsterdam) — the Dutch national museum collection: 700k+ artworks incl. Rembrandt & Vermeer, with high-res images. FREE API key required (get one at https://data.rijksmuseum.nl (free key via Rijksstudio account)); the platform
 * provides it automatically, or pass your own via _apiKey (BYOK).
 */


const BASE = 'https://www.rijksmuseum.nl/api/en';
const UA = 'pipeworx-mcp-rijksmuseum/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description: 'Search the Rijksmuseum collection by keyword. Returns matching items with ids (pass an id to artwork), titles, creators, dates and image links.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keyword(s), e.g. "rembrandt", "ceramics", "moon landing".' },
        limit: { type: 'number', description: 'Max results (1-100, default 20).' },
        page: { type: 'number', description: 'Page number (1-based, default 1).' },
        _apiKey: { type: 'string', description: 'Rijksmuseum API key (auto-injected by the platform; or pass your own).' },
      },
      required: ['query'],
    },
  },
  {
    name: 'artwork',
    description: 'Fetch full details for one Rijksmuseum item by id — a Rijksmuseum object number (e.g. "SK-C-5", from search).',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'e.g. "SK-C-5".' },
        _apiKey: { type: 'string', description: 'Rijksmuseum API key (auto-injected by the platform; or pass your own).' },
      },
      required: ['id'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const key = typeof args._apiKey === 'string' ? args._apiKey : '';
  delete args._apiKey;
  if (!key) throw new Error('Rijksmuseum API key required. Get one free at https://data.rijksmuseum.nl (free key via Rijksstudio account) and pass via _apiKey (the platform key may not be configured yet).');
  switch (name) {
    case 'search': {
      const limit = clamp(numArg(args.limit, 20), 1, 100);
      const page = Math.max(1, numArg(args.page, 1));
      const p = new URLSearchParams({ 'key': key, 'q': String(args.query ?? ''), 'ps': String(limit) });
      p.set('p', String(page));
      return get(`${BASE}/collection?${p}`);
    }
    case 'artwork': {
      const id = reqStr(args, 'id', '"SK-C-5"');
      return get(`${BASE}/collection/${encodeURIComponent(id)}?key=${encodeURIComponent(key)}`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function get(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (res.status === 401 || res.status === 403) throw new Error('Rijksmuseum: key rejected (invalid/expired key). Get a free key at https://data.rijksmuseum.nl (free key via Rijksstudio account).');
  if (!res.ok) throw new Error(`Rijksmuseum: ${res.status} ${await res.text().then((t) => t.slice(0, 160))}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}
function numArg(v: unknown, dflt: number): number { const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN; return Number.isFinite(n) ? n : dflt; }
function clamp(n: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, Math.trunc(n))); }

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
