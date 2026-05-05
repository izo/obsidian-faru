import { App } from 'obsidian';
import { FaruCard, FaruConfig } from '../types';
import { formatDate } from '../utils';

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
  const file = await app.vault.create(filePath, '');

  await app.fileManager.processFrontMatter(file, (fm) => {
    fm['title'] = params.title;
    fm['type'] = params.type.toLowerCase();
    fm['status'] = 'todo';
    fm['assigned'] = params.assigned ?? '';
    fm['created'] = today;
    fm['edited'] = today;
    fm['description'] = '';
  });

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
