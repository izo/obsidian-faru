import { App, TFile } from 'obsidian';
import { FaruCard, FaruColumn } from '../types';
import { formatDate } from '../utils';

export async function moveCard(app: App, card: FaruCard, newStatus: FaruColumn): Promise<void> {
  const file = app.vault.getAbstractFileByPath(card.filePath);
  if (!(file instanceof TFile)) {
    console.warn(`[Faru] moveCard: file not found at ${card.filePath}`);
    return;
  }
  await app.fileManager.processFrontMatter(file, (fm) => {
    fm.status = newStatus;
    fm.edited = formatDate(new Date());
  });
}
