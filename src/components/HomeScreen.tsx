import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Search,
  Play,
  X,
  CreditCard,
  Sparkles,
  BadgeCheck,
  RefreshCw,
  BellRing,
} from 'lucide-react';
import {
  APP_FEATURES,
  ASSISTANCE_TILES,
  AppFeatureId,
  AssistanceCategory,
  CARD_CHARM_DESIGNS,
  COMMUTER_PROFILES,
  CardCharmDesign,
  CommuterProfileId,
  HERO_SLIDES,
  QUICK_SEARCH_ITEMS,
  RestockAlert,
  SIMPLYGO_ASSETS,
  ScreenId,
} from '../data/simplygoData';
import { ResilientImage } from './ResilientImage';
import {
  AvailabilityStatusIndicator,
  CardAvailabilityModal,
} from './CardAvailabilityModal';
import {
  ALL_QUICK_DESTINATIONS,
  NavigationDestination,
} from './CommandPalette';

interface HomeScreenProps {
  onNavigate: (
    screen: ScreenId,
    options?: {
      appFeature?: AppFeatureId;
      cardTab?: 'ezlink' | 'charms' | 'concession' | 'motoring';
      assistanceCategory?: AssistanceCategory;
    }
  ) => void;
  lastRefreshedAt: string | null;
  isRefreshingStock: boolean;
  onRefreshStock: () => void;
  restockAlerts: RestockAlert[];
  onToggleRestockAlert: (
    designId: string,
    channel: string,
    email: string
  ) => void;
  pinnedIds: string[];
  onTogglePin: (shortcutId: string) => void;
  onOpenQuickJump: () => void;
  onSelectDestination: (dest: NavigationDestination) => void;
}

