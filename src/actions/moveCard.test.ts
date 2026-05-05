import { describe, it, expect, vi } from 'vitest';
import { moveCard } from './moveCard';
import { TFile } from 'obsidian';

describe('moveCard', () => {
  it('calls processFrontMatter with new status and edited date', async () => {
    const file = new TFile();
    file.path = 'backlog/CARD/CARD.md';

    let captured: Record<string, unknown> = {};
    const app = {
      vault: {
        getAbstractFileByPath: vi.fn().mockReturnValue(file),
      },
      fileManager: {
        processFrontMatter: vi.fn().mockImplementation(async (_f, cb) => {
          cb(captured);
        }),
      },
    } as any;

    const card = {
      folderPath: 'backlog/CARD',
      filePath: 'backlog/CARD/CARD.md',
      title: 'Test',
      type: 'product',
      status: 'todo' as const,
      assigned: 'alice',
      created: '2026-05-04',
      description: '',
    };

    await moveCard(app, card, 'wip');

    expect(app.fileManager.processFrontMatter).toHaveBeenCalledOnce();
    expect(captured.status).toBe('wip');
    expect(typeof captured.edited).toBe('string');
    expect(captured.edited).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('does nothing if file is not found', async () => {
    const app = {
      vault: { getAbstractFileByPath: vi.fn().mockReturnValue(null) },
      fileManager: { processFrontMatter: vi.fn() },
    } as any;

    const card = {
      folderPath: 'backlog/CARD',
      filePath: 'backlog/CARD/CARD.md',
      title: 'Test',
      type: 'product',
      status: 'todo' as const,
      assigned: '',
      created: '2026-05-04',
      description: '',
    };

    await moveCard(app, card, 'done');
    expect(app.fileManager.processFrontMatter).not.toHaveBeenCalled();
  });
});
