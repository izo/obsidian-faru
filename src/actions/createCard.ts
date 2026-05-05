import { App } from 'obsidian';
import { FaruCard, FaruConfig } from '../types';

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function yamlEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function buildFolderName(date: string, type: string, title: string): string {
  const normalizedType = type.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const normalizedTitle = title.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `${date}-${normalizedType}-${normalizedTitle}`;
}

export async function createCard(
  app: App,
  config: FaruConfig,
  params: { title: string; type: string; assigned?: string }
): Promise<FaruCard> {
  const today = formatDate(new Date());
  const folderName = buildFolderName(today, params.type, params.title);
  const backlogDir = config.backlogDir.replace(/^\.\//, '');
  const folderPath = `${backlogDir}/${folderName}`;
  const filePath = `${folderPath}/CARD.md`;

  await app.vault.createFolder(folderPath);

  const frontmatter = [
    '---',
    `title: "${yamlEscape(params.title)}"`,
    `type: ${params.type.toLowerCase()}`,
    'status: todo',
    `assigned: ${params.assigned ?? ''}`,
    `created: ${today}`,
    `edited: ${today}`,
    'description: ""',
    '---',
    '',
  ].join('\n');

  await app.vault.create(filePath, frontmatter);

  return {
    folderPath,
    filePath,
    title: params.title,
    type: params.type.toLowerCase(),
    status: 'todo',
    assigned: params.assigned ?? '',
    created: today,
    edited: today,
    description: '',
  };
}
