export interface FilterState {
  types: string[];
  assignees: string[];
}

export function createFilterBar(
  categories: string[],
  assignees: string[],
  current: FilterState,
  onChange: (filters: FilterState) => void
): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'faru-filter-bar';

  bar.appendChild(
    buildPillGroup('Type', 'type', categories, current.types, categories, (selected) => {
      current = { ...current, types: selected };
      onChange(current);
    })
  );

  if (assignees.length > 0) {
    bar.appendChild(
      buildPillGroup('Assignee', 'assignee', assignees, current.assignees, [], (selected) => {
        current = { ...current, assignees: selected };
        onChange(current);
      })
    );
  }

  return bar;
}

function buildPillGroup(
  ariaLabel: string,
  variant: 'type' | 'assignee',
  options: string[],
  selected: string[],
  categories: string[],
  onChange: (selected: string[]) => void
): HTMLElement {
  const group = document.createElement('div');
  group.className = 'faru-filter-pills';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', `Filtre ${ariaLabel}`);

  let active = [...selected];

  for (const opt of options) {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = `faru-filter-pill faru-filter-pill-${variant}`;
    pill.textContent = variant === 'assignee' ? `@${opt}` : opt;

    const isActive = active.includes(opt);
    pill.setAttribute('aria-pressed', String(isActive));

    if (variant === 'type') {
      const idx = (categories.indexOf(opt) + categories.length) % Math.max(categories.length, 1);
      pill.style.setProperty('--badge-color', `var(--faru-cat-${idx % 6})`);
    }

    const toggle = () => {
      const idx = active.indexOf(opt);
      if (idx === -1) active.push(opt);
      else active.splice(idx, 1);
      pill.setAttribute('aria-pressed', String(active.includes(opt)));
      onChange([...active]);
    };

    pill.addEventListener('click', toggle);
    pill.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });

    group.appendChild(pill);
  }

  return group;
}
