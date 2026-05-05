import { App } from 'obsidian';
import { FaruCard, FaruColumn, FaruConfig } from './types';

export function resolveCardFile(files: string[]): string | null {
  const mdFiles = files.filter((f) => f.endsWith('.md'));
  if (mdFiles.length === 0) return null;

  const milestonesFile = mdFiles.find((f) => /[^/]+-milestones\.md$/.test(f));
  if (milestonesFile) return milestonesFile;

  const cardFile = mdFiles.find((f) => f.endsWith('/CARD.md') || f === 'CARD.md');
  if (cardFile) return cardFile;

  const specFile = mdFiles.find((f) => /[^/]+-spec\.md$/.test(f));
  if (specFile) return specFile;

  return mdFiles[0];
}

export async function parseMilestones(
  app: App,
  files: string[]
): Promise<{ total: number; completed: number } | undefined> {
  const milestonesFile = files.find((f) => /[^/]+-milestones\.md$/.test(f));
  if (!milestonesFile) return undefined;

  const fileName = milestonesFile.split('/').pop() ?? '';
  const prefix = fileName.replace(/-milestones\.md$/, '');

  let content: string;
  try {
    content = await app.vault.adapter.read(milestonesFile);
  } catch {
    return undefined;
  }

  const headingPattern = new RegExp(`^## ${escapeRegex(prefix)}-(\\d+):`, 'gm');
  const matches = [...content.matchAll(headingPattern)];
  const total = matches.length;
  if (total === 0) return undefined;

  let completed = 0;
  for (const match of matches) {
    const n = match[1];
    const reportName = `${prefix}-${n}-report.md`;
    if (files.some((f) => f.endsWith('/' + reportName) || f === reportName)) {
      completed++;
    }
  }

  return { total, completed };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const VALID_STATUSES = new Set<FaruColumn>(['todo', 'wip', 'done']);

function normalizeStatus(raw: unknown): FaruColumn {
  if (typeof raw === 'string' && VALID_STATUSES.has(raw as FaruColumn)) {
    return raw as FaruColumn;
  }
  return 'todo';
}

export async function parseBacklog(app: App, config: FaruConfig): Promise<FaruCard[]> {
  const backlogDir = config.backlogDir.replace(/^\.\//, '');
  const cards: FaruCard[] = [];

  let listing: { files: string[]; folders: string[] };
  try {
    listing = await app.vault.adapter.list(backlogDir);
  } catch {
    console.warn(`[Faru] backlogDir "${backlogDir}" not found.`);
    return [];
  }

  for (const folderPath of listing.folders) {
    let folderListing: { files: string[]; folders: string[] };
    try {
      folderListing = await app.vault.adapter.list(folderPath);
    } catch {
      continue;
    }

    const primaryFile = resolveCardFile(folderListing.files);
    if (!primaryFile) continue;

    const cache = app.metadataCache.getCache(primaryFile);
    const fm = cache?.frontmatter;
    if (!fm) {
      console.log(`[Faru] No frontmatter in ${primaryFile}, skipping.`);
      continue;
    }

    const milestones = await parseMilestones(app, folderListing.files);

    cards.push({
      folderPath,
      filePath: primaryFile,
      title: String(fm.title ?? ''),
      type: String(fm.type ?? ''),
      status: normalizeStatus(fm.status),
      assigned: String(fm.assigned ?? ''),
      created: String(fm.created ?? ''),
      edited: fm.edited ? String(fm.edited) : undefined,
      description: String(fm.description ?? ''),
      links: Array.isArray(fm.links) ? fm.links.map(String) : undefined,
      milestones,
    });
  }

  cards.sort((a, b) => (b.created > a.created ? 1 : -1));
  return cards;
}
