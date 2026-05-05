import { App, TFile } from 'obsidian';
import { FaruCard, FaruColumn } from '../types';

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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
