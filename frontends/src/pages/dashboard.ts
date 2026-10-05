// ── Mobile nav toggle ─────────────────────────────────────
const navToggle = document.getElementById('nav-toggle') as HTMLButtonElement | null;
const navLinks  = document.getElementById('nav-links')  as HTMLUListElement  | null;

navToggle?.addEventListener('click', () => {
  const isOpen = navLinks?.classList.toggle('is-open') ?? false;
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.textContent = isOpen ? '✕' : '☰';
});

// Close menu when a link is clicked (single-page nav feel)
navLinks?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    if (navToggle) navToggle.textContent = '☰';
  });
});

// ── Dashboard TypeScript ──────────────────────────────────
// Populates summary stat cards and activity feed.
// Replace the mock data below with real API calls.

interface Stats {
  total: number;
  completed: number;
  pending: number;
  users: number;
}

interface ActivityItem {
  id: number;
  icon: string;
  text: string;
  time: string;
}

// ── Mock data (replace with API) ─────────────────────────
const mockStats: Stats = {
  total:     248,
  completed: 185,
  pending:    63,
  users:      32,
};

const mockActivity: ActivityItem[] = [
  { id: 1, icon: '📄', text: 'Record #248 was created',         time: '2m ago'  },
  { id: 2, icon: '✅', text: 'Record #247 marked as complete',  time: '14m ago' },
  { id: 3, icon: '✏️', text: 'Record #245 was updated',         time: '1h ago'  },
  { id: 4, icon: '👤', text: 'New user registered',             time: '3h ago'  },
  { id: 5, icon: '📋', text: 'Report generated for October',    time: '5h ago'  },
];

// ── Render helpers ────────────────────────────────────────
function renderStats(stats: Stats): void {
  const set = (id: string, val: number) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val.toLocaleString();
  };
  set('stat-total',     stats.total);
  set('stat-completed', stats.completed);
  set('stat-pending',   stats.pending);
  set('stat-users',     stats.users);
}

function renderActivity(items: ActivityItem[]): void {
  const list = document.getElementById('activity-list');
  if (!list) return;

  list.innerHTML = items
    .map(
      (item) => `
        <li class="dash-activity__item">
          <span aria-hidden="true">${item.icon}</span>
          <span style="flex:1">${item.text}</span>
          <span style="font-size:0.75rem;color:var(--text);white-space:nowrap">${item.time}</span>
        </li>`
    )
    .join('');
}

// ── Init ──────────────────────────────────────────────────
async function init(): Promise<void> {
  // Simulate network delay
  await new Promise<void>((r) => setTimeout(r, 600));

  // TODO: replace with real API calls, e.g.:
  // const stats = await fetch('/api/stats').then(r => r.json());
  // const activity = await fetch('/api/activity').then(r => r.json());

  renderStats(mockStats);
  renderActivity(mockActivity);
}

init();
