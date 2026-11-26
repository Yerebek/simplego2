import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Command,
  History,
  Home,
  Keyboard,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import {
  APP_FEATURES,
  AppFeatureId,
  AssistanceCategory,
  CARD_CHARM_DESIGNS,
  SERVICE_LOCATIONS,
  ScreenId,
} from '../data/simplygoData';

export interface NavigationDestination {
  id: string;
  label: string;
  category: string;
  keywords: string;
  shortcutHint?: string;
  screen: ScreenId;
  appFeature?: AppFeatureId;
  cardTab?: 'ezlink' | 'charms' | 'concession' | 'motoring';
  assistanceCategory?: AssistanceCategory;
  actionType?: 'refresh-stock' | 'quick-topup';
}

export const ALL_QUICK_DESTINATIONS: NavigationDestination[] = [
  {
    id: 'nav-home',
    label: 'Home Overview',
    category: 'Section',
    keywords: 'home start overview commuter profile',
    shortcutHint: '1',
    screen: 'home',
  },
  {
    id: 'nav-cards',
    label: 'Cards & Charms Catalog & Stock',
    category: 'Section',
    keywords: 'cards charms ezlink concession availability stock',
    shortcutHint: '2',
    screen: 'cards',
    cardTab: 'ezlink',
  },
  {
    id: 'nav-charms',
    label: 'EZ-Link Charms & Outlet Stockists',
    category: 'Cards & Charms',
    keywords: 'charms minions mahjong led wearable shopee lazada',
    screen: 'cards',
    cardTab: 'charms',
  },
  {
    id: 'nav-concession-cards',
    label: 'Concession & Monthly Travel Cards',
    category: 'Cards & Charms',
    keywords: 'concession adult monthly student senior child pwd pass',
    screen: 'cards',
    cardTab: 'concession',
  },
  {
    id: 'nav-motoring-cards',
    label: 'EZ-Link Motoring & EV Charging Plans',
    category: 'Cards & Charms',
    keywords: 'motoring erp carpark ev charging iu obu',
    screen: 'cards',
    cardTab: 'motoring',
  },
  {
    id: 'nav-app',
    label: 'Interactive SimplyGo App Screens',
    category: 'Section',
    keywords: 'app mobile screens transactions top up',
    shortcutHint: '3',
    screen: 'app',
    appFeature: 'transactions',
  },
  {
    id: 'nav-services',
    label: 'Fare Calculator & Application Status',
    category: 'Section',
    keywords: 'fare calculator distance mrt bus status application',
    shortcutHint: '4',
    screen: 'services',
  },
  {
    id: 'nav-locations',
    label: 'MRT Ticket Offices, Service Centres & Kiosks',
    category: 'Section',
    keywords: 'locations mrt station ticket office service centre kiosk hotline',
    shortcutHint: '5',
    screen: 'locations',
    assistanceCategory: 'all',
  },
  ...APP_FEATURES.map((feat) => ({
    id: `app-${feat.id}`,
    label: `SimplyGo App: ${feat.title}`,
    category: 'App Feature',
    keywords: `${feat.title} ${feat.description} app feature`,
    screen: 'app' as ScreenId,
    appFeature: feat.id,
  })),
  ...CARD_CHARM_DESIGNS.map((design) => ({
    id: `design-${design.id}`,
    label: `${design.name} (${design.availabilityLabel})`,
    category: 'Live Stock',
    keywords: `${design.name} ${design.whereToBuy} ${design.availabilityLabel} ${design.category}`,
    screen: 'cards' as ScreenId,
    cardTab: (design.category === 'charm'
      ? 'charms'
      : design.category) as 'ezlink' | 'charms' | 'concession',
  })),
  ...SERVICE_LOCATIONS.map((loc) => ({
    id: `loc-${loc.id}`,
    label: `${loc.name} (${loc.region})`,
    category: 'Location',
    keywords: `${loc.name} ${loc.station} ${loc.region} ${loc.services.join(' ')}`,
    screen: 'locations' as ScreenId,
    assistanceCategory: loc.category as AssistanceCategory,
  })),
  {
    id: 'act-refresh-stock',
    label: 'Refresh Card & Charm Live Stock',
    category: 'Quick Action',
    keywords: 'refresh reload check live stock availability',
    screen: 'cards',
    cardTab: 'charms',
    actionType: 'refresh-stock',
  },
  {
    id: 'act-quick-topup',
    label: 'Quick Top-Up Daily Commute EZ-Link (+$10.00)',
    category: 'Quick Action',
    keywords: 'top up balance +10 quick pay ezlink',
    screen: 'app',
    appFeature: 'transactions',
    actionType: 'quick-topup',
  },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelectDestination: (dest: NavigationDestination) => void;
  recentIds: string[];
}

