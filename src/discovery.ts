import { App } from 'obsidian';
import { DiscoveredBacklog, FARU_DEFAULTS } from './types';

const FARU_CARD_RE = /^\d{4}-\d{2}-\d{2}-[A-Z]/;
const MAX_DEPTH = 4;
const SKIP_DIRS = new Set(['.obsidian', '.trash', 'node_modules', '.git']);

function resolveBacklogDir(configPath: string, rawDir: string): string {
  const stripped = rawDir.replace(/^\.\//, '');
  if (!configPath.includes('/')) return stripped;
  const base = configPath.substring(0, configPath.lastIndexOf('/'));
  return base ? `${base}/${stripped}` : stripped;
}

function nameFromDir(dir: string): string {
  if (!dir || !dir.includes('/')) return dir || 'Root';
  return dir.split('/').pop() ?? dir;
}

async function scan(
  app: App,
  dir: string,
  depth: number,
  configs: string[],
  heuristicDirs: string[]
): Promise<void> {
  if (depth <= 0) return;

  let listing: { files: string[]; folders: string[] };
  try {
    listing = await app.vault.adapter.list(dir);
  } catch {
    return;
  }

  for (const f of listing.files) {
    if (f.split('/').pop() === 'faru.config.json') configs.push(f);
  }

  // Heuristic: this dir is a Faru backlog if it contains card folders + CARD.md
  if (dir !== '') {
    const cardFolders = listing.folders.filter((f) =>
      FARU_CARD_RE.test(f.split('/').pop() ?? '')
    );
    if (cardFolders.length > 0) {
      for (const cf of cardFolders.slice(0, 3)) {
        try {
          const inner = await app.vault.adapter.list(cf);
          if (inner.files.some((f) => f.split('/').pop() === 'CARD.md')) {
            heuristicDirs.push(dir);
            break;
          }
        } catch { /* skip */ }
      }
    }
  }

  for (const folder of listing.folders) {
    const name = folder.split('/').pop() ?? '';
    if (name.startsWith('.') || SKIP_DIRS.has(name) || FARU_CARD_RE.test(name)) continue;
    await scan(app, folder, depth - 1, configs, heuristicDirs);
  }
}

export async function discoverBacklogs(app: App): Promise<DiscoveredBacklog[]> {
  const configs: string[] = [];
  const heuristicDirs: string[] = [];

  await scan(app, '', MAX_DEPTH, configs, heuristicDirs);

  const result: DiscoveredBacklog[] = [];
  const resolvedDirs = new Set<string>();

  for (const configPath of configs) {
    let rawBacklogDir = FARU_DEFAULTS.backlogDir;
    try {
      const raw = await app.vault.adapter.read(configPath);
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (typeof parsed['backlogDir'] === 'string') rawBacklogDir = parsed['backlogDir'] as string;
    } catch { /* use default */ }

    const backlogDir = resolveBacklogDir(configPath, rawBacklogDir);
    resolvedDirs.add(backlogDir);

    const configDir = configPath.includes('/')
      ? configPath.substring(0, configPath.lastIndexOf('/'))
      : '';
    const displayName = configDir ? nameFromDir(configDir) : 'Root';

    result.push({ configPath, backlogDir, displayName });
  }

  for (const dir of heuristicDirs) {
    if (resolvedDirs.has(dir)) continue;
    result.push({ configPath: '', backlogDir: dir, displayName: nameFromDir(dir) + ' (auto)' });
  }

  return result;
}
