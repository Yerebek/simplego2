import { useEffect, useState } from 'react';
import {
  AppFeatureId,
  AssistanceCategory,
  INITIAL_ACCOUNTS,
  RestockAlert,
  ScreenId,
  TransitCardAccount,
} from './data/simplygoData';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { AppScreensView } from './components/AppScreensView';
import { TravelCardsView } from './components/TravelCardsView';
import { OnlineServicesView } from './components/OnlineServicesView';
import { LocationsView } from './components/LocationsView';
import { ChatbotWidget } from './components/ChatbotWidget';
import { Footer } from './components/Footer';
import {
  CommandPalette,
  KeyboardShortcutsModal,
  NavigationDestination,
} from './components/CommandPalette';

const DEFAULT_PINNED_IDS = [
  'nav-charms',
  'nav-services',
  'app-transactions',
  'nav-locations',
];

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('home');
  const [selectedAppFeature, setSelectedAppFeature] =
    useState<AppFeatureId>('transactions');
  const [selectedCardTab, setSelectedCardTab] = useState<
    'ezlink' | 'charms' | 'concession' | 'motoring'
  >('ezlink');
  const [selectedAssistance, setSelectedAssistance] =
    useState<AssistanceCategory>('all');
  const [accounts, setAccounts] =
    useState<TransitCardAccount[]>(INITIAL_ACCOUNTS);
  const [restockAlerts, setRestockAlerts] = useState<RestockAlert[]>([]);
  const [lastStockRefresh, setLastStockRefresh] = useState<string | null>(null);
  const [isRefreshingStock, setIsRefreshingStock] = useState(false);

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem('simplygo_pinned_shortcuts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_PINNED_IDS;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        'simplygo_pinned_shortcuts',
        JSON.stringify(pinnedIds)
      );
    } catch {
      // ignore storage errors
    }
  }, [pinnedIds]);

  const navigate = (
    screen: ScreenId,
    options?: {
      appFeature?: AppFeatureId;
      cardTab?: 'ezlink' | 'charms' | 'concession' | 'motoring';
      assistanceCategory?: AssistanceCategory;
    }
  ) => {
    if (options?.appFeature) setSelectedAppFeature(options.appFeature);
    if (options?.cardTab) setSelectedCardTab(options.cardTab);
    if (options?.assistanceCategory) {
      setSelectedAssistance(options.assistanceCategory);
    } else if (screen === 'locations') {
      setSelectedAssistance('all');
    }
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTogglePin = (shortcutId: string) => {
    setPinnedIds((prev) =>
      prev.includes(shortcutId)
        ? prev.filter((id) => id !== shortcutId)
        : [shortcutId, ...prev]
    );
  };

  const handleRefreshStock = () => {
    if (isRefreshingStock) return;
    setIsRefreshingStock(true);
    window.setTimeout(() => {
      const now = new Date();
      const timeLabel = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastStockRefresh(timeLabel);
      setIsRefreshingStock(false);
    }, 450);
  };

  const handleToggleRestockAlert = (
    designId: string,
    channel: string,
    email: string
  ) => {
    setRestockAlerts((prev) => {
      const exists = prev.some(
        (a) => a.designId === designId && a.channel === channel
      );
      if (exists) {
        return prev.filter(
          (a) => !(a.designId === designId && a.channel === channel)
        );
      }
      return [
        ...prev,
        {
          designId,
          channel,
          email,
          createdAt: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ];
    });
  };

  const handleTopUpCard = (cardId: string, amount: number) => {
    setAccounts((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? { ...card, balance: Number((card.balance + amount).toFixed(2)) }
          : card
      )
    );
  };

  const handleUpdateAutoTopUp = (
    cardId: string,
    enabled: boolean,
    threshold: number,
    amount: number
  ) => {
    setAccounts((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              autoTopUpEnabled: enabled,
              autoTopUpThreshold: threshold,
              autoTopUpAmount: amount,
            }
          : card
      )
    );
  };

  const handleSelectDestination = (dest: NavigationDestination) => {
    setRecentIds((prev) => [dest.id, ...prev.filter((id) => id !== dest.id)].slice(0, 5));
    if (dest.actionType === 'refresh-stock') {
      handleRefreshStock();
    } else if (dest.actionType === 'quick-topup') {
      handleTopUpCard('card-1', 10);
    }
    navigate(dest.screen, {
      appFeature: dest.appFeature,
      cardTab: dest.cardTab,
      assistanceCategory: dest.assistanceCategory,
    });
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShortcutsOpen(false);
        setPaletteOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        if (paletteOpen) setPaletteOpen(false);
        if (shortcutsOpen) setShortcutsOpen(false);
        return;
      }

      if (isTyping) return;

      if (e.key === '/') {
        e.preventDefault();
        setShortcutsOpen(false);
        setPaletteOpen(true);
      } else if (e.key === '?') {
        e.preventDefault();
        setPaletteOpen(false);
        setShortcutsOpen((prev) => !prev);
      } else if (e.key === '1') {
        navigate('home');
      } else if (e.key === '2') {
        navigate('cards');
      } else if (e.key === '3') {
        navigate('app');
      } else if (e.key === '4') {
        navigate('services');
      } else if (e.key === '5') {
        navigate('locations');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [paletteOpen, shortcutsOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#142333]">
      <Header
        activeScreen={activeScreen}
        onNavigate={(screen) => navigate(screen)}
      />

      <main className="flex-1">
        {activeScreen === 'home' && (
          <HomeScreen
            onNavigate={navigate}
            lastRefreshedAt={lastStockRefresh}
            isRefreshingStock={isRefreshingStock}
            onRefreshStock={handleRefreshStock}
            restockAlerts={restockAlerts}
            onToggleRestockAlert={handleToggleRestockAlert}
            pinnedIds={pinnedIds}
            onTogglePin={handleTogglePin}
            onOpenQuickJump={() => setPaletteOpen(true)}
            onSelectDestination={handleSelectDestination}
          />
        )}

        {activeScreen === 'cards' && (
          <TravelCardsView
            key={selectedCardTab}
            initialTab={selectedCardTab}
            onNavigate={(screen) => navigate(screen)}
            lastRefreshedAt={lastStockRefresh}
            isRefreshingStock={isRefreshingStock}
            onRefreshStock={handleRefreshStock}
            restockAlerts={restockAlerts}
            onToggleRestockAlert={handleToggleRestockAlert}
            pinnedIds={pinnedIds}
            onTogglePin={handleTogglePin}
          />
        )}

        {activeScreen === 'app' && (
          <AppScreensView
            selectedFeature={selectedAppFeature}
            onSelectFeature={setSelectedAppFeature}
            accounts={accounts}
            onUpdateAutoTopUp={handleUpdateAutoTopUp}
            onTopUpCard={handleTopUpCard}
            onNavigateHome={() => navigate('home')}
            pinnedIds={pinnedIds}
            onTogglePin={handleTogglePin}
          />
        )}

        {activeScreen === 'services' && (
          <OnlineServicesView
            onNavigate={(screen, feature) =>
              navigate(screen, feature ? { appFeature: feature } : undefined)
            }
            pinnedIds={pinnedIds}
            onTogglePin={handleTogglePin}
          />
        )}

        {activeScreen === 'locations' && (
          <LocationsView
            key={selectedAssistance}
            initialCategory={selectedAssistance}
            onNavigateHome={() => navigate('home')}
            pinnedIds={pinnedIds}
            onTogglePin={handleTogglePin}
          />
        )}
      </main>

      <Footer
        onNavigate={(screen) => navigate(screen)}
        onOpenQuickJump={() => setPaletteOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />

      <ChatbotWidget onNavigate={navigate} />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelectDestination={handleSelectDestination}
        recentIds={recentIds}
      />

      <KeyboardShortcutsModal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}