export function CommandPalette({
  open,
  onClose,
  onSelectDestination,
  recentIds,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      const recents = recentIds
        .map((id) => ALL_QUICK_DESTINATIONS.find((d) => d.id === id))
        .filter((d): d is NavigationDestination => Boolean(d));
      const defaults = ALL_QUICK_DESTINATIONS.filter(
        (d) =>
          !recentIds.includes(d.id) &&
          (d.category === 'Section' || d.category === 'Quick Action')
      );
      return [...recents, ...defaults].slice(0, 9);
    }

    return ALL_QUICK_DESTINATIONS.filter(
      (d) =>
        d.label.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.keywords.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [query, recentIds]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (items.length ? (prev + 1) % items.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        items.length ? (prev - 1 + items.length) % items.length : 0
      );
    } else if (e.key === 'Enter' && items[activeIndex]) {
      e.preventDefault();
      onSelectDestination(items[activeIndex]);
      onClose();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[#0c1a27]/55 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Quick Jump Navigation"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200">
          <Search className="w-4 h-4 text-[#316aa1] shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to any card, charm stock, fare tool, or MRT location..."
            className="flex-1 text-sm text-[#142333] placeholder:text-slate-400 focus:outline-none"
            aria-label="Quick jump search"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            aria-label="Close quick jump"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              No matching pages or tools for "{query}". Try "charm", "fare", "top-up", or "Somerset".
            </div>
          ) : (
            items.map((item, idx) => {
              const isSelected = idx === activeIndex;
              const isRecent = !query.trim() && recentIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => {
                    onSelectDestination(item);
                    onClose();
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#ebf2f9]' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-3">
                    {isRecent ? (
                      <History
                        className="w-4 h-4 text-[#3f84c5] shrink-0"
                        aria-hidden="true"
                      />
                    ) : item.actionType === 'refresh-stock' ? (
                      <RefreshCw
                        className="w-4 h-4 text-[#316aa1] shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <Command
                        className="w-4 h-4 text-slate-400 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-[#3f84c5] block">
                        {isRecent ? `Recent · ${item.category}` : item.category}
                      </span>
                      <span className="text-sm font-semibold text-[#142333] truncate block">
                        {item.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.shortcutHint && (
                      <kbd className="px-1.5 py-0.5 text-[11px] font-mono bg-slate-100 border border-slate-200 rounded text-slate-600">
                        {item.shortcutHint}
                      </kbd>
                    )}
                    <ArrowRight
                      className={`w-4 h-4 ${
                        isSelected ? 'text-[#316aa1]' : 'text-slate-400'
                      }`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-slate-700">
                ↑↓
              </kbd>{' '}
              navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-slate-700">
                Enter
              </kbd>{' '}
              open
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-slate-700">
                Esc
              </kbd>{' '}
              close
            </span>
          </div>
          <span>Power-user quick jump</span>
        </div>
      </div>
    </div>
  );
}

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({
  open,
  onClose,
}: KeyboardShortcutsModalProps) {
  if (!open) return null;

  const shortcuts = [
    { keys: 'Ctrl + K  or  /', desc: 'Open Quick Jump palette anywhere' },
    { keys: '1', desc: 'Go to Home Overview' },
    { keys: '2', desc: 'Go to Cards & Charms' },
    { keys: '3', desc: 'Go to SimplyGo App Screens' },
    { keys: '4', desc: 'Go to Fare Calculator & Online Services' },
    { keys: '5', desc: 'Go to MRT Ticket Offices & Locations' },
    { keys: '?', desc: 'Toggle this Keyboard Shortcuts guide' },
    { keys: 'Esc', desc: 'Close active dialog or quick jump' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c1a27]/55 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#142333]">
            <Keyboard className="w-5 h-5 text-[#316aa1]" aria-hidden="true" />
            <h3 className="text-lg font-bold">Keyboard Accelerators</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            aria-label="Close keyboard shortcuts"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Optional single-key and palette shortcuts for returning commuters who prefer fast keyboard navigation.
        </p>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {shortcuts.map((s) => (
            <div
              key={s.keys}
              className="px-3.5 py-2.5 flex items-center justify-between gap-4 text-xs"
            >
              <span className="text-slate-700">{s.desc}</span>
              <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded font-mono text-[11px] font-semibold text-[#142333] whitespace-nowrap shrink-0">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#316aa1] hover:bg-[#255582] text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

interface BreadcrumbBarProps {
  currentLabel: string;
  onGoHome: () => void;
  shortcutId?: string;
  shortcutLabel?: string;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

export function BreadcrumbBar({
  currentLabel,
  onGoHome,
  shortcutLabel,
  isPinned,
  onTogglePin,
}: BreadcrumbBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80 text-xs">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-slate-500">
        <button
          type="button"
          onClick={onGoHome}
          className="inline-flex items-center gap-1 hover:text-[#316aa1] font-medium transition-colors cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Home</span>
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
        <span className="font-semibold text-[#142333]">{currentLabel}</span>
      </nav>

      {onTogglePin && shortcutLabel && (
        <button
          type="button"
          onClick={onTogglePin}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
            isPinned
              ? 'bg-[#ebf2f9] border-[#316aa1]/40 text-[#316aa1]'
              : 'bg-white border-slate-200 text-slate-600 hover:border-[#316aa1] hover:text-[#316aa1]'
          }`}
        >
          {isPinned ? (
            <BookmarkCheck className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span>{isPinned ? 'Pinned to Home' : `Pin ${shortcutLabel}`}</span>
        </button>
      )}
    </div>
  );
}
