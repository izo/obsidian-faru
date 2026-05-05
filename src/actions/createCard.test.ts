import { describe, it, expect, vi } from 'vitest';
import { buildFolderName, createCard } from './createCard';

describe('buildFolderName', () => {
  it('uppercases type and title', () => {
    expect(buildFolderName('2026-05-04', 'product', 'oauth login')).toBe(
      '2026-05-04-PRODUCT-OAUTH-LOGIN'
    );
  });

  it('replaces spaces with hyphens', () => {
    expect(buildFolderName('2026-05-04', 'ops', 'ci pipeline setup')).toBe(
      '2026-05-04-OPS-CI-PIPELINE-SETUP'
    );
  });

  it('strips leading/trailing hyphens from title', () => {
    expect(buildFolderName('2026-05-04', 'bug', '  crash on load  ')).toBe(
      '2026-05-04-BUG-CRASH-ON-LOAD'
    );
  });

  it('collapses multiple separators into one hyphen', () => {
    expect(buildFolderName('2026-05-04', 'product', 'fix--double  issue')).toBe(
      '2026-05-04-PRODUCT-FIX-DOUBLE-ISSUE'
    );
  });

  it('removes non-alphanumeric characters', () => {
    expect(buildFolderName('2026-05-04', 'bug', 'fix: null@pointer!')).toBe(
      '2026-05-04-BUG-FIX-NULL-POINTER'
    );
  });
});

describe('createCard', () => {
  it('creates the correct folder and CARD.md', async () => {
    const app = {
      vault: {
        createFolder: vi.fn().mockResolvedValue(undefined),
        create: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const config = { backlogDir: './backlog', cardCategories: ['product', 'bug'] };
    const card = await createCard(app, config, { title: 'OAuth Flow', type: 'product', assigned: 'alice' });

    expect(app.vault.createFolder).toHaveBeenCalledOnce();
    const folderArg: string = app.vault.createFolder.mock.calls[0][0];
    expect(folderArg).toMatch(/^backlog\/\d{4}-\d{2}-\d{2}-PRODUCT-OAUTH-FLOW$/);

    expect(app.vault.create).toHaveBeenCalledOnce();
    const [filePath, content]: [string, string] = app.vault.create.mock.calls[0];
    expect(filePath).toBe(`${folderArg}/CARD.md`);
    expect(content).toContain('status: todo');
    expect(content).toContain('title: "OAuth Flow"');
    expect(content).toContain('assigned: alice');

    expect(card.status).toBe('todo');
    expect(card.type).toBe('product');
  });

  it('uses empty assigned when not provided', async () => {
    const app = {
      vault: {
        createFolder: vi.fn().mockResolvedValue(undefined),
        create: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const config = { backlogDir: './backlog', cardCategories: [] };
    const card = await createCard(app, config, { title: 'Test Card', type: 'bug' });
    expect(card.assigned).toBe('');
  });
});
