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

  bar.appendChild(buildSelect('Type', categories, current.types, (selected) => {
    onChange({ ...current, types: selected });
    current = { ...current, types: selected };
  }));

  bar.appendChild(buildSelect('Assignee', assignees, current.assignees, (selected) => {
    onChange({ ...current, assignees: selected });
    current = { ...current, assignees: selected };
  }));

  return bar;
}

function buildSelect(
  label: string,
  options: string[],
  selected: string[],
  onChange: (selected: string[]) => void
): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'faru-filter-group';

  const lbl = document.createElement('label');
  lbl.textContent = label;
  lbl.className = 'faru-filter-label';
  wrapper.appendChild(lbl);

  const select = document.createElement('select');
  select.multiple = true;
  select.className = 'faru-filter-select';

  for (const opt of options) {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    option.selected = selected.includes(opt);
    select.appendChild(option);
  }

  select.addEventListener('change', () => {
    const values = Array.from(select.selectedOptions).map((o) => o.value);
    onChange(values);
  });

  wrapper.appendChild(select);
  return wrapper;
}
