'use client';

type Tab = 'live' | 'upcoming' | 'completed';

interface NavbarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  liveCounts: number;
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'live', label: 'Live Now' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
];

export default function Navbar({ activeTab, onTabChange, liveCounts }: NavbarProps) {
  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--accent)' }}>
            🏏 Cricket Live
          </span>
          <nav className="flex gap-1">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onTabChange(key)}
                className="relative px-4 py-2 text-sm rounded-md transition-colors"
                style={{
                  backgroundColor: activeTab === key ? 'var(--accent)' : 'transparent',
                  color: activeTab === key ? '#000' : 'var(--muted)',
                  fontWeight: activeTab === key ? 600 : 400,
                }}
              >
                {label}
                {key === 'live' && liveCounts > 0 && (
                  <span
                    className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: 'var(--live)', color: '#fff' }}
                  >
                    {liveCounts}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