export function HomeScreen({
  onNavigate,
  lastRefreshedAt,
  isRefreshingStock,
  onRefreshStock,
  restockAlerts,
  onToggleRestockAlert,
  pinnedIds,
  onOpenQuickJump,
  onSelectDestination,
}: HomeScreenProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [activeFeatureId, setActiveFeatureId] =
    useState<AppFeatureId>('transactions');
  const [advisoryVisible, setAdvisoryVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHighlightIdx, setSearchHighlightIdx] = useState(0);
  const [activeProfile, setActiveProfile] = useState<CommuterProfileId>('all');
  const [showCardGuide, setShowCardGuide] = useState(false);
  const [designFilter, setDesignFilter] = useState<
    'all' | 'ezlink' | 'charm' | 'concession'
  >('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<
    'all' | 'in-stock' | 'low-stock'
  >('all');
  const [selectedDesign, setSelectedDesign] =
    useState<CardCharmDesign | null>(null);

  useEffect(() => {
    if (carouselPaused) return;
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [carouselPaused]);

  const currentSlide = HERO_SLIDES[slideIndex];
  const activeFeature =
    APP_FEATURES.find((f) => f.id === activeFeatureId) ?? APP_FEATURES[0];

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchResults = normalizedQuery
    ? QUICK_SEARCH_ITEMS.filter(
        (item) =>
          item.label.toLowerCase().includes(normalizedQuery) ||
          item.keywords.toLowerCase().includes(normalizedQuery) ||
          item.category.toLowerCase().includes(normalizedQuery)
      ).slice(0, 5)
    : [];

  const pinnedDestinations = pinnedIds
    .map((id) => ALL_QUICK_DESTINATIONS.find((d) => d.id === id))
    .filter((d): d is NavigationDestination => Boolean(d))
    .slice(0, 4);

  const selectedProfileObj =
    activeProfile === 'all'
      ? null
      : COMMUTER_PROFILES.find((p) => p.id === activeProfile) ?? null;

  const handleSelectProfile = (profileId: CommuterProfileId) => {
    setActiveProfile(profileId);
    if (profileId === 'all') {
      setDesignFilter('all');
      return;
    }
    const found = COMMUTER_PROFILES.find((p) => p.id === profileId);
    if (found) {
      setDesignFilter(found.recommendedDesignFilter);
    }
  };

  const matchesAvailability = (item: CardCharmDesign) => {
    if (availabilityFilter === 'all') return true;
    if (availabilityFilter === 'in-stock') {
      return item.availabilityStatus === 'in-stock';
    }
    return (
      item.availabilityStatus === 'low-stock' ||
      item.availabilityStatus === 'out-of-stock' ||
      item.channels.some((ch) => ch.status === 'out-of-stock')
    );
  };

  const ezlinkDesigns = CARD_CHARM_DESIGNS.filter(
    (d) => d.category === 'ezlink' && matchesAvailability(d)
  );
  const charmDesigns = CARD_CHARM_DESIGNS.filter(
    (d) => d.category === 'charm' && matchesAvailability(d)
  );
  const concessionDesigns = CARD_CHARM_DESIGNS.filter(
    (d) => d.category === 'concession' && matchesAvailability(d)
  );

  const renderDesignCard = (
    item: CardCharmDesign,
    accentClass: string,
    compactCard = false
  ) => {
    const itemAlertCount = restockAlerts.filter(
      (a) => a.designId === item.id
    ).length;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => setSelectedDesign(item)}
        className={`group text-left bg-white border border-slate-200 hover:border-[#3f84c5] rounded-2xl transition-all hover:shadow-md flex flex-col justify-between cursor-pointer ${
          compactCard ? 'p-3.5' : 'p-4'
        }`}
      >
        <div>
          <div
            className={`relative rounded-xl flex items-center justify-center p-2.5 overflow-hidden ${
              compactCard ? 'h-24 mb-2.5' : 'h-28 mb-3'
            } ${accentClass}`}
          >
            <ResilientImage
              src={item.image}
              alt={item.name}
              fallbackLabel={item.name}
              className={`${
                compactCard ? 'max-h-20' : 'max-h-24'
              } w-auto object-contain transition-transform duration-200 group-hover:scale-105`}
            />
            {item.videoUrl && (
              <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 bg-[#0c1a27]/85 text-white text-[11px] font-semibold px-2 py-1 rounded-md">
                <Play className="w-3 h-3" />
                <span>Video</span>
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-[#142333] group-hover:text-[#316aa1] transition-colors line-clamp-2 leading-snug">
            {item.name}
          </h4>
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-1.5">
            <AvailabilityStatusIndicator
              status={item.availabilityStatus}
              label={item.availabilityLabel}
              compact
            />
            {itemAlertCount > 0 && (
              <BellRing
                className="w-3.5 h-3.5 text-emerald-700 shrink-0"
                aria-label="Restock alert active"
              />
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-[#142333] tabular-nums truncate">
              {item.priceOrFee}
            </span>
            <span className="font-semibold text-[#316aa1] shrink-0 inline-flex items-center gap-0.5">
              Details
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div>
      {/* Slim Dismissible Service Notice */}
      {advisoryVisible && (
        <div className="bg-[#316aa1] text-white text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-4">
            <p className="truncate">
              <span className="font-semibold">Service Notice:</span> Scheduled maintenance 27 Nov, 12 AM – 6 AM. E-services and kiosks may experience brief interruptions.
            </p>
            <button
              type="button"
              onClick={() => setAdvisoryVisible(false)}
              className="p-0.5 rounded hover:bg-white/15 transition-colors shrink-0 cursor-pointer"
              aria-label="Dismiss service notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Compact Split Hero: Quick Search + Compact Announcement Banner */}
      <section className="bg-gradient-to-b from-[#ebf2f9] to-white border-b border-slate-200/80 py-5 lg:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6 space-y-3.5">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#142333]">
                  Find your SimplyGo card, charm, or fare service
                </h1>
                <p className="mt-1.5 text-sm sm:text-base text-slate-600">
                  Compare EZ-Link cards, wearable charms, and concession cards—or jump straight to the tool you need.
                </p>
              </div>

              {/* Instant Search Input with Keyboard Navigation & Quick Jump Accelerator */}
              <div className="relative">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchHighlightIdx(0);
                    }}
                    onKeyDown={(e) => {
                      if (!normalizedQuery || searchResults.length === 0) {
                        if (e.key === 'Escape') setSearchQuery('');
                        return;
                      }
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setSearchHighlightIdx(
                          (prev) => (prev + 1) % searchResults.length
                        );
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setSearchHighlightIdx(
                          (prev) =>
                            (prev - 1 + searchResults.length) %
                            searchResults.length
                        );
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        const chosen =
                          searchResults[searchHighlightIdx] ?? searchResults[0];
                        if (chosen) {
                          setSearchQuery('');
                          onNavigate(chosen.screen, {
                            appFeature: chosen.appFeature,
                            cardTab: chosen.cardTab,
                            assistanceCategory: chosen.assistanceCategory,
                          });
                        }
                      } else if (e.key === 'Escape') {
                        setSearchQuery('');
                      }
                    }}
                    placeholder="Search EZ-Link charms, concession cards, fares, MRT stations..."
                    className="w-full pl-10 pr-24 py-2.5 bg-white border border-slate-300 focus:border-[#316aa1] rounded-xl text-sm text-[#142333] shadow-xs focus:outline-none"
                    aria-label="Search SimplyGo functions and cards"
                  />
                  <button
                    type="button"
                    onClick={onOpenQuickJump}
                    title="Open Quick Jump Palette (Ctrl+K)"
                    className="hidden sm:inline-flex items-center gap-1 absolute right-2 px-2 py-1 rounded-lg bg-slate-100 hover:bg-[#ebf2f9] border border-slate-200 text-[11px] font-mono font-semibold text-slate-600 hover:text-[#316aa1] transition-colors cursor-pointer"
                  >
                    <span>Ctrl K</span>
                  </button>
                </div>

                {normalizedQuery && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden">
                    {searchResults.length === 0 ? (
                      <div className="p-3.5 text-sm text-slate-500">
                        No direct match for "{searchQuery}". Try "charm", "fare", "top-up", or "concession".
                      </div>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {searchResults.map((item, idx) => (
                          <li key={item.id}>
                            <button
                              type="button"
                              onMouseEnter={() => setSearchHighlightIdx(idx)}
                              onClick={() => {
                                setSearchQuery('');
                                onNavigate(item.screen, {
                                  appFeature: item.appFeature,
                                  cardTab: item.cardTab,
                                  assistanceCategory: item.assistanceCategory,
                                });
                              }}
                              className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                                idx === searchHighlightIdx
                                  ? 'bg-[#ebf2f9]'
                                  : 'hover:bg-[#ebf2f9]/65'
                              }`}
                            >
                              <div>
                                <span className="text-xs font-medium text-[#3f84c5] block">
                                  {item.category}
                                </span>
                                <span className="text-sm font-semibold text-[#142333]">
                                  {item.label}
                                </span>
                              </div>
                              <ArrowRight className="w-4 h-4 text-[#316aa1] shrink-0" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Clean, Minimal Quick Shortcuts */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {pinnedDestinations.length > 0 ? (
                  pinnedDestinations.map((dest) => (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => onSelectDestination(dest)}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#316aa1] rounded-lg text-xs font-semibold text-[#316aa1] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {dest.label.replace('SimplyGo App: ', '')}
                    </button>
                  ))
                ) : (
                  <>
                    <a
                      href="#latest-cards-charms"
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#316aa1] rounded-lg text-xs font-semibold text-[#316aa1] transition-colors whitespace-nowrap"
                    >
                      Cards & Charms
                    </a>
                    <button
                      type="button"
                      onClick={() => onNavigate('services')}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#316aa1] rounded-lg text-xs font-semibold text-[#316aa1] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Fare Calculator
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right: Compact Announcement Banner */}
            <div
              className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-slate-200 bg-[#0c1a27] shadow-sm"
              onMouseEnter={() => setCarouselPaused(true)}
              onMouseLeave={() => setCarouselPaused(false)}
              aria-label="Featured SimplyGo Highlights"
            >
              <div className="relative aspect-[16/7] w-full overflow-hidden">
                <ResilientImage
                  src={currentSlide.desktopImage}
                  alt={currentSlide.title}
                  fallbackLabel={currentSlide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0c1a27]/95 via-[#0c1a27]/55 to-transparent px-4 sm:px-5 pt-10 pb-3.5 flex items-end justify-between gap-3">
                  <div className="text-white min-w-0">
                    <p className="text-xs font-medium text-[#9ec7f0]">
                      {currentSlide.accentNote} · {slideIndex + 1}/{HERO_SLIDES.length}
                    </p>
                    <h2 className="text-sm sm:text-base font-bold text-white truncate">
                      {currentSlide.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate(currentSlide.targetScreen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3f84c5] hover:bg-[#316aa1] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>{currentSlide.ctaLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSlideIndex(
                      (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
                    )
                  }
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-[#0c1a27] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Previous announcement"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-[#0c1a27] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Next announcement"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#0c1a27] py-2 flex items-center justify-center gap-1.5">
                {HERO_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setSlideIndex(idx)}
                    aria-label={`View slide ${idx + 1}: ${slide.title}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === slideIndex
                        ? 'w-6 bg-[#3f84c5]'
                        : 'w-1.5 bg-slate-500 hover:bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1.5 Quiet Commuter Profile Selector */}
      <section
        aria-label="Choose your commuter profile"
        className="bg-white border-b border-slate-200/80 py-3"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-500">
              Tailor by commuter type:
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectProfile('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  activeProfile === 'all'
                    ? 'bg-[#316aa1] text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#142333]'
                }`}
              >
                All
              </button>
              {COMMUTER_PROFILES.map((profile) => {
                const isSelected = activeProfile === profile.id;
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => handleSelectProfile(profile.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-[#316aa1] text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-[#142333]'
                    }`}
                  >
                    {profile.label}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedProfileObj && (
            <div className="bg-[#ebf2f9]/65 border border-[#316aa1]/20 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <p className="text-sm text-[#142333]">
                <span className="font-bold text-[#316aa1]">
                  {selectedProfileObj.recommendedCard}:
                </span>{' '}
                {selectedProfileObj.tagline}
              </p>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {selectedProfileObj.actions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() =>
                      onNavigate(action.screen, {
                        appFeature: action.appFeature,
                        cardTab: action.cardTab,
                        assistanceCategory: action.assistanceCategory,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#316aa1] text-[#316aa1] hover:text-white border border-[#316aa1]/30 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>{action.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Minimalist Cards & Charms Catalog (Key Info Upfront, Click for Stock & Details) */}
      <section id="latest-cards-charms" className="py-8 lg:py-9 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#142333]">
                EZ-Link Cards, Charms & Concession Cards
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span>Click any item to view full details, outlet stock, and restock alerts.</span>
                <button
                  type="button"
                  onClick={() => setShowCardGuide((prev) => !prev)}
                  aria-expanded={showCardGuide}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#316aa1] hover:underline cursor-pointer"
                >
                  <span>How do the 3 types differ?</span>
                  {showCardGuide ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={onRefreshStock}
              disabled={isRefreshingStock}
              aria-live="polite"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#ebf2f9] border border-slate-200 hover:border-[#316aa1] text-[#316aa1] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 self-start md:self-auto cursor-pointer disabled:opacity-60 tabular-nums"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isRefreshingStock ? 'animate-spin' : ''
                }`}
                aria-hidden="true"
              />
              <span>
                {isRefreshingStock
                  ? 'Checking stock...'
                  : lastRefreshedAt
                  ? `Stock verified ${lastRefreshedAt}`
                  : 'Refresh Live Stock'}
              </span>
            </button>
          </div>

          {/* Progressive Disclosure: Card Types Comparison (Opened on Click) */}
          {showCardGuide && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="border border-slate-200 rounded-xl p-4 bg-[#ebf2f9]/45">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#316aa1]">
                    EZ-Link Cards
                  </span>
                  <CreditCard className="w-4 h-4 text-[#316aa1]" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Standard stored-value cards for everyone. Buy off the shelf ($10 incl. $5 value) and pay standard Adult fares.
                </p>
              </div>

              <div className="border border-amber-200/90 rounded-xl p-4 bg-amber-50/45">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-amber-800">
                    EZ-Link Charms
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-700" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Wearable tap-and-go accessories sold empty (top up before riding) online & at selected Ticket Offices.
                </p>
              </div>

              <div className="border border-emerald-200/90 rounded-xl p-4 bg-emerald-50/45">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-800">
                    Concession Cards
                  </span>
                  <BadgeCheck className="w-4 h-4 text-emerald-700" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Personalised cards for Students, Seniors, Children, PWD & Adult Pass holders via Singpass MyInfo.
                </p>
              </div>
            </div>
          )}

          {/* Single Unified Filter Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl self-start">
              {[
                { id: 'all', label: 'All Types' },
                { id: 'ezlink', label: 'EZ-Link Cards' },
                { id: 'charm', label: 'Charms' },
                { id: 'concession', label: 'Concession' },
              ].map((tab) => {
                const isActive = designFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setDesignFilter(
                        tab.id as 'all' | 'ezlink' | 'charm' | 'concession'
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#316aa1] shadow-xs'
                        : 'text-slate-600 hover:text-[#142333]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              {[
                { id: 'all', label: 'All Stock' },
                { id: 'in-stock', label: 'In Stock' },
                { id: 'low-stock', label: 'Low / Restocking' },
              ].map((opt) => {
                const active = availabilityFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setAvailabilityFilter(
                        opt.id as 'all' | 'in-stock' | 'low-stock'
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-white text-[#316aa1] shadow-xs'
                        : 'text-slate-600 hover:text-[#142333]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minimalist Product Grids */}
          <div className="space-y-6">
            {(designFilter === 'all' || designFilter === 'ezlink') &&
              ezlinkDesigns.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#142333]">
                      EZ-Link Cards
                    </h3>
                    <button
                      type="button"
                      onClick={() => onNavigate('cards', { cardTab: 'ezlink' })}
                      className="text-xs font-semibold text-[#316aa1] hover:underline whitespace-nowrap cursor-pointer"
                    >
                      Compare plans →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ezlinkDesigns.map((item) =>
                      renderDesignCard(item, 'bg-[#ebf2f9]/70')
                    )}
                  </div>
                </div>
              )}

            {(designFilter === 'all' || designFilter === 'charm') &&
              charmDesigns.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#142333]">
                      EZ-Link Charms
                    </h3>
                    <button
                      type="button"
                      onClick={() => onNavigate('cards', { cardTab: 'charms' })}
                      className="text-xs font-semibold text-[#316aa1] hover:underline whitespace-nowrap cursor-pointer"
                    >
                      Check by outlet →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {charmDesigns.map((item) =>
                      renderDesignCard(item, 'bg-amber-50/80')
                    )}
                  </div>
                </div>
              )}

            {(designFilter === 'all' || designFilter === 'concession') &&
              concessionDesigns.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#142333]">
                      Concession & Monthly Travel Cards
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        onNavigate('cards', { cardTab: 'concession' })
                      }
                      className="text-xs font-semibold text-[#316aa1] hover:underline whitespace-nowrap cursor-pointer"
                    >
                      Check eligibility & estimator →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {concessionDesigns.map((item) =>
                      renderDesignCard(item, 'bg-emerald-50/75', true)
                    )}
                  </div>
                </div>
              )}

            {((designFilter === 'all' &&
              ezlinkDesigns.length === 0 &&
              charmDesigns.length === 0 &&
              concessionDesigns.length === 0) ||
              (designFilter === 'ezlink' && ezlinkDesigns.length === 0) ||
              (designFilter === 'charm' && charmDesigns.length === 0) ||
              (designFilter === 'concession' &&
                concessionDesigns.length === 0)) && (
              <div className="border border-slate-200 rounded-2xl p-8 text-center bg-slate-50 space-y-3">
                <p className="text-sm font-semibold text-[#142333]">
                  No cards or charms match your current filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAvailabilityFilter('all');
                    setDesignFilter('all');
                  }}
                  className="px-4 py-2 bg-[#316aa1] hover:bg-[#255582] text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Show All
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Summarised SimplyGo App Section (Compact Features + Direct Download) */}
      <section
        id="simplygo-app-hub"
        className="py-8 lg:py-9 bg-[#ebf2f9] border-y border-slate-200/70"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Concise Summary + 2x3 Compact Feature Tiles */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <p className="text-xs font-semibold text-[#3f84c5]">
                  SimplyGo Mobile App
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#142333] mt-0.5">
                  One app for transit, motoring & passes
                </h2>
                <p className="mt-1.5 text-sm text-slate-600 max-w-xl">
                  Link bank cards, EZ-Link cards, and concession cards to track trips, automate top-ups, and pay ERP or EV charging.
                </p>
              </div>

              {/* Compact 2x3 Feature Selector (Click to Preview) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {APP_FEATURES.map((feature) => {
                  const isSelected = feature.id === activeFeatureId;
                  return (
                    <button
                      key={feature.id}
                      type="button"
                      onClick={() => setActiveFeatureId(feature.id)}
                      className={`text-left p-3 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-white border-[#316aa1] shadow-xs'
                          : 'bg-white/70 border-slate-200/80 hover:bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#ebf2f9] flex items-center justify-center shrink-0 p-1.5">
                        <ResilientImage
                          src={feature.icon}
                          alt={feature.title}
                          fallbackLabel={feature.shortTitle}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h3
                        className={`text-sm font-bold truncate ${
                          isSelected ? 'text-[#316aa1]' : 'text-[#142333]'
                        }`}
                      >
                        {feature.title}
                      </h3>
                    </button>
                  );
                })}
              </div>

              {/* Direct Download + Interactive CTA Row */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    onNavigate('app', { appFeature: activeFeature.id })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#316aa1] hover:bg-[#255582] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <span>Try {activeFeature.shortTitle} Screen</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="https://play.google.com/store/apps/details?id=sg.com.transitlink.tlapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                >
                  <ResilientImage
                    src={SIMPLYGO_ASSETS.playStore}
                    alt="Download SimplyGo on Google Play"
                    className="h-10 w-auto object-contain"
                  />
                </a>
                <a
                  href="https://apps.apple.com/sg/app/simplygo/id1460864759"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                >
                  <ResilientImage
                    src={SIMPLYGO_ASSETS.appStore}
                    alt="Download SimplyGo on the App Store"
                    className="h-10 w-auto object-contain"
                  />
                </a>
              </div>
            </div>

            {/* Right: Compact Phone Preview */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-5">
              <div className="bg-[#f4f8fc] border border-slate-200/80 rounded-xl p-2.5 w-40 sm:w-44 shrink-0 flex items-center justify-center">
                <ResilientImage
                  src={activeFeature.screenImage}
                  alt={`${activeFeature.title} app screen`}
                  fallbackLabel={activeFeature.title}
                  className="w-full h-auto max-h-[250px] object-contain"
                />
              </div>
              <div className="min-w-0 space-y-2">
                <p className="text-xs font-semibold text-[#3f84c5]">
                  App Screen Preview
                </p>
                <h3 className="text-lg font-bold text-[#142333]">
                  {activeFeature.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeFeature.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Minimal Assistance Hub */}
      <section className="py-8 lg:py-9 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#142333]">
                Looking For Assistance?
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Select a support channel to view stations, hours, and services.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('locations')}
              className="text-sm font-semibold text-[#316aa1] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View all MRT locations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ASSISTANCE_TILES.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() =>
                  onNavigate('locations', { assistanceCategory: tile.category })
                }
                className="group text-left bg-white border border-slate-200 hover:border-[#3f84c5] rounded-2xl p-5 transition-all hover:shadow-md flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="h-20 flex items-center justify-center bg-[#ebf2f9]/50 rounded-xl mb-3.5 p-2.5">
                    <ResilientImage
                      src={tile.image}
                      alt={tile.title}
                      fallbackLabel={tile.title}
                      className="max-h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-base font-bold text-[#142333] group-hover:text-[#316aa1] transition-colors">
                    {tile.title}
                  </h3>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-[#316aa1]">
                  <span>Find locations</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Card & Charm Availability Modal */}
      {selectedDesign && (
        <CardAvailabilityModal
          design={selectedDesign}
          lastRefreshedAt={lastRefreshedAt}
          isRefreshing={isRefreshingStock}
          onRefreshStock={onRefreshStock}
          restockAlerts={restockAlerts}
          onToggleRestockAlert={onToggleRestockAlert}
          onClose={() => setSelectedDesign(null)}
          onViewCategory={() => {
            const tab =
              selectedDesign.category === 'concession'
                ? 'concession'
                : selectedDesign.category === 'charm'
                ? 'charms'
                : 'ezlink';
            setSelectedDesign(null);
            onNavigate('cards', { cardTab: tab });
          }}
        />
      )}
    </div>
  );
}
