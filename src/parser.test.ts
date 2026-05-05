import { describe, it, expect, vi } from 'vitest';
import { resolveCardFile, parseMilestones, parseBacklog } from './parser';

describe('resolveCardFile', () => {
  it('prefers *-milestones.md over CARD.md', () => {
    const files = ['backlog/CARD-NAME/CARD.md', 'backlog/CARD-NAME/VX-milestones.md'];
    expect(resolveCardFile(files)).toBe('backlog/CARD-NAME/VX-milestones.md');
  });

  it('falls back to CARD.md when no milestones file', () => {
    const files = ['backlog/CARD-NAME/CARD.md', 'backlog/CARD-NAME/notes.md'];
    expect(resolveCardFile(files)).toBe('backlog/CARD-NAME/CARD.md');
  });

  it('falls back to *-spec.md', () => {
    const files = ['backlog/CARD-NAME/feature-spec.md', 'backlog/CARD-NAME/notes.md'];
    expect(resolveCardFile(files)).toBe('backlog/CARD-NAME/feature-spec.md');
  });

  it('falls back to first .md file', () => {
    const files = ['backlog/CARD-NAME/notes.md', 'backlog/CARD-NAME/readme.md'];
    expect(resolveCardFile(files)).toBe('backlog/CARD-NAME/notes.md');
  });

  it('returns null when no .md files', () => {
    expect(resolveCardFile(['backlog/CARD-NAME/image.png'])).toBeNull();
  });

  it('returns null for empty list', () => {
    expect(resolveCardFile([])).toBeNull();
  });
});

describe('parseMilestones', () => {
  it('returns undefined when no milestones file', async () => {
    const app = { vault: { adapter: { read: vi.fn() } } } as any;
    const result = await parseMilestones(app, ['backlog/CARD/CARD.md']);
    expect(result).toBeUndefined();
    expect(app.vault.adapter.read).not.toHaveBeenCalled();
  });

  it('counts headings and matching report files', async () => {
    const content = `# VX milestones\n\n## VX-1: First step\n## VX-2: Second step\n## VX-3: Third step\n`;
    const app = {
      vault: { adapter: { read: vi.fn().mockResolvedValue(content) } },
    } as any;
    const files = [
      'backlog/CARD/VX-milestones.md',
      'backlog/CARD/VX-1-report.md',
      'backlog/CARD/VX-3-report.md',
    ];
    const result = await parseMilestones(app, files);
    expect(result).toEqual({ total: 3, completed: 2 });
  });

  it('returns undefined when no headings match the pattern', async () => {
    const content = `# Empty milestones\n\nNo headings here.\n`;
    const app = { vault: { adapter: { read: vi.fn().mockResolvedValue(content) } } } as any;
    const result = await parseMilestones(app, ['backlog/CARD/VX-milestones.md']);
    expect(result).toBeUndefined();
  });

  it('returns undefined when read fails', async () => {
    const app = { vault: { adapter: { read: vi.fn().mockRejectedValue(new Error('not found')) } } } as any;
    const result = await parseMilestones(app, ['backlog/CARD/VX-milestones.md']);
    expect(result).toBeUndefined();
  });
});

describe('parseBacklog', () => {
  it('returns empty array when backlogDir does not exist', async () => {
    const app = {
      vault: { adapter: { list: vi.fn().mockRejectedValue(new Error('not found')) } },
      metadataCache: { getCache: vi.fn() },
    } as any;
    const result = await parseBacklog(app, { backlogDir: './backlog', cardCategories: [] });
    expect(result).toEqual([]);
  });

  it('ignores folders without a primary .md file', async () => {
    const app = {
      vault: {
        adapter: {
          list: vi.fn()
            .mockResolvedValueOnce({ files: [], folders: ['backlog/CARD-NO-MD'] })
            .mockResolvedValueOnce({ files: ['backlog/CARD-NO-MD/image.png'], folders: [] }),
        },
      },
      metadataCache: { getCache: vi.fn() },
    } as any;
    const result = await parseBacklog(app, { backlogDir: './backlog', cardCategories: [] });
    expect(result).toEqual([]);
  });

  it('ignores cards with no frontmatter', async () => {
    const app = {
      vault: {
        adapter: {
          list: vi.fn()
            .mockResolvedValueOnce({ files: [], folders: ['backlog/CARD-1'] })
            .mockResolvedValueOnce({ files: ['backlog/CARD-1/CARD.md'], folders: [] }),
        },
      },
      metadataCache: { getCache: vi.fn().mockReturnValue(null) },
    } as any;
    const result = await parseBacklog(app, { backlogDir: './backlog', cardCategories: [] });
    expect(result).toEqual([]);
  });

  it('defaults invalid status to todo', async () => {
    const app = {
      vault: {
        adapter: {
          list: vi.fn()
            .mockResolvedValueOnce({ files: [], folders: ['backlog/CARD-1'] })
            .mockResolvedValueOnce({ files: ['backlog/CARD-1/CARD.md'], folders: [] }),
        },
      },
      metadataCache: {
        getCache: vi.fn().mockReturnValue({
          frontmatter: {
            title: 'Test',
            type: 'product',
            status: 'invalid-status',
            assigned: 'alice',
            created: '2026-05-04',
            description: 'desc',
          },
        }),
      },
    } as any;
    const result = await parseBacklog(app, { backlogDir: './backlog', cardCategories: [] });
    expect(result[0].status).toBe('todo');
  });

  it('parses a valid card correctly', async () => {
    const fm = {
      title: 'OAuth Login',
      type: 'product',
      status: 'wip',
      assigned: 'alice',
      created: '2026-05-04',
      edited: '2026-05-04',
      description: 'Implement OAuth.',
      links: ['specs/oauth.md'],
    };
    const app = {
      vault: {
        adapter: {
          list: vi.fn()
            .mockResolvedValueOnce({ files: [], folders: ['backlog/2026-05-04-PRODUCT-OAUTH'] })
            .mockResolvedValueOnce({ files: ['backlog/2026-05-04-PRODUCT-OAUTH/CARD.md'], folders: [] }),
        },
      },
      metadataCache: { getCache: vi.fn().mockReturnValue({ frontmatter: fm }) },
    } as any;
    const [card] = await parseBacklog(app, { backlogDir: './backlog', cardCategories: [] });
    expect(card.title).toBe('OAuth Login');
    expect(card.status).toBe('wip');
    expect(card.assigned).toBe('alice');
    expect(card.links).toEqual(['specs/oauth.md']);
  });
});
